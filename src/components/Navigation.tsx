import type { AppScreen, NativeLanguage } from '../types';

interface NavigationProps {
  screen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  nativeLanguage?: NativeLanguage;
  darkMode: boolean;
  onToggleDark: () => void;
}

// 메뉴는 한국어로 고정 (학습 목적)
const NAV_ITEMS: { screen: AppScreen; label: string; icon: string }[] = [
  { screen: 'home',       label: '지도',   icon: '🗺️' },
  { screen: 'learning',   label: '학습',   icon: '📚' },
  { screen: 'level-test', label: '진단',   icon: '📝' },
  { screen: 'progress',   label: '기록',   icon: '🏆' },
];

export default function Navigation({ screen, onNavigate, darkMode, onToggleDark }: NavigationProps) {
  const bg = darkMode ? '#1a1a2e' : 'white';
  const activeColor = '#FF6B6B';
  const mutedColor = darkMode ? '#9CA3AF' : '#6B7280';

  return (
    <>
      {/* ── 상단 헤더 ── */}
      <header
        className="fixed top-0 w-full z-50 shadow-sm"
        style={{ background: bg, borderBottom: '2px solid #FFE66D' }}
      >
        <div className="flex items-center justify-between px-5 py-3 max-w-7xl mx-auto">
          {/* 로고 */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2"
          >
            <span className="text-2xl">🌟</span>
            <span style={{ fontFamily: 'Jua, sans-serif', color: activeColor, fontSize: '1.3rem' }}>
              한국어 배워요
            </span>
          </button>

          {/* 데스크탑 메뉴 */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(item => {
              const isActive = screen === item.screen;
              return (
                <button
                  key={item.screen}
                  onClick={() => onNavigate(item.screen)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-bold transition-all"
                  style={{
                    fontFamily: 'Jua, sans-serif',
                    background: isActive ? '#FFF0EE' : 'transparent',
                    color: isActive ? activeColor : mutedColor,
                    border: isActive ? `2px solid ${activeColor}` : '2px solid transparent',
                  }}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* 오른쪽 버튼 */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleDark}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              style={{ fontSize: '1.2rem' }}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      {/* ── 하단 탭 (모바일) ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center py-2 border-t"
        style={{
          background: darkMode ? '#1a1a2e' : 'white',
          borderColor: darkMode ? '#333' : '#FFE66D',
        }}
      >
        {NAV_ITEMS.map(item => {
          const isActive = screen === item.screen;
          return (
            <button
              key={item.screen}
              onClick={() => onNavigate(item.screen)}
              className="flex flex-col items-center gap-0.5 px-3 py-1"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all"
                style={{ background: isActive ? '#FFF0EE' : 'transparent' }}
              >
                {item.icon}
              </div>
              <span
                className="text-[10px] font-bold"
                style={{
                  fontFamily: 'Jua, sans-serif',
                  color: isActive ? activeColor : mutedColor,
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
