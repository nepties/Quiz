import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  setDoc,
  query, 
  where, 
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserGameRecord, UserStats, QuizStats } from '@/types/quiz';

export class StatsService {
  private static GAME_RECORDS_COLLECTION = 'gameRecords';
  private static USER_STATS_COLLECTION = 'userStats';
  private static QUIZ_STATS_COLLECTION = 'quizStats';

  // 게임 기록 저장
  static async saveGameRecord(record: Omit<UserGameRecord, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.GAME_RECORDS_COLLECTION), {
        ...record,
        completedAt: Date.now()
      });
      
      // 사용자 통계 업데이트
      await this.updateUserStats(record.userId, record);
      
      // 퀴즈 통계 업데이트
      await this.updateQuizStats(record.quizId, record);
      
      console.log('게임 기록 저장 완료:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('게임 기록 저장 실패:', error);
      throw error;
    }
  }

  // 사용자 통계 업데이트
  private static async updateUserStats(userId: string, record: Omit<UserGameRecord, 'id'>): Promise<void> {
    try {
      const userStatsRef = doc(db, this.USER_STATS_COLLECTION, userId);
      const userStatsDoc = await getDoc(userStatsRef);
      
      const scorePercentage = (record.score / record.maxScore) * 100;
      
      if (userStatsDoc.exists()) {
        const currentStats = userStatsDoc.data() as UserStats;
        
        // 기존 통계 업데이트
        const updatedStats: UserStats = {
          userId,
          totalGames: currentStats.totalGames + 1,
          bestScores: {
            ...currentStats.bestScores,
            [record.quizId]: Math.max(currentStats.bestScores[record.quizId] || 0, scorePercentage)
          },
          playCount: {
            ...currentStats.playCount,
            [record.quizId]: (currentStats.playCount[record.quizId] || 0) + 1
          },
          totalScore: currentStats.totalScore + scorePercentage,
          averageScore: (currentStats.totalScore + scorePercentage) / (currentStats.totalGames + 1)
        };
        
        await updateDoc(userStatsRef, updatedStats);
      } else {
        // 새로운 사용자 통계 생성
        const newStats: UserStats = {
          userId,
          totalGames: 1,
          bestScores: { [record.quizId]: scorePercentage },
          playCount: { [record.quizId]: 1 },
          totalScore: scorePercentage,
          averageScore: scorePercentage
        };
        
        await setDoc(userStatsRef, newStats);
      }
    } catch (error) {
      console.error('사용자 통계 업데이트 실패:', error);
      throw error;
    }
  }

  // 퀴즈 통계 업데이트
  private static async updateQuizStats(quizId: string, record: Omit<UserGameRecord, 'id'>): Promise<void> {
    try {
      const quizStatsRef = doc(db, this.QUIZ_STATS_COLLECTION, quizId);
      const quizStatsDoc = await getDoc(quizStatsRef);
      
      const scorePercentage = (record.score / record.maxScore) * 100;
      
      if (quizStatsDoc.exists()) {
        const currentStats = quizStatsDoc.data() as QuizStats;
        
        const updatedStats: QuizStats = {
          quizId,
          totalPlays: currentStats.totalPlays + 1,
          totalScore: currentStats.totalScore + scorePercentage,
          averageScore: (currentStats.totalScore + scorePercentage) / (currentStats.totalPlays + 1),
          bestScore: Math.max(currentStats.bestScore, scorePercentage)
        };
        
        await updateDoc(quizStatsRef, updatedStats);
      } else {
        const newStats: QuizStats = {
          quizId,
          totalPlays: 1,
          totalScore: scorePercentage,
          averageScore: scorePercentage,
          bestScore: scorePercentage
        };
        
        await setDoc(quizStatsRef, newStats);
      }
    } catch (error) {
      console.error('퀴즈 통계 업데이트 실패:', error);
      throw error;
    }
  }

  // 사용자 통계 조회
  static async getUserStats(userId: string): Promise<UserStats | null> {
    try {
      const userStatsRef = doc(db, this.USER_STATS_COLLECTION, userId);
      const userStatsDoc = await getDoc(userStatsRef);
      
      if (userStatsDoc.exists()) {
        return userStatsDoc.data() as UserStats;
      }
      return null;
    } catch (error) {
      console.error('사용자 통계 조회 실패:', error);
      return null;
    }
  }

  // 퀴즈 통계 조회
  static async getQuizStats(quizId: string): Promise<QuizStats | null> {
    try {
      const quizStatsRef = doc(db, this.QUIZ_STATS_COLLECTION, quizId);
      const quizStatsDoc = await getDoc(quizStatsRef);
      
      if (quizStatsDoc.exists()) {
        return quizStatsDoc.data() as QuizStats;
      }
      return null;
    } catch (error) {
      console.error('퀴즈 통계 조회 실패:', error);
      return null;
    }
  }

  // 사용자의 특정 퀴즈 기록 조회
  static async getUserQuizRecords(userId: string, quizId: string, limitCount: number = 10): Promise<UserGameRecord[]> {
    try {
      const q = query(
        collection(db, this.GAME_RECORDS_COLLECTION),
        where('userId', '==', userId),
        where('quizId', '==', quizId),
        orderBy('completedAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as UserGameRecord));
    } catch (error) {
      console.error('사용자 퀴즈 기록 조회 실패:', error);
      return [];
    }
  }

  // 특정 퀴즈의 사용자별 최고 점수와 플레이 횟수 조회
  static async getUserQuizStats(userId: string, quizId: string): Promise<{
    bestScore: number;
    playCount: number;
  }> {
    try {
      const userStats = await this.getUserStats(userId);
      
      if (!userStats) {
        return { bestScore: 0, playCount: 0 };
      }
      
      return {
        bestScore: userStats.bestScores[quizId] || 0,
        playCount: userStats.playCount[quizId] || 0
      };
    } catch (error) {
      console.error('사용자 퀴즈 통계 조회 실패:', error);
      return { bestScore: 0, playCount: 0 };
    }
  }
}