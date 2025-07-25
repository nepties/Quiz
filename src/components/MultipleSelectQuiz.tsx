import { useState, useEffect, useCallback } from "react";
import { useQuizStore } from "@/store/quizStore";
import { MultipleSelectQuestion } from "@/types/quiz";
import { ArrowPathIcon, HomeIcon } from "@heroicons/react/24/solid";
import QuizStats from "./QuizStats";
import QuizControls from "./QuizControls";
import AverageComparison from "./AverageComparison";
import LoginButton from "./LoginButton";
import { useAuth } from "@/contexts/AuthContext";
import { StatsService } from "@/services/statsService";

export default function MultipleSelectQuiz() {
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState<{text: string; originalIndex: number}[]>([]);

  const {
    currentQuiz,
    currentSession,
    isGameStarted,
    startGame,
    resetQuiz,
  } = useQuizStore();

  const { user } = useAuth();
  const [statsRefreshTrigger, setStatsRefreshTrigger] = useState(0);

  const selectQuestion = currentQuiz?.selectQuestion;
  const maxSelections = selectQuestion?.maxSelections || 0;

  // 배열을 섞는 함수
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // 게임 시작 시 선택지 섞기
  useEffect(() => {
    if (selectQuestion && isGameStarted && shuffledOptions.length === 0) {
      const optionsWithIndex = selectQuestion.options.map((text, index) => ({
        text,
        originalIndex: index
      }));
      const shuffled = shuffleArray(optionsWithIndex);
      setShuffledOptions(shuffled);
    }
  }, [selectQuestion, isGameStarted, shuffledOptions.length]);

  // 실시간 점수 계산 (선택할 때마다 즉시 계산)
  const currentScore = selectedOptions.filter(option =>
    selectQuestion?.correctAnswers.includes(option)
  ).length;
  const totalScore = selectQuestion?.correctAnswers.length || 0;

  // 퀴즈 완료 처리 함수
  const handleQuizComplete = useCallback(() => {
    if (!selectQuestion || isCompleted) return;

    setIsCompleted(true);

    useQuizStore.setState(state => ({
      currentSession: state.currentSession
        ? {
            ...state.currentSession,
            score: currentScore,
            isCompleted: true,
            endTime: Date.now(),
          }
        : null,
    }));
  }, [selectQuestion, currentScore, isCompleted]);

  useEffect(() => {
    if (
      currentQuiz &&
      currentSession &&
      !currentSession.isCompleted &&
      isGameStarted
    ) {
      setTimeLeft(currentQuiz.timeLimit);

      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleQuizComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [
    currentQuiz,
    currentSession?.isCompleted,
    isGameStarted,
    handleQuizComplete,
  ]);

  // 게임 완료 시 기록 저장
  useEffect(() => {
    const saveGameRecord = async () => {
      if (
        user &&
        currentQuiz &&
        currentSession &&
        currentSession.isCompleted &&
        currentSession.endTime &&
        selectQuestion
      ) {
        try {
          await StatsService.saveGameRecord({
            userId: user.uid,
            quizId: currentQuiz.id,
            quizTitle: currentQuiz.title,
            score: currentSession.score,
            maxScore: selectQuestion.correctAnswers.length,
            timeSpent: Math.floor((currentSession.endTime - currentSession.startTime) / 1000),
            quizType: currentQuiz.type,
            completedAt: currentSession.endTime
          });
          console.log('게임 기록 저장 완료');
          // 통계 새로고침 트리거
          setStatsRefreshTrigger(prev => prev + 1);
        } catch (error) {
          console.error('게임 기록 저장 실패:', error);
        }
      }
    };

    saveGameRecord();
  }, [user, currentQuiz, currentSession?.isCompleted, currentSession?.endTime, selectQuestion]);

  // 최대 선택 개수에 도달하면 자동으로 완료 처리
  useEffect(() => {
    if (
      selectedOptions.length === maxSelections &&
      maxSelections > 0 &&
      !isCompleted
    ) {
      // 1초 후 자동 완료
      const timer = setTimeout(() => {
        handleQuizComplete();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [selectedOptions.length, maxSelections, handleQuizComplete, isCompleted]);

  const handleOptionSelect = (shuffledIndex: number) => {
    if (isCompleted || currentSession?.isCompleted) return;

    // 섞인 배열에서 원래 인덱스 찾기
    const originalIndex = shuffledOptions[shuffledIndex]?.originalIndex;
    if (originalIndex === undefined) return;

    // 이미 선택된 옵션이면 무시 (취소 불가)
    if (selectedOptions.includes(originalIndex)) return;

    // 최대 선택 개수에 도달했으면 무시
    if (selectedOptions.length >= maxSelections) return;

    // 새로운 옵션 추가 (원래 인덱스로 저장)
    setSelectedOptions(prev => [...prev, originalIndex]);
  };

  const handleRestart = () => {
    setSelectedOptions([]);
    setIsCompleted(false);
    setShuffledOptions([]);

    const { currentQuiz } = useQuizStore.getState();
    if (currentQuiz) {
      useQuizStore.setState({
        currentSession: {
          score: 0,
          isCompleted: false,
          startTime: Date.now(),
        },
        isGameStarted: false,
      });
    }
  };

  if (!currentQuiz || !currentSession || !selectQuestion) {
    return null;
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={resetQuiz}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded font-bold flex items-center gap-2"
            >
              <HomeIcon className="w-4 h-4" />
              메인으로
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              {currentQuiz.title}
            </h1>
          </div>
          <LoginButton />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Quiz Content */}
        <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
          <QuizControls
            isGameStarted={isGameStarted}
            isCompleted={currentSession.isCompleted}
            currentScore={currentScore}
            totalScore={totalScore}
            timeLeft={timeLeft}
            onStart={startGame}
            onRestart={handleRestart}
            onEndQuiz={handleQuizComplete}
            showEndButton={true}
          >
            <div className="text-center">
              <div className="text-xs text-gray-500">남은 횟수</div>
              <div className="text-lg font-bold text-gray-800">
                {maxSelections - selectedOptions.length}
              </div>
            </div>
          </QuizControls>
          
          <AverageComparison
            quizId={currentQuiz.id}
            isCompleted={currentSession.isCompleted}
            currentScore={currentScore}
            totalScore={totalScore}
          />

          {/* Question Content - Always visible when game started */}
          {isGameStarted && (
            <div>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {selectQuestion.question}
                </h2>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
                {shuffledOptions.map((optionData, shuffledIndex) => {
                  const { text, originalIndex } = optionData;
                  const isSelected = selectedOptions.includes(originalIndex);
                  const isCorrect =
                    selectQuestion.correctAnswers.includes(originalIndex);

                  let buttonClass =
                    "bg-gray-50 border-gray-300 hover:bg-gray-100";
                  let cursorClass = "";

                  if (isSelected) {
                    if (isCorrect) {
                      // 선택한 정답은 진한 초록색으로 표시
                      buttonClass =
                        "bg-green-200 border-green-600 text-green-800";
                    } else {
                      // 선택한 오답은 빨간색으로 표시
                      buttonClass = "bg-red-100 border-red-500 text-red-700";
                    }
                    cursorClass = "cursor-not-allowed";
                  } else if (currentSession.isCompleted && isCorrect) {
                    // 완료 후 선택하지 않은 정답들은 연한 노란색으로 표시
                    buttonClass =
                      "bg-yellow-100 border-yellow-500 text-yellow-700";
                    cursorClass = "cursor-not-allowed";
                  } else if (currentSession.isCompleted) {
                    cursorClass = "cursor-not-allowed";
                  } else if (selectedOptions.length >= maxSelections) {
                    // 최대 선택 개수에 도달한 경우
                    buttonClass = "bg-gray-100 border-gray-300 text-gray-500";
                    cursorClass = "cursor-not-allowed";
                  }

                  return (
                    <button
                      key={shuffledIndex}
                      onClick={() => handleOptionSelect(shuffledIndex)}
                      disabled={
                        isSelected ||
                        currentSession.isCompleted ||
                        selectedOptions.length >= maxSelections
                      }
                      className={`text-center p-4 rounded-lg border-2 transition-all ${buttonClass} ${cursorClass}`}
                    >
                      {text}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 통계 표시 */}
        <QuizStats 
          quizId={currentQuiz.id} 
          quizTitle={currentQuiz.title} 
          refreshTrigger={statsRefreshTrigger}
        />
      </div>
    </div>
  );
}
