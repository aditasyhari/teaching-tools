export type RaisedHandStatus = 'RAISED' | 'ACKNOWLEDGED' | 'SPEAKING' | 'LOWERED';

export interface RaisedHandItem {
  id: string;
  sessionId: string;
  participantId: string;
  displayName: string;
  status: RaisedHandStatus;
  raisedAt: number;
  acknowledgedAt?: number;
  speakingAt?: number;
  loweredAt?: number;
}

export interface TeacherRaiseHandSnapshot {
  queue: RaisedHandItem[];
  currentSpeaker: RaisedHandItem | null;
  raisedCount: number;
}

export interface ParticipantRaiseHandSnapshot {
  myHand: RaisedHandItem | null;
  currentSpeaker: { displayName: string } | null;
  queuePosition: number | null;
  totalRaisedCount: number;
}

// Client-to-server WebSocket payloads
export interface RaiseHandPayload {
  sessionId: string;
}

export interface LowerHandPayload {
  sessionId: string;
}

export interface AcknowledgeHandPayload {
  sessionId: string;
  handId: string;
}

export interface StartSpeakingPayload {
  sessionId: string;
  handId: string;
}

export interface LowerParticipantHandPayload {
  sessionId: string;
  handId: string;
}

export interface LowerAllHandsPayload {
  sessionId: string;
}

// Server-to-client WebSocket event payloads
export interface HandRaisedEvent {
  hand: RaisedHandItem;
  queueCount: number;
}

export interface HandAcknowledgedEvent {
  handId: string;
  participantId: string;
}

export interface HandSpeakingEvent {
  handId: string;
  participantId: string;
  displayName: string;
}

export interface HandLoweredEvent {
  handId: string;
  participantId: string;
}

export interface HandQueueUpdateEvent {
  queueCount: number;
}

export interface HandErrorEvent {
  code: string;
  message: string;
}
