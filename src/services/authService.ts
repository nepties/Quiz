import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

export class AuthService {
  // Google 로그인
  static async signInWithGoogle(): Promise<User> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Google 로그인 성공:', result.user.displayName);
      return result.user;
    } catch (error) {
      console.error('Google 로그인 실패:', error);
      throw error;
    }
  }

  // 로그아웃
  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
      console.log('로그아웃 성공');
    } catch (error) {
      console.error('로그아웃 실패:', error);
      throw error;
    }
  }

  // 현재 사용자 가져오기
  static getCurrentUser(): User | null {
    return auth.currentUser;
  }

  // 인증 상태 변경 리스너
  static onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }
}