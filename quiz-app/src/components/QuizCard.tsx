import { Quiz } from "@/types/quiz";

interface QuizCardProps {
  quiz: Quiz;
  onStart: (quiz: Quiz) => void;
}

export default function QuizCard({ quiz, onStart }: QuizCardProps) {
  const handleStart = () => {
    onStart(quiz);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all hover:scale-105">
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-3">{quiz.title}</h3>
        <p className="text-gray-600 mb-6">{quiz.description}</p>
        

        <button
          onClick={handleStart}
          className="w-full bg-blue-500 hover:bg-blue-400 text-white font-bold py-4 px-6 rounded-lg transition-colors text-lg shadow-md hover:shadow-lg"
        >
          퀴즈 시작
        </button>
      </div>
    </div>
  );
}
