export type QuizType = "fill-in-blank" | "multiple-choice" | "multiple-select";

export interface Quiz {
  id: string;
  title: string;
  description: string;
  type: QuizType;
  answers: Answer[];
  category: string;
  timeLimit: number;
  questions?: MultipleChoiceQuestion[];
  selectQuestion?: MultipleSelectQuestion;
}

export interface Answer {
  answer: string;
  synonyms: string[];
  isCorrect: boolean;
}

export interface MultipleChoiceQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // 정답의 인덱스
}

export interface MultipleChoiceAnswer {
  questionId: string;
  selectedOption: number;
  isCorrect: boolean;
}

export interface MultipleSelectQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswers: number[]; // 정답들의 인덱스 배열
  maxSelections: number; // 선택할 수 있는 최대 개수 (정답 개수와 동일)
}

export interface MultipleSelectAnswer {
  questionId: string;
  selectedOptions: number[];
  isCorrect: boolean;
  correctCount: number; // 맞춘 정답 개수
}

export interface QuizSession {
  score: number;
  isCompleted: boolean;
  startTime: number;
  endTime?: number;
}

export interface UserGameRecord {
  id: string;
  userId: string;
  quizId: string;
  quizTitle: string;
  score: number;
  maxScore: number;
  completedAt: number;
  timeSpent: number; // 소요 시간 (초)
  quizType: QuizType;
}

export interface UserStats {
  userId: string;
  totalGames: number;
  bestScores: { [quizId: string]: number }; // 퀴즈별 최고 점수
  playCount: { [quizId: string]: number }; // 퀴즈별 플레이 횟수
  totalScore: number;
  averageScore: number;
}

export interface QuizStats {
  quizId: string;
  totalPlays: number;
  averageScore: number;
  bestScore: number;
  totalScore: number;
}
