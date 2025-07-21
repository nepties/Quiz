export type QuizType = "fill-in-blank" | "multiple-choice";

export interface Quiz {
  id: string;
  title: string;
  description: string;
  type: QuizType;
  answers: Answer[];
  category: string;
  timeLimit: number;
  questions?: MultipleChoiceQuestion[];
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

export interface QuizSession {
  score: number;
  isCompleted: boolean;
  startTime: number;
  endTime?: number;
}
