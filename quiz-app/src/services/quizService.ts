import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  where
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Quiz } from '@/types/quiz';

const QUIZZES_COLLECTION = 'quizzes';

export class QuizService {
  // 모든 퀴즈 가져오기
  static async getAllQuizzes(): Promise<Quiz[]> {
    try {
      const q = query(collection(db, QUIZZES_COLLECTION), orderBy('title'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as Quiz[];
    } catch (error) {
      console.error('퀴즈 목록을 가져오는 중 오류 발생:', error);
      throw error;
    }
  }

  // 특정 퀴즈 가져오기
  static async getQuizById(id: string): Promise<Quiz | null> {
    try {
      const docRef = doc(db, QUIZZES_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          ...docSnap.data(),
          id: docSnap.id,
        } as Quiz;
      } else {
        return null;
      }
    } catch (error) {
      console.error('퀴즈를 가져오는 중 오류 발생:', error);
      throw error;
    }
  }

  // 카테고리별 퀴즈 가져오기
  static async getQuizzesByCategory(category: string): Promise<Quiz[]> {
    try {
      const q = query(
        collection(db, QUIZZES_COLLECTION), 
        where('category', '==', category),
        orderBy('title')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as Quiz[];
    } catch (error) {
      console.error('카테고리별 퀴즈를 가져오는 중 오류 발생:', error);
      throw error;
    }
  }

  // 퀴즈 타입별로 가져오기
  static async getQuizzesByType(type: string): Promise<Quiz[]> {
    try {
      const q = query(
        collection(db, QUIZZES_COLLECTION), 
        where('type', '==', type),
        orderBy('title')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as Quiz[];
    } catch (error) {
      console.error('타입별 퀴즈를 가져오는 중 오류 발생:', error);
      throw error;
    }
  }

  // 새 퀴즈 추가
  static async addQuiz(quiz: Omit<Quiz, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, QUIZZES_COLLECTION), quiz);
      console.log('퀴즈가 추가되었습니다. ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('퀴즈 추가 중 오류 발생:', error);
      throw error;
    }
  }

  // 퀴즈 업데이트
  static async updateQuiz(id: string, quiz: Partial<Quiz>): Promise<void> {
    try {
      const docRef = doc(db, QUIZZES_COLLECTION, id);
      await updateDoc(docRef, quiz);
      console.log('퀴즈가 업데이트되었습니다. ID:', id);
    } catch (error) {
      console.error('퀴즈 업데이트 중 오류 발생:', error);
      throw error;
    }
  }

  // 퀴즈 삭제
  static async deleteQuiz(id: string): Promise<void> {
    try {
      const docRef = doc(db, QUIZZES_COLLECTION, id);
      await deleteDoc(docRef);
      console.log('퀴즈가 삭제되었습니다. ID:', id);
    } catch (error) {
      console.error('퀴즈 삭제 중 오류 발생:', error);
      throw error;
    }
  }

  // 여러 퀴즈를 한 번에 업로드 (초기 데이터 설정용)
  static async uploadQuizzes(quizzes: Omit<Quiz, 'id'>[]): Promise<string[]> {
    const uploadedIds: string[] = [];
    
    try {
      for (const quiz of quizzes) {
        const id = await this.addQuiz(quiz);
        uploadedIds.push(id);
      }
      
      console.log(`${quizzes.length}개의 퀴즈가 업로드되었습니다.`);
      return uploadedIds;
    } catch (error) {
      console.error('퀴즈들 업로드 중 오류 발생:', error);
      throw error;
    }
  }
}