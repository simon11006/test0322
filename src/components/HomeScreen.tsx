import { motion } from 'framer-motion';
import type { AppScreen, Level, NativeLanguage } from '../types';
import { SUPPORTED_LANGUAGES } from '../utils/languages';
import { LEVEL_CONFIG } from '../utils/levelUtils';
import { getTodayString } from '../utils/levelUtils';
import type { LearningProgress } from '../types';

interface HomeScreenProps {
  nativeLanguage?: NativeLanguage;
  level?: Level;
  onNavigate: (screen: AppScreen) => void;
  onLanguageSelect: (lang: NativeLanguage) => void;
  darkMode: boolean;
}

const QUICK_ACTIONS: { screen: AppScreen; icon: string; label: string; color: string; desc: string }[] = [
  { screen: 'translate', icon: '🔤', label: '번역 학습', color: '#FF6B6B', desc: '모국어 → 한국어' },
  { screen: 'level-test', icon: '📝', label: '수준 진단', color: '#4ECDC4', desc: '나의 한국어 실력 확인' },
  { screen: 'learning', icon: '📚', label: '레벨 학습', color: '#FFE66D', desc: '맞춤형 학습 콘텐츠' },
  { screen: 'progress', icon: '📊', label: '학습 기록', color: '#A78BFA', desc: '나의 학습 현황' },
];

export default function HomeScreen({
  nativeLanguage,
  level,
  onNavigate,
  onLanguageSelect,
  darkMode,
}: HomeScreenProps) {
  const progressData: LearningProgress[] = JSON.parse(
    localStorage.getItem('learning_progress') ?? '[]',
  );
  const today = getTodayString();
  const todayProg = progressData.find(p => p.date === today);

  const cardBg = darkMode ? '#1e293b' : 'white';
  const textColor = darkMode ? '#e2e8f0' : '#1f2937';

  return (
    <div className="p-4 md:p-6 pb-20 md:pb-8">
      {/* 인사 배너 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl p-5 md:p-7 mb-5 text-white"
        style={{ background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)' }}
      >
        <div className="flex items-center gap-3">
          <motion.span
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-4xl md:text-5xl"
          >
            🌟
          </motion.span>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'Jua, sans-serif' }}>
              안녕하세요!
            </h1>
            <p className="text-sm md:text-base opacity-90">오늘도 한국어를 배워봐요!</p>
          </div>
        </div>

        {/* 오늘 학습 요약 */}
        {todayProg && (
          <div className="mt-3 flex gap-4 text-sm">
            <span>📝 단어 {todayProg.wordsLearned}개</span>
            <span>💬 문장 {todayProg.sentencesLearned}개</span>
            <span>🧩 퀴즈 {todayProg.quizzesTaken}회</span>
          </div>
        )}
      </motion.div>

      {/* 현재 레벨 표시 */}
      {level && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`p-3 rounded-2xl mb-5 flex items-center gap-2 ${LEVEL_CONFIG[level].bg} border ${LEVEL_CONFIG[level].border}`}
        >
          <span className="text-2xl">{LEVEL_CONFIG[level].emoji}</span>
          <span className={`font-bold ${LEVEL_CONFIG[level].color}`} style={{ fontFamily: 'Jua, sans-serif' }}>
            나의 레벨: {LEVEL_CONFIG[level].label}
          </span>
          <button
            onClick={() => onNavigate('level-test')}
            className="ml-auto text-xs px-2 py-1 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
          >
            재진단
          </button>
        </motion.div>
      )}

      {/* 모국어 미선택 시에만 언어 선택 표시 */}
      {!nativeLanguage && (
        <div className="mb-5">
          <h2 className="text-base font-bold mb-3" style={{ fontFamily: 'Jua, sans-serif', color: textColor }}>
            나의 모국어를 선택해요
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {SUPPORTED_LANGUAGES.map((lang, i) => (
              <motion.button
                key={lang.code}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onLanguageSelect(lang.code)}
                className="p-3 rounded-2xl flex items-center gap-2 text-sm font-medium transition-all"
                style={{
                  background: cardBg,
                  color: textColor,
                  border: '2px solid transparent',
                  fontFamily: 'Noto Sans KR, sans-serif',
                }}
              >
                <span className="text-xl">{lang.flag}</span>
                <div className="text-left">
                  <div className="font-bold text-xs">{lang.name}</div>
                  <div className="text-xs opacity-70">{lang.nativeName}</div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* 빠른 이동 */}
      {nativeLanguage && (
        <div>
          <h2 className="text-base font-bold mb-3" style={{ fontFamily: 'Jua, sans-serif', color: textColor }}>
            무엇을 할까요?
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {QUICK_ACTIONS.map((action, i) => (
              <motion.button
                key={action.screen}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onNavigate(action.screen)}
                className="p-4 rounded-2xl text-left shadow-sm"
                style={{ background: cardBg }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-2"
                  style={{ background: `${action.color}20` }}
                >
                  {action.icon}
                </div>
                <p className="font-bold text-sm" style={{ color: action.color, fontFamily: 'Jua, sans-serif' }}>
                  {action.label}
                </p>
                <p className="text-xs text-gray-400 mt-1">{action.desc}</p>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* 모국어 미선택 안내 */}
      {!nativeLanguage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-6"
        >
          <p className="text-gray-400 text-sm">위에서 나의 모국어를 선택하면 학습을 시작할 수 있어요! 👆</p>
        </motion.div>
      )}

      {/* 모국어 선택된 경우 - 설정에서 변경 안내 */}
      {nativeLanguage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 text-center"
        >
          <p className="text-xs text-gray-400">
            모국어를 변경하려면 하단 ⚙️ 설정 탭을 이용하세요.
          </p>
        </motion.div>
      )}
    </div>
  );
}
