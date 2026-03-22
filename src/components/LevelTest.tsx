import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { QuizQuestion, Level } from '../types';
import { useDiagnosticQuiz } from '../hooks/useGemini';
import { buildQuizResult, LEVEL_CONFIG } from '../utils/levelUtils';
import ProgressBar from './ProgressBar';

interface LevelTestProps {
  apiKey: string;
  onLevelSet: (level: Level) => void;
  darkMode: boolean;
}

// 기본 내장 퀴즈 (API 실패 시 폴백)
const FALLBACK_QUESTIONS: QuizQuestion[] = [
  { emoji: '🍎', question: '이것은 무엇인가요?', options: ['사과', '바나나', '오렌지', '포도'], answer: '사과', level: 1 },
  { emoji: '🐶', question: '이 동물의 이름은 무엇인가요?', options: ['강아지', '고양이', '토끼', '물고기'], answer: '강아지', level: 1 },
  { emoji: '✏️', question: '학교에서 글씨를 쓸 때 사용하는 것은?', options: ['연필', '가위', '풀', '자'], answer: '연필', level: 1 },
  { question: '"안녕하세요"는 무슨 뜻인가요?', emoji: '', options: ['감사합니다', '안녕하세요', '잘 가세요', '미안합니다'], answer: '안녕하세요', level: 2 },
  { question: '"오늘 날씨가 맑아요." 여기서 "맑다"는 무슨 뜻인가요?', emoji: '', options: ['비가 온다', '흐리다', '맑고 화창하다', '춥다'], answer: '맑고 화창하다', level: 2 },
  { question: '"감사합니다"의 올바른 응답은?', emoji: '', options: ['천만에요', '미안해요', '안녕히 가세요', '잠깐만요'], answer: '천만에요', level: 2 },
  { question: '"봄, 여름, 가을, ___" 빈칸에 들어갈 계절은?', emoji: '', options: ['겨울', '봄', '여름', '가을'], answer: '겨울', level: 3 },
  { question: '"나는 오늘 친구와 함께 공원에서 놀았습니다." 누구와 놀았나요?', emoji: '', options: ['혼자', '가족', '친구', '선생님'], answer: '친구', level: 3 },
];

