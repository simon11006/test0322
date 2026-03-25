import { useState, useCallback } from 'react';

// 카테고리별 폴백 이모지 매핑 (300+ 단어)
const FALLBACK_EMOJIS: Record<string, string> = {
  // 과일
  사과: '🍎', 배: '🍐', 오렌지: '🍊', 귤: '🍊', 레몬: '🍋', 바나나: '🍌',
  수박: '🍉', 포도: '🍇', 딸기: '🍓', 복숭아: '🍑', 멜론: '🍈', 체리: '🍒',
  블루베리: '🫐', 키위: '🥝', 망고: '🥭', 파인애플: '🍍', 코코넛: '🥥',
  // 채소
  토마토: '🍅', 당근: '🥕', 옥수수: '🌽', 고추: '🌶️', 브로콜리: '🥦',
  마늘: '🧄', 양파: '🧅', 감자: '🥔', 고구마: '🍠', 버섯: '🍄',
  오이: '🥒', 배추: '🥬', 상추: '🥗', 파: '🧅', 호박: '🎃',
  // 음식
  밥: '🍚', 빵: '🍞', 국수: '🍜', 라면: '🍜', 떡: '🍡', 김밥: '🍙',
  삼각김밥: '🍙', 초밥: '🍣', 피자: '🍕', 햄버거: '🍔', 치킨: '🍗',
  튀김: '🍤', 케이크: '🎂', 쿠키: '🍪', 아이스크림: '🍦', 사탕: '🍬',
  초콜릿: '🍫', 팝콘: '🍿', 달걀: '🥚', 치즈: '🧀', 버터: '🧈',
  // 음료
  물: '💧', 우유: '🥛', 주스: '🧃', 커피: '☕', 차: '🍵', 콜라: '🥤',
  // 동물
  강아지: '🐶', 고양이: '🐱', 토끼: '🐰', 곰: '🐻', 돼지: '🐷',
  소: '🐮', 닭: '🐔', 병아리: '🐥', 오리: '🦆', 새: '🐦',
  물고기: '🐟', 상어: '🦈', 고래: '🐳', 돌고래: '🐬', 문어: '🐙',
  게: '🦀', 새우: '🦐', 나비: '🦋', 벌: '🐝', 개미: '🐜',
  달팽이: '🐌', 무당벌레: '🐞', 거미: '🕷️', 개구리: '🐸', 도마뱀: '🦎',
  뱀: '🐍', 거북이: '🐢', 공룡: '🦕', 호랑이: '🐯', 사자: '🦁',
  코끼리: '🐘', 기린: '🦒', 원숭이: '🐒', 팬더: '🐼', 펭귄: '🐧',
  말: '🐴', 양: '🐑', 염소: '🐐', 당나귀: '🫏', 낙타: '🐪',
  여우: '🦊', 늑대: '🐺', 사슴: '🦌', 다람쥐: '🐿️', 쥐: '🐭',
  // 학교/문구
  책: '📚', 연필: '✏️', 볼펜: '🖊️', 지우개: '🧹', 자: '📏',
  가위: '✂️', 풀: '🖍️', 색연필: '🖍️', 크레용: '🖍️', 노트: '📓',
  공책: '📒', 가방: '🎒', 필통: '🗒️', 칠판: '🖥️', 교실: '🏫',
  // 신체
  눈: '👁️', 코: '👃', 귀: '👂', 입: '👄', 손: '✋',
  발: '🦶', 머리: '🗣️', 얼굴: '😊', 팔: '💪', 다리: '🦵',
  손가락: '☝️', 배꼽: '🫃', 가슴: '❤️', 등: '🔙', 어깨: '💪',
  // 가족/사람
  엄마: '👩', 아빠: '👨', 아이: '👶', 아기: '👶', 할머니: '👵',
  할아버지: '👴', 언니: '👧', 오빠: '👦', 누나: '👧', 형: '👦',
  동생: '👦', 가족: '👨‍👩‍👧‍👦', 친구: '👫', 선생님: '👩‍🏫', 의사: '👨‍⚕️',
  간호사: '👩‍⚕️', 소방관: '👨‍🚒', 경찰: '👮', 요리사: '👨‍🍳', 농부: '👨‍🌾',
  // 장소/건물
  집: '🏠', 학교: '🏫', 병원: '🏥', 마트: '🏪', 시장: '🏬',
  공원: '🌳', 도서관: '📚', 은행: '🏦', 우체국: '🏣', 소방서: '🚒',
  경찰서: '🚓', 식당: '🍽️', 카페: '☕', 교회: '⛪', 아파트: '🏢',
  // 교통수단
  자동차: '🚗', 버스: '🚌', 기차: '🚂', 지하철: '🚇', 자전거: '🚲',
  오토바이: '🏍️', 비행기: '✈️', 선박: '🚢', 택시: '🚕', 트럭: '🚛',
  소방차: '🚒', 구급차: '🚑', 경찰차: '🚓', 헬리콥터: '🚁',
  // 자연/날씨
  해: '☀️', 달: '🌙', 별: '⭐', 구름: '☁️', 비: '🌧️',
  눈송이: '❄️', 번개: '⚡', 무지개: '🌈', 바람: '💨', 안개: '🌫️',
  나무: '🌳', 꽃: '🌸', 잔디: '🌿', 잎: '🍃', 씨앗: '🌱',
  산: '⛰️', 강: '🏞️', 바다: '🌊', 호수: '🏞️', 모래: '🏖️',
  돌: '🪨', 흙: '🌍',
  // 색깔
  빨간색: '🔴', 파란색: '🔵', 초록색: '🟢', 노란색: '🟡', 주황색: '🟠',
  보라색: '🟣', 분홍색: '🩷', 하얀색: '⬜', 검은색: '⬛', 갈색: '🟫',
  // 숫자
  하나: '1️⃣', 둘: '2️⃣', 셋: '3️⃣', 넷: '4️⃣', 다섯: '5️⃣',
  여섯: '6️⃣', 일곱: '7️⃣', 여덟: '8️⃣', 아홉: '9️⃣', 열: '🔟',
  // 옷/의복
  모자: '🧢', 티셔츠: '👕', 바지: '👖', 치마: '👗', 원피스: '👗',
  양말: '🧦', 신발: '👟', 운동화: '👟', 슬리퍼: '🩴', 장갑: '🧤',
  목도리: '🧣', 외투: '🧥', 핸드백: '👜', 우산: '☂️',
  // 스포츠/놀이
  공: '⚽', 축구: '⚽', 야구: '⚾', 농구: '🏀', 배구: '🏐',
  테니스: '🎾', 수영: '🏊', 달리기: '🏃', 자전거타기: '🚴', 태권도: '🥋',
  놀이터: '🛝', 그네: '🎠', 미끄럼틀: '🛝', 줄넘기: '🪢', 블록: '🧱',
  인형: '🪆', 장난감: '🧸', 게임: '🎮', 그림: '🎨', 음악: '🎵',
  // 감정
  기쁨: '😊', 슬픔: '😢', 화남: '😠', 놀람: '😮', 웃음: '😄',
  울음: '😭', 무서움: '😱', 부끄러움: '😳', 사랑: '❤️', 행복: '😃',
  // 시간
  아침: '🌅', 점심: '🌞', 저녁: '🌆', 밤: '🌙', 오늘: '📅',
  내일: '📆', 어제: '🗓️', 시계: '⏰', 달력: '📅',
  // 집안/생활
  침대: '🛏️', 소파: '🛋️', 책상: '🪑', 의자: '🪑', 냉장고: '🧊',
  세탁기: '🫧', 청소기: '🧹', 빗자루: '🧹', 쓰레기통: '🗑️', 화장실: '🚿',
  욕조: '🛁', 거울: '🪞', 창문: '🪟', 문: '🚪', 열쇠: '🔑',
  컵: '🥤', 그릇: '🍽️', 젓가락: '🥢', 숟가락: '🥄', 포크: '🍴',
  // 도구/전자기기
  컴퓨터: '💻', 핸드폰: '📱', 전화: '📞', 텔레비전: '📺', 카메라: '📷',
  전등: '💡', 망치: '🔨', 풍선: '🎈',
};

