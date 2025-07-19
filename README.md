# Quiz Application

React와 Next.js로 구현된 인터랙티브 퀴즈 게임 애플리케이션입니다. Claude AI를 이용해 작성했습니다.

## 🛠️ 기술 스택

-   **Frontend**: React 19, Next.js 15
-   **Styling**: Tailwind CSS
-   **State Management**: Zustand
-   **Language**: TypeScript
-   **Build Tool**: Turbopack

## 📁 프로젝트 구조

```
quiz-app/
├── src/
│   ├── app/                 # Next.js 앱 라우터
│   ├── components/          # React 컴포넌트
│   │   ├── QuizCard.tsx    # 퀴즈 선택 카드
│   │   └── QuizGame.tsx    # 메인 게임 컴포넌트
│   ├── data/               # 퀴즈 데이터
│   │   ├── hearthstone-quiz.json
│   │   └── nfl-quiz.json
│   ├── store/              # 상태 관리
│   │   └── quizStore.ts
│   └── types/              # TypeScript 타입 정의
│       └── quiz.ts
├── package.json
└── README.md
```

## 🚀 설치 및 실행

### 1. 저장소 클론

```bash
git clone https://github.com/nepties/Quiz.git
cd Quiz/quiz-app
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인하세요.

### 4. 프로덕션 빌드

```bash
npm run build
npm start
```

## 📝 퀴즈 데이터 추가

새로운 퀴즈를 추가하려면 `src/data/` 폴더에 JSON 파일을 생성하세요:

```json
{
    "id": "new-quiz",
    "title": "새로운 퀴즈",
    "description": "퀴즈 설명",
    "timeLimit": 300,
    "answers": [
        {
            "answer": "정답",
            "synonyms": ["정답", "동의어1", "동의어2"]
        }
    ]
}
```

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🔧 개발 스크립트

-   `npm run dev`: 개발 서버 시작 (Turbopack 사용)
-   `npm run build`: 프로덕션 빌드
-   `npm run start`: 프로덕션 서버 시작
-   `npm run lint`: ESLint 실행
-   `npm run format`: Prettier로 코드 포맷팅
-   `npm run format:check`: 코드 포맷 검사
