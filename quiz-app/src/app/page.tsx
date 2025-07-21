"use client";

import { useState, useEffect } from "react";
import { useQuizStore } from "@/store/quizStore";
import { Quiz } from "@/types/quiz";
import QuizCard from "@/components/QuizCard";
import QuizGame from "@/components/QuizGame";
import MultipleChoiceQuiz from "@/components/MultipleChoiceQuiz";
import nflQuizData from "@/data/nfl-quiz.json";
import hearthstoneQuizData from "@/data/hearthstone-quiz.json";
import historyQuizData from "@/data/history-quiz.json";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { currentQuiz, availableQuizzes, setAvailableQuizzes, startQuiz } =
    useQuizStore();

  useEffect(() => {
    setMounted(true);
    const allQuizzes = [...nflQuizData, ...hearthstoneQuizData, historyQuizData] as Quiz[];
    setAvailableQuizzes(allQuizzes);
  }, [setAvailableQuizzes]);

  if (!mounted) {
    return null;
  }

  if (currentQuiz) {
    if (currentQuiz.type === "multiple-choice") {
      return <MultipleChoiceQuiz />;
    } else {
      return <QuizGame />;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-8 shadow-sm">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-2 text-gray-800">Quiz Game</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableQuizzes.map(quiz => (
            <QuizCard key={quiz.id} quiz={quiz} onStart={startQuiz} />
          ))}
        </div>
      </div>
    </div>
  );
}