export default function LevelTest({ apiKey, onLevelSet, darkMode }: LevelTestProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [started, setStarted] = useState(false);

  const { loadQuiz, loading, error } = useDiagnosticQuiz(apiKey);

  const startTest = async () => {
    setStarted(true);
    const q = await loadQuiz();
    setQuestions(q ?? FALLBACK_QUESTIONS);
    setCurrentIdx(0);
    setAnswers([]);
    setSelected(null);
    setShowResult(false);
  };

  const handleAnswer = (option: string) => {
    if (selected) return;
    setSelected(option);

    setTimeout(() => {
      const newAnswers = [...answers, option];
      setAnswers(newAnswers);
      setSelected(null);
      if (currentIdx + 1 >= questions.length) {
        setShowResult(true);
      } else {
        setCurrentIdx(prev => prev + 1);
      }
    }, 800);
  };

  const getScore = () =>
    answers.filter((a, i) => a === questions[i]?.answer).length;

  const handleComplete = () => {
    const score = getScore();
    const result = buildQuizResult(score, questions.length);
    onLevelSet(result.level);
  };

  const cardBg = darkMode ? '#1e293b' : 'white';
  const textColor = darkMode ? '#e2e8f0' : '#1f2937';

  if (!started) {
    return (
      <div className="p-4 md:p-8 pb-20 md:pb-8 flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Jua, sans-serif', color: '#FF6B6B' }}>
            한국어 수준 진단
          </h2>
          <p className="text-gray-500 mb-2">간단한 퀴즈로 나의 한국어 수준을 알아봐요!</p>
          <p className="text-sm text-gray-400 mb-6">총 8문항 · 약 3분 소요</p>

          {/* 레벨 안내 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            {([1, 2, 3] as Level[]).map(lvl => {
              const cfg = LEVEL_CONFIG[lvl];
              return (
                <div
                  key={lvl}
                  className={`p-3 rounded-2xl ${cfg.bg} ${cfg.border} border`}
                >
                  <div className="text-2xl mb-1">{cfg.emoji}</div>
                  <div className={`text-sm font-bold ${cfg.color}`}>{cfg.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{cfg.description}</div>
                </div>
              );
            })}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startTest}
            className="px-8 py-4 rounded-2xl text-white font-bold text-lg"
            style={{
              background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
              fontFamily: 'Jua, sans-serif',
            }}
          >
            진단 시작하기 🚀
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="text-5xl"
        >
          ⚙️
        </motion.div>
        <p className="text-gray-500">문제를 만들고 있어요...</p>
      </div>
    );
  }

  if (showResult) {
    const score = getScore();
    const result = buildQuizResult(score, questions.length);
    const cfg = LEVEL_CONFIG[result.level];

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-4 md:p-8 pb-20 md:pb-8 flex flex-col items-center"
      >
        {/* 폭죽 애니메이션 */}
        <div className="flex gap-2 text-3xl mb-4">
          {['🎉', '⭐', '🎊', '✨', '🌟'].map((e, i) => (
            <motion.span
              key={i}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              {e}
            </motion.span>
          ))}
        </div>

        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Jua, sans-serif', color: '#FF6B6B' }}>
          진단 완료!
        </h2>

        <div
          className={`p-6 rounded-3xl text-center mb-6 w-full max-w-xs ${cfg.bg} ${cfg.border} border-2`}
        >
          <div className="text-5xl mb-2">{cfg.emoji}</div>
          <div className={`text-2xl font-bold ${cfg.color}`} style={{ fontFamily: 'Jua, sans-serif' }}>
            {cfg.label} (Level {result.level})
          </div>
          <div className="text-gray-600 mt-1 text-sm">{cfg.description}</div>
          <div className="mt-3 text-lg font-bold text-gray-700">
            {score} / {questions.length} 정답
          </div>
        </div>

        <ProgressBar
          current={score}
          total={questions.length}
          label="정답률"
          color={result.level === 3 ? '#4ECDC4' : result.level === 2 ? '#FFE66D' : '#FF6B6B'}
        />

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleComplete}
          className="mt-6 px-8 py-4 rounded-2xl text-white font-bold text-lg"
          style={{
            background: 'linear-gradient(135deg, #4ECDC4, #2FA898)',
            fontFamily: 'Jua, sans-serif',
          }}
        >
          학습 시작하기 📚
        </motion.button>
      </motion.div>
    );
  }

  const question = questions[currentIdx];
  if (!question) return null;

  return (
    <div className="p-4 md:p-6 pb-20 md:pb-8">
      <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ fontFamily: 'Jua, sans-serif', color: '#FF6B6B' }}>
        한국어 진단 테스트
      </h2>

      <ProgressBar
        current={currentIdx}
        total={questions.length}
        label={`${currentIdx + 1} / ${questions.length} 문항`}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          className="mt-6 p-5 rounded-3xl shadow-md"
          style={{ background: cardBg }}
        >
          {/* 이모지 (그림 역할) */}
          {question.emoji && (
            <div
              className="w-28 h-28 md:w-36 md:h-36 rounded-2xl flex items-center justify-center text-6xl md:text-7xl mx-auto mb-4"
              style={{ background: '#FFF3E8' }}
            >
              {question.emoji}
            </div>
          )}
          <p className="text-lg font-medium mb-6" style={{ color: textColor, fontFamily: 'Noto Sans KR, sans-serif' }}>
            {question.question}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {question.options.map(option => {
              const isSelected = selected === option;
              const isCorrect = selected && option === question.answer;
              const isWrong = isSelected && option !== question.answer;

              return (
                <motion.button
                  key={option}
                  whileHover={{ scale: selected ? 1 : 1.02 }}
                  whileTap={{ scale: selected ? 1 : 0.98 }}
                  onClick={() => handleAnswer(option)}
                  className="p-3 rounded-2xl text-sm font-medium text-left transition-all"
                  style={{
                    background: isCorrect
                      ? '#D1FAE5'
                      : isWrong
                      ? '#FEE2E2'
                      : isSelected
                      ? '#FFF3E8'
                      : darkMode ? '#334155' : '#F9FAFB',
                    border: `2px solid ${
                      isCorrect ? '#10B981' : isWrong ? '#EF4444' : isSelected ? '#FF6B6B' : 'transparent'
                    }`,
                    color: textColor,
                  }}
                >
                  {isCorrect ? '✅ ' : isWrong ? '❌ ' : ''}{option}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {error && (
        <p className="mt-4 text-sm text-center text-gray-400">
          (기본 문제로 진행 중이에요)
        </p>
      )}
    </div>
  );
}
