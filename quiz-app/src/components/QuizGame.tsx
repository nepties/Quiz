import { useState, useEffect, useRef } from "react";
import { useQuizStore } from "@/store/quizStore";
import { QuizSession } from "@/types/quiz";
import { ArrowPathIcon, HomeIcon } from "@heroicons/react/24/solid";

export default function QuizGame() {
  const [inputValue, setInputValue] = useState("");
  const { currentQuiz } = useQuizStore();
  const [timeLeft, setTimeLeft] = useState(currentQuiz?.timeLimit || 0);
  const isComposingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    currentSession,
    foundAnswers,
    isGameStarted,
    submitAnswer,
    startGame,
    endQuiz,
    resetQuiz,
  } = useQuizStore();

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
            endQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentQuiz, currentSession?.isCompleted, endQuiz, isGameStarted]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const checkAnswer = (value: string) => {
    if (value.trim()) {
      const result = submitAnswer(value.trim());

      if (result) {
        // 조합 상태 초기화
        isComposingRef.current = false;
        setInputValue("");

        // 포커스 유지
        setTimeout(() => {
          inputRef.current?.focus();
        }, 0);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // 기존 타이머 클리어
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 조합 중이 아닐 때는 바로 정답 체크
    if (!isComposingRef.current) {
      checkAnswer(value);
    } else {
      // 조합 중일 때는 짧은 지연 후 정답 체크
      timeoutRef.current = setTimeout(() => {
        checkAnswer(value);
      }, 100);
    }
  };

  const handleCompositionStart = () => {
    isComposingRef.current = true;
  };

  const handleCompositionEnd = (
    e: React.CompositionEvent<HTMLInputElement>
  ) => {
    isComposingRef.current = false;

    // 조합 완료 후 정답 체크
    const value = e.currentTarget.value;
    checkAnswer(value);
  };

  const handleEndQuiz = () => {
    endQuiz();
  };

  const handleRestart = () => {
    setInputValue("");
    const session: QuizSession = {
      score: 0,
      isCompleted: false,
      startTime: Date.now(),
    };

    const { currentQuiz } = useQuizStore.getState();
    if (currentQuiz) {
      useQuizStore.setState({
        currentSession: session,
        foundAnswers: [],
        isGameStarted: false,
      });
    }
  };

  if (!currentQuiz || !currentSession) {
    return null;
  }

  const displayTimeLeft = isGameStarted
    ? timeLeft
    : currentQuiz?.timeLimit || 0;
  const minutes = Math.floor(displayTimeLeft / 60);
  const seconds = displayTimeLeft % 60;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
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
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex flex-col items-center">
          {/* Combined Input and Answers Section */}
          <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200 w-full max-w-4xl">
            {/* Input Section */}
            <div className="mb-12">
              <div className="flex items-center gap-4">
                {/* 입력 영역 / 시작 버튼 / 다시하기 버튼 */}
                <div className="w-1/2 relative">
                  {!isGameStarted ? (
                    <button
                      onClick={startGame}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-base font-bold h-10"
                    >
                      시작하기
                    </button>
                  ) : currentSession.isCompleted ? (
                    <button
                      onClick={handleRestart}
                      className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-base font-bold h-10 flex items-center justify-center gap-2"
                    >
                      <ArrowPathIcon className="w-5 h-5" />
                      다시하기
                    </button>
                  ) : (
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={handleInputChange}
                      onCompositionStart={handleCompositionStart}
                      onCompositionEnd={handleCompositionEnd}
                      placeholder="답을 입력하세요..."
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-base text-gray-800 h-10"
                      autoComplete="off"
                      autoFocus
                      key={foundAnswers.length}
                    />
                  )}
                </div>

                {/* 여백 */}
                <div className="flex-1"></div>

                {/* 점수와 시간 */}
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-xs text-gray-500">점수</div>
                    <div className="text-lg font-bold text-gray-800">
                      {currentSession.score} / {currentQuiz.answers.length}
                    </div>
                  </div>

                  <div className="text-center relative">
                    <div className="text-xs text-gray-500">시간</div>
                    <div className="text-lg font-bold font-mono text-gray-800">
                      {minutes.toString().padStart(2, "0")}:
                      {seconds.toString().padStart(2, "0")}
                    </div>
                    {isGameStarted && !currentSession.isCompleted && (
                      <button
                        onClick={handleEndQuiz}
                        className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 text-xs text-red-500 hover:text-red-700 underline whitespace-nowrap"
                      >
                        포기하기
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Answers Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {currentQuiz.answers.map((answer, index) => {
                const isFound = foundAnswers.includes(answer.answer);
                const isRevealed = currentSession.isCompleted && !isFound;

                return (
                  <div
                    key={index}
                    className={`p-2 rounded border font-semibold text-sm ${
                      isFound
                        ? "bg-green-100 border-green-300 text-green-800"
                        : isRevealed
                          ? "bg-red-100 border-red-300 text-red-800"
                          : "bg-gray-100 border-gray-300 text-gray-400"
                    }`}
                  >
                    <div className="text-center">
                      <span>
                        {isFound || isRevealed ? answer.answer : "???"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
