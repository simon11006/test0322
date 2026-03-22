import { motion } from 'framer-motion';
import type { LearningProgress, TranslationCard, Level } from '../types';
import { LEVEL_CONFIG, getTodayString } from '../utils/levelUtils';
import { isRTL } from '../utils/languages';
import type { NativeLanguage } from '../types';

interface ProgressViewProps {
  nativeLanguage: NativeLanguage;
  level?: Level;
  darkMode: boolean;
}

export default function ProgressView({ nativeLanguage, level, darkMode }: ProgressViewProps) {
  const progressData: LearningProgress[] = JSON.parse(
    localStorage.getItem('learning_progress') ?? '[]',
  );
  const favorites: TranslationCard[] = JSON.parse(
    localStorage.getItem('favorites') ?? '[]',
  );

  const today = getTodayString();
  const todayProgress = progressData.find(p => p.date === today);
  const totalWords = progressData.reduce((acc, p) => acc + p.wordsLearned, 0);
  const totalSentences = progressData.reduce((acc, p) => acc + p.sentencesLearned, 0);
  const totalQuizzes = progressData.reduce((acc, p) => acc + p.quizzesTaken, 0);

  const rtl = isRTL(nativeLanguage);
  const levelConfig = level ? LEVEL_CONFIG[level] : null;

  const cardBg = darkMode ? '#1e293b' : 'white';
  const textColor = darkMode ? '#e2e8f0' : '#1f2937';

  const StatCard = ({
    emoji,
    value,
    label,
    color,
  }: {
    emoji: string;
    value: number;
    label: string;
    color: string;
  }) => (
    <motion.div
      whileHover={{ y: -2 }}
      className="p-4 rounded-2xl text-center shadow-sm"
      style={{ background: cardBg }}
    >
      <div className="text-3xl mb-1">{emoji}</div>
      <div className="text-2xl font-bold" style={{ color, fontFamily: 'Jua, sans-serif' }}>
        {value}
      </div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </motion.div>
  );

  return (
    <div className="p-4 pb-20">
      <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Jua, sans-serif', color: '#FF6B6B' }}>
        학습 기록
      </h2>

      {/* 현재 레벨 */}
      {levelConfig && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl mb-5 flex items-center gap-3 ${levelConfig.bg} border ${levelConfig.border}`}
        >
          <span className="text-4xl">{levelConfig.emoji}</span>
          <div>
            <p className={`font-bold text-lg ${levelConfig.color}`} style={{ fontFamily: 'Jua, sans-serif' }}>
              {levelConfig.label} (Level {level})
            </p>
            <p className="text-sm text-gray-500">{levelConfig.description}</p>
          </div>
        </motion.div>
      )}

      {/* 오늘 학습 */}
      <div className="mb-5">
        <h3 className="text-base font-bold mb-3" style={{ color: textColor, fontFamily: 'Jua, sans-serif' }}>
          오늘 학습
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            emoji="📝"
            value={todayProgress?.wordsLearned ?? 0}
            label="단어"
            color="#FF6B6B"
          />
          <StatCard
            emoji="💬"
            value={todayProgress?.sentencesLearned ?? 0}
            label="문장"
            color="#4ECDC4"
          />
          <StatCard
            emoji="🧩"
            value={todayProgress?.quizzesTaken ?? 0}
            label="퀴즈"
            color="#FFE66D"
          />
        </div>
      </div>

      {/* 전체 누적 */}
      <div className="mb-5">
        <h3 className="text-base font-bold mb-3" style={{ color: textColor, fontFamily: 'Jua, sans-serif' }}>
          전체 누적
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <StatCard emoji="🌟" value={totalWords} label="단어" color="#FF6B6B" />
          <StatCard emoji="✨" value={totalSentences} label="문장" color="#4ECDC4" />
          <StatCard emoji="🏆" value={totalQuizzes} label="퀴즈" color="#FFE66D" />
        </div>
      </div>

      {/* 연속 학습일 */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="p-4 rounded-2xl mb-5 shadow-sm"
        style={{ background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)' }}
      >
        <div className="flex items-center gap-3 text-white">
          <span className="text-3xl">🔥</span>
          <div>
            <p className="font-bold text-lg" style={{ fontFamily: 'Jua, sans-serif' }}>
              {progressData.length}일 학습
            </p>
            <p className="text-sm opacity-80">계속 열심히 해요!</p>
          </div>
        </div>
      </motion.div>

      {/* 즐겨찾기 카드 */}
      {favorites.length > 0 && (
        <div>
          <h3 className="text-base font-bold mb-3" style={{ color: textColor, fontFamily: 'Jua, sans-serif' }}>
            ⭐ 저장한 단어 ({favorites.length})
          </h3>
          <div className="space-y-2">
            {favorites.map(card => (
              <motion.div
                key={card.id}
                whileHover={{ x: 4 }}
                className="p-3 rounded-2xl flex items-center gap-3 shadow-sm"
                style={{ background: cardBg }}
              >
                {card.imageUrl?.startsWith('emoji:') ? (
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: '#FFF3E8' }}>
                    {card.imageUrl.replace('emoji:', '')}
                  </div>
                ) : card.imageUrl ? (
                  <img src={card.imageUrl} alt={card.korean} className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: '#FFF3E8' }}>
                    🖼️
                  </div>
                )}
                <div>
                  <p className="font-bold" style={{ color: '#FF6B6B', fontFamily: 'Jua, sans-serif' }}>
                    {card.korean}
                  </p>
                  <p className="text-sm text-gray-400">[{card.pronunciation}]</p>
                  <p className="text-xs text-gray-500" dir={rtl ? 'rtl' : 'ltr'}>
                    {card.nativeText}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* 이력 없을 때 */}
      {progressData.length === 0 && favorites.length === 0 && (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">🌱</div>
          <p className="text-gray-400">아직 학습 기록이 없어요.</p>
          <p className="text-gray-400 text-sm">번역하거나 학습을 시작해봐요!</p>
        </div>
      )}
    </div>
  );
}
