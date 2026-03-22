import type { AppScreen } from '../types';

interface NavigationProps {
  screen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  darkMode: boolean;
  onToggleDark: () => void;
}

const NAV_ITEMS: { screen: AppScreen; label: string; icon: string }[] = [
  { screen: 'home',       label: 'Map',     icon: 'map' },
  { screen: 'learning',   label: 'Lessons', icon: 'auto_stories' },
  { screen: 'level-test', label: 'Quizzes', icon: 'quiz' },
  { screen: 'progress',   label: 'Rewards', icon: 'military_tech' },
];

export default function Navigation({ screen, onNavigate, darkMode, onToggleDark }: NavigationProps) {
  return (
    <>
      {/* Top App Bar */}
      <nav
        className="fixed top-0 w-full z-50 backdrop-blur-md"
        style={{
          background: darkMode ? 'rgba(26,27,24,0.85)' : 'rgba(248,246,240,0.85)',
          boxShadow: '0 20px 40px rgba(46,47,43,0.06)',
        }}
      >
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          {/* Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="text-2xl font-black tracking-tight"
            style={{ color: darkMode ? '#fdd34d' : '#705900', fontFamily: '"Plus Jakarta Sans", sans-serif' }}
          >
            Storybook Learning
          </button>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map(item => {
              const isActive = screen === item.screen;
              return (
                <button
                  key={item.screen}
                  onClick={() => onNavigate(item.screen)}
                  className="font-bold text-lg transition-colors duration-300 rounded-lg px-3 py-1"
                  style={{
                    fontFamily: '"Plus Jakarta Sans", sans-serif',
                    color: isActive ? (darkMode ? '#fdd34d' : '#705900') : (darkMode ? '#aeada8' : '#5c5d58'),
                    borderBottom: isActive ? `2px solid ${darkMode ? '#fdd34d' : '#705900'}` : '2px solid transparent',
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleDark}
              className="p-2 rounded-full hover:bg-black/10 transition-colors active:scale-95"
              style={{ color: darkMode ? '#fdd34d' : '#705900' }}
            >
              <span className="material-symbols-outlined">
                {darkMode ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
            <button
              className="p-2 rounded-full hover:bg-black/10 transition-colors active:scale-95"
              style={{ color: darkMode ? '#fdd34d' : '#705900' }}
            >
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center border-2 text-xl overflow-hidden"
              style={{ background: '#fdd34d', borderColor: '#705900' }}
            >
              🧒
            </div>
          </div>
        </div>
        <div className="h-[1px] w-full opacity-20" style={{ background: '#5c5c57' }} />
      </nav>

      {/* Bottom Nav (Mobile only) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-end px-4 pb-6 pt-2 z-50"
        style={{
          background: darkMode ? 'rgba(26,27,24,0.92)' : 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(8px)',
          borderRadius: '3rem 3rem 0 0',
          boxShadow: '0 -10px 30px rgba(46,47,43,0.08)',
        }}
      >
        {NAV_ITEMS.map(item => {
          const isActive = screen === item.screen;
          return (
            <button
              key={item.screen}
              onClick={() => onNavigate(item.screen)}
              className="flex flex-col items-center justify-center"
            >
              {isActive ? (
                <div
                  className="flex flex-col items-center rounded-full p-3 mb-2 shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #705900, #fdd34d)', color: 'white' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 22 }}>{item.icon}</span>
                  <span style={{ fontSize: 10, fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 500, marginTop: 2 }}>
                    {item.label.toUpperCase()}
                  </span>
                </div>
              ) : (
                <div
                  className="flex flex-col items-center p-2"
                  style={{ color: darkMode ? '#aeada8' : '#5c5d58' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 22 }}>{item.icon}</span>
                  <span style={{ fontSize: 10, fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 500, marginTop: 2 }}>
                    {item.label.toUpperCase()}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
}
