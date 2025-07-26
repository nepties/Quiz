"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { StatsService } from "@/services/statsService";
import { QuizStats as QuizStatsType } from "@/types/quiz";
import { useQuizStore } from "@/store/quizStore";
import { ChartBarIcon } from "@heroicons/react/24/solid";

interface QuizStatsProps {
  quizId: string;
  quizTitle: string;
  refreshTrigger?: number; // 통계 새로고침을 위한 트리거
}

export default function QuizStats({ quizId, refreshTrigger }: QuizStatsProps) {
  const { user } = useAuth();
  const { currentSession, currentQuiz } = useQuizStore();
  const [userStats, setUserStats] = useState<{
    bestScore: number;
    playCount: number;
  }>({ bestScore: 0, playCount: 0 });
  const [quizStats, setQuizStats] = useState<QuizStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // 최대 점수 계산
  const getMaxScore = () => {
    if (!currentQuiz) return 100;

    switch (currentQuiz.type) {
      case "fill-in-blank":
        return currentQuiz.answers.length;
      case "multiple-choice":
        return currentQuiz.questions?.length || 0;
      case "multiple-select":
        return currentQuiz.selectQuestion?.correctAnswers.length || 0;
      default:
        return 100;
    }
  };

  const maxScore = getMaxScore();

  useEffect(() => {
    loadStats();
  }, [user, quizId]);

  useEffect(() => {
    if (refreshTrigger && user) {
      loadStats();
    }
  }, [refreshTrigger, user]);

  // 게임 완료 시 통계 새로고침 (백업용)
  useEffect(() => {
    if (currentSession?.isCompleted && user) {
      // 약간의 지연을 두어 Firebase 업데이트가 완료되도록 함
      const timer = setTimeout(() => {
        loadStats();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [currentSession?.isCompleted, user]);

  const loadStats = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      if (!hasLoadedOnce) {
        setLoading(true);
      }

      // 사용자 개인 통계 로드
      const userQuizStats = await StatsService.getUserQuizStats(
        user.uid,
        quizId
      );
      setUserStats(userQuizStats);

      // 전체 퀴즈 통계 로드
      const globalQuizStats = await StatsService.getQuizStats(quizId);
      setQuizStats(globalQuizStats);
    } catch (error) {
      console.error("통계 로드 실패:", error);
    } finally {
      setLoading(false);
      setHasLoadedOnce(true);
    }
  };

  if (!user) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
        <p className="text-center text-gray-600">
          로그인하면 개인 기록을 확인할 수 있습니다.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mt-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <ChartBarIcon className="w-5 h-5" />
        플레이 기록
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-3 font-medium text-gray-700">
                사용자
              </th>
              <th className="text-center py-2 px-3 font-medium text-gray-700">
                최고 점수 (/{maxScore})
              </th>
              <th className="text-center py-2 px-3 font-medium text-gray-700">
                플레이 횟수
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-3 font-medium text-gray-800">
                <div className="flex items-center gap-2">
                  {user?.photoURL && (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="w-5 h-5 rounded-full"
                    />
                  )}
                  <span className="text-lg">
                    {user?.displayName || user?.email}
                  </span>
                </div>
              </td>
              <td className="py-3 px-3">
                {userStats.playCount === 0 ? (
                  <div className="text-center">
                    <span className="text-gray-500 text-sm">
                      아직 플레이하지 않았습니다
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 w-full">
                    {/* 막대 그래프 */}
                    <div className="flex-1 bg-gray-200 rounded-full h-2 relative">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-in-out"
                        style={{
                          width: `${Math.min(userStats.bestScore, 100)}%`,
                        }}
                      ></div>
                    </div>
                    {/* 점수 숫자 */}
                    <span className="font-semibold text-gray-800 text-lg flex-shrink-0">
                      {Math.round((userStats.bestScore * maxScore) / 100)}
                    </span>
                  </div>
                )}
              </td>
              <td className="py-3 px-3 text-center">
                <span className="font-semibold text-gray-800 text-lg">
                  {userStats.playCount || "-"}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
