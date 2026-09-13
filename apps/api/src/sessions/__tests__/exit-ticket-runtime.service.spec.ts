import { describe, it, expect, beforeEach } from 'vitest';
import { ExitTicketRuntimeService } from '../exit-ticket-runtime.service';

describe('ExitTicketRuntimeService', () => {
  let service: ExitTicketRuntimeService;
  const sessionId = 'session_et_test';

  beforeEach(() => {
    service = new ExitTicketRuntimeService();
  });

  describe('createActivity', () => {
    it('creates a new activity in DRAFT status with 1-3 questions', () => {
      const result = service.createActivity(sessionId, 'Refleksi Harian', true, [
        {
          type: 'SCALE',
          prompt: 'Seberapa paham Anda hari ini?',
          required: true,
          scale: { min: 1, max: 5, minLabel: 'Kurang', maxLabel: 'Paham' },
        },
        {
          type: 'SHORT_TEXT',
          prompt: 'Apa yang Anda pelajari?',
          required: false,
        },
      ]);

      expect(result.accepted).toBe(true);
      expect(result.activity).toBeDefined();
      expect(result.activity?.title).toBe('Refleksi Harian');
      expect(result.activity?.status).toBe('DRAFT');
      expect(result.activity?.isAnonymous).toBe(true);
      expect(result.activity?.questions).toHaveLength(2);
      expect(result.activity?.questions[0]?.order).toBe(0);
      expect(result.activity?.questions[1]?.order).toBe(1);
    });

    it('rejects creation with 0 questions', () => {
      const result = service.createActivity(sessionId, 'Refleksi', true, []);
      expect(result.accepted).toBe(false);
      expect(result.error).toContain('minimal memiliki 1 pertanyaan');
    });

    it('rejects creation with more than 3 questions', () => {
      const result = service.createActivity(sessionId, 'Refleksi', true, [
        { type: 'SCALE', prompt: 'Q1' },
        { type: 'SCALE', prompt: 'Q2' },
        { type: 'SCALE', prompt: 'Q3' },
        { type: 'SCALE', prompt: 'Q4' },
      ]);
      expect(result.accepted).toBe(false);
      expect(result.error).toContain('maksimal memiliki 3 pertanyaan');
    });
  });

  describe('openActivity & closeActivity', () => {
    it('transitions DRAFT -> OPEN -> CLOSED and enforces terminal CLOSED', () => {
      service.createActivity(sessionId, 'Refleksi', true, [
        { type: 'SCALE', prompt: 'Tingkat pemahaman?' },
      ]);

      const openRes = service.openActivity(sessionId);
      expect(openRes.accepted).toBe(true);
      expect(openRes.activity?.status).toBe('OPEN');
      expect(openRes.activity?.openedAt).toBeDefined();

      const closeRes = service.closeActivity(sessionId);
      expect(closeRes.accepted).toBe(true);
      expect(closeRes.activity?.status).toBe('CLOSED');
      expect(closeRes.activity?.closedAt).toBeDefined();

      // Attempt to reopen closed activity
      const reopenRes = service.openActivity(sessionId);
      expect(reopenRes.accepted).toBe(false);
      expect(reopenRes.error).toContain('tidak dapat dibuka kembali');
    });
  });

  describe('submitResponse & Question Validation', () => {
    let qScaleId: string;
    let qChoiceId: string;
    let qTextId: string;

    beforeEach(() => {
      const created = service.createActivity(sessionId, 'Refleksi Lengkap', true, [
        {
          type: 'SCALE',
          prompt: 'Skala pemahaman?',
          required: true,
          scale: { min: 1, max: 5 },
        },
        {
          type: 'MULTIPLE_CHOICE',
          prompt: 'Metode yang paling membantu?',
          required: true,
          options: [
            { id: 'opt_diskusi', text: 'Diskusi' },
            { id: 'opt_praktik', text: 'Praktik' },
          ],
        },
        {
          type: 'SHORT_TEXT',
          prompt: 'Saran untuk guru?',
          required: false,
        },
      ]);

      qScaleId = created.activity!.questions[0]!.id;
      qChoiceId = created.activity!.questions[1]!.id;
      qTextId = created.activity!.questions[2]!.id;

      service.openActivity(sessionId);
    });

    it('rejects submission if ticket is not OPEN', () => {
      service.closeActivity(sessionId);

      const result = service.submitResponse(sessionId, 'p-1', 'Budi', [
        { questionId: qScaleId, value: 5 },
      ]);

      expect(result.accepted).toBe(false);
      expect(result.error).toContain('belum dibuka atau sudah ditutup');
    });

    it('rejects submission when required question is missing', () => {
      const result = service.submitResponse(sessionId, 'p-1', 'Budi', [
        { questionId: qScaleId, value: 4 },
        // missing qChoiceId which is required
      ]);

      expect(result.accepted).toBe(false);
      expect(result.error).toContain('wajib dijawab');
    });

    it('rejects invalid SCALE value (< 1 or > 5 or non-integer)', () => {
      const res1 = service.submitResponse(sessionId, 'p-1', 'Budi', [
        { questionId: qScaleId, value: 6 },
        { questionId: qChoiceId, value: 'opt_diskusi' },
      ]);
      expect(res1.accepted).toBe(false);
      expect(res1.error).toContain('harus berupa angka 1 sampai 5');

      const res2 = service.submitResponse(sessionId, 'p-1', 'Budi', [
        { questionId: qScaleId, value: 0 },
        { questionId: qChoiceId, value: 'opt_diskusi' },
      ]);
      expect(res2.accepted).toBe(false);

      const res3 = service.submitResponse(sessionId, 'p-1', 'Budi', [
        { questionId: qScaleId, value: 3.5 },
        { questionId: qChoiceId, value: 'opt_diskusi' },
      ]);
      expect(res3.accepted).toBe(false);
    });

    it('rejects invalid MULTIPLE_CHOICE option', () => {
      const result = service.submitResponse(sessionId, 'p-1', 'Budi', [
        { questionId: qScaleId, value: 4 },
        { questionId: qChoiceId, value: 'opt_fake_invalid' },
      ]);

      expect(result.accepted).toBe(false);
      expect(result.error).toContain('Pilihan tidak valid');
    });

    it('rejects SHORT_TEXT longer than 300 chars', () => {
      const result = service.submitResponse(sessionId, 'p-1', 'Budi', [
        { questionId: qScaleId, value: 5 },
        { questionId: qChoiceId, value: 'opt_diskusi' },
        { questionId: qTextId, value: 'x'.repeat(301) },
      ]);

      expect(result.accepted).toBe(false);
      expect(result.error).toContain('maksimal 300 karakter');
    });

    it('accepts valid response and masks author when isAnonymous is true', () => {
      const result = service.submitResponse(sessionId, 'p-1', 'Budi Santoso', [
        { questionId: qScaleId, value: 5 },
        { questionId: qChoiceId, value: 'opt_praktik' },
        { questionId: qTextId, value: 'Sangat seru & jelas!' },
      ]);

      expect(result.accepted).toBe(true);
      expect(result.response).toBeDefined();
      expect(result.response?.authorName).toBe('Anonim');
      expect(result.response?.isAnonymous).toBe(true);
      expect(result.response?.answers).toHaveLength(3);
    });

    it('enforces ONE_RESPONSE_PER_PARTICIPANT', () => {
      const res1 = service.submitResponse(sessionId, 'p-1', 'Budi', [
        { questionId: qScaleId, value: 5 },
        { questionId: qChoiceId, value: 'opt_diskusi' },
      ]);
      expect(res1.accepted).toBe(true);

      const res2 = service.submitResponse(sessionId, 'p-1', 'Budi', [
        { questionId: qScaleId, value: 4 },
        { questionId: qChoiceId, value: 'opt_diskusi' },
      ]);
      expect(res2.accepted).toBe(false);
      expect(res2.error).toContain('sudah mengirimkan refleksi');
    });
  });

  describe('calculateAggregates & Snapshots', () => {
    it('calculates scale average, choice percentages, text list, and completion rate', () => {
      const created = service.createActivity(sessionId, 'Refleksi Akhir', false, [
        {
          type: 'SCALE',
          prompt: 'Pemahaman?',
          required: true,
        },
        {
          type: 'MULTIPLE_CHOICE',
          prompt: 'Kegiatan paling berkesan?',
          required: true,
          options: [
            { id: 'opt-a', text: 'Eksperimen' },
            { id: 'opt-b', text: 'Diskusi' },
          ],
        },
        {
          type: 'SHORT_TEXT',
          prompt: 'Komentar?',
          required: false,
        },
      ]);

      const [qScale, qChoice, qText] = created.activity!.questions;
      service.openActivity(sessionId);

      // Participant 1: scale 5, opt-a, text
      service.submitResponse(sessionId, 'p-1', 'Budi', [
        { questionId: qScale!.id, value: 5 },
        { questionId: qChoice!.id, value: 'opt-a' },
        { questionId: qText!.id, value: 'Bagus sekali materinya' },
      ]);

      // Participant 2: scale 4, opt-b, text
      service.submitResponse(sessionId, 'p-2', 'Siti', [
        { questionId: qScale!.id, value: 4 },
        { questionId: qChoice!.id, value: 'opt-b' },
        { questionId: qText!.id, value: 'Mudah dipahami' },
      ]);

      // Participant 3: scale 4, opt-a
      service.submitResponse(sessionId, 'p-3', 'Ahmad', [
        { questionId: qScale!.id, value: 4 },
        { questionId: qChoice!.id, value: 'opt-a' },
      ]);

      const teacherSnapshot = service.getTeacherSnapshot(sessionId, 4);

      expect(teacherSnapshot.responseCount).toBe(3);
      expect(teacherSnapshot.totalExpected).toBe(4);
      expect(teacherSnapshot.completionRate).toBe(75); // 3 / 4 * 100 = 75%

      const aggScale = teacherSnapshot.aggregates?.questionAggregates[qScale!.id];
      expect(aggScale?.type).toBe('SCALE');
      expect(aggScale?.totalResponses).toBe(3);
      expect(aggScale?.scaleAverage).toBe(4.3); // (5 + 4 + 4) / 3 = 4.333 -> 4.3
      expect(aggScale?.scaleDistribution?.[5]).toBe(1);
      expect(aggScale?.scaleDistribution?.[4]).toBe(2);
      expect(aggScale?.scaleDistribution?.[1]).toBe(0);

      const aggChoice = teacherSnapshot.aggregates?.questionAggregates[qChoice!.id];
      expect(aggChoice?.type).toBe('MULTIPLE_CHOICE');
      expect(aggChoice?.totalResponses).toBe(3);
      expect(aggChoice?.choiceDistribution?.['opt-a']?.count).toBe(2);
      expect(aggChoice?.choiceDistribution?.['opt-a']?.percentage).toBe(66.7);
      expect(aggChoice?.choiceDistribution?.['opt-b']?.count).toBe(1);
      expect(aggChoice?.choiceDistribution?.['opt-b']?.percentage).toBe(33.3);

      const aggText = teacherSnapshot.aggregates?.questionAggregates[qText!.id];
      expect(aggText?.type).toBe('SHORT_TEXT');
      expect(aggText?.totalResponses).toBe(2);
      expect(aggText?.textResponses).toHaveLength(2);
      expect(aggText?.textResponses?.[0]?.content).toBeDefined();

      // Participant Snapshot check
      const p1Snapshot = service.getParticipantSnapshot(sessionId, 'p-1');
      expect(p1Snapshot.hasSubmitted).toBe(true);
      expect((p1Snapshot as any).aggregates).toBeUndefined(); // never leak aggregates to participant

      const p4Snapshot = service.getParticipantSnapshot(sessionId, 'p-4');
      expect(p4Snapshot.hasSubmitted).toBe(false);
    });

    it('cleans up session data when clearSession is called', () => {
      service.createActivity(sessionId, 'Refleksi', true, [{ type: 'SCALE', prompt: 'Paham?' }]);
      expect(service.hasSession(sessionId)).toBe(true);

      service.clearSession(sessionId);
      expect(service.hasSession(sessionId)).toBe(false);
      expect(service.getActivity(sessionId)).toBeNull();
    });
  });
});
