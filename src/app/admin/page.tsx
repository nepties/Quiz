"use client";

import { useState } from "react";
import { checkFirebaseConnection } from "@/utils/uploadQuizData";
import { QuizService } from "@/services/quizService";

export default function AdminPage() {
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const [quizCount, setQuizCount] = useState<number | null>(null);

  const handleConnectionTest = async () => {
    setUploading(true);
    setUploadResult(null);
    
    try {
      const result = await checkFirebaseConnection();
      
      if (result.success) {
        setUploadResult(`Firebase 연결 성공! 현재 ${result.quizCount}개의 퀴즈가 저장되어 있습니다.`);
      } else {
        setUploadResult(`연결 실패: ${result.error}`);
      }
    } catch (error) {
      setUploadResult(`연결 테스트 중 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleCheckQuizCount = async () => {
    try {
      const quizzes = await QuizService.getAllQuizzes();
      setQuizCount(quizzes.length);
    } catch (error) {
      console.error('퀴즈 개수 확인 중 오류:', error);
      setQuizCount(-1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">관리자 페이지</h1>
          
          <div className="space-y-6">
            {/* 퀴즈 개수 확인 */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                현재 Firestore 퀴즈 개수 확인
              </h2>
              <button
                onClick={handleCheckQuizCount}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                퀴즈 개수 확인
              </button>
              {quizCount !== null && (
                <p className="mt-4 text-lg">
                  {quizCount >= 0 ? (
                    <span className="text-green-600">
                      현재 Firestore에 {quizCount}개의 퀴즈가 저장되어 있습니다.
                    </span>
                  ) : (
                    <span className="text-red-600">
                      퀴즈 개수를 확인할 수 없습니다. Firebase 연결을 확인해주세요.
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Firebase 연결 테스트 */}
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Firebase 연결 테스트
              </h2>
              <p className="text-gray-600 mb-4">
                Firebase Firestore 연결 상태를 확인하고 저장된 퀴즈 개수를 조회합니다.
              </p>
              
              <button
                onClick={handleConnectionTest}
                disabled={uploading}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  uploading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                {uploading ? "연결 확인 중..." : "Firebase 연결 테스트"}
              </button>

              {uploadResult && (
                <div className={`mt-4 p-4 rounded-lg ${
                  uploadResult.includes("성공") 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                }`}>
                  {uploadResult}
                </div>
              )}
            </div>

            {/* 경고 메시지 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-yellow-800 font-semibold mb-2">⚠️ 주의사항</h3>
              <ul className="text-yellow-700 text-sm space-y-1">
                <li>• Firebase 프로젝트가 올바르게 설정되어 있는지 확인하세요.</li>
                <li>• .env.local 파일에 올바른 Firebase 구성 정보가 있는지 확인하세요.</li>
                <li>• Firestore 데이터베이스가 생성되어 있고 읽기 권한이 있는지 확인하세요.</li>
                <li>• 모든 퀴즈 데이터는 현재 Firebase에 저장되어 있습니다.</li>
              </ul>
            </div>

            {/* 홈으로 돌아가기 */}
            <div className="pt-6">
              <a
                href="/"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
              >
                ← 홈으로 돌아가기
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}