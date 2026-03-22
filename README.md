# 한국어 배워요 🌟

초등학교 다문화 학생을 위한 한국어 학습 웹 앱입니다.

## 주요 기능

- 🔤 **번역 학습** - 모국어 → 한국어 번역 + AI 이미지 생성
- 📝 **수준 진단** - AI 퀴즈로 한국어 레벨 측정 (입문/초급/중급)
- 📚 **레벨별 학습** - Gemini AI가 생성하는 맞춤형 학습 콘텐츠
- 📊 **학습 기록** - 오늘 학습 통계 및 즐겨찾기 관리
- 🔊 **TTS** - 한국어 발음 듣기 (Web Speech API)
- 🎤 **음성 입력** - 마이크로 모국어 입력
- 🌙 **다크모드** 지원

## 지원 언어

베트남어, 중국어(간체), 필리핀어(타갈로그), 몽골어, 러시아어, 아랍어, 영어, 인도네시아어, 태국어, 캄보디아어(크메르)

## 기술 스택

- **프레임워크**: React 18 + TypeScript + Vite
- **스타일링**: Tailwind CSS v4
- **애니메이션**: Framer Motion
- **AI API**: Google Gemini API (gemini-2.0-flash, gemini-2.0-flash-exp-image-generation)
- **폰트**: Google Fonts (Jua, Noto Sans KR)

---

## 로컬 실행 방법

### 사전 요구사항

- Node.js 18 이상
- Google Gemini API 키 ([Google AI Studio에서 발급](https://aistudio.google.com/app/apikey))

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:5173` 접속 후 Gemini API 키를 입력하면 시작됩니다.

### 빌드

```bash
npm run build
```

`dist/` 폴더에 빌드 결과물이 생성됩니다.

---

## Netlify 배포 방법

### 방법 1: GitHub 연동 자동 배포 (권장)

1. 이 저장소를 GitHub에 push
2. [Netlify](https://netlify.com) 로그인 → "Add new site" → "Import an existing project"
3. GitHub 저장소 선택
4. 빌드 설정 확인 (자동으로 `netlify.toml` 읽음):
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. "Deploy site" 클릭

### 방법 2: Netlify CLI 사용

```bash
# Netlify CLI 설치
npm install -g netlify-cli

# 로그인
netlify login

# 빌드 후 배포
npm run build
netlify deploy --prod --dir=dist
```

### 방법 3: 드래그 앤 드롭

1. `npm run build` 실행
2. Netlify 대시보드의 "Sites" 탭으로 이동
3. `dist/` 폴더를 드래그 앤 드롭

---

## 사용 방법

1. **API 키 입력**: Gemini API 키를 입력하고 "학습 시작하기"
2. **모국어 선택**: 홈 화면에서 학생의 모국어 선택
3. **수준 진단**: 간단한 퀴즈로 한국어 레벨 확인
4. **학습 시작**:
   - **번역**: 모국어로 단어/문장 입력 → 한국어 번역 + 이미지
   - **레벨 학습**: 카테고리 선택 후 맞춤 콘텐츠 학습
   - **퀴즈**: 복습 퀴즈로 학습 확인

---

## 주의사항

- API 키는 브라우저(sessionStorage/localStorage)에만 저장되며 외부 서버로 전송되지 않습니다
- 모든 AI 호출은 클라이언트 사이드에서 직접 Gemini API를 호출합니다
- 이미지 생성은 API 한도에 따라 제한될 수 있으며, 실패 시 이모지로 대체됩니다
