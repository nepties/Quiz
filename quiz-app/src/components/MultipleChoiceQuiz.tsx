import { useState, useEffect, useCallback } from "react";
import { useQuizStore } from "@/store/quizStore";
import { MultipleChoiceQuestion, MultipleChoiceAnswer } from "@/types/quiz";
import { ArrowPathIcon, ChevronLeftIcon, ChevronRightIcon, HomeIcon } from "@heroicons/react/24/solid";
import QuizStats from "./QuizStats";
import { useAuth } from "@/contexts/AuthContext";
import { StatsService } from "@/services/statsService";

export default function MultipleChoiceQuiz() {
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    MultipleChoiceAnswer[]
  >([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const {
    currentQuiz,
    currentSession,
    isGameStarted,
    startGame,
    endQuiz,
    resetQuiz,
  } = useQuizStore();

  const { user } = useAuth();
  const [statsRefreshTrigger, setStatsRefreshTrigger] = useState(0);

  const questions = currentQuiz?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  // 실시간 점수 계산
  const currentScore = selectedAnswers.filter(
    answer => answer.isCorrect
  ).length;

  // 퀴즈 완료 처리 함수
  const handleQuizComplete = useCallback(() => {
    // 모든 문제에 대해 답변 확인 및 미답변 문제 오답 처리
    const allAnswers = questions.map(question => {
      const existingAnswer = selectedAnswers.find(
        a => a.questionId === question.id
      );
      
      if (existingAnswer) {
        return existingAnswer;
      } else {
        // 미답변 문제는 오답으로 처리 (selectedOption을 -1로 설정)
        return {
          questionId: question.id,
          selectedOption: -1,
          isCorrect: false,
        } as MultipleChoiceAnswer;
      }
    });

    setSelectedAnswers(allAnswers);
    
    const correctCount = allAnswers.filter(a => a.isCorrect).length;
    useQuizStore.setState(state => ({
      currentSession: state.currentSession
        ? {
            ...state.currentSession,
            score: correctCount,
            isCompleted: true,
            endTime: Date.now(),
          }
        : null,
    }));
  }, [questions, selectedAnswers]);

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
  }, [currentQuiz, currentSession?.isCompleted, isGameStarted, handleQuizComplete]);

  // 게임 완료 시 기록 저장
  useEffect(() => {
    const saveGameRecord = async () => {
      if (
        user &&
        currentQuiz &&
        currentSession &&
        currentSession.isCompleted &&
        currentSession.endTime
      ) {
        try {
          await StatsService.saveGameRecord({
            userId: user.uid,
            quizId: currentQuiz.id,
            quizTitle: currentQuiz.title,
            score: currentSession.score,
            maxScore: totalQuestions,
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
  }, [user, currentQuiz, currentSession?.isCompleted, currentSession?.endTime, totalQuestions]);

  // 다음 미답변 문제를 찾는 함수
  const findNextUnansweredQuestion = (
    fromIndex: number,
    answers: MultipleChoiceAnswer[]
  ) => {
    for (let i = fromIndex; i < totalQuestions; i++) {
      const hasAnswer = answers.some(a => a.questionId === questions[i].id);
      if (!hasAnswer) {
        return i;
      }
    }
    return -1; // 모든 문제가 답변됨
  };

  const handleOptionSelect = (optionIndex: number) => {
    // 이미 답변한 문제인지 확인
    const existingAnswer = selectedAnswers.find(
      a => a.questionId === currentQuestion.id
    );
    if (existingAnswer || showResult) return; // 이미 답변했거나 결과를 보여주고 있으면 무시

    setSelectedOption(optionIndex);
    const correct = optionIndex === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);

    // 답안 저장
    const newAnswer: MultipleChoiceAnswer = {
      questionId: currentQuestion.id,
      selectedOption: optionIndex,
      isCorrect: correct,
    };

    const updatedAnswers = [
      ...selectedAnswers.filter(a => a.questionId !== currentQuestion.id),
      newAnswer,
    ];
    setSelectedAnswers(updatedAnswers);

    // 1.5초 후 다음 동작 결정
    setTimeout(() => {
      // 모든 문제를 풀었는지 확인
      if (updatedAnswers.length === totalQuestions) {
        // 퀴즈 완료
        handleQuizComplete();
        return;
      }

      // 현재 문제 다음부터 미답변 문제 찾기
      let nextUnansweredIndex = findNextUnansweredQuestion(
        currentQuestionIndex + 1,
        updatedAnswers
      );

      // 현재 이후에 미답변 문제가 없으면 처음부터 현재 문제 전까지 찾기
      if (nextUnansweredIndex === -1) {
        nextUnansweredIndex = findNextUnansweredQuestion(0, updatedAnswers);
        // 찾은 문제가 현재 문제라면 더 이상 미답변 문제가 없음
        if (nextUnansweredIndex === currentQuestionIndex) {
          nextUnansweredIndex = -1;
        }
      }

      if (nextUnansweredIndex !== -1) {
        // 다음 미답변 문제로 이동
        setCurrentQuestionIndex(nextUnansweredIndex);
        setSelectedOption(null);
        setShowResult(false);
        setIsCorrect(null);
      }
    }, 1500);
  };

  const handlePreviousQuestion = () => {
    // 1번 문제에서 이전을 누르면 마지막 문제로
    const newIndex =
      currentQuestionIndex > 0 ? currentQuestionIndex - 1 : totalQuestions - 1;
    setCurrentQuestionIndex(newIndex);

    // 이전에 답변한 내용이 있다면 복원
    const prevAnswer = selectedAnswers.find(
      a => a.questionId === questions[newIndex].id
    );

    if (prevAnswer) {
      // 이미 답변한 문제면 결과를 표시
      setSelectedOption(prevAnswer.selectedOption);
      setShowResult(true);
      setIsCorrect(prevAnswer.isCorrect);
    } else {
      // 새 문제면 초기화
      setSelectedOption(null);
      setShowResult(false);
      setIsCorrect(null);
    }
  };

  const handleNextQuestion = () => {
    // 마지막 문제에서 다음을 누르면 1번 문제로
    const newIndex =
      currentQuestionIndex < totalQuestions - 1 ? currentQuestionIndex + 1 : 0;
    setCurrentQuestionIndex(newIndex);

    // 다음 문제에 대한 기존 답변이 있다면 복원
    const nextAnswer = selectedAnswers.find(
      a => a.questionId === questions[newIndex].id
    );

    if (nextAnswer) {
      // 이미 답변한 문제면 결과를 표시
      setSelectedOption(nextAnswer.selectedOption);
      setShowResult(true);
      setIsCorrect(nextAnswer.isCorrect);
    } else {
      // 새 문제면 초기화
      setSelectedOption(null);
      setShowResult(false);
      setIsCorrect(null);
    }
  };

  const handleJumpToQuestion = (questionIndex: number) => {
    setCurrentQuestionIndex(questionIndex);

    // 해당 문제에 대한 기존 답변이 있다면 복원
    const answer = selectedAnswers.find(
      a => a.questionId === questions[questionIndex].id
    );

    if (answer) {
      // 이미 답변한 문제면 결과를 표시
      setSelectedOption(answer.selectedOption);
      setShowResult(true);
      setIsCorrect(answer.isCorrect);
    } else {
      // 새 문제면 초기화
      setSelectedOption(null);
      setShowResult(false);
      setIsCorrect(null);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setSelectedOption(null);
    setShowResult(false);
    setIsCorrect(null);

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

  if (!currentQuiz || !currentSession || !currentQuestion) {
    return null;
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = (currentQuestionIndex / totalQuestions) * 100;

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
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Quiz Content */}
        <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
          {!isGameStarted ? (
            <div className="mb-12">
              <div className="flex items-center gap-4">
                <div className="w-1/2 relative">
                  <button
                    onClick={startGame}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-base font-bold h-10"
                  >
                    시작하기
                  </button>
                </div>
                <div className="flex-1"></div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-xs text-gray-500">점수</div>
                    <div className="text-lg font-bold text-gray-800">
                      0 / {totalQuestions}
                    </div>
                  </div>
                  <div className="text-center relative">
                    <div className="text-xs text-gray-500">시간</div>
                    <div className="text-lg font-bold font-mono text-gray-800">
                      {Math.floor(currentQuiz.timeLimit / 60)
                        .toString()
                        .padStart(2, "0")}
                      :
                      {(currentQuiz.timeLimit % 60).toString().padStart(2, "0")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : currentSession.isCompleted ? (
            <div className="mb-12">
              <div className="flex items-center gap-4">
                <div className="w-1/2 relative">
                  <button
                    onClick={handleRestart}
                    className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-base font-bold h-10 flex items-center justify-center gap-2"
                  >
                    <ArrowPathIcon className="w-5 h-5" />
                    다시하기
                  </button>
                </div>
                <div className="flex-1"></div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-xs text-gray-500">점수</div>
                    <div className="text-lg font-bold text-gray-800">
                      {currentScore} / {totalQuestions}
                    </div>
                  </div>
                  <div className="text-center relative">
                    <div className="text-xs text-gray-500">시간</div>
                    <div className="text-lg font-bold font-mono text-gray-800">
                      {minutes.toString().padStart(2, "0")}:
                      {seconds.toString().padStart(2, "0")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-12">
              <div className="flex items-center justify-end gap-4">
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-xs text-gray-500">점수</div>
                    <div className="text-lg font-bold text-gray-800">
                      {currentScore} / {totalQuestions}
                    </div>
                  </div>
                  <div className="text-center relative">
                    <div className="text-xs text-gray-500">시간</div>
                    <div className="text-lg font-bold font-mono text-gray-800">
                      {minutes.toString().padStart(2, "0")}:
                      {seconds.toString().padStart(2, "0")}
                    </div>
                    {!currentSession.isCompleted && (
                      <button
                        onClick={handleQuizComplete}
                        className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 text-xs text-red-500 hover:text-red-700 underline whitespace-nowrap"
                      >
                        포기하기
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Question Content - Always visible when game started */}
          {isGameStarted && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {currentQuestion.question}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {currentQuestion.options.map((option, index) => {
                  const isAnswered = selectedAnswers.some(
                    a => a.questionId === currentQuestion.id
                  );
                  let buttonClass =
                    "bg-gray-50 border-gray-300 hover:bg-gray-100";

                  if (showResult || isAnswered) {
                    if (index === currentQuestion.correctAnswer) {
                      // 정답은 항상 초록색
                      buttonClass =
                        "bg-green-100 border-green-500 text-green-700";
                    } else if (index === selectedOption) {
                      // 선택한 오답은 빨간색
                      buttonClass = "bg-red-100 border-red-500 text-red-700";
                    } else {
                      // 나머지는 회색
                      buttonClass = "bg-gray-100 border-gray-300 text-gray-500";
                    }
                  } else if (currentSession.isCompleted) {
                    // 퀴즈 완료 후 미답변 문제의 경우
                    if (index === currentQuestion.correctAnswer) {
                      // 정답은 초록색으로 표시
                      buttonClass = "bg-green-100 border-green-500 text-green-700";
                    } else {
                      // 나머지는 회색
                      buttonClass = "bg-gray-100 border-gray-300 text-gray-500";
                    }
                  } else if (selectedOption === index) {
                    // 아직 결과를 보여주지 않았을 때 선택된 옵션
                    buttonClass = "bg-blue-50 border-blue-500 text-blue-700";
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleOptionSelect(index)}
                      disabled={showResult || isAnswered || currentSession.isCompleted}
                      className={`text-center p-4 rounded-lg border-2 transition-all ${buttonClass} ${
                        showResult || isAnswered || currentSession.isCompleted ? "cursor-not-allowed" : ""
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {/* 네비게이션 버튼들 */}
              <div className="flex justify-between items-center">
                <button
                  onClick={handlePreviousQuestion}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-bold transition-all flex items-center gap-2"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                  이전
                </button>

                {/* 문제 번호 네비게이션 */}
                <div className="flex items-center space-x-2">
                  {(() => {
                    const maxVisible = 10;
                    const totalQuestions = questions.length;

                    if (totalQuestions <= maxVisible) {
                      // 전체 문제가 10개 이하면 모두 표시
                      return questions.map((_, index) => {
                        const answer = selectedAnswers.find(
                          a => a.questionId === questions[index].id
                        );
                        const isCurrent = index === currentQuestionIndex;

                        let buttonClass;
                        if (isCurrent) {
                          buttonClass =
                            "bg-blue-500 border-blue-500 text-white";
                        } else if (answer) {
                          // 답변한 문제: 정답이면 초록색, 오답이면 빨간색
                          buttonClass = answer.isCorrect
                            ? "bg-green-100 border-green-500 text-green-700 hover:bg-green-200"
                            : "bg-red-100 border-red-500 text-red-700 hover:bg-red-200";
                        } else {
                          // 미답변 문제
                          buttonClass =
                            "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200";
                        }

                        return (
                          <button
                            key={index}
                            onClick={() => handleJumpToQuestion(index)}
                            className={`w-8 h-8 rounded-lg border-2 font-bold text-xs ${buttonClass}`}
                          >
                            {index + 1}
                          </button>
                        );
                      });
                    } else {
                      // 10개보다 많으면 현재 문제 중심으로 표시
                      let startIndex = Math.max(
                        0,
                        currentQuestionIndex - Math.floor(maxVisible / 2)
                      );
                      let endIndex = Math.min(
                        totalQuestions - 1,
                        startIndex + maxVisible - 1
                      );

                      // 끝에서 시작 조정
                      if (endIndex - startIndex < maxVisible - 1) {
                        startIndex = Math.max(0, endIndex - maxVisible + 1);
                      }

                      const visibleQuestions = [];

                      // 실제 문제 번호들
                      for (let index = startIndex; index <= endIndex; index++) {
                        const answer = selectedAnswers.find(
                          a => a.questionId === questions[index].id
                        );
                        const isCurrent = index === currentQuestionIndex;

                        let buttonClass;
                        if (isCurrent) {
                          buttonClass =
                            "bg-blue-500 border-blue-500 text-white";
                        } else if (answer) {
                          // 답변한 문제: 정답이면 초록색, 오답이면 빨간색
                          buttonClass = answer.isCorrect
                            ? "bg-green-100 border-green-500 text-green-700 hover:bg-green-200"
                            : "bg-red-100 border-red-500 text-red-700 hover:bg-red-200";
                        } else {
                          // 미답변 문제
                          buttonClass =
                            "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200";
                        }

                        visibleQuestions.push(
                          <button
                            key={index}
                            onClick={() => handleJumpToQuestion(index)}
                            className={`w-8 h-8 rounded-lg border-2 font-bold text-xs ${buttonClass}`}
                          >
                            {index + 1}
                          </button>
                        );
                      }

                      return visibleQuestions;
                    }
                  })()}
                </div>

                <button
                  onClick={handleNextQuestion}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"
                >
                  다음
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
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
