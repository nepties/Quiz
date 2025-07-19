export interface Quiz {
  id: string;
  title: string;
  description: string;
  answers: Answer[];
  category: string;
  timeLimit: number;
}

export interface Answer {
  answer: string;
  synonyms: string[];
  isCorrect: boolean;
}

export interface QuizSession {
  score: number;
  isCompleted: boolean;
  startTime: number;
  endTime?: number;
}
