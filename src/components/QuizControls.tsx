import { ReactNode } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/solid";

interface QuizControlsProps {
  isGameStarted: boolean;
  isCompleted: boolean;
  currentScore: number;
  totalScore: number;
  timeLeft: number;
  onStart: () => void;
  onRestart: () => void;
  onEndQuiz?: () => void;
  children?: ReactNode; // 커스텀 입력 컴포넌트나 기타 UI
  showEndButton?: boolean;
}

export default function QuizControls({
  isGameStarted,
  isCompleted,
  currentScore,
  totalScore,
  timeLeft,
  onStart,
  onRestart,
  onEndQuiz,
  children,
  showEndButton = false
}: QuizControlsProps) {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className={isCompleted ? "mb-6" : "mb-12"}>
      <div className="flex items-center gap-4">
        <div className="w-1/2 relative">
          {!isGameStarted ? (
            <button
              onClick={onStart}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-base font-bold h-10"
            >
              시작하기
            </button>
          ) : isCompleted ? (
            <button
              onClick={onRestart}
              className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-base font-bold h-10 flex items-center justify-center gap-2"
            >
              <ArrowPathIcon className="w-5 h-5" />
              다시하기
            </button>
          ) : (
            children || (
              <div className="flex items-center space-x-6">
                {/* 기본 게임 진행 중 UI */}
              </div>
            )
          )}
        </div>
        
        <div className="flex-1"></div>
        
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <div className="text-xs text-gray-500">점수</div>
            <div className="text-lg font-bold text-gray-800">
              {currentScore} / {totalScore}
            </div>
          </div>
          <div className="text-center relative">
            <div className="text-xs text-gray-500">시간</div>
            <div className="text-lg font-bold font-mono text-gray-800">
              {minutes.toString().padStart(2, "0")}:
              {seconds.toString().padStart(2, "0")}
            </div>
            {showEndButton && isGameStarted && !isCompleted && onEndQuiz && (
              <button
                onClick={onEndQuiz}
                className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 text-xs text-red-500 hover:text-red-700 underline whitespace-nowrap"
              >
                포기하기
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}