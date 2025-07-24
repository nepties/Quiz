"use client";

import { useState, useEffect } from "react";
import { useQuizStore } from "@/store/quizStore";
import { Quiz } from "@/types/quiz";
import { QuizService } from "@/services/quizService";
import QuizCard from "@/components/QuizCard";
import QuizGame from "@/components/QuizGame";
import MultipleChoiceQuiz from "@/components/MultipleChoiceQuiz";
import MultipleSelectQuiz from "@/components/MultipleSelectQuiz";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentQuiz, availableQuizzes, setAvailableQuizzes, startQuiz } =
    useQuizStore();

  useEffect(() => {
    setMounted(true);
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);

      // Firebase에서 퀴즈 데이터 가져오기
      const quizzes = await QuizService.getAllQuizzes();
      setAvailableQuizzes(quizzes);
      console.log(`Firebase에서 ${quizzes.length}개의 퀴즈를 로드했습니다.`);
    } catch (error) {
      console.error("Firebase에서 퀴즈를 로드하는 중 오류 발생:", error);
      setError(
        "퀴즈 데이터를 불러오는 중 오류가 발생했습니다. Firebase 연결을 확인해주세요."
      );
      setAvailableQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  if (currentQuiz) {
    if (currentQuiz.type === "multiple-choice") {
      return <MultipleChoiceQuiz />;
    } else if (currentQuiz.type === "multiple-select") {
      return <MultipleSelectQuiz />;
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
          {error && <p className="text-sm text-red-600 mt-2">⚠️ {error}</p>}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex justify-center items-center min-h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">퀴즈 데이터를 불러오는 중...</p>
            </div>
          </div>
        ) : availableQuizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableQuizzes.map(quiz => (
              <QuizCard key={quiz.id} quiz={quiz} onStart={startQuiz} />
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center min-h-64">
            <div className="text-center">
              <p className="text-gray-600 text-lg mb-4">
                퀴즈 데이터를 불러올 수 없습니다.
              </p>
              <button
                onClick={loadQuizzes}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium"
              >
                다시 시도
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
