import { describe, it, expect, beforeEach } from 'vitest';
import { QuestionBoxRuntimeService } from '../question-box-runtime.service';

describe('QuestionBoxRuntimeService', () => {
  let service: QuestionBoxRuntimeService;
  const sessionId = 'session_test_123';

  beforeEach(() => {
    service = new QuestionBoxRuntimeService();
  });

  describe('submitQuestion', () => {
    it('should submit a valid question successfully', () => {
      const result = service.submitQuestion(
        sessionId,
        'part_1',
        'Budi Santoso',
        'Bagaimana cara menghitung luas trapesium?',
        false,
      );

      expect(result.accepted).toBe(true);
      expect(result.question).toBeDefined();
      expect(result.question?.authorName).toBe('Budi Santoso');
      expect(result.question?.isAnonymous).toBe(false);
      expect(result.question?.status).toBe('PENDING');
      expect(result.question?.content).toBe('Bagaimana cara menghitung luas trapesium?');
    });

    it('should mask authorName to Anonim when isAnonymous is true', () => {
      const result = service.submitQuestion(
        sessionId,
        'part_1',
        'Budi Santoso',
        'Pertanyaan rahasia anonim',
        true,
      );

      expect(result.accepted).toBe(true);
      expect(result.question?.authorName).toBe('Anonim');
      expect(result.question?.isAnonymous).toBe(true);
    });

    it('should reject empty or whitespace-only question', () => {
      const result = service.submitQuestion(sessionId, 'part_1', 'Budi', '   ');
      expect(result.accepted).toBe(false);
      expect(result.error).toContain('tidak boleh kosong');
    });

    it('should reject question exceeding 500 characters', () => {
      const longText = 'a'.repeat(501);
      const result = service.submitQuestion(sessionId, 'part_1', 'Budi', longText);
      expect(result.accepted).toBe(false);
      expect(result.error).toContain('maksimal 500 karakter');
    });

    it('should enforce 5-second submission cooldown', () => {
      const res1 = service.submitQuestion(sessionId, 'part_1', 'Budi', 'Pertanyaan pertama');
      expect(res1.accepted).toBe(true);

      const res2 = service.submitQuestion(sessionId, 'part_1', 'Budi', 'Pertanyaan kedua');
      expect(res2.accepted).toBe(false);
      expect(res2.error).toContain('detik sebelum mengirim');
    });

    it('should reject duplicate question within 30 seconds', () => {
      const res1 = service.submitQuestion(sessionId, 'part_1', 'Budi', 'Pertanyaan kembar');
      expect(res1.accepted).toBe(true);

      // Advance mock time past 5s cooldown but within 30s
      const origNow = Date.now;
      try {
        Date.now = () => origNow() + 6000;
        const res2 = service.submitQuestion(sessionId, 'part_1', 'Budi', 'Pertanyaan kembar');
        expect(res2.accepted).toBe(false);
        expect(res2.error).toContain('sudah diajukan sebelumnya');
      } finally {
        Date.now = origNow;
      }
    });

    it('should enforce max 5 active pending questions per participant', () => {
      const origNow = Date.now;
      try {
        let fakeTime = 100000;
        Date.now = () => {
          fakeTime += 6000;
          return fakeTime;
        };

        for (let i = 1; i <= 5; i++) {
          const res = service.submitQuestion(sessionId, 'part_1', 'Budi', `Pertanyaan ke-${i}`);
          expect(res.accepted).toBe(true);
        }

        const res6 = service.submitQuestion(sessionId, 'part_1', 'Budi', 'Pertanyaan ke-6');
        expect(res6.accepted).toBe(false);
        expect(res6.error).toContain('5 pertanyaan aktif');
      } finally {
        Date.now = origNow;
      }
    });
  });

  describe('highlightQuestion & unhighlightQuestion', () => {
    it('should highlight a pending question', () => {
      const res = service.submitQuestion(sessionId, 'part_1', 'Budi', 'Pertanyaan penting');
      const qId = res.question!.id;

      const highlighted = service.highlightQuestion(sessionId, qId);
      expect(highlighted).toBeDefined();
      expect(highlighted?.status).toBe('HIGHLIGHTED');

      const snapshot = service.getTeacherSnapshot(sessionId);
      expect(snapshot.highlightedQuestionId).toBe(qId);
    });

    it('should enforce single highlight rule by unhighlighting previously highlighted question', () => {
      const origNow = Date.now;
      try {
        let fakeTime = 100000;
        Date.now = () => {
          fakeTime += 6000;
          return fakeTime;
        };

        const q1 = service.submitQuestion(sessionId, 'part_1', 'Budi', 'Soal 1').question!;
        const q2 = service.submitQuestion(sessionId, 'part_2', 'Siti', 'Soal 2').question!;

        service.highlightQuestion(sessionId, q1.id);
        expect(service.getTeacherSnapshot(sessionId).highlightedQuestionId).toBe(q1.id);

        service.highlightQuestion(sessionId, q2.id);
        const snapshot = service.getTeacherSnapshot(sessionId);
        expect(snapshot.highlightedQuestionId).toBe(q2.id);

        const q1Updated = snapshot.questions.find((q) => q.id === q1.id);
        expect(q1Updated?.status).toBe('PENDING');
      } finally {
        Date.now = origNow;
      }
    });

    it('should unhighlight a question back to PENDING', () => {
      const q = service.submitQuestion(sessionId, 'part_1', 'Budi', 'Soal 1').question!;
      service.highlightQuestion(sessionId, q.id);

      const unhighlighted = service.unhighlightQuestion(sessionId, q.id);
      expect(unhighlighted?.status).toBe('PENDING');
      expect(service.getTeacherSnapshot(sessionId).highlightedQuestionId).toBeNull();
    });
  });

  describe('answerQuestion and dismissQuestion', () => {
    it('should mark question as ANSWERED and clear highlight', () => {
      const q = service.submitQuestion(sessionId, 'part_1', 'Budi', 'Soal 1').question!;
      service.highlightQuestion(sessionId, q.id);

      const answered = service.answerQuestion(sessionId, q.id);
      expect(answered?.status).toBe('ANSWERED');
      expect(answered?.answeredAt).toBeDefined();

      const snapshot = service.getTeacherSnapshot(sessionId);
      expect(snapshot.highlightedQuestionId).toBeNull();
      expect(snapshot.answeredCount).toBe(1);
      expect(snapshot.pendingCount).toBe(0);
    });

    it('should mark question as DISMISSED and clear highlight', () => {
      const q = service.submitQuestion(sessionId, 'part_1', 'Budi', 'Spam question').question!;
      service.highlightQuestion(sessionId, q.id);

      const dismissed = service.dismissQuestion(sessionId, q.id);
      expect(dismissed?.status).toBe('DISMISSED');
      expect(dismissed?.dismissedAt).toBeDefined();

      const snapshot = service.getTeacherSnapshot(sessionId);
      expect(snapshot.highlightedQuestionId).toBeNull();
      expect(snapshot.pendingCount).toBe(0);
    });
  });

  describe('privacy and snapshots', () => {
    it('participant snapshot should only return their own questions and highlighted question', () => {
      const origNow = Date.now;
      try {
        let fakeTime = 100000;
        Date.now = () => {
          fakeTime += 6000;
          return fakeTime;
        };

        service.submitQuestion(sessionId, 'part_1', 'Budi', 'Pertanyaan Budi 1');
        const q2 = service.submitQuestion(
          sessionId,
          'part_2',
          'Siti',
          'Pertanyaan Siti 1',
        ).question!;

        // Highlight Siti's question
        service.highlightQuestion(sessionId, q2.id);

        // Budi checks snapshot
        const budiSnapshot = service.getParticipantSnapshot(sessionId, 'part_1');
        expect(budiSnapshot.myQuestions.length).toBe(1);
        expect(budiSnapshot.myQuestions[0]?.content).toBe('Pertanyaan Budi 1');

        // Budi sees highlighted question from Siti
        expect(budiSnapshot.highlightedQuestion).toBeDefined();
        expect(budiSnapshot.highlightedQuestion?.id).toBe(q2.id);
        expect(budiSnapshot.highlightedQuestion?.content).toBe('Pertanyaan Siti 1');
        expect(budiSnapshot.highlightedQuestion?.authorName).toBe('Siti');
      } finally {
        Date.now = origNow;
      }
    });

    it('clearSession should wipe out all question box state for the session', () => {
      service.submitQuestion(sessionId, 'part_1', 'Budi', 'Pertanyaan');
      expect(service.hasSession(sessionId)).toBe(true);

      service.clearSession(sessionId);
      expect(service.hasSession(sessionId)).toBe(false);
      expect(service.getTeacherSnapshot(sessionId).totalCount).toBe(0);
    });
  });
});
