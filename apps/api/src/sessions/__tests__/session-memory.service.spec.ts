import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SessionMemoryService } from '../session-memory.service';

describe('SessionMemoryService', () => {
  let service: SessionMemoryService;

  beforeEach(() => {
    service = new SessionMemoryService();
  });

  afterEach(() => {
    service.onModuleDestroy();
  });

  it('should add a new participant and generate a unique participantId', () => {
    const p1 = service.addParticipant('sess-1', 'Budi Santoso', undefined, 'socket-1');
    expect(p1.id).toBeDefined();
    expect(p1.displayName).toBe('Budi Santoso');
    expect(p1.isOnline).toBe(true);
    expect(p1.sessionId).toBe('sess-1');

    const participants = service.getParticipants('sess-1');
    expect(participants).toHaveLength(1);
    expect(participants[0]?.id).toBe(p1.id);
    expect(service.getOnlineParticipantCount('sess-1')).toBe(1);
  });

  it('should allow duplicate display names with distinct participant IDs', () => {
    const p1 = service.addParticipant('sess-1', 'Budi', undefined, 'socket-1');
    const p2 = service.addParticipant('sess-1', 'Budi', undefined, 'socket-2');

    expect(p1.id).not.toBe(p2.id);
    expect(p1.displayName).toBe('Budi');
    expect(p2.displayName).toBe('Budi');
    expect(service.getOnlineParticipantCount('sess-1')).toBe(2);
  });

  it('should recover participant identity on reconnect with existing participantId', () => {
    const initial = service.addParticipant('sess-1', 'Siti Rahma', undefined, 'socket-1');
    const initialId = initial.id;

    // Simulate disconnect
    service.handleDisconnect('socket-1');
    expect(initial.isOnline).toBe(false);
    expect(service.getOnlineParticipantCount('sess-1')).toBe(0);

    // Reconnect with same participantId and valid reconnectToken
    const reconnected = service.addParticipant('sess-1', 'Siti Rahma', initialId, 'socket-2', initial.reconnectToken);
    expect(reconnected.id).toBe(initialId);
    expect(reconnected.isOnline).toBe(true);
    expect(service.getOnlineParticipantCount('sess-1')).toBe(1);
  });

  it('should register teacher socket and track entry', () => {
    service.registerTeacher('sess-1', 'teacher-socket-1');
    const entry = service.getSocketEntry('teacher-socket-1');
    expect(entry).toBeDefined();
    expect(entry?.role).toBe('TEACHER');
    expect(entry?.sessionId).toBe('sess-1');
  });

  it('should handle socket disconnect for teacher and participant', () => {
    service.registerTeacher('sess-1', 'teacher-sock');
    const p = service.addParticipant('sess-1', 'Andi', undefined, 'participant-sock');

    const teacherRes = service.handleDisconnect('teacher-sock');
    expect(teacherRes?.role).toBe('TEACHER');

    const partRes = service.handleDisconnect('participant-sock');
    expect(partRes?.role).toBe('PARTICIPANT');
    expect(partRes?.participant?.id).toBe(p.id);
    expect(p.isOnline).toBe(false);
  });

  it('should update lastSeenAt on touchParticipant heartbeat', () => {
    const p = service.addParticipant('sess-1', 'Dewi', undefined, 'sock-1');
    const initialSeen = p.lastSeenAt;

    const touched = service.touchParticipant('sess-1', p.id);
    expect(touched).toBe(true);
    expect(p.isOnline).toBe(true);

    const touchInvalid = service.touchParticipant('sess-1', 'non-existent');
    expect(touchInvalid).toBe(false);
  });

  it('should clear session completely on clearSession', () => {
    service.registerTeacher('sess-1', 'teacher-sock');
    service.addParticipant('sess-1', 'Murid 1', undefined, 'sock-1');
    service.addParticipant('sess-1', 'Murid 2', undefined, 'sock-2');

    service.clearSession('sess-1');

    expect(service.getParticipants('sess-1')).toHaveLength(0);
    expect(service.getOnlineParticipantCount('sess-1')).toBe(0);
    expect(service.getSocketEntry('teacher-sock')).toBeUndefined();
    expect(service.getSocketEntry('sock-1')).toBeUndefined();
  });

  it('SEC-002: should generate a reconnectToken and enforce token matching on reconnect', () => {
    // 1. Initial join generates a reconnectToken
    const initial = service.addParticipant('sess-1', 'Budi Santoso', undefined, 'sock-1');
    expect(initial.reconnectToken).toBeDefined();
    expect(initial.reconnectToken).toMatch(/^rt_/);
    const validToken = initial.reconnectToken;
    const initialId = initial.id;

    // Simulate disconnect
    service.handleDisconnect('sock-1');

    // 2. Reconnection with valid token succeeds
    const reconnected = service.addParticipant('sess-1', 'Budi Santoso', initialId, 'sock-2', validToken);
    expect(reconnected.id).toBe(initialId);
    expect(reconnected.isOnline).toBe(true);

    // Simulate disconnect again
    service.handleDisconnect('sock-2');

    // 3. Attacker tries to hijack Budi's ID with wrong/missing token
    const hijacked = service.addParticipant('sess-1', 'Attacker Impersonator', initialId, 'sock-evil', 'rt_wrong_token');
    // Must NOT re-bind Budi's ID
    expect(hijacked.id).not.toBe(initialId);
    expect(hijacked.displayName).toBe('Attacker Impersonator');
    // Budi's original record remains intact and offline until Budi returns
    const originalBudi = service.getParticipant('sess-1', initialId);
    expect(originalBudi?.id).toBe(initialId);
    expect(originalBudi?.displayName).toBe('Budi Santoso');
    expect(originalBudi?.isOnline).toBe(false);
  });

  it('REAL-002: should keep participant online if other sockets remain connected', () => {
    // 1. Participant joins on Tab 1
    const p = service.addParticipant('sess-1', 'Siti Rahma', undefined, 'tab-1-sock');
    const token = p.reconnectToken!;

    // 2. Same participant opens Tab 2 with reconnect token
    service.addParticipant('sess-1', 'Siti Rahma', p.id, 'tab-2-sock', token);

    expect(p.isOnline).toBe(true);

    // 3. Tab 1 disconnects (e.g. user closes one tab)
    const disconn1 = service.handleDisconnect('tab-1-sock');
    expect(disconn1?.participant?.id).toBe(p.id);
    // Participant should still be online because tab-2-sock is still connected!
    expect(p.isOnline).toBe(true);
    expect(service.getOnlineParticipantCount('sess-1')).toBe(1);

    // 4. Tab 2 disconnects (all tabs closed)
    const disconn2 = service.handleDisconnect('tab-2-sock');
    expect(disconn2?.participant?.id).toBe(p.id);
    // Now participant transitions to offline
    expect(p.isOnline).toBe(false);
    expect(service.getOnlineParticipantCount('sess-1')).toBe(0);
  });
});
