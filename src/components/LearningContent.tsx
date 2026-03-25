import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Level, NativeLanguage, LearningItem, QuizQuestion } from '../types';
import { useLearningContent, useReviewQuiz } from '../hooks/useGemini';
import { useImageGen } from '../hooks/useImageGen';
import { LEVEL_CONFIG, LEVEL_CATEGORIES } from '../utils/levelUtils';
import { isRTL } from '../utils/languages';
import QuizModal from './QuizModal';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { LearningProgress } from '../types';
import { getTodayString } from '../utils/levelUtils';

interface LearningContentProps {
  apiKey: string;
  level: Level;
  nativeLanguage: NativeLanguage;
  darkMode: boolean;
}

function WordCard({
  item,
  apiKey,
  rtl,
  darkMode,
}: {
  item: LearningItem;
  apiKey: string;
  rtl: boolean;
  darkMode: boolean;
}) {
  const { generateImg, imageUrl, loading } = useImageGen(apiKey);
  const [ttsSupported] = useState(() => 'speechSynthesis' in window);

  useEffect(() => {
    generateImg(item.korean);
  }, [item.korean]);

  const speak = () => {
    if (!ttsSupported) return;
    const u = new SpeechSynthesisUtterance(item.korean);
    u.lang = 'ko-KR';
    u.rate = 0.8;
    window.speechSynthesis.speak(u);
  };

  const cardBg = darkMode ? '#1e293b' : 'white';

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="p-4 rounded-2xl shadow-sm flex flex-col items-center gap-2"
      style={{ background: cardBg }}
    >
      {/* 이미지 */}
      {loading ? (
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-20 h-20 rounded-xl flex items-center justify-center text-3xl"
          style={{ background: '#FFF3E8' }}
        >
          🎨
        </motion.div>
      ) : imageUrl?.startsWith('emoji:') ? (
        <div
          className="w-20 h-20 rounded-xl flex items-center justify-center text-4xl"
          style={{ background: '#FFF3E8' }}
        >
          {imageUrl.replace('emoji:', '')}
        </div>
      ) : imageUrl ? (
        <img src={imageUrl} alt={item.korean} className="w-20 h-20 rounded-xl object-cover" />
      ) : null}

      {/* 단어 */}
      <div className="text-center">
        <div className="flex items-center gap-1 justify-center">
          <p className="text-xl font-bold" style={{ color: '#FF6B6B', fontFamily: 'Jua, sans-serif' }}>
            {item.korean}
          </p>
          {ttsSupported && (
            <button onClick={speak} className="text-sm hover:scale-110 transition-transform">
              🔊
            </button>
          )}
        </div>
        {item.pronunciation && (
          <p className="text-xs text-gray-400">[{item.pronunciation}]</p>
        )}
        {item.nativeTranslation && (
          <p className="text-sm text-gray-500 mt-1" dir={rtl ? 'rtl' : 'ltr'}>
            {item.nativeTranslation}
          </p>
        )}
      </div>
    </motion.div>
  );
}

