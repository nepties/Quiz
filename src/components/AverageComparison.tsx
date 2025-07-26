import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { StatsService } from "@/services/statsService";

interface AverageComparisonProps {
  quizId: string;
  isCompleted: boolean;
  currentScore: number;
  totalScore: number;
  className?: string;
}

export default function AverageComparison({ 
  quizId, 
  isCompleted, 
  currentScore,
  totalScore,
  className = "" 
}: AverageComparisonProps) {
  const { user } = useAuth();
  const [showComparison, setShowComparison] = useState(false);
  const [averageScore, setAverageScore] = useState<number>(0);

  const loadComparisonData = async () => {
    if (!isCompleted) return;

    try {
      const globalStats = await StatsService.getQuizStats(quizId);

      if (globalStats) {
        setAverageScore(globalStats.averageScore);
        setShowComparison(true);
      }
    } catch (error) {
      console.error('평균 비교 데이터 로드 실패:', error);
    }
  };

  useEffect(() => {
    if (isCompleted) {
      loadComparisonData();
    } else {
      setShowComparison(false);
    }
  }, [isCompleted, quizId]);

  if (!showComparison) {
    return null;
  }

  // 현재 점수를 퍼센트로 계산
  const currentScorePercentage = (currentScore / totalScore) * 100;

  return (
    <div className={`mt-6 mb-4 ${className}`}>
      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-md">
          <span className="text-gray-600">내 점수</span>
          <span className="font-bold text-blue-700">{Math.round(currentScorePercentage)}%</span>
        </div>
        
        <div className="text-gray-400 font-medium">vs</div>
        
        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-md">
          <span className="text-gray-600">평균</span>
          <span className="font-bold text-green-700">{Math.round(averageScore)}%</span>
        </div>
      </div>
    </div>
  );
}