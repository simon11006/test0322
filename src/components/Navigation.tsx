import type { AppScreen, NativeLanguage } from '../types';
import { getUIStrings } from '../utils/uiStrings';

interface NavigationProps {
  screen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  nativeLanguage?: NativeLanguage;
  darkMode: boolean;
  onToggleDark: () => void;
}

export default function Navigation({ screen, onNavigate, nativeLanguage, darkMode, onToggleDark }: NavigationProps) {
  const t = getUIStrings(nativeLanguage);

  const navItems: { screen: AppScreen; label: string; icon: string }[] = [
    { screen: 'home',       label: t.nav.map,     icon: 'map' },
    { screen: 'learning',   label: t.nav.lessons,  icon: 'auto_stories' },
    { screen: 'level-test', label: t.nav.quizzes,  icon: 'quiz' },
    { screen: 'progress',   label: t.nav.rewards,  icon: 'military_tech' },
  ];

  const navBg = darkMode ? 'rgba(26,27,24,0.88)' : 'rgba(248,246,240,0.88)';
  const logoBg = darkMode ? '#fdd34d' : '#705900';

  return (
    <>
      {/* ── Top App Bar ──────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 w-full z-50 backdrop-blur-md"
        style={{ background: navBg, boxShadow: '0 1px 0 rgba(92,92,87,0.15)' }}
      >
        <div className="flex items-center justify-between px-5 py-3 max-w-7xl mx-auto">
          {/* Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="text-xl font-black tracking-tight"
            style={{ color: logoBg, fontFamily: '"Plus Jakarta Sans", sans-serif' }}
          >
            Storybook Learning
          </button>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => {
              const isActive = screen === item.screen;
              return (
                <button
                  key={item.screen}
                  onClick={() => onNavigate(item.screen)}
                  className="px-4 py-2 rounded-xl font-bold text-base transition-colors"
                  style={{
                    fontFamily: '"Plus Jakarta Sans", sans-serif',
                    color: isActive ? logoBg : (darkMode ? '#aeada8' : '#5c5d58'),
                    background: isActive ? (darkMode ? 'rgba(253,211,77,0.12)' : 'rgba(112,89,0,0.08)') : 'transparent',
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleDark}
              className="p-2 rounded-full transition-colors hover:bg-black/10 active:scale-95"
              style={{ color: logoBg }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                {darkMode ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center border-2 text-lg"
              style={{ background: '#fdd34d', borderColor: '#705900' }}
            >
              🧒
            </div>
          </div>
        </div>
      </nav>

      {/* ── Bottom Nav (Mobile) ───────────────────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 pt-2 pb-5"
        style={{
          background: darkMode ? 'rgba(26,27,24,0.95)' : 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1.5rem 1.5rem 0 0',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
        }}
      >
        {navItems.map(item => {
          const isActive = screen === item.screen;
          return (
            <button
              key={item.screen}
              onClick={() => onNavigate(item.screen)}
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all"
              style={{ minWidth: 60 }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                style={{
                  background: isActive ? 'linear-gradient(135deg, #705900, #fdd34d)' : 'transparent',
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: 22,
                    color: isActive ? 'white' : (darkMode ? '#aeada8' : '#5c5d58'),
                    fontVariationSettings: isActive ? '"FILL" 1' : '"FILL" 0',
                  }}
                >
                  {item.icon}
                </span>
              </div>
              <span
                className="text-[10px] font-bold leading-tight"
                style={{
                  color: isActive ? logoBg : (darkMode ? '#aeada8' : '#5c5d58'),
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                  maxWidth: 60,
                  textAlign: 'center',
                  wordBreak: 'keep-all',
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
