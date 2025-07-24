import { QuizService } from '@/services/quizService';

// 참고: 이 파일은 초기 데이터 업로드를 위해 사용되었습니다.
// 현재는 모든 데이터가 Firebase에 저장되어 있습니다.

export async function checkFirebaseConnection() {
  try {
    console.log('Firebase 연결 상태를 확인합니다...');
    const quizzes = await QuizService.getAllQuizzes();
    console.log(`Firebase에 ${quizzes.length}개의 퀴즈가 저장되어 있습니다.`);
    
    return {
      success: true,
      quizCount: quizzes.length,
      quizzes: quizzes
    };
    
  } catch (error) {
    console.error('Firebase 연결 확인 중 오류 발생:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    };
  }
}