// 앱 화면 상태 (학생용)
export type AppScreen = 'home' | 'translate' | 'level-test' | 'learning' | 'progress';

// 교사 계정
export interface Teacher {
  uid: string;
  name: string;
  email: string;
  geminiApiKey: string;
  pixabayApiKey: string;
  classCode: string;
}

// 학생 계정
export interface Student {
  id: string;
  name: string;
  teacherId: string;
  nativeLanguage: NativeLanguage;
  level?: Level;
  pin: string;
  lastActivity?: number;
  wordsLearned?: number;
  quizzesTaken?: number;
  createdAt: number;
}

// 학습 레벨
export type Level = 1 | 2 | 3;

// 지원 모국어
export type NativeLanguage =
  | 'vi'   // 베트남어
  | 'zh'   // 중국어(간체)
  | 'fil'  // 필리핀어(타갈로그)
  | 'mn'   // 몽골어
  | 'ru'   // 러시아어
  | 'ar'   // 아랍어
  | 'en'   // 영어
  | 'id'   // 인도네시아어
  | 'th'   // 태국어
  | 'km'   // 캄보디아어(크메르)
  | 'other'; // 기타

// 번역 카드 데이터
export interface TranslationCard {
  id: string;
  nativeText: string;
  nativeLanguage: NativeLanguage;
  korean: string;
  pronunciation: string;
  example: string;
  exampleTranslation: string;
  imageUrl?: string; // base64 또는 URL
  isFavorite: boolean;
  createdAt: number;
}

// 진단 퀴즈 문항
export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  level: Level;
  emoji?: string; // 문제에 함께 표시할 시각적 이모지 (그림 역할)
}

// 퀴즈 결과
export interface QuizResult {
  score: number;
  total: number;
  level: Level;
  completedAt: number;
}

// 학습 콘텐츠 아이템
export interface LearningItem {
  id: string;
  type: 'word' | 'conversation' | 'reading';
  korean: string;
  pronunciation?: string;
  nativeTranslation?: string;
  example?: string;
  imageUrl?: string;
  category?: string;
}

// 학습 진도 기록
export interface LearningProgress {
  date: string; // YYYY-MM-DD
  wordsLearned: number;
  sentencesLearned: number;
  quizzesTaken: number;
  level?: Level;
}

// 앱 설정
export interface AppSettings {
  apiKey: string;
  nativeLanguage: NativeLanguage;
  level?: Level;
  darkMode: boolean;
}

// 관리자 설정
export interface AdminConfig {
  geminiApiKey: string;
  pixabayApiKey: string;
}

// Gemini 번역 응답
export interface TranslationResponse {
  korean: string;
  pronunciation: string;
  example: string;
  exampleTranslation: string;
}