function ConversationCard({
  item,
  rtl,
  darkMode,
}: {
  item: LearningItem;
  rtl: boolean;
  darkMode: boolean;
}) {
  const [ttsSupported] = useState(() => 'speechSynthesis' in window);

  const speak = () => {
    if (!ttsSupported) return;
    const u = new SpeechSynthesisUtterance(item.korean);
    u.lang = 'ko-KR';
    u.rate = 0.8;
    window.speechSynthesis.speak(u);
  };

  const cardBg = darkMode ? '#1e293b' : 'white';

  return (
    <motion.div
      whileHover={{ x: 4 }}
      className="p-4 rounded-2xl shadow-sm"
      style={{ background: cardBg }}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">💬</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-bold text-lg" style={{ color: '#FF6B6B', fontFamily: 'Jua, sans-serif' }}>
              {item.korean}
            </p>
            {ttsSupported && (
              <button onClick={speak} className="text-sm hover:scale-110 transition-transform">
                🔊
              </button>
            )}
          </div>
          {item.nativeTranslation && (
            <p className="text-sm text-gray-500" dir={rtl ? 'rtl' : 'ltr'}>
              {item.nativeTranslation}
            </p>
          )}
          {item.example && (
            <p className="text-xs text-gray-400 mt-1 italic" dir={rtl ? 'rtl' : 'ltr'}>
              💡 {item.example}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ReadingCard({
  item,
  rtl,
  darkMode,
}: {
  item: LearningItem;
  rtl: boolean;
  darkMode: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const cardBg = darkMode ? '#1e293b' : 'white';
  const textColor = darkMode ? '#e2e8f0' : '#1f2937';

  return (
    <motion.div
      className="p-4 rounded-2xl shadow-sm cursor-pointer"
      style={{ background: cardBg }}
      onClick={() => setExpanded(!expanded)}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">📖</span>
        <div className="flex-1">
          <p className="font-medium" style={{ color: textColor, fontFamily: 'Noto Sans KR, sans-serif', lineHeight: 1.8 }}>
            {item.korean}
          </p>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                {item.nativeTranslation && (
                  <p className="text-sm text-gray-500 mt-2" dir={rtl ? 'rtl' : 'ltr'}>
                    {item.nativeTranslation}
                  </p>
                )}
                {item.example && (
                  <div
                    className="mt-2 p-2 rounded-xl text-sm"
                    style={{ background: '#FFF3E8', color: '#FF6B6B' }}
                  >
                    ❓ {item.example}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <p className="text-xs text-gray-400 mt-1">
            {expanded ? '접기 ▲' : '번역 보기 ▼'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function LearningContent({
  apiKey,
  level,
  nativeLanguage,
  darkMode,
}: LearningContentProps) {
  const [selectedCategory, setSelectedCategory] = useState(LEVEL_CATEGORIES[level][0]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [, setProgress] = useLocalStorage<LearningProgress[]>('learning_progress', []);

  const levelConfig = LEVEL_CONFIG[level];
  const rtl = isRTL(nativeLanguage);
  const categories = LEVEL_CATEGORIES[level];

  const { loadContent, data: items, loading, error } = useLearningContent(apiKey);
  const { loadReviewQuiz, loading: quizLoading } = useReviewQuiz(apiKey);

  useEffect(() => {
    loadContent(level, selectedCategory, nativeLanguage);
  }, [level, selectedCategory, nativeLanguage]);

  // 학습 진도 기록
  useEffect(() => {
    if (!items) return;
    const today = getTodayString();
    setProgress(prev => {
      const existing = prev.find(p => p.date === today);
      if (existing) {
        return prev.map(p =>
          p.date === today
            ? {
                ...p,
                wordsLearned: p.wordsLearned + (level === 1 ? items.length : 0),
                sentencesLearned: p.sentencesLearned + (level > 1 ? items.length : 0),
                level,
              }
            : p,
        );
      }
      return [
        ...prev,
        {
          date: today,
          wordsLearned: level === 1 ? items.length : 0,
          sentencesLearned: level > 1 ? items.length : 0,
          quizzesTaken: 0,
          level,
        },
      ];
    });
  }, [items]);

  const handleStartQuiz = async () => {
    if (!items) return;
    const q = await loadReviewQuiz(items);
    if (q) {
      setQuizQuestions(q);
      setShowQuiz(true);
    }
  };

  const handleQuizClose = (_score: number) => {
    setShowQuiz(false);
    // 퀴즈 횟수 기록
    const today = getTodayString();
    setProgress(prev =>
      prev.map(p =>
        p.date === today ? { ...p, quizzesTaken: p.quizzesTaken + 1 } : p,
      ),
    );
  };

  return (
    <div className="p-4 md:p-6 pb-20 md:pb-8">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl md:text-4xl">{levelConfig.emoji}</span>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'Jua, sans-serif', color: '#FF6B6B' }}>
            {levelConfig.label} 학습
          </h2>
          <p className="text-sm md:text-base text-gray-500">{levelConfig.description}</p>
        </div>
      </div>

      {/* 카테고리 선택 */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all"
            style={{
              background: selectedCategory === cat ? '#FF6B6B' : darkMode ? '#334155' : '#F3F4F6',
              color: selectedCategory === cat ? 'white' : darkMode ? '#e2e8f0' : '#4B5563',
              fontFamily: 'Jua, sans-serif',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 콘텐츠 영역 */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="text-4xl"
          >
            📚
          </motion.div>
          <p className="text-gray-400 text-sm">학습 콘텐츠를 준비하고 있어요...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-8 text-gray-400">
          <p className="text-3xl mb-2">{error === 'RATE_LIMIT' ? '⏳' : '😅'}</p>
          <p className="text-sm font-medium" style={{ color: error === 'RATE_LIMIT' ? '#f59e0b' : undefined }}>
            {error === 'RATE_LIMIT'
              ? 'API 요청 한도 초과. 1분 후 다시 시도해주세요.'
              : '콘텐츠를 불러오지 못했어요. 다시 시도해주세요.'}
          </p>
          <button
            onClick={() => loadContent(level, selectedCategory, nativeLanguage)}
            className="mt-3 px-4 py-2 rounded-xl text-sm"
            style={{ background: '#FF6B6B', color: 'white' }}
          >
            다시 시도
          </button>
        </div>
      )}

      {items && !loading && (
        <>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${level}-${selectedCategory}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {level === 1 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {items.map(item => (
                    <WordCard
                      key={item.id}
                      item={item}
                      apiKey={apiKey}
                      rtl={rtl}
                      darkMode={darkMode}
                    />
                  ))}
                </div>
              )}
              {level === 2 && (
                <div className="space-y-3">
                  {items.map(item => (
                    <ConversationCard
                      key={item.id}
                      item={item}
                      rtl={rtl}
                      darkMode={darkMode}
                    />
                  ))}
                </div>
              )}
              {level === 3 && (
                <div className="space-y-3">
                  {items.map(item => (
                    <ReadingCard
                      key={item.id}
                      item={item}
                      rtl={rtl}
                      darkMode={darkMode}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* 복습 퀴즈 버튼 */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStartQuiz}
            disabled={quizLoading}
            className="mt-6 w-full py-4 rounded-2xl text-white font-bold text-lg"
            style={{
              background: quizLoading
                ? '#ccc'
                : 'linear-gradient(135deg, #4ECDC4, #2FA898)',
              fontFamily: 'Jua, sans-serif',
            }}
          >
            {quizLoading ? '퀴즈 준비 중...' : '복습 퀴즈 풀기 🧩'}
          </motion.button>
        </>
      )}

      {/* 퀴즈 모달 */}
      {showQuiz && quizQuestions.length > 0 && (
        <QuizModal
          questions={quizQuestions}
          onClose={handleQuizClose}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}
