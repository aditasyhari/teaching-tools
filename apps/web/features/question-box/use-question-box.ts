'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { Socket } from 'socket.io-client';
import type {
  QuestionBoxItem,
  ParticipantQuestionItem,
  SharedQuestionItem,
  TeacherQuestionBoxSnapshot,
  ParticipantQuestionBoxSnapshot,
  QuestionSubmittedEvent,
  QuestionCreatedEvent,
  QuestionHighlightedEvent,
  QuestionUnhighlightedEvent,
  QuestionAnsweredEvent,
  QuestionDismissedEvent,
  QuestionCountUpdateEvent,
  QuestionErrorEvent,
} from '@walikelas/types';

interface UseQuestionBoxOptions {
  socket: Socket | null;
  sessionId?: string;
  isTeacher?: boolean;
}

export function useQuestionBox({ socket, sessionId, isTeacher = false }: UseQuestionBoxOptions) {
  // Teacher state
  const [questions, setQuestions] = useState<QuestionBoxItem[]>([]);
  const [highlightedQuestionId, setHighlightedQuestionId] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [answeredCount, setAnsweredCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Participant state
  const [myQuestions, setMyQuestions] = useState<ParticipantQuestionItem[]>([]);

  // Shared state (for projector, teacher, and participant)
  const [highlightedQuestion, setHighlightedQuestion] = useState<SharedQuestionItem | null>(null);

  // Status & error states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const sessionIdRef = useRef(sessionId);
  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  useEffect(() => {
    if (!socket) return;

    // Snapshot on join or reconnect
    const onQuestionState = (
      state: TeacherQuestionBoxSnapshot | ParticipantQuestionBoxSnapshot,
    ) => {
      if (!state) return;

      if (isTeacher) {
        const tState = state as TeacherQuestionBoxSnapshot;
        setQuestions(tState.questions || []);
        setHighlightedQuestionId(tState.highlightedQuestionId || null);
        setPendingCount(tState.pendingCount || 0);
        setAnsweredCount(tState.answeredCount || 0);
        setTotalCount(tState.totalCount || 0);

        if (tState.highlightedQuestionId) {
          const hq = (tState.questions || []).find((q) => q.id === tState.highlightedQuestionId);
          if (hq) {
            setHighlightedQuestion({
              id: hq.id,
              content: hq.content,
              authorName: hq.authorName,
              isAnonymous: hq.isAnonymous,
              createdAt: hq.createdAt,
            });
          }
        } else {
          setHighlightedQuestion(null);
        }
      } else {
        const pState = state as ParticipantQuestionBoxSnapshot;
        setMyQuestions(pState.myQuestions || []);
        setHighlightedQuestion(pState.highlightedQuestion || null);
      }
    };

    // Teacher: new question created by any participant
    const onQuestionCreated = (payload: QuestionCreatedEvent) => {
      if (!isTeacher) return;
      setQuestions((prev) => {
        // Prevent duplicate addition
        if (prev.some((q) => q.id === payload.question.id)) return prev;
        return [payload.question, ...prev];
      });
    };

    // Teacher: count update
    const onCountUpdate = (payload: QuestionCountUpdateEvent) => {
      if (!isTeacher) return;
      setPendingCount(payload.pendingCount);
      setAnsweredCount(payload.answeredCount);
      setTotalCount(payload.totalCount);
    };

    // Participant: my question successfully submitted
    const onQuestionSubmitted = (payload: QuestionSubmittedEvent) => {
      setIsSubmitting(false);
      setSuccessMessage('Pertanyaan Anda berhasil dikirim ke guru');
      setMyQuestions((prev) => {
        if (prev.some((q) => q.id === payload.question.id)) return prev;
        return [payload.question, ...prev];
      });
    };

    // All: a question was highlighted
    const onQuestionHighlighted = (payload: QuestionHighlightedEvent) => {
      setHighlightedQuestion(payload.question);
      setHighlightedQuestionId(payload.question.id);

      // Update question status in lists
      setQuestions((prev) =>
        prev.map((q) => {
          if (q.id === payload.question.id) {
            return { ...q, status: 'HIGHLIGHTED' };
          }
          if (q.status === 'HIGHLIGHTED') {
            return { ...q, status: 'PENDING' };
          }
          return q;
        }),
      );

      setMyQuestions((prev) =>
        prev.map((q) => {
          if (q.id === payload.question.id) {
            return { ...q, status: 'HIGHLIGHTED' };
          }
          if (q.status === 'HIGHLIGHTED') {
            return { ...q, status: 'PENDING' };
          }
          return q;
        }),
      );
    };

    // All: question unhighlighted
    const onQuestionUnhighlighted = (payload: QuestionUnhighlightedEvent) => {
      setHighlightedQuestion((current) => (current?.id === payload.questionId ? null : current));
      setHighlightedQuestionId((current) => (current === payload.questionId ? null : current));

      setQuestions((prev) =>
        prev.map((q) => (q.id === payload.questionId ? { ...q, status: 'PENDING' } : q)),
      );

      setMyQuestions((prev) =>
        prev.map((q) => (q.id === payload.questionId ? { ...q, status: 'PENDING' } : q)),
      );
    };

    // All: question answered
    const onQuestionAnswered = (payload: QuestionAnsweredEvent) => {
      setHighlightedQuestion((current) => (current?.id === payload.questionId ? null : current));
      setHighlightedQuestionId((current) => (current === payload.questionId ? null : current));

      setQuestions((prev) =>
        prev.map((q) =>
          q.id === payload.questionId ? { ...q, status: 'ANSWERED', answeredAt: Date.now() } : q,
        ),
      );

      setMyQuestions((prev) =>
        prev.map((q) =>
          q.id === payload.questionId ? { ...q, status: 'ANSWERED', answeredAt: Date.now() } : q,
        ),
      );
    };

    // All: question dismissed
    const onQuestionDismissed = (payload: QuestionDismissedEvent) => {
      setHighlightedQuestion((current) => (current?.id === payload.questionId ? null : current));
      setHighlightedQuestionId((current) => (current === payload.questionId ? null : current));

      setQuestions((prev) =>
        prev.map((q) =>
          q.id === payload.questionId ? { ...q, status: 'DISMISSED', dismissedAt: Date.now() } : q,
        ),
      );

      setMyQuestions((prev) =>
        prev.map((q) =>
          q.id === payload.questionId ? { ...q, status: 'DISMISSED', dismissedAt: Date.now() } : q,
        ),
      );
    };

    // Error handler
    const onQuestionError = (payload: QuestionErrorEvent) => {
      setIsSubmitting(false);
      setError(payload.message || 'Terjadi kesalahan pada kotak pertanyaan');
    };

    socket.on('question:state', onQuestionState);
    socket.on('question:created', onQuestionCreated);
    socket.on('question:count-update', onCountUpdate);
    socket.on('question:submitted', onQuestionSubmitted);
    socket.on('question:highlighted', onQuestionHighlighted);
    socket.on('question:unhighlighted', onQuestionUnhighlighted);
    socket.on('question:answered', onQuestionAnswered);
    socket.on('question:dismissed', onQuestionDismissed);
    socket.on('question:error', onQuestionError);

    return () => {
      socket.off('question:state', onQuestionState);
      socket.off('question:created', onQuestionCreated);
      socket.off('question:count-update', onCountUpdate);
      socket.off('question:submitted', onQuestionSubmitted);
      socket.off('question:highlighted', onQuestionHighlighted);
      socket.off('question:unhighlighted', onQuestionUnhighlighted);
      socket.off('question:answered', onQuestionAnswered);
      socket.off('question:dismissed', onQuestionDismissed);
      socket.off('question:error', onQuestionError);
    };
  }, [socket, isTeacher]);

  // Actions for Participant
  const submitQuestion = useCallback(
    (content: string, isAnonymous: boolean = false) => {
      if (!socket || !sessionIdRef.current) return;
      setError(null);
      setSuccessMessage(null);
      setIsSubmitting(true);

      socket.emit('question:submit', {
        sessionId: sessionIdRef.current,
        content,
        isAnonymous,
      });
    },
    [socket],
  );

  // Actions for Teacher
  const highlightQuestion = useCallback(
    (questionId: string) => {
      if (!socket || !sessionIdRef.current) return;
      socket.emit('question:highlight', {
        sessionId: sessionIdRef.current,
        questionId,
      });
    },
    [socket],
  );

  const unhighlightQuestion = useCallback(
    (questionId: string) => {
      if (!socket || !sessionIdRef.current) return;
      socket.emit('question:unhighlight', {
        sessionId: sessionIdRef.current,
        questionId,
      });
    },
    [socket],
  );

  const answerQuestion = useCallback(
    (questionId: string) => {
      if (!socket || !sessionIdRef.current) return;
      socket.emit('question:answer', {
        sessionId: sessionIdRef.current,
        questionId,
      });
    },
    [socket],
  );

  const dismissQuestion = useCallback(
    (questionId: string) => {
      if (!socket || !sessionIdRef.current) return;
      socket.emit('question:dismiss', {
        sessionId: sessionIdRef.current,
        questionId,
      });
    },
    [socket],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearSuccess = useCallback(() => {
    setSuccessMessage(null);
  }, []);

  return {
    questions,
    highlightedQuestionId,
    pendingCount,
    answeredCount,
    totalCount,
    myQuestions,
    highlightedQuestion,
    isSubmitting,
    error,
    successMessage,
    submitQuestion,
    highlightQuestion,
    unhighlightQuestion,
    answerQuestion,
    dismissQuestion,
    clearError,
    clearSuccess,
  };
}
