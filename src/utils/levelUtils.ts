import type { Level, QuizResult } from '../types';

export const LEVEL_CONFIG = {
  1: {
    label: '입문',
    emoji: '🌱',
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    description: '기초 단어 중심 학습',
  },
  2: {
    label: '초급',
    emoji: '🌿',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    description: '짧은 문장 중심 학습',
  },
  3: {
    label: '중급',
    emoji: '🌳',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    description: '문장 이해 및 표현 학습',
  },
} as const;

// 퀴즈 점수로 레벨 판정
export function calculateLevel(score: number, total: number): Level {
  const ratio = score / total;
  if (ratio >= 0.8) return 3;
  if (ratio >= 0.5) return 2;
  return 1;
}

// 퀴즈 결과 객체 생성
export function buildQuizResult(score: number, total: number): QuizResult {
  return {
    score,
    total,
    level: calculateLevel(score, total),
    completedAt: Date.now(),
  };
}

// 레벨별 카테고리 목록
export const LEVEL_CATEGORIES: Record<Level, string[]> = {
  1: ['학교', '집', '음식', '동물', '색깔', '숫자'],
  2: ['인사', '날씨', '가족', '학교생활', '쇼핑', '교통'],
  3: ['계절', '직업', '취미', '감정', '자연', '문화'],
};

// 오늘 날짜 문자열 (YYYY-MM-DD)
export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}
