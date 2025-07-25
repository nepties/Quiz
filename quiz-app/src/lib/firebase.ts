import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase 구성 정보 검증
const requiredEnvs = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// 환경 변수 누락 확인
const missingEnvs = Object.entries(requiredEnvs)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingEnvs.length > 0) {
  console.error("누락된 Firebase 환경 변수:", missingEnvs);
  throw new Error(
    `Firebase 환경 변수가 누락되었습니다: ${missingEnvs.join(", ")}`
  );
}

const firebaseConfig = {
  apiKey: requiredEnvs.apiKey!,
  authDomain: requiredEnvs.authDomain!,
  projectId: requiredEnvs.projectId!,
  storageBucket: requiredEnvs.storageBucket!,
  messagingSenderId: requiredEnvs.messagingSenderId!,
  appId: requiredEnvs.appId!,
};

// Firebase 앱 초기화
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log("Firebase 앱 초기화 성공");
} catch (error) {
  console.error("Firebase 앱 초기화 실패:", error);
  throw error;
}

// Firestore 데이터베이스 인스턴스
export const db = getFirestore(app);

// Authentication 인스턴스
export const auth = getAuth(app);

// Google 인증 제공자
export const googleProvider = new GoogleAuthProvider();

export default app;
