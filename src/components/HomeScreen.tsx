import { motion } from 'framer-motion';
import type { AppScreen, Level, NativeLanguage, LearningProgress } from '../types';
import { SUPPORTED_LANGUAGES, getLanguageConfig } from '../utils/languages';

interface HomeScreenProps {
  nativeLanguage?: NativeLanguage;
  level?: Level;
  onNavigate: (screen: AppScreen) => void;
  onLanguageSelect: (lang: NativeLanguage) => void;
  darkMode: boolean;
}

function getStreak(progressData: LearningProgress[]): number {
  if (!progressData.length) return 0;
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    if (progressData.some(p => p.date === dateStr)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function getXPInfo(level?: Level) {
  if (!level) return { label: '?', current: 0, total: 1000, pct: 0 };
  const map = {
    1: { label: '1', current: 250, pct: 25 },
    2: { label: '2', current: 500, pct: 50 },
    3: { label: '3', current: 750, pct: 75 },
  };
  return { total: 1000, ...map[level] };
}

export default function HomeScreen({ nativeLanguage, level, onNavigate, onLanguageSelect, darkMode }: HomeScreenProps) {
  const progressData: LearningProgress[] = JSON.parse(localStorage.getItem('learning_progress') ?? '[]');
  const streak = getStreak(progressData);
  const totalWords = progressData.reduce((sum, p) => sum + (p.wordsLearned ?? 0), 0);
  const xp = getXPInfo(level);
  const langConfig = nativeLanguage ? getLanguageConfig(nativeLanguage) : null;

  const node1Done = !!nativeLanguage;
  const node2Done = !!level;

  const sidebarBg = darkMode ? '#1e1f1c' : '#f2f1ea';
  const cardBg = darkMode ? '#2e2f2b' : 'white';
  const textPrimary = darkMode ? '#fdd34d' : '#705900';
  const textMuted = darkMode ? '#aeada8' : '#5c5d58';

  return (
    <div className="pt-20 pb-24 md:pb-0 min-h-screen flex">
      {/* ── Sidebar (Desktop) ── */}
      <aside
        className="hidden md:flex flex-col w-72 p-6 gap-6 sticky top-20 overflow-y-auto"
        style={{ height: 'calc(100vh - 80px)', background: sidebarBg }}
      >
        {/* XP Progress Card */}
        <div className="p-6 rounded-xl shadow-sm" style={{ background: cardBg }}>
          <h3
            className="font-bold mb-2 text-lg"
            style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', color: textPrimary }}
          >
            Current Progress
          </h3>
          <div className="flex items-center gap-4 mb-4">
            <div
              className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest"
              style={{ background: '#abf4ac', color: '#246830' }}
            >
              Lv. {xp.label}
            </div>
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#eae8e2' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${xp.pct}%`, background: 'linear-gradient(90deg, #705900, #fdd34d)' }}
              />
            </div>
          </div>
          <div className="flex justify-between text-sm font-medium" style={{ color: textMuted }}>
            <span>{xp.current} XP</span>
            <span>{xp.total} XP</span>
          </div>
        </div>

        {/* Language Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => onNavigate('translate')}
            className="flex items-center gap-4 p-4 rounded-xl font-semibold shadow-sm transition-all hover:opacity-90"
            style={{ background: cardBg, color: darkMode ? '#e2e8f0' : '#2e2f2b', borderLeft: `4px solid ${textPrimary}` }}
          >
            <span className="material-symbols-outlined" style={{ color: textPrimary }}>translate</span>
            <span>
              {langConfig ? `${langConfig.flag} ${langConfig.nativeName}` : '언어 선택'}
              <span className="text-xs font-normal ml-1 opacity-60">Learning</span>
            </span>
          </button>
          <button
            className="flex items-center gap-4 p-4 rounded-xl font-semibold transition-all hover:opacity-80"
            style={{ color: textMuted }}
          >
            <span className="material-symbols-outlined">translate</span>
            <span>한국어 <span className="text-xs font-normal opacity-60">Source</span></span>
          </button>
        </div>

        {/* Daily Goal */}
        <div
          className="p-6 rounded-xl border"
          style={{ background: 'rgba(84,199,252,0.12)', borderColor: 'rgba(84,199,252,0.35)' }}
        >
          <div className="flex items-center gap-2 mb-2 font-bold" style={{ color: '#006384' }}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1', color: '#006384' }}>
              stars
            </span>
            <span style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>Daily Goal</span>
          </div>
          <p className="text-sm" style={{ color: '#003d54' }}>
            {level
              ? 'Keep learning to build your streak!'
              : '언어를 선택하고 학습을 시작해보세요!'}
          </p>
        </div>

        {/* Language grid (only when none selected) */}
        {!nativeLanguage && (
          <div>
            <p
              className="text-sm font-bold mb-3"
              style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', color: textPrimary }}
            >
              모국어를 선택하세요
            </p>
            <div className="grid grid-cols-2 gap-2">
              {SUPPORTED_LANGUAGES.slice(0, 8).map(lang => (
                <button
                  key={lang.code}
                  onClick={() => onLanguageSelect(lang.code)}
                  className="flex items-center gap-2 p-2 rounded-xl text-xs font-medium transition-all"
                  style={{ color: textMuted }}
                >
                  <span className="text-base">{lang.flag}</span>
                  <span>{lang.nativeName.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* ── Map Canvas ── */}
      <section className="flex-1 relative overflow-hidden anime-island-bg" style={{ minHeight: 800 }}>
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-16 rounded-full blur-2xl" style={{ background: 'rgba(255,255,255,0.4)' }} />
          <div className="absolute top-60 right-20 w-48 h-24 rounded-full blur-3xl" style={{ background: 'rgba(255,255,255,0.3)' }} />
          <div className="absolute bottom-40 left-1/4 w-64 h-32 rounded-full blur-2xl" style={{ background: 'rgba(255,255,255,0.2)' }} />
        </div>

        {/* Island nodes */}
        <div className="relative w-full h-full flex items-center justify-center p-8">
          <div className="relative w-full max-w-4xl" style={{ height: 600 }}>

            {/* Node 1 — 인사 배우기 */}
            <div className="absolute flex flex-col items-center" style={{ top: '80%', left: '15%' }}>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-4 border-white cursor-pointer"
                style={{ background: node1Done ? '#abf4ac' : '#eae8e2' }}
              >
                {node1Done
                  ? <span className="material-symbols-outlined text-3xl" style={{ color: '#246830', fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                  : <span className="material-symbols-outlined text-3xl" style={{ color: '#5c5c57' }}>lock</span>
                }
              </motion.div>
              <span className="mt-2 px-4 py-1 rounded-full text-sm font-bold shadow-sm" style={{ background: 'rgba(255,255,255,0.85)' }}>
                🌿 인사 배우기
              </span>
            </div>

            {/* Node 2 — 번역 학습 */}
            <div className="absolute flex flex-col items-center" style={{ top: '60%', left: '42%' }}>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-4 border-white cursor-pointer"
                style={{ background: node2Done ? '#abf4ac' : '#eae8e2' }}
                onClick={() => onNavigate('translate')}
              >
                {node2Done
                  ? <span className="material-symbols-outlined text-3xl" style={{ color: '#246830', fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                  : <span className="material-symbols-outlined text-3xl" style={{ color: '#5c5c57' }}>lock</span>
                }
              </motion.div>
              <span className="mt-2 px-4 py-1 rounded-full text-sm font-bold shadow-sm" style={{ background: 'rgba(255,255,255,0.85)' }}>
                🔤 번역 학습
              </span>
            </div>

            {/* Node 3 — Active: 레벨 학습 */}
            <div className="absolute z-10 flex flex-col items-center" style={{ top: '35%', left: '28%' }}>
              {/* Bouncing avatar above play button */}
              <div className="bouncing-avatar absolute flex flex-col items-center" style={{ top: -88 }}>
                <div
                  className="w-20 h-20 bg-white rounded-full p-1 shadow-2xl border-4 text-4xl flex items-center justify-center"
                  style={{ borderColor: '#705900' }}
                >
                  🧒
                </div>
                <div style={{ width: 16, height: 16, background: '#705900', transform: 'rotate(45deg)', marginTop: -8 }} />
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate(level ? 'learning' : 'level-test')}
                className="w-24 h-24 rounded-full flex items-center justify-center border-4 border-white animate-pulse cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #705900, #fdd34d)',
                  boxShadow: '0 0 30px rgba(253,211,77,0.6)',
                }}
              >
                <span
                  className="material-symbols-outlined text-white"
                  style={{ fontSize: 48, fontVariationSettings: '"FILL" 1' }}
                >
                  play_arrow
                </span>
              </motion.button>

              <span
                className="mt-4 px-6 py-2 rounded-full text-base font-black shadow-lg text-white"
                style={{ background: '#705900' }}
              >
                📚 레벨 학습
              </span>
            </div>

            {/* Node 4 — Locked: 수준 진단 */}
            <div className="absolute flex flex-col items-center" style={{ top: '18%', left: '62%', opacity: 0.65 }}>
              <motion.div
                whileHover={{ scale: 1.08 }}
                className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-4 border-white cursor-pointer"
                style={{ background: '#eae8e2' }}
                onClick={() => onNavigate('level-test')}
              >
                <span className="material-symbols-outlined text-3xl" style={{ color: '#5c5c57' }}>lock</span>
              </motion.div>
              <span className="mt-2 px-4 py-1 rounded-full text-sm font-bold shadow-sm" style={{ background: 'rgba(255,255,255,0.5)' }}>
                ✏️ 문장 만들기
              </span>
            </div>

            {/* Node 5 — Mystery cloud */}
            <div className="absolute flex flex-col items-center" style={{ top: '3%', left: '80%' }}>
              <div className="relative">
                <div
                  className="absolute rounded-full blur-2xl"
                  style={{ inset: -40, background: 'rgba(255,255,255,0.25)' }}
                />
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg border-4 relative"
                  style={{ background: 'rgba(234,232,226,0.45)', borderColor: 'rgba(255,255,255,0.5)' }}
                >
                  <span className="material-symbols-outlined text-3xl" style={{ color: '#777' }}>cloud</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Floating Stats */}
        <div className="absolute flex gap-4" style={{ top: 24, left: 24 }}>
          <div className="glass-card px-4 py-2 rounded-full flex items-center gap-2 shadow-md">
            <span className="material-symbols-outlined" style={{ color: '#705900', fontVariationSettings: '"FILL" 1' }}>
              local_fire_department
            </span>
            <span className="font-bold" style={{ color: '#705900' }}>{streak}</span>
          </div>
          <div className="glass-card px-4 py-2 rounded-full flex items-center gap-2 shadow-md">
            <span className="material-symbols-outlined" style={{ color: '#006384', fontVariationSettings: '"FILL" 1' }}>
              database
            </span>
            <span className="font-bold" style={{ color: '#006384' }}>{totalWords}</span>
          </div>
        </div>

        {/* FAB (mobile) */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate(level ? 'learning' : 'level-test')}
          className="md:hidden fixed rounded-full text-white shadow-2xl flex items-center justify-center z-50"
          style={{
            bottom: 112, right: 32,
            width: 64, height: 64,
            background: 'linear-gradient(135deg, #705900, #fdd34d)',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 30 }}>play_arrow</span>
        </motion.button>

        {/* Mobile: language select overlay (when none chosen) */}
        {!nativeLanguage && (
          <div
            className="md:hidden absolute left-0 right-0 px-6"
            style={{ bottom: 100 }}
          >
            <div
              className="rounded-2xl p-4 shadow-lg"
              style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)' }}
            >
              <p
                className="font-bold text-center mb-3"
                style={{ color: '#705900', fontFamily: '"Plus Jakarta Sans", sans-serif' }}
              >
                모국어를 선택해주세요
              </p>
              <div className="grid grid-cols-4 gap-2">
                {SUPPORTED_LANGUAGES.slice(0, 8).map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => onLanguageSelect(lang.code)}
                    className="flex flex-col items-center p-2 rounded-xl hover:bg-gray-100"
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <span className="text-xs mt-1" style={{ color: '#5c5c57' }}>
                      {lang.nativeName.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
