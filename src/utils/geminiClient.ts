import type { NativeLanguage, TranslationResponse, QuizQuestion, LearningItem, Level } from '../types';
import { getLanguageName } from './languages';

const TEXT_MODEL = 'gemini-2.0-flash';
const IMAGE_MODEL = 'gemini-2.0-flash-exp-image-generation';

const SAFETY_PREFIX =
  '초등학생이 이해할 수 있는 쉬운 한국어로 설명해주세요. 부적절한 내용 없이 교육적인 내용만 생성해주세요.\n\n';

function getApiUrl(model: string, apiKey: string): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
}

async function callGemini(apiKey: string, prompt: string, model = TEXT_MODEL): Promise<string> {
  const res = await fetch(getApiUrl(model, apiKey), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `API 오류: ${res.status}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

// API Key 유효성 검증 (간단한 ping)
export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    await callGemini(apiKey, '안녕하세요. 응답해 주세요.');
    return true;
  } catch {
    return false;
  }
}

// 번역 요청
export async function translateText(
  apiKey: string,
  text: string,
  language: NativeLanguage,
): Promise<TranslationResponse> {
  const langName = getLanguageName(language);
  const prompt = `${SAFETY_PREFIX}다음 ${langName} 텍스트를 한국어로 번역해주세요.
번역 결과는 초등학생이 이해할 수 있는 쉬운 한국어로 작성해주세요.
JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "korean": "한국어 번역",
  "pronunciation": "발음 (로마자)",
  "example": "한국어 예시 문장 (쉬운 표현)",
  "exampleTranslation": "${langName}으로 번역된 예시 문장"
}
입력 텍스트: ${text}`;

  const raw = await callGemini(apiKey, prompt);
  // JSON 추출 (마크다운 코드블록 제거)
  const json = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(json) as TranslationResponse;
}

// 이미지 생성 (base64 반환)
export async function generateImage(apiKey: string, koreanWord: string): Promise<string> {
  const prompt = `A cute, simple, colorful illustration for elementary school children showing: ${koreanWord}.
Style: flat design, bright colors, educational, child-friendly, no text in image.`;

  const res = await fetch(getApiUrl(IMAGE_MODEL, apiKey), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
    }),
  });

  if (!res.ok) throw new Error('이미지 생성 실패');

  const data = await res.json();
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find((p: { inlineData?: { mimeType: string; data: string } }) => p.inlineData?.mimeType?.startsWith('image/'));

  if (!imagePart?.inlineData?.data) throw new Error('이미지 데이터 없음');
  return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
}

// 레벨 진단 퀴즈 생성
export async function generateDiagnosticQuiz(apiKey: string): Promise<QuizQuestion[]> {
  const prompt = `${SAFETY_PREFIX}초등학생 다문화 학생을 위한 한국어 수준 진단 문제 8개를 만들어주세요.
난이도는 쉬운 것부터 어려운 순서로 구성하세요.

중요한 규칙:
- "그림을 보고", "다음 그림", "이 그림" 등의 표현을 절대 사용하지 마세요. 실제 그림을 보여줄 수 없습니다.
- 레벨 1 문제는 이모지(emoji) 필드에 문제와 관련된 이모지를 1개 넣어서 시각적 힌트를 제공하세요.
- 레벨 2~3 문제는 emoji 필드를 빈 문자열("")로 두세요.
- 레벨 1 문제 예시: emoji에 "🍎", question에 "이것은 무엇인가요?" 처럼 이모지로 힌트를 주세요.

JSON 배열 형식으로만 응답하세요 (다른 텍스트 없이):
[{
  "question": "문제 텍스트",
  "emoji": "이모지 또는 빈 문자열",
  "options": ["보기1", "보기2", "보기3", "보기4"],
  "answer": "정답",
  "level": 1
}]
레벨 1: 기초 단어 (사물 이름, 색깔, 숫자) - emoji 필드 필수
레벨 2: 짧은 문장 (인사, 간단한 표현) - emoji 빈 문자열
레벨 3: 문장 이해 (짧은 글 읽기) - emoji 빈 문자열`;

  const raw = await callGemini(apiKey, prompt);
  const json = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(json) as QuizQuestion[];
}

// 레벨별 학습 콘텐츠 생성
export async function generateLearningContent(
  apiKey: string,
  level: Level,
  category: string,
  language: NativeLanguage,
): Promise<LearningItem[]> {
  const langName = getLanguageName(language);

  const levelPrompts: Record<Level, string> = {
    1: `카테고리 "${category}"에 관한 기초 단어 카드 6개를 만들어주세요.
각 단어는 한국어, 발음(로마자), ${langName} 번역을 포함해주세요.
JSON 배열로만 응답하세요:
[{"id":"1","type":"word","korean":"단어","pronunciation":"발음","nativeTranslation":"번역","category":"${category}"}]`,
    2: `카테고리 "${category}"에 관한 짧은 대화문 4개를 만들어주세요.
각 대화문은 한국어와 ${langName} 번역을 포함해주세요.
JSON 배열로만 응답하세요:
[{"id":"1","type":"conversation","korean":"한국어 대화","nativeTranslation":"번역","example":"사용 상황 설명"}]`,
    3: `주제 "${category}"에 관한 짧은 한국어 글 3개를 만들어주세요.
각 글은 2~3문장으로 구성하고 ${langName} 번역을 포함해주세요.
JSON 배열로만 응답하세요:
[{"id":"1","type":"reading","korean":"한국어 글","nativeTranslation":"번역","example":"이해 확인 질문"}]`,
  };

  const prompt = `${SAFETY_PREFIX}${levelPrompts[level]}`;
  const raw = await callGemini(apiKey, prompt);
  const json = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(json) as LearningItem[];
}

// 복습 퀴즈 생성
export async function generateReviewQuiz(
  apiKey: string,
  items: LearningItem[],
): Promise<QuizQuestion[]> {
  const words = items.map(i => i.korean).join(', ');
  const prompt = `${SAFETY_PREFIX}다음 한국어 단어/문장으로 복습 퀴즈 4개를 만들어주세요: ${words}
JSON 배열로만 응답하세요:
[{"question":"문제","options":["보기1","보기2","보기3","보기4"],"answer":"정답","level":1}]`;

  const raw = await callGemini(apiKey, prompt);
  const json = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(json) as QuizQuestion[];
}
