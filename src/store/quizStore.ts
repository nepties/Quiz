import { create } from "zustand";
import { Quiz, QuizSession } from "@/types/quiz";

interface QuizStore {
  currentQuiz: Quiz | null;
  currentSession: QuizSession | null;
  availableQuizzes: Quiz[];
  foundAnswers: string[];
  isGameStarted: boolean;

  // Actions
  setAvailableQuizzes: (quizzes: Quiz[]) => void;
  startQuiz: (quiz: Quiz) => void;
  startGame: () => void;
  submitAnswer: (answer: string) => string | false;
  endQuiz: () => void;
  resetQuiz: () => void;
}

export const useQuizStore = create<QuizStore>((set, get) => ({
  currentQuiz: null,
  currentSession: null,
  availableQuizzes: [],
  foundAnswers: [],
  isGameStarted: false,

  setAvailableQuizzes: (quizzes: Quiz[]) => set({ availableQuizzes: quizzes }),

  startQuiz: (quiz: Quiz) => {
    const session: QuizSession = {
      score: 0,
      isCompleted: false,
      startTime: Date.now(),
    };

    set({
      currentQuiz: quiz,
      currentSession: session,
      foundAnswers: [],
      isGameStarted: false,
    });
  },

  startGame: () => {
    set({ isGameStarted: true });
  },

  submitAnswer: (answer: string) => {
    const { currentQuiz, currentSession, foundAnswers } = get();
    if (!currentQuiz || !currentSession) return false;

    const matchedAnswer = currentQuiz.answers.find(answerObj =>
      answerObj.synonyms.some(
        synonym =>
          answer.toLowerCase().trim().replace(/\s+/g, "") ===
          synonym.toLowerCase().trim().replace(/\s+/g, "")
      )
    );

    if (matchedAnswer && !foundAnswers.includes(matchedAnswer.answer)) {
      const newScore = currentSession.score + 1;
      const newFoundAnswers = [...foundAnswers, matchedAnswer.answer];

      // 모든 답을 맞춘 경우 게임 종료
      const isGameComplete = newFoundAnswers.length === currentQuiz.answers.length;

      set({
        currentSession: {
          ...currentSession,
          score: newScore,
          isCompleted: isGameComplete,
          endTime: isGameComplete ? Date.now() : undefined,
        },
        foundAnswers: newFoundAnswers,
      });

      return matchedAnswer.answer;
    }

    return false;
  },

  endQuiz: () => {
    const { currentSession } = get();
    if (!currentSession) return;

    set({
      currentSession: {
        ...currentSession,
        isCompleted: true,
        endTime: Date.now(),
      },
    });
  },

  resetQuiz: () => {
    set({
      currentQuiz: null,
      currentSession: null,
      foundAnswers: [],
      isGameStarted: false,
    });
  },
}));
