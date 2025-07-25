import { Quiz } from "@/types/quiz";

interface QuizCardProps {
  quiz: Quiz;
  onStart: (quiz: Quiz) => void;
}

export default function QuizCard({ quiz, onStart }: QuizCardProps) {
  const handleStart = () => {
    onStart(quiz);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "multiple-choice":
        return "객관식";
      case "fill-in-blank":
        return "빈칸 맞추기";
      case "multiple-select":
        return "다지선다";
      default:
        return "퀴즈";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all hover:scale-105">
      <div className="text-center">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            {getTypeLabel(quiz.type)}
          </span>
          <span className="text-sm text-gray-500">{quiz.category}</span>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-3">{quiz.title}</h3>
        <p className="text-gray-600 mb-4">{quiz.description}</p>

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
