export type TestStatus = 'idle' | 'testing' | 'ok' | 'fail';

/** Gemini API 키 유효성 테스트 */
export async function testGeminiKey(apiKey: string): Promise<{ ok: boolean; message: string }> {
  if (!apiKey.trim()) return { ok: false, message: 'API 키를 먼저 입력해주세요.' };
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey.trim()}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: '안녕' }] }] }),
      },
    );
    if (res.ok) return { ok: true, message: '정상 작동 중입니다.' };
    if (res.status === 400) return { ok: false, message: 'API 키가 유효하지 않습니다.' };
    if (res.status === 403) return { ok: false, message: '권한이 없습니다. 키를 확인해주세요.' };
    if (res.status === 429) return { ok: false, message: '요청 한도 초과. 잠시 후 재시도해주세요.' };
    return { ok: false, message: `오류 (${res.status})` };
  } catch {
    return { ok: false, message: '네트워크 오류가 발생했습니다.' };
  }
}

/** Pixabay API 키 유효성 테스트 */
export async function testPixabayKey(apiKey: string): Promise<{ ok: boolean; message: string }> {
  if (!apiKey.trim()) return { ok: false, message: 'API 키를 먼저 입력해주세요.' };
  try {
    const res = await fetch(
      `https://pixabay.com/api/?key=${apiKey.trim()}&q=flower&per_page=3&safesearch=true`,
    );
    if (res.ok) {
      const data = await res.json();
      if (data.totalHits !== undefined) return { ok: true, message: '정상 작동 중입니다.' };
    }
    if (res.status === 400) return { ok: false, message: 'API 키가 유효하지 않습니다.' };
    return { ok: false, message: `오류 (${res.status})` };
  } catch {
    return { ok: false, message: '네트워크 오류가 발생했습니다.' };
  }
}
