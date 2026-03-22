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

function getStreak(data: LearningProgress[]): number {
  if (!data.length) return 0;
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const s = d.toISOString().split('T')[0];
    if (data.some(p => p.date === s)) streak++;
    else break;
  }
  return streak;
}

function getXP(level?: Level) {
  if (!level) return { label: '?', current: 0, total: 1000, pct: 0 };
  return {
    1: { label: '1', current: 250, total: 1000, pct: 25 },
    2: { label: '2', current: 500, total: 1000, pct: 50 },
    3: { label: '3', current: 750, total: 1000, pct: 75 },
  }[level];
}

// ── 언어 선택 그리드 (공용) ───────────────────────────────────────────────────
function LangGrid({ selected, onSelect }: { selected?: NativeLanguage; onSelect: (l: NativeLanguage) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {SUPPORTED_LANGUAGES.map(lang => {
        const isSel = selected === lang.code;
        return (
          <button
            key={lang.code}
            onClick={() => onSelect(lang.code)}
            className="flex items-center gap-2 px-3 py-2 rounded-2xl text-sm font-bold transition-all"
            style={{
              background: isSel ? '#FF6B6B' : 'white',
              color: isSel ? 'white' : '#374151',
              border: `2px solid ${isSel ? '#FF6B6B' : '#E5E7EB'}`,
              fontFamily: 'Noto Sans KR, sans-serif',
            }}
          >
            <span className="text-lg">{lang.flag}</span>
            <span className="truncate text-xs">{lang.nativeName.split(' ')[0]}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── 지도 노드 (공용) ──────────────────────────────────────────────────────────
function MapNode({
  top, left, label, done = false, locked = false, onClick,
}: {
  top: string; left: string; label: string;
  done?: boolean; locked?: boolean; onClick: () => void;
}) {
  return (
    <div
      className="absolute flex flex-col items-center cursor-pointer"
      style={{ top, left, transform: 'translateX(-50%)', opacity: locked ? 0.55 : 1 }}
      onClick={onClick}
    >
      <motion.div
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-white"
        style={{ background: done ? '#4ECDC4' : '#E5E7EB' }}
      >
        <span className="text-2xl">{done ? '✅' : locked ? '🔒' : '⭕'}</span>
      </motion.div>
      <span
        className="mt-2 px-3 py-1 rounded-full text-xs font-bold shadow-sm whitespace-nowrap"
        style={{
          background: 'rgba(255,255,255,0.92)',
          fontFamily: 'Jua, sans-serif',
          color: '#374151',
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────────
export default function HomeScreen({ nativeLanguage, level, onNavigate, onLanguageSelect, darkMode }: HomeScreenProps) {
  const progressData: LearningProgress[] = JSON.parse(localStorage.getItem('learning_progress') ?? '[]');
  const streak = getStreak(progressData);
  const totalWords = progressData.reduce((sum, p) => sum + (p.wordsLearned ?? 0), 0);
  const xp = getXP(level);
  const langConfig = nativeLanguage ? getLanguageConfig(nativeLanguage) : null;

  const sidebarBg = darkMode ? '#1e293b' : '#FFF9F0';
  const cardBg = darkMode ? '#1e293b' : 'white';
  const textMain = darkMode ? '#e2e8f0' : '#1f2937';

  return (
    <div className="pt-16 pb-20 md:pb-0 min-h-screen flex flex-col md:flex-row">

      {/* ── 사이드바 (데스크탑) ─────────────────────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col w-72 p-5 gap-4 sticky top-16 overflow-y-auto shrink-0"
        style={{ height: 'calc(100vh - 64px)', background: sidebarBg, borderRight: '2px solid #FFE66D' }}
      >
        {/* 학습 진도 */}
        <div className="p-4 rounded-2xl shadow-sm" style={{ background: cardBg }}>
          <p className="font-bold mb-3 text-sm" style={{ fontFamily: 'Jua, sans-serif', color: '#FF6B6B' }}>
            📊 나의 학습 진도
          </p>
          <div className="flex items-center gap-3 mb-2">
            <span
              className="text-xs font-black px-2 py-1 rounded-full"
              style={{ background: '#4ECDC420', color: '#4ECDC4', border: '2px solid #4ECDC4' }}
            >
              Lv. {xp.label}
            </span>
            <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: '#E5E7EB' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${xp.pct}%`, background: 'linear-gradient(90deg, #FF6B6B, #FFE66D)' }}
              />
            </div>
          </div>
          <div className="flex justify-between text-xs" style={{ color: '#9CA3AF' }}>
            <span>{xp.current} XP</span><span>{xp.total} XP</span>
          </div>
        </div>

        {/* 모국어 선택 — 항상 표시 */}
        <div className="flex flex-col gap-2">
          <p className="font-bold text-sm" style={{ fontFamily: 'Jua, sans-serif', color: textMain }}>
            🌍 모국어 선택
            {langConfig && (
              <span className="ml-2 text-xs font-normal" style={{ color: '#9CA3AF' }}>
                ({langConfig.flag} {langConfig.nativeName.split(' ')[0]})
              </span>
            )}
          </p>
          <LangGrid selected={nativeLanguage} onSelect={onLanguageSelect} />
        </div>

        {/* 바로가기 버튼 */}
        <div className="flex flex-col gap-2 mt-auto">
          <button
            onClick={() => onNavigate('translate')}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all hover:opacity-85 shadow-sm"
            style={{ fontFamily: 'Jua, sans-serif', background: '#FF6B6B15', color: '#FF6B6B', border: '2px solid #FF6B6B40' }}
          >
            🔤 번역 학습
          </button>
          <button
            onClick={() => onNavigate('level-test')}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all hover:opacity-85 shadow-sm"
            style={{ fontFamily: 'Jua, sans-serif', background: '#4ECDC415', color: '#4ECDC4', border: '2px solid #4ECDC440' }}
          >
            📝 수준 진단
          </button>
        </div>
      </aside>

      {/* ── 오른쪽 패널 ──────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col">

        {/* 지도 캔버스 */}
        <section
          className="relative overflow-hidden"
          style={{
            background: 'radial-gradient(circle at 40% 60%, #54c7fc 0%, #006384 100%)',
            height: '65vh',
            minHeight: 420,
          }}
        >
          {/* 배경 광원 */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute rounded-full blur-3xl" style={{ top: 60, left: 60, width: 200, height: 100, background: 'rgba(255,255,255,0.2)' }} />
            <div className="absolute rounded-full blur-2xl" style={{ bottom: 80, right: 80, width: 160, height: 80, background: 'rgba(255,255,255,0.15)' }} />
          </div>

          {/* 노드 영역 */}
          <div className="relative w-full h-full">

            {/* 노드 1 — 인사 배우기 */}
            <MapNode top="78%" left="18%" label="🌿 인사 배우기" done={!!nativeLanguage} onClick={() => {}} />

            {/* 노드 2 — 번역 학습 */}
            <MapNode top="57%" left="42%" label="🔤 번역 학습" done={!!level} onClick={() => onNavigate('translate')} />

            {/* 노드 3 — 활성 (레벨 학습) */}
            <div
              className="absolute flex flex-col items-center z-10"
              style={{ top: '28%', left: '35%', transform: 'translateX(-50%)' }}
            >
              <div className="bouncing-avatar mb-2">
                <div
                  className="w-14 h-14 bg-white rounded-full shadow-xl border-4 flex items-center justify-center text-3xl"
                  style={{ borderColor: '#FF6B6B' }}
                >
                  🧒
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={() => onNavigate(level ? 'learning' : 'level-test')}
                className="w-20 h-20 rounded-full flex items-center justify-center border-4 border-white shadow-2xl"
                style={{ background: 'linear-gradient(135deg, #FF6B6B, #FFE66D)', boxShadow: '0 0 30px rgba(255,107,107,0.5)' }}
              >
                <span className="text-4xl">▶️</span>
              </motion.button>
              <span
                className="mt-3 px-5 py-1.5 rounded-full text-sm font-black text-white shadow-lg"
                style={{ fontFamily: 'Jua, sans-serif', background: '#FF6B6B' }}
              >
                📚 레벨 학습
              </span>
            </div>

            {/* 노드 4 — 잠김 */}
            <MapNode top="15%" left="65%" label="✏️ 문장 만들기" locked onClick={() => {}} />

            {/* 노드 5 — 미래 */}
            <div className="absolute" style={{ top: '5%', left: '85%', transform: 'translateX(-50%)' }}>
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center border-4 text-2xl opacity-50"
                style={{ background: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.4)' }}
              >
                ☁️
              </div>
            </div>
          </div>

          {/* 플로팅 스탯 */}
          <div className="absolute flex gap-2" style={{ top: 16, right: 16 }}>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow font-bold text-sm"
              style={{ background: 'rgba(255,255,255,0.85)', color: '#FF6B6B' }}>
              🔥 {streak}
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow font-bold text-sm"
              style={{ background: 'rgba(255,255,255,0.85)', color: '#4ECDC4' }}>
              📝 {totalWords}
            </div>
          </div>
        </section>

        {/* ── 모바일: 언어 선택 + 바로가기 ─────────────────────────────────── */}
        <div
          className="md:hidden flex-1 p-4 overflow-y-auto"
          style={{ background: sidebarBg }}
        >
          {/* XP 바 */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-black px-2 py-1 rounded-full shrink-0"
              style={{ background: '#4ECDC420', color: '#4ECDC4', border: '2px solid #4ECDC4' }}>
              Lv. {xp.label}
            </span>
            <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: '#E5E7EB' }}>
              <div className="h-full rounded-full"
                style={{ width: `${xp.pct}%`, background: 'linear-gradient(90deg, #FF6B6B, #FFE66D)' }} />
            </div>
            <span className="text-xs shrink-0" style={{ color: '#9CA3AF' }}>{xp.current} XP</span>
          </div>

          {/* 언어 선택 */}
          <p className="font-bold text-sm mb-3" style={{ fontFamily: 'Jua, sans-serif', color: '#FF6B6B' }}>
            🌍 모국어 선택
            {langConfig && <span className="ml-1 font-normal text-gray-400">({langConfig.flag} {langConfig.nativeName.split(' ')[0]})</span>}
          </p>
          <LangGrid selected={nativeLanguage} onSelect={onLanguageSelect} />

          {/* 바로가기 */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              onClick={() => onNavigate('translate')}
              className="px-4 py-3 rounded-2xl font-bold text-sm shadow-sm"
              style={{ fontFamily: 'Jua, sans-serif', background: '#FF6B6B15', color: '#FF6B6B', border: '2px solid #FF6B6B40' }}
            >
              🔤 번역 학습
            </button>
            <button
              onClick={() => onNavigate('level-test')}
              className="px-4 py-3 rounded-2xl font-bold text-sm shadow-sm"
              style={{ fontFamily: 'Jua, sans-serif', background: '#4ECDC415', color: '#4ECDC4', border: '2px solid #4ECDC440' }}
            >
              📝 수준 진단
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
