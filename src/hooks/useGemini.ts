import { useState, useCallback } from 'react';
import type { NativeLanguage, TranslationResponse, QuizQuestion, LearningItem, Level } from '../types';
import {
  translateText,
  generateDiagnosticQuiz,
  generateLearningContent,
  generateReviewQuiz,
} from '../utils/geminiClient';

interface UseGeminiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useTranslation(apiKey: string) {
  const [state, setState] = useState<UseGeminiState<TranslationResponse>>({
    data: null,
    loading: false,
    error: null,
  });

  const translate = useCallback(async (text: string, language: NativeLanguage) => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await translateText(apiKey, text, language);
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : '번역 중 오류가 발생했습니다.';
      setState({ data: null, loading: false, error: msg });
      return null;
    }
  }, [apiKey]);

  return { ...state, translate };
}

export function useDiagnosticQuiz(apiKey: string) {
  const [state, setState] = useState<UseGeminiState<QuizQuestion[]>>({
    data: null,
    loading: false,
    error: null,
  });

  const loadQuiz = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await generateDiagnosticQuiz(apiKey);
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : '퀴즈 생성 중 오류가 발생했습니다.';
      setState({ data: null, loading: false, error: msg });
      return null;
    }
  }, [apiKey]);

  return { ...state, loadQuiz };
}

export function useLearningContent(apiKey: string) {
  const [state, setState] = useState<UseGeminiState<LearningItem[]>>({
    data: null,
    loading: false,
    error: null,
  });

  const loadContent = useCallback(async (
    level: Level,
    category: string,
    language: NativeLanguage,
  ) => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await generateLearningContent(apiKey, level, category, language);
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : '학습 콘텐츠 생성 중 오류가 발생했습니다.';
      setState({ data: null, loading: false, error: msg });
      return null;
    }
  }, [apiKey]);

  return { ...state, loadContent };
}

export function useReviewQuiz(apiKey: string) {
  const [state, setState] = useState<UseGeminiState<QuizQuestion[]>>({
    data: null,
    loading: false,
    error: null,
  });

  const loadReviewQuiz = useCallback(async (items: LearningItem[]) => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await generateReviewQuiz(apiKey, items);
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : '퀴즈 생성 중 오류가 발생했습니다.';
      setState({ data: null, loading: false, error: msg });
      return null;
    }
  }, [apiKey]);

  return { ...state, loadReviewQuiz };
}
