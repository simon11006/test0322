import { motion } from 'framer-motion';
import type { NativeLanguage, Level } from '../types';
import { SUPPORTED_LANGUAGES } from '../utils/languages';

interface StudentSettingsProps {
  nativeLanguage?: NativeLanguage;
  onLanguageChange: (lang: NativeLanguage) => void;
  level?: Level;
  onResetLevel: () => void;
  darkMode: boolean;
  onToggleDark: () => void;
}

export default function StudentSettings({
  nativeLanguage,
  onLanguageChange,
  level,
  onResetLevel,
  darkMode,
  onToggleDark,
}: StudentSettingsProps) {
  const cardBg = darkMode ? '#1e293b' : 'white';
  const textColor = darkMode ? '#e2e8f0' : '#1f2937';
  const subColor = darkMode ? '#94a3b8' : '#6b7280';

  return (
    <div className="p-4 md:p-6 pb-20 md:pb-8" style={{ color: textColor }}>
      <h2
        className="text-2xl font-bold mb-6"
        style={{ fontFamily: 'Jua, sans-serif', color: '#FF6B6B' }}
      >
        ⚙️ 설정
      </h2>

      {/* 모국어 변경 */}
      <div
        className="rounded-2xl p-5 mb-4 shadow-sm"
        style={{ background: cardBg }}
      >
        <h3
          className="text-base font-bold mb-1"
          style={{ fontFamily: 'Jua, sans-serif', color: textColor }}
        >
          나의 모국어
        </h3>
        <p className="text-sm mb-4" style={{ color: subColor }}>
          현재 선택된 언어로 번역과 학습 콘텐츠가 제공됩니다.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SUPPORTED_LANGUAGES.map((lang, i) => (
            <motion.button
              key={lang.code}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onLanguageChange(lang.code)}
              className="p-3 rounded-2xl flex items-center gap-2 text-sm font-medium transition-all"
              style={{
                background: nativeLanguage === lang.code ? '#FF6B6B' : darkMode ? '#0f172a' : '#f9fafb',
                color: nativeLanguage === lang.code ? 'white' : textColor,
                border: `2px solid ${nativeLanguage === lang.code ? '#FF6B6B' : 'transparent'}`,
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

      {/* 화면 모드 */}
      <div
        className="rounded-2xl p-5 mb-4 shadow-sm flex items-center justify-between"
        style={{ background: cardBg }}
      >
        <div>
          <h3
            className="text-base font-bold"
            style={{ fontFamily: 'Jua, sans-serif', color: textColor }}
          >
            화면 모드
          </h3>
          <p className="text-sm mt-0.5" style={{ color: subColor }}>
            {darkMode ? '현재: 어두운 화면' : '현재: 밝은 화면'}
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onToggleDark}
          className="text-3xl p-2 rounded-xl"
          style={{ background: darkMode ? '#0f172a' : '#f3f4f6' }}
        >
          {darkMode ? '☀️' : '🌙'}
        </motion.button>
      </div>

      {/* 레벨 재진단 */}
      <div
        className="rounded-2xl p-5 shadow-sm"
        style={{ background: cardBg }}
      >
        <h3
          className="text-base font-bold mb-1"
          style={{ fontFamily: 'Jua, sans-serif', color: textColor }}
        >
          수준 진단
        </h3>
        <p className="text-sm mb-4" style={{ color: subColor }}>
          {level ? `현재 레벨: Level ${level} — 다시 진단받고 싶으면 재진단을 눌러주세요.` : '아직 수준 진단을 받지 않았어요.'}
        </p>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onResetLevel}
          className="px-5 py-3 rounded-xl text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #4ECDC4, #2FA898)', fontFamily: 'Jua, sans-serif' }}
        >
          📝 {level ? '레벨 재진단' : '수준 진단 받기'}
        </motion.button>
      </div>
    </div>
  );
}
