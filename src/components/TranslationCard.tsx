import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TranslationCard as TCard, NativeLanguage } from '../types';
import { useTranslation } from '../hooks/useGemini';
import { useImageGen } from '../hooks/useImageGen';
import { isRTL, getLanguageConfig } from '../utils/languages';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface TranslationCardProps {
  apiKey: string;
  nativeLanguage: NativeLanguage;
  darkMode: boolean;
}

function ImageDisplay({ url, alt }: { url: string; alt: string }) {
  if (url.startsWith('emoji:')) {
    return (
      <div
        className="w-32 h-32 rounded-2xl flex items-center justify-center text-6xl"
        style={{ background: '#FFF3E8' }}
      >
        {url.replace('emoji:', '')}
      </div>
    );
  }
  return (
    <img
      src={url}
      alt={alt}
      className="w-32 h-32 rounded-2xl object-cover"
    />
  );
}

export default function TranslationCardView({ apiKey, nativeLanguage, darkMode }: TranslationCardProps) {
  const [inputText, setInputText] = useState('');
  const [currentCard, setCurrentCard] = useState<TCard | null>(null);
  const [favorites, setFavorites] = useLocalStorage<TCard[]>('favorites', []);
  const [isRecording, setIsRecording] = useState(false);
  const [ttsSupported] = useState(() => 'speechSynthesis' in window);

  const { translate, loading: translateLoading, error: translateError } = useTranslation(apiKey);
  const { generateImg, imageUrl, loading: imageLoading } = useImageGen(apiKey);

  const langConfig = getLanguageConfig(nativeLanguage);
  const rtl = isRTL(nativeLanguage);

  // 번역 실행
  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    const result = await translate(inputText, nativeLanguage);
    if (!result) return;
    const card: TCard = {
      id: Date.now().toString(),
      nativeText: inputText,
      nativeLanguage,
      korean: result.korean,
      pronunciation: result.pronunciation,
      example: result.example,
      exampleTranslation: result.exampleTranslation,
      isFavorite: false,
      createdAt: Date.now(),
    };
    setCurrentCard(card);
    // 이미지 생성 (첫 단어만)
    const firstWord = result.korean.split(' ')[0];
    generateImg(firstWord);
  };

  // 이미지 URL 업데이트
  useEffect(() => {
    if (imageUrl && currentCard) {
      setCurrentCard(prev => prev ? { ...prev, imageUrl } : prev);
    }
  }, [imageUrl]);

  // 즐겨찾기 토글
  const toggleFavorite = () => {
    if (!currentCard) return;
    const isFav = favorites.some(f => f.id === currentCard.id);
    if (isFav) {
      setFavorites(prev => prev.filter(f => f.id !== currentCard.id));
      setCurrentCard(prev => prev ? { ...prev, isFavorite: false } : prev);
    } else {
      const cardWithImg = { ...currentCard, imageUrl: imageUrl ?? undefined, isFavorite: true };
      setFavorites(prev => [cardWithImg, ...prev]);
      setCurrentCard(prev => prev ? { ...prev, isFavorite: true } : prev);
    }
  };

  // TTS: 한국어 발음 듣기
  const speakKorean = (text: string) => {
    if (!ttsSupported) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  // 마이크 입력 (Web Speech API)
  const startRecording = () => {
    type SpeechRecognitionCtor = new () => {
      lang: string;
      interimResults: boolean;
      onresult: ((e: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void) | null;
      onerror: (() => void) | null;
      onend: (() => void) | null;
      start: () => void;
    };
    const w = window as Window & {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
    };
    const SpeechRecognitionAPI = w.SpeechRecognition ?? w.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      alert('이 브라우저는 음성 입력을 지원하지 않아요.');
      return;
    }
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = nativeLanguage === 'other' ? 'ko-KR' : nativeLanguage;
    recognition.interimResults = false;
    recognition.onresult = (e) => {
      setInputText(e.results[0][0].transcript);
      setIsRecording(false);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognition.start();
    setIsRecording(true);
  };

  const cardBg = darkMode ? '#1e293b' : 'white';
  const textColor = darkMode ? '#e2e8f0' : '#1f2937';

  return (
    <div className="p-4 md:p-6 pb-20 md:pb-8">
      <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ fontFamily: 'Jua, sans-serif', color: '#FF6B6B' }}>
        번역 학습
      </h2>

      {/* 언어 표시 */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{langConfig.flag}</span>
        <span className="text-sm text-gray-500">{langConfig.name} → 한국어</span>
      </div>

      {/* 입력창 */}
      <div className="mb-4 relative">
        <textarea
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder={`${langConfig.nativeName}으로 입력하세요...`}
          rows={3}
          dir={rtl ? 'rtl' : 'ltr'}
          className="w-full px-4 py-3 rounded-2xl border-2 outline-none resize-none text-base transition-all"
          style={{
            borderColor: '#FF6B6B',
            background: cardBg,
            color: textColor,
            fontFamily: 'Noto Sans KR, sans-serif',
          }}
        />
        <div className="flex gap-2 mt-2">
          {/* 마이크 버튼 */}
          <button
            onClick={startRecording}
            className="p-3 rounded-xl transition-all"
            style={{
              background: isRecording ? '#FF6B6B' : '#FFF0EE',
              color: isRecording ? 'white' : '#FF6B6B',
            }}
          >
            {isRecording ? '🔴' : '🎤'}
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleTranslate}
            disabled={translateLoading || !inputText.trim()}
            className="flex-1 py-3 rounded-xl text-white font-bold"
            style={{
              background: translateLoading || !inputText.trim()
                ? '#ccc'
                : 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
              fontFamily: 'Jua, sans-serif',
            }}
          >
            {translateLoading ? '번역 중...' : '번역하기 ✨'}
          </motion.button>
        </div>
      </div>

      {/* 오류 표시 */}
      {translateError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-3 rounded-xl mb-4 text-sm"
          style={{ background: '#FFE8E8', color: '#FF6B6B' }}
        >
          ⚠️ {translateError}
        </motion.div>
      )}

      {/* 번역 카드 */}
      <AnimatePresence>
        {currentCard && (
          <motion.div
            key={currentCard.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="rounded-3xl p-5 shadow-lg"
            style={{ background: cardBg }}
          >
            <div className="flex gap-4">
              {/* 이미지 영역 */}
              <div className="flex-shrink-0">
                {imageLoading ? (
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-32 h-32 rounded-2xl flex items-center justify-center text-4xl"
                    style={{ background: '#FFF3E8' }}
                  >
                    🎨
                  </motion.div>
                ) : currentCard.imageUrl ? (
                  <ImageDisplay url={currentCard.imageUrl} alt={currentCard.korean} />
                ) : (
                  <div
                    className="w-32 h-32 rounded-2xl flex items-center justify-center text-4xl"
                    style={{ background: '#FFF3E8' }}
                  >
                    🖼️
                  </div>
                )}
              </div>

              {/* 텍스트 영역 */}
              <div className="flex-1 min-w-0">
                {/* 원문 */}
                <p
                  className="text-sm text-gray-400 mb-1"
                  dir={rtl ? 'rtl' : 'ltr'}
                >
                  {langConfig.flag} {currentCard.nativeText}
                </p>

                {/* 한국어 */}
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-2xl font-bold" style={{ color: '#FF6B6B', fontFamily: 'Jua, sans-serif' }}>
                    {currentCard.korean}
                  </h3>
                  {ttsSupported && (
                    <button
                      onClick={() => speakKorean(currentCard.korean)}
                      className="text-xl hover:scale-110 transition-transform"
                    >
                      🔊
                    </button>
                  )}
                </div>

                {/* 발음 */}
                <p className="text-sm text-gray-500 mb-2">
                  [{currentCard.pronunciation}]
                </p>

                {/* 즐겨찾기 */}
                <button
                  onClick={toggleFavorite}
                  className="text-xl hover:scale-110 transition-transform"
                >
                  {currentCard.isFavorite ? '⭐' : '☆'}
                </button>
              </div>
            </div>

            {/* 예시 문장 */}
            <div className="mt-4 p-3 rounded-xl" style={{ background: '#FFF3E8' }}>
              <p className="text-sm font-medium text-gray-700 mb-1">예시 문장:</p>
              <p className="text-base" style={{ color: '#FF6B6B', fontFamily: 'Jua, sans-serif' }}>
                {currentCard.example}
              </p>
              <p
                className="text-sm text-gray-500 mt-1"
                dir={rtl ? 'rtl' : 'ltr'}
              >
                {currentCard.exampleTranslation}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 즐겨찾기 목록 */}
      {favorites.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-bold mb-3" style={{ fontFamily: 'Jua, sans-serif', color: '#4ECDC4' }}>
            ⭐ 저장한 카드 ({favorites.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {favorites.slice(0, 6).map(fav => (
              <motion.div
                key={fav.id}
                whileHover={{ x: 4 }}
                className="p-3 rounded-2xl flex items-center gap-3"
                style={{ background: cardBg, border: '1px solid #E5E7EB' }}
              >
                {fav.imageUrl && <ImageDisplay url={fav.imageUrl} alt={fav.korean} />}
                <div>
                  <p className="font-bold" style={{ color: '#FF6B6B' }}>{fav.korean}</p>
                  <p className="text-sm text-gray-400">[{fav.pronunciation}]</p>
                  <p className="text-xs text-gray-500" dir={rtl ? 'rtl' : 'ltr'}>
                    {fav.nativeText}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
