import { motion } from 'framer-motion';
import type { AppScreen, Level, NativeLanguage, LearningProgress } from '../types';
import { SUPPORTED_LANGUAGES, getLanguageConfig } from '../utils/languages';
import { getUIStrings } from '../utils/uiStrings';

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
    if (progressData.some(p => p.date === dateStr)) streak++;
    else break;
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

// ── Language Grid (공용) ──────────────────────────────────────────────────────
function LanguageGrid({
  selected,
  onSelect,
  darkMode,
}: {
  selected?: NativeLanguage;
  onSelect: (lang: NativeLanguage) => void;
  darkMode: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {SUPPORTED_LANGUAGES.map(lang => {
        const isSelected = selected === lang.code;
        return (
          <button
            key={lang.code}
            onClick={() => onSelect(lang.code)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: isSelected ? '#705900' : darkMode ? '#3a3b38' : '#f2f1ea',
              color: isSelected ? '#fdd34d' : darkMode ? '#aeada8' : '#2e2f2b',
              border: isSelected ? '2px solid #fdd34d40' : '2px solid transparent',
            }}
          >
            <span className="text-lg">{lang.flag}</span>
            <span className="truncate">{lang.nativeName.split(' ')[0]}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
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
  const streak = getStreak(progressData);
  const totalWords = progressData.reduce((sum, p) => sum + (p.wordsLearned ?? 0), 0);
  const xp = getXPInfo(level);
  const langConfig = nativeLanguage ? getLanguageConfig(nativeLanguage) : null;

  const node1Done = !!nativeLanguage;
  const node2Done = !!level;

  const t = getUIStrings(nativeLanguage);
  const sidebarBg = darkMode ? '#1e1f1c' : '#f2f1ea';
  const cardBg = darkMode ? '#2a2b28' : 'white';
  const textPrimary = darkMode ? '#fdd34d' : '#705900';
  const textMuted = darkMode ? '#aeada8' : '#5c5d58';

  return (
    <div className="pt-20 pb-24 md:pb-0 min-h-screen flex flex-col md:flex-row">

      {/* ── Sidebar (Desktop) ─────────────────────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col w-72 p-5 gap-5 sticky top-20 overflow-y-auto shrink-0"
        style={{ height: 'calc(100vh - 80px)', background: sidebarBg }}
      >
        {/* XP Progress */}
        <div className="p-5 rounded-2xl shadow-sm" style={{ background: cardBg }}>
          <h3
            className="font-bold mb-3 text-sm uppercase tracking-widest"
            style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', color: textMuted }}
          >
            {t.home.progress}
          </h3>
          <div className="flex items-center gap-3 mb-3">
            <span
              className="rounded-full px-3 py-1 text-xs font-black"
              style={{ background: '#abf4ac', color: '#246830' }}
            >
              Lv. {xp.label}
            </span>
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#eae8e2' }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${xp.pct}%`, background: 'linear-gradient(90deg, #705900, #fdd34d)' }}
              />
            </div>
          </div>
          <div className="flex justify-between text-xs" style={{ color: textMuted }}>
            <span>{xp.current} XP</span>
            <span>{xp.total} XP</span>
          </div>
        </div>

        {/* Language Selection — 항상 표시 */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3
              className="font-bold text-sm"
              style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', color: textPrimary }}
            >
              {langConfig ? `${langConfig.flag} ${t.home.selectLanguage}` : t.home.selectLanguage}
            </h3>
            {langConfig && (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#fdd34d30', color: textPrimary }}>
                {langConfig.nativeName.split(' ')[0]}
              </span>
            )}
          </div>
          <LanguageGrid selected={nativeLanguage} onSelect={onLanguageSelect} darkMode={darkMode} />
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col gap-2 mt-auto">
          <button
            onClick={() => onNavigate('translate')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
            style={{ background: cardBg, color: darkMode ? '#e2e8f0' : '#2e2f2b', borderLeft: `3px solid ${textPrimary}` }}
          >
            <span className="material-symbols-outlined text-xl" style={{ color: textPrimary }}>translate</span>
            {t.home.translate}
          </button>
          <button
            onClick={() => onNavigate('level-test')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
            style={{ background: cardBg, color: darkMode ? '#e2e8f0' : '#2e2f2b', borderLeft: '3px solid #006384' }}
          >
            <span className="material-symbols-outlined text-xl" style={{ color: '#006384' }}>quiz</span>
            {t.home.levelTest}
          </button>
        </div>
      </aside>

      {/* ── Right Panel ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col">

        {/* Map Canvas */}
        <section
          className="relative overflow-hidden anime-island-bg"
          style={{ height: '65vh', minHeight: 420 }}
        >
          {/* Blobs */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-16 left-10 w-32 h-16 rounded-full blur-2xl" style={{ background: 'rgba(255,255,255,0.35)' }} />
            <div className="absolute top-40 right-16 w-40 h-20 rounded-full blur-3xl" style={{ background: 'rgba(255,255,255,0.25)' }} />
            <div className="absolute bottom-20 left-1/3 w-56 h-28 rounded-full blur-2xl" style={{ background: 'rgba(255,255,255,0.15)' }} />
          </div>

          {/* SVG path connecting nodes */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
            <path
              d="M 18% 85% Q 32% 70% 45% 62% Q 40% 45% 38% 38% Q 52% 28% 66% 22%"
              fill="none"
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="4"
              strokeDasharray="10 8"
            />
          </svg>

          {/* Nodes */}
          <div className="relative w-full h-full" style={{ zIndex: 1 }}>

            {/* Node 1 — 인사 배우기 */}
            <NodeItem
              top="78%" left="12%"
              label="🌿 인사 배우기"
              done={node1Done}
              onClick={() => {}}
            />

            {/* Node 2 — 번역 학습 */}
            <NodeItem
              top="56%" left="38%"
              label="🔤 번역 학습"
              done={node2Done}
              onClick={() => onNavigate('translate')}
            />

            {/* Node 3 — Active */}
            <div className="absolute flex flex-col items-center" style={{ top: '28%', left: '26%', transform: 'translateX(-50%)' }}>
              {/* Bouncing avatar */}
              <div className="bouncing-avatar mb-1">
                <div
                  className="w-14 h-14 bg-white rounded-full shadow-xl border-4 text-3xl flex items-center justify-center"
                  style={{ borderColor: '#705900' }}
                >
                  🧒
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={() => onNavigate(level ? 'learning' : 'level-test')}
                className="w-20 h-20 rounded-full flex items-center justify-center border-4 border-white"
                style={{
                  background: 'linear-gradient(135deg, #705900, #fdd34d)',
                  boxShadow: '0 0 28px rgba(253,211,77,0.55)',
                  animation: 'pulse 2s infinite',
                }}
              >
                <span className="material-symbols-outlined text-white" style={{ fontSize: 40, fontVariationSettings: '"FILL" 1' }}>
                  play_arrow
                </span>
              </motion.button>
              <span
                className="mt-3 px-5 py-1.5 rounded-full text-sm font-black shadow-lg text-white"
                style={{ background: '#705900' }}
              >
                📚 레벨 학습
              </span>
            </div>

            {/* Node 4 — 수준 진단 (반투명) */}
            <NodeItem
              top="16%" left="60%"
              label="📝 수준 진단"
              locked
              onClick={() => onNavigate('level-test')}
            />

            {/* Node 5 — 미래 콘텐츠 */}
            <div className="absolute flex flex-col items-center" style={{ top: '5%', left: '82%', transform: 'translateX(-50%)' }}>
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center border-4"
                style={{ background: 'rgba(234,232,226,0.4)', borderColor: 'rgba(255,255,255,0.4)' }}
              >
                <span className="material-symbols-outlined" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 28 }}>cloud</span>
              </div>
            </div>

          </div>

          {/* Floating Stats */}
          <div className="absolute flex gap-3" style={{ top: 16, right: 16 }}>
            <div className="glass-card px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow">
              <span className="material-symbols-outlined" style={{ color: '#705900', fontVariationSettings: '"FILL" 1', fontSize: 18 }}>local_fire_department</span>
              <span className="font-bold text-sm" style={{ color: '#705900' }}>{streak}</span>
            </div>
            <div className="glass-card px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow">
              <span className="material-symbols-outlined" style={{ color: '#006384', fontVariationSettings: '"FILL" 1', fontSize: 18 }}>database</span>
              <span className="font-bold text-sm" style={{ color: '#006384' }}>{totalWords}</span>
            </div>
          </div>
        </section>

        {/* ── Mobile: Language + Quick Actions (항상 표시) ─────────────────── */}
        <div
          className="md:hidden flex-1 p-4 overflow-y-auto"
          style={{ background: sidebarBg }}
        >
          {/* XP bar (mobile) */}
          <div className="flex items-center gap-3 mb-4 px-1">
            <span
              className="rounded-full px-3 py-1 text-xs font-black shrink-0"
              style={{ background: '#abf4ac', color: '#246830' }}
            >
              Lv. {xp.label}
            </span>
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#ddd' }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${xp.pct}%`, background: 'linear-gradient(90deg, #705900, #fdd34d)' }}
              />
            </div>
            <span className="text-xs shrink-0" style={{ color: textMuted }}>{xp.current} XP</span>
          </div>

          {/* Language selection */}
          <p
            className="font-bold text-sm mb-3"
            style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', color: textPrimary }}
          >
            {langConfig ? `${langConfig.flag} ${t.home.selectLanguage}` : t.home.selectLanguage}
          </p>
          <LanguageGrid selected={nativeLanguage} onSelect={onLanguageSelect} darkMode={darkMode} />

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              onClick={() => onNavigate('translate')}
              className="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm"
              style={{ background: cardBg, color: '#2e2f2b', borderLeft: `3px solid ${textPrimary}` }}
            >
              <span className="material-symbols-outlined text-xl" style={{ color: textPrimary }}>translate</span>
              {t.home.translate}
            </button>
            <button
              onClick={() => onNavigate('level-test')}
              className="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm"
              style={{ background: cardBg, color: '#2e2f2b', borderLeft: '3px solid #006384' }}
            >
              <span className="material-symbols-outlined text-xl" style={{ color: '#006384' }}>quiz</span>
              {t.home.levelTest}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Node helper component ─────────────────────────────────────────────────────
function NodeItem({
  top, left, label, done = false, locked = false, onClick,
}: {
  top: string; left: string; label: string;
  done?: boolean; locked?: boolean; onClick: () => void;
}) {
  return (
    <div
      className="absolute flex flex-col items-center cursor-pointer"
      style={{ top, left, transform: 'translateX(-50%)', opacity: locked ? 0.6 : 1 }}
      onClick={onClick}
    >
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-white"
        style={{ background: done ? '#abf4ac' : '#eae8e2' }}
      >
        {done
          ? <span className="material-symbols-outlined" style={{ color: '#246830', fontSize: 28, fontVariationSettings: '"FILL" 1' }}>check_circle</span>
          : <span className="material-symbols-outlined" style={{ color: '#5c5c57', fontSize: 26 }}>lock</span>
        }
      </motion.div>
      <span
        className="mt-2 px-3 py-1 rounded-full text-xs font-bold shadow-sm whitespace-nowrap"
        style={{ background: 'rgba(255,255,255,0.88)' }}
      >
        {label}
      </span>
    </div>
  );
}
