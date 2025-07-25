# Quiz Application

다양한 유형의 퀴즈를 즐길 수 있는 Next.js 기반 웹 애플리케이션입니다. Claude AI를 이용해 작성되었습니다.

## ✨ Features

### 퀴즈 유형

- **빈칸 맞추기**: 텍스트 입력으로 답안 작성
- **객관식**: 4개 선택지 중 1개 정답 선택
- **다지선다**: 여러 정답을 동시에 선택하는 그리드 형태

### 사용자 기능

- **Google 로그인**: Firebase Authentication을 통한 간편 로그인
- **개인 기록 추적**: 최고 점수, 플레이 횟수 등 통계 제공

### 기술적 특징

- **실시간 데이터**: Firebase Firestore를 통한 실시간 데이터 동기화
- **반응형 디자인**: 모바일과 데스크톱 모두 지원
- **TypeScript**: 타입 안전성을 위한 TypeScript 사용
- **상태 관리**: Zustand를 활용한 효율적인 상태 관리

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth (Google Provider)
- **State Management**: Zustand
- **Icons**: Heroicons

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, 또는 bun

### Installation

1. **저장소 클론**

   ```bash
   git clone <repository-url>
   cd Quiz
   ```

2. **의존성 설치**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **환경 변수 설정**

   `.env.local` 파일을 생성하고 Firebase 설정을 추가하세요:

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **개발 서버 실행**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **브라우저에서 확인**

   [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인하세요.

## 📁 Project Structure

```
src/
├── app/              # Next.js App Router 페이지
├── components/       # React 컴포넌트
├── contexts/         # React Context (AuthContext)
├── lib/             # 라이브러리 설정 (Firebase)
├── services/        # API 서비스 (Quiz, Auth, Stats)
├── store/           # 상태 관리 (Zustand)
├── types/           # TypeScript 타입 정의
└── utils/           # 유틸리티 함수
```

## 🎮 사용법

1. **Google 계정으로 로그인**
2. **원하는 퀴즈 선택**
3. **퀴즈 플레이**
4. **결과 확인 및 통계 비교**

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

이 프로젝트는 MIT 라이센스를 따릅니다.
