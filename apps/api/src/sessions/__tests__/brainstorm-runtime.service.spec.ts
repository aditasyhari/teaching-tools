import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BrainstormRuntimeService } from '../brainstorm-runtime.service';

describe('BrainstormRuntimeService', () => {
  let service: BrainstormRuntimeService;
  const sessionId = 'session_brainstorm_test';

  beforeEach(() => {
    service = new BrainstormRuntimeService();
  });

  describe('createActivity and lifecycle', () => {
    it('creates an activity in DRAFT state with default settings', () => {
      const res = service.createActivity(
        sessionId,
        'Apa ide kalian untuk menghemat energi di sekolah?',
      );

      expect(res.accepted).toBe(true);
      expect(res.activity).toBeDefined();
      expect(res.activity?.status).toBe('DRAFT');
      expect(res.activity?.prompt).toBe('Apa ide kalian untuk menghemat energi di sekolah?');
      expect(res.activity?.settings.isAnonymous).toBe(false);
      expect(res.activity?.settings.ideasVisibleToParticipants).toBe(false);
      expect(res.activity?.settings.submissionMode).toBe('ONE_PER_PARTICIPANT');
      expect(res.activity?.settings.maxIdeasPerParticipant).toBe(1);
    });

    it('rejects empty or whitespace-only prompt', () => {
      const res = service.createActivity(sessionId, '   ');
      expect(res.accepted).toBe(false);
      expect(res.error).toContain('wajib diisi');
    });

    it('rejects prompt exceeding 300 characters', () => {
      const res = service.createActivity(sessionId, 'x'.repeat(301));
      expect(res.accepted).toBe(false);
      expect(res.error).toContain('maksimal 300 karakter');
    });

    it('allows valid state transitions: DRAFT -> OPEN -> PAUSED -> OPEN -> CLOSED', () => {
      service.createActivity(sessionId, 'Topik Diskusi');

      const openRes = service.openActivity(sessionId);
      expect(openRes.accepted).toBe(true);
      expect(openRes.activity?.status).toBe('OPEN');
      expect(openRes.activity?.openedAt).toBeGreaterThan(0);

      const pauseRes = service.pauseActivity(sessionId);
      expect(pauseRes.accepted).toBe(true);
      expect(pauseRes.activity?.status).toBe('PAUSED');
      expect(pauseRes.activity?.pausedAt).toBeGreaterThan(0);

      const resumeRes = service.openActivity(sessionId);
      expect(resumeRes.accepted).toBe(true);
      expect(resumeRes.activity?.status).toBe('OPEN');

      const closeRes = service.closeActivity(sessionId);
      expect(closeRes.accepted).toBe(true);
      expect(closeRes.activity?.status).toBe('CLOSED');
      expect(closeRes.activity?.closedAt).toBeGreaterThan(0);

      // Reopening CLOSED activity must be rejected
      const reopenRes = service.openActivity(sessionId);
      expect(reopenRes.accepted).toBe(false);
      expect(reopenRes.error).toContain('tidak dapat dibuka kembali');
    });
  });

  describe('submitIdea', () => {
    it('accepts valid idea submission when activity is OPEN', () => {
      service.createActivity(sessionId, 'Topik Diskusi');
      service.openActivity(sessionId);

      const res = service.submitIdea(
        sessionId,
        'part_1',
        'Budi Santoso',
        'Memasang panel surya di atap sekolah',
      );

      expect(res.accepted).toBe(true);
      expect(res.idea).toBeDefined();
      expect(res.idea?.authorName).toBe('Budi Santoso');
      expect(res.idea?.content).toBe('Memasang panel surya di atap sekolah');
      expect(res.idea?.status).toBe('VISIBLE');
      expect(res.idea?.isAnonymous).toBe(false);
    });

    it('rejects submission when activity is DRAFT, PAUSED, or CLOSED', () => {
      service.createActivity(sessionId, 'Topik Diskusi');

      // In DRAFT
      const resDraft = service.submitIdea(sessionId, 'part_1', 'Budi', 'Ide 1');
      expect(resDraft.accepted).toBe(false);
      expect(resDraft.error).toContain('tidak menerima kiriman');

      // In PAUSED
      service.openActivity(sessionId);
      service.pauseActivity(sessionId);
      const resPaused = service.submitIdea(sessionId, 'part_1', 'Budi', 'Ide 1');
      expect(resPaused.accepted).toBe(false);

      // In CLOSED
      service.closeActivity(sessionId);
      const resClosed = service.submitIdea(sessionId, 'part_1', 'Budi', 'Ide 1');
      expect(resClosed.accepted).toBe(false);
    });

    it('masks author name to Anonim when isAnonymous is enabled', () => {
      service.createActivity(sessionId, 'Topik Diskusi', { isAnonymous: true });
      service.openActivity(sessionId);

      const res = service.submitIdea(sessionId, 'part_1', 'Budi Santoso', 'Ide Anonim');
      expect(res.accepted).toBe(true);
      expect(res.idea?.authorName).toBe('Anonim');
      expect(res.idea?.isAnonymous).toBe(true);
    });

    it('enforces 3-second submission cooldown', () => {
      service.createActivity(sessionId, 'Topik Diskusi', {
        submissionMode: 'MULTIPLE_PER_PARTICIPANT',
      });
      service.openActivity(sessionId);

      const res1 = service.submitIdea(sessionId, 'part_1', 'Budi', 'Ide pertama');
      expect(res1.accepted).toBe(true);

      const res2 = service.submitIdea(sessionId, 'part_1', 'Budi', 'Ide kedua');
      expect(res2.accepted).toBe(false);
      expect(res2.error).toContain('Mohon tunggu 3 detik');
    });

    it('enforces duplicate submission prevention within 15 seconds', () => {
      service.createActivity(sessionId, 'Topik Diskusi', {
        submissionMode: 'MULTIPLE_PER_PARTICIPANT',
      });
      service.openActivity(sessionId);

      let now = 10000;
      vi.spyOn(Date, 'now').mockImplementation(() => now);

      const res1 = service.submitIdea(sessionId, 'part_1', 'Budi', 'Ide sama');
      expect(res1.accepted).toBe(true);

      // Advance 5 seconds (past cooldown, but within 15s duplicate window)
      now = 15000;
      const res2 = service.submitIdea(sessionId, 'part_1', 'Budi', 'Ide sama');
      expect(res2.accepted).toBe(false);
      expect(res2.error).toContain('sudah Anda kirimkan sebelumnya');

      vi.restoreAllMocks();
    });

    it('enforces ONE_PER_PARTICIPANT limit', () => {
      service.createActivity(sessionId, 'Topik Diskusi', {
        submissionMode: 'ONE_PER_PARTICIPANT',
      });
      service.openActivity(sessionId);

      vi.spyOn(Date, 'now').mockReturnValue(10000);
      const res1 = service.submitIdea(sessionId, 'part_1', 'Budi', 'Ide pertama');
      expect(res1.accepted).toBe(true);

      vi.spyOn(Date, 'now').mockReturnValue(20000);
      const res2 = service.submitIdea(sessionId, 'part_1', 'Budi', 'Ide kedua');
      expect(res2.accepted).toBe(false);
      expect(res2.error).toContain('sudah mengirimkan ide untuk sesi ini');

      vi.restoreAllMocks();
    });

    it('enforces MULTIPLE_PER_PARTICIPANT limit of 5 ideas', () => {
      service.createActivity(sessionId, 'Topik Diskusi', {
        submissionMode: 'MULTIPLE_PER_PARTICIPANT',
      });
      service.openActivity(sessionId);

      let time = 10000;
      for (let i = 1; i <= 5; i++) {
        vi.spyOn(Date, 'now').mockReturnValue(time);
        const res = service.submitIdea(sessionId, 'part_1', 'Budi', `Ide ke-${i}`);
        expect(res.accepted).toBe(true);
        time += 5000;
      }

      // 6th idea must be rejected
      vi.spyOn(Date, 'now').mockReturnValue(time);
      const res6 = service.submitIdea(sessionId, 'part_1', 'Budi', 'Ide ke-6');
      expect(res6.accepted).toBe(false);
      expect(res6.error).toContain('batas maksimal 5 ide');

      vi.restoreAllMocks();
    });
  });

  describe('moderation: hide and restore', () => {
    it('hides an idea and restores it', () => {
      service.createActivity(sessionId, 'Topik');
      service.openActivity(sessionId);

      const res = service.submitIdea(sessionId, 'part_1', 'Budi', 'Ide kurang pantas');
      const ideaId = res.idea!.id;

      const hidden = service.hideIdea(sessionId, ideaId);
      expect(hidden).not.toBeNull();
      expect(hidden?.status).toBe('HIDDEN');
      expect(hidden?.hiddenAt).toBeGreaterThan(0);

      const teacherSnap = service.getTeacherSnapshot(sessionId);
      expect(teacherSnap.visibleCount).toBe(0);
      expect(teacherSnap.hiddenCount).toBe(1);

      const restored = service.restoreIdea(sessionId, ideaId);
      expect(restored).not.toBeNull();
      expect(restored?.status).toBe('VISIBLE');
      expect(restored?.hiddenAt).toBeUndefined();

      const teacherSnap2 = service.getTeacherSnapshot(sessionId);
      expect(teacherSnap2.visibleCount).toBe(1);
      expect(teacherSnap2.hiddenCount).toBe(0);
    });
  });

  describe('snapshots and visibility security', () => {
    it('protects peer ideas when ideasVisibleToParticipants is false', () => {
      service.createActivity(sessionId, 'Topik', {
        ideasVisibleToParticipants: false,
      });
      service.openActivity(sessionId);

      service.submitIdea(sessionId, 'part_1', 'Budi', 'Ide Budi');

      const part2Snap = service.getParticipantSnapshot(sessionId, 'part_2');
      expect(part2Snap.ideas).toHaveLength(0); // Peer ideas hidden!
      expect(part2Snap.myIdeas).toHaveLength(0);
      expect(part2Snap.totalIdeasCount).toBe(1);

      const part1Snap = service.getParticipantSnapshot(sessionId, 'part_1');
      expect(part1Snap.ideas).toHaveLength(0); // Only receives own ideas in myIdeas
      expect(part1Snap.myIdeas).toHaveLength(1);
      expect(part1Snap.myIdeas[0].content).toBe('Ide Budi');
    });

    it('provides visible peer ideas without participantId when ideasVisibleToParticipants is true', () => {
      service.createActivity(sessionId, 'Topik', {
        ideasVisibleToParticipants: true,
      });
      service.openActivity(sessionId);

      const res1 = service.submitIdea(sessionId, 'part_1', 'Budi', 'Ide Budi');
      service.submitIdea(sessionId, 'part_2', 'Siti', 'Ide Siti');

      // Hide Budi's idea
      service.hideIdea(sessionId, res1.idea!.id);

      const part3Snap = service.getParticipantSnapshot(sessionId, 'part_3');
      // Only Siti's idea should be visible, Budi's hidden idea must NOT be included
      expect(part3Snap.ideas).toHaveLength(1);
      expect(part3Snap.ideas[0].content).toBe('Ide Siti');
      expect((part3Snap.ideas[0] as any).participantId).toBeUndefined(); // No ID leakage!
    });
  });

  describe('clearSession', () => {
    it('clears all session state', () => {
      service.createActivity(sessionId, 'Topik');
      expect(service.hasSession(sessionId)).toBe(true);

      service.clearSession(sessionId);
      expect(service.hasSession(sessionId)).toBe(false);
      expect(service.getTeacherSnapshot(sessionId).activity).toBeNull();
    });
  });
});