function getFallbackEmoji(word: string): string {
  // 1단계: 정확히 일치
  if (FALLBACK_EMOJIS[word]) return FALLBACK_EMOJIS[word];

  // 2단계: 단어가 키를 포함하거나 키가 단어를 포함
  const partial = Object.entries(FALLBACK_EMOJIS).find(
    ([k]) => word.includes(k) || k.includes(word),
  );
  if (partial) return partial[1];

  // 3단계: 첫 글자가 같은 단어로 유추
  const firstChar = word[0];
  const firstCharMatch = Object.entries(FALLBACK_EMOJIS).find(([k]) => k[0] === firstChar);
  if (firstCharMatch) return firstCharMatch[1];

  return '';  // 빈 문자열 = Pixabay로 넘김
}

// Pixabay 무료 API로 이미지 검색 (API 키는 localStorage에서 읽음)
async function fetchPixabayImage(word: string): Promise<string | null> {
  const pixabayKey = localStorage.getItem('pixabay_api_key');
  if (!pixabayKey) return null;

  try {
    const query = encodeURIComponent(word);
    const url =
      `https://pixabay.com/api/?key=${pixabayKey}` +
      `&q=${query}&image_type=illustration&safesearch=true` +
      `&per_page=5&min_width=200&min_height=200`;

    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    const hit = data.hits?.[0];
    return hit?.webformatURL ?? null;
  } catch {
    return null;
  }
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
      // 1순위: 이모지 사전 (300+ 단어, API 요청 없음)
      const emoji = getFallbackEmoji(koreanWord);
      if (emoji) {
        setImageUrl(`emoji:${emoji}`);
        return null;
      }

      // 2순위: Pixabay 무료 이미지 API
      const pixabayUrl = await fetchPixabayImage(koreanWord);
      if (pixabayUrl) {
        setImageUrl(pixabayUrl);
        return pixabayUrl;
      }

      // 최종: 기본 이모지
      setImageUrl('emoji:🖼️');
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  return { imageUrl, loading, error, generateImg, getFallbackEmoji };
}
