'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { Socket } from 'socket.io-client';
import type {
  TeacherLiveQuizSnapshot,
  ParticipantLiveQuizSnapshot,
  ParticipantQuestionData,
  QuizLeaderboardEntry,
  QuizQuestionStartedEvent,
  QuizQuestionEndedEvent,
  QuizAnswerAcceptedEvent,
  QuizCompletedEvent,
} from '@walikelas/types';

interface QuizErrorEvent {
  code: string;
  message: string;
}

interface UseLiveQuizOptions {
  socket: Socket | null;
  sessionId?: string;
  isTeacher?: boolean;
}

export function useLiveQuiz({ socket, sessionId, isTeacher = false }: UseLiveQuizOptions) {
  // Common states
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [isQuestionEnded, setIsQuestionEnded] = useState(false);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);

  // Question details
  const [questionNumber, setQuestionNumber] = useState<number>(1);
  const [totalQuestions, setTotalQuestions] = useState<number>(1);
  const [questionDeadline, setQuestionDeadline] = useState<number>(0);

  // Teacher specific state
  const [teacherSnapshot, setTeacherSnapshot] = useState<TeacherLiveQuizSnapshot | null>(null);
  const [distribution, setDistribution] = useState<Record<string, number>>({});
  const [answeredCount, setAnsweredCount] = useState<number>(0);
  const [totalParticipants, setTotalParticipants] = useState<number>(0);
  const [correctOptionId, setCorrectOptionId] = useState<string | null>(null);

  // Participant specific state
  const [participantQuestion, setParticipantQuestion] = useState<ParticipantQuestionData | null>(
    null,
  );
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const [pointsEarned, setPointsEarned] = useState<number>(0);
  const [totalScore, setTotalScore] = useState<number>(0);

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState<QuizLeaderboardEntry[]>([]);

  // Keep ref to avoid stale state in callbacks
  const sessionIdRef = useRef(sessionId);
  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  useEffect(() => {
    if (!socket) return;

    // Event: quiz:started
    const onQuizStarted = (payload: { quizId: string; title: string; totalQuestions: number }) => {
      setIsQuizActive(true);
      setIsQuizFinished(false);
      setIsQuestionEnded(false);
      setTotalQuestions(payload.totalQuestions);
      setQuizError(null);
    };

    // Event: quiz:state (authoritative snapshot)
    const onQuizState = (state: TeacherLiveQuizSnapshot | ParticipantLiveQuizSnapshot | null) => {
      if (!state) {
        setIsQuizActive(false);
        return;
      }

      setIsQuizActive(state.status !== 'COMPLETED');
      setIsQuestionEnded(state.status === 'QUESTION_ENDED');
      setIsQuizFinished(state.status === 'COMPLETED');
      setTotalQuestions(state.totalQuestions);
      setQuestionNumber(state.currentQuestionIndex + 1);

      if (isTeacher) {
        const tState = state as TeacherLiveQuizSnapshot;
        setTeacherSnapshot(tState);
        setDistribution(tState.distribution || {});
        setAnsweredCount(tState.answeredCount || 0);
        setTotalParticipants(tState.totalParticipants || 0);
        setQuestionDeadline(tState.deadline || 0);
        if (tState.leaderboard) {
          setLeaderboard(tState.leaderboard);
        }
        if (tState.currentQuestion) {
          const correctOpt = tState.currentQuestion.options.find((o) => o.isCorrect);
          if (correctOpt) {
            setCorrectOptionId(correctOpt.id);
          }
        }
      } else {
        const pState = state as ParticipantLiveQuizSnapshot;
        if (pState.currentQuestion) {
          setParticipantQuestion(pState.currentQuestion);
        }
        setQuestionDeadline(pState.deadline || 0);
        setHasAnswered(pState.hasAnswered);
        setSelectedOptionId(pState.selectedOptionId || null);
        setTotalScore(pState.totalScore || 0);
        if (pState.wasCorrect !== undefined) {
          setWasCorrect(pState.wasCorrect);
        }
        if (pState.pointsEarned !== undefined) {
          setPointsEarned(pState.pointsEarned);
        }
      }
    };

    // Event: quiz:question-started
    const onQuestionStarted = (payload: QuizQuestionStartedEvent) => {
      setIsQuizActive(true);
      setIsQuestionEnded(false);
      setQuestionNumber(payload.questionNumber);
      setTotalQuestions(payload.totalQuestions);
      setQuestionDeadline(payload.deadline);
      setCorrectOptionId(null);
      setDistribution({});
      setAnsweredCount(0);

      if (!isTeacher) {
        setParticipantQuestion(payload.question);
        setHasAnswered(false);
        setSelectedOptionId(null);
        setWasCorrect(null);
        setPointsEarned(0);
      }
    };

    // Event: quiz:answer-accepted (sent to participant)
    const onAnswerAccepted = (payload: QuizAnswerAcceptedEvent) => {
      setHasAnswered(true);
      setSelectedOptionId(payload.optionId);
    };

    // Event: quiz:stats-update (sent to room)
    const onStatsUpdate = (payload: { answeredCount: number; totalParticipants: number }) => {
      setAnsweredCount(payload.answeredCount);
      setTotalParticipants(payload.totalParticipants);
    };

    // Event: quiz:distribution-update (sent to teacher)
    const onDistributionUpdate = (payload: {
      distribution: Record<string, number>;
      answeredCount: number;
    }) => {
      setDistribution(payload.distribution);
      setAnsweredCount(payload.answeredCount);
    };

    // Event: quiz:question-ended (reveals answer to all)
    const onQuestionEnded = (payload: QuizQuestionEndedEvent) => {
      setIsQuestionEnded(true);
      if (payload.correctOptionId) {
        setCorrectOptionId(payload.correctOptionId);
      }
      if (payload.distribution) {
        setDistribution(payload.distribution);
      }

      if (!isTeacher) {
        setSelectedOptionId((currentSelected) => {
          if (currentSelected) {
            const isAnswerCorrect = currentSelected === payload.correctOptionId;
            setWasCorrect(isAnswerCorrect);
            if (isAnswerCorrect && participantQuestion?.points) {
              setPointsEarned(participantQuestion.points);
              setTotalScore((prev) => prev + participantQuestion.points);
            }
          }
          return currentSelected;
        });
      }
    };

    // Event: quiz:finished
    const onQuizFinished = (payload: QuizCompletedEvent) => {
      setIsQuizActive(false);
      setIsQuestionEnded(false);
      setIsQuizFinished(true);
      setLeaderboard(payload.leaderboard || []);
    };

    // Event: quiz:error
    const onQuizError = (payload: QuizErrorEvent) => {
      setQuizError(payload.message || 'Terjadi kesalahan pada kuis');
    };

    socket.on('quiz:started', onQuizStarted);
    socket.on('quiz:state', onQuizState);
    socket.on('quiz:question-started', onQuestionStarted);
    socket.on('quiz:answer-accepted', onAnswerAccepted);
    socket.on('quiz:stats-update', onStatsUpdate);
    socket.on('quiz:distribution-update', onDistributionUpdate);
    socket.on('quiz:question-ended', onQuestionEnded);
    socket.on('quiz:finished', onQuizFinished);
    socket.on('quiz:error', onQuizError);

    return () => {
      socket.off('quiz:started', onQuizStarted);
      socket.off('quiz:state', onQuizState);
      socket.off('quiz:question-started', onQuestionStarted);
      socket.off('quiz:answer-accepted', onAnswerAccepted);
      socket.off('quiz:stats-update', onStatsUpdate);
      socket.off('quiz:distribution-update', onDistributionUpdate);
      socket.off('quiz:question-ended', onQuestionEnded);
      socket.off('quiz:finished', onQuizFinished);
      socket.off('quiz:error', onQuizError);
    };
  }, [socket, isTeacher, participantQuestion?.points]);

  // Actions for Teacher
  const startQuiz = useCallback(
    (quizId: string) => {
      if (!socket || !sessionIdRef.current) return;
      socket.emit('quiz:start', {
        sessionId: sessionIdRef.current,
        quizId,
      });
    },
    [socket],
  );

  const endQuestion = useCallback(() => {
    if (!socket || !sessionIdRef.current) return;
    // Optimistic 0ms update
    setIsQuestionEnded(true);
    socket.emit('quiz:end-question', {
      sessionId: sessionIdRef.current,
    });
  }, [socket]);

  const nextQuestion = useCallback(() => {
    if (!socket || !sessionIdRef.current) return;
    socket.emit('quiz:next-question', {
      sessionId: sessionIdRef.current,
    });
  }, [socket]);

  const finishQuiz = useCallback(() => {
    if (!socket || !sessionIdRef.current) return;
    // Optimistic 0ms update
    setIsQuizActive(false);
    setIsQuestionEnded(false);
    setIsQuizFinished(true);
    socket.emit('quiz:finish', {
      sessionId: sessionIdRef.current,
    });
  }, [socket]);

  // Action for Participant
  const submitAnswer = useCallback(
    (questionId: string, optionId: string) => {
      if (!socket || !sessionIdRef.current || hasAnswered) return;
      socket.emit('quiz:answer', {
        sessionId: sessionIdRef.current,
        questionId,
        optionId,
      });
      // Optimistic selection update
      setSelectedOptionId(optionId);
    },
    [socket, hasAnswered],
  );

  return {
    isQuizActive,
    isQuestionEnded,
    isQuizFinished,
    quizError,
    // Progress
    questionNumber,
    totalQuestions,
    questionDeadline,
    // Teacher states & actions
    teacherSnapshot,
    distribution,
    answeredCount,
    totalParticipants,
    correctOptionId,
    leaderboard,
    startQuiz,
    endQuestion,
    nextQuestion,
    finishQuiz,
    // Participant states & actions
    participantQuestion,
    hasAnswered,
    selectedOptionId,
    wasCorrect,
    pointsEarned,
    totalScore,
    submitAnswer,
  };
}
