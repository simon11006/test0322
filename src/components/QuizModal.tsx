import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { QuizQuestion } from '../types';
import ProgressBar from './ProgressBar';

interface QuizModalProps {
  questions: QuizQuestion[];
  onClose: (score: number) => void;
  darkMode: boolean;
}

// 별 폭죽 이펙트
function StarBurst() {
  const stars = Array.from({ length: 12 }, (_, i) => i);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {stars.map(i => (
        <motion.div
          key={i}
          initial={{
            opacity: 1,
            x: '50vw',
            y: '50vh',
            scale: 0,
          }}
          animate={{
            opacity: 0,
            x: `${Math.random() * 100}vw`,
            y: `${Math.random() * 100}vh`,
            scale: [0, 1.5, 0],
          }}
          transition={{ duration: 0.8, delay: i * 0.05 }}
          className="absolute text-2xl"
        >
          {['⭐', '✨', '🌟', '💫'][i % 4]}
        </motion.div>
      ))}
    </div>
  );
}

export default function QuizModal({ questions, onClose, darkMode }: QuizModalProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showStars, setShowStars] = useState(false);
  const [finished, setFinished] = useState(false);

  const handleAnswer = (option: string) => {
    if (selected) return;
    setSelected(option);
    const correct = option === questions[currentIdx].answer;
    if (correct) {
      setScore(s => s + 1);
      setShowStars(true);
      setTimeout(() => setShowStars(false), 900);
    }

    setTimeout(() => {
      setSelected(null);
      if (currentIdx + 1 >= questions.length) {
        setFinished(true);
      } else {
        setCurrentIdx(i => i + 1);
      }
    }, 900);
  };

  const cardBg = darkMode ? '#1e293b' : 'white';
  const textColor = darkMode ? '#e2e8f0' : '#1f2937';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.5)' }}
      >
        {showStars && <StarBurst />}

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="w-full max-w-md rounded-3xl p-6 shadow-2xl"
          style={{ background: cardBg }}
        >
          {finished ? (
            <div className="text-center">
              <div className="text-5xl mb-3">
                {score === questions.length ? '🏆' : score >= questions.length / 2 ? '🎉' : '💪'}
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Jua, sans-serif', color: '#FF6B6B' }}>
                퀴즈 완료!
              </h3>
              <p className="text-gray-500 mb-4">
                {score} / {questions.length} 정답
              </p>
              <ProgressBar
                current={score}
                total={questions.length}
                color={score === questions.length ? '#4ECDC4' : '#FF6B6B'}
              />
              <p className="mt-4 text-sm text-gray-500">
                {score === questions.length
                  ? '완벽해요! 모두 맞혔어요! 🌟'
                  : score >= questions.length / 2
                  ? '잘 했어요! 조금만 더 연습해요! 🌿'
                  : '괜찮아요! 다시 복습해봐요! 🌱'}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onClose(score)}
                className="mt-5 w-full py-3 rounded-2xl text-white font-bold"
                style={{
                  background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
                  fontFamily: 'Jua, sans-serif',
                }}
              >
                닫기
              </motion.button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold" style={{ fontFamily: 'Jua, sans-serif', color: '#FF6B6B' }}>
                  복습 퀴즈
                </h3>
                <button
                  onClick={() => onClose(score)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <ProgressBar current={currentIdx} total={questions.length} />

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIdx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="mt-5"
                >
                  <p className="text-base font-medium mb-5" style={{ color: textColor }}>
                    {questions[currentIdx].question}
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    {questions[currentIdx].options.map(option => {
                      const isSelected = selected === option;
                      const isCorrect = selected && option === questions[currentIdx].answer;
                      const isWrong = isSelected && option !== questions[currentIdx].answer;

                      return (
                        <motion.button
                          key={option}
                          whileHover={{ scale: selected ? 1 : 1.02 }}
                          whileTap={{ scale: selected ? 1 : 0.98 }}
                          onClick={() => handleAnswer(option)}
                          className="p-3 rounded-2xl text-sm font-medium transition-all"
                          style={{
                            background: isCorrect
                              ? '#D1FAE5'
                              : isWrong
                              ? '#FEE2E2'
                              : darkMode ? '#334155' : '#F9FAFB',
                            border: `2px solid ${
                              isCorrect
                                ? '#10B981'
                                : isWrong
                                ? '#EF4444'
                                : 'transparent'
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
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
