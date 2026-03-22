import { useState, useCallback } from 'react';
import { generateImage } from '../utils/geminiClient';

// 단어별 폴백 이모지 매핑
const FALLBACK_EMOJIS: Record<string, string> = {
  사과: '🍎', 바나나: '🍌', 학교: '🏫', 집: '🏠', 고양이: '🐱',
  강아지: '🐶', 책: '📚', 연필: '✏️', 물: '💧', 밥: '🍚',
  선생님: '👩‍🏫', 친구: '👫', 가족: '👨‍👩‍👧‍👦', 나무: '🌳', 꽃: '🌸',
};

function getFallbackEmoji(word: string): string {
  // 정확히 일치하는 키 찾기
  const exact = FALLBACK_EMOJIS[word];
  if (exact) return exact;
  // 포함되는 키 찾기
  const partial = Object.entries(FALLBACK_EMOJIS).find(([k]) => word.includes(k));
  return partial ? partial[1] : '🖼️';
}

export function useImageGen(apiKey: string) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateImg = useCallback(async (koreanWord: string) => {
    setLoading(true);
    setError(null);
    setImageUrl(null);
    try {
      const url = await generateImage(apiKey, koreanWord);
      setImageUrl(url);
      return url;
    } catch (err) {
      const msg = err instanceof Error ? err.message : '이미지 생성 실패';
      setError(msg);
      // graceful fallback: 이모지 기반 placeholder
      const emoji = getFallbackEmoji(koreanWord);
      setImageUrl(`emoji:${emoji}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  return { imageUrl, loading, error, generateImg, getFallbackEmoji };
}
