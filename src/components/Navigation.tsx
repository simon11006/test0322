import { motion } from 'framer-motion';
import type { AppScreen, Level, NativeLanguage } from '../types';
import { getLanguageConfig } from '../utils/languages';
import { LEVEL_CONFIG } from '../utils/levelUtils';

interface NavigationProps {
  screen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  nativeLanguage?: NativeLanguage;
  level?: Level;
  darkMode: boolean;
  onToggleDark: () => void;
}

const NAV_ITEMS: { screen: AppScreen; label: string; icon: string }[] = [
  { screen: 'home',      label: '홈',      icon: '🏠' },
  { screen: 'translate', label: '번역',    icon: '🔤' },
  { screen: 'level-test', label: '진단',   icon: '📝' },
  { screen: 'learning',  label: '학습',    icon: '📚' },
  { screen: 'progress',  label: '기록',    icon: '📊' },
];

export default function Navigation({
  screen,
  onNavigate,
  nativeLanguage,
  level,
  darkMode,
  onToggleDark,
}: NavigationProps) {
  const langConfig = nativeLanguage ? getLanguageConfig(nativeLanguage) : null;
  const levelConfig = level ? LEVEL_CONFIG[level] : null;

  return (
    <>
      {/* 상단 헤더 */}
      <header
        className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between shadow-sm"
        style={{ background: darkMode ? '#1a1a2e' : 'white' }}
      >
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2"
        >
          <span className="text-2xl">🌟</span>
          <span
            className="text-xl font-bold"
            style={{
              fontFamily: 'Jua, sans-serif',
              color: '#FF6B6B',
            }}
          >
            한국어 배워요
          </span>
        </button>

        {/* PC/태블릿 가로 네비게이션 */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(item => {
            const isActive = screen === item.screen;
            return (
              <button
                key={item.screen}
                onClick={() => onNavigate(item.screen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: isActive ? '#FFF0EE' : 'transparent',
                  color: isActive ? '#FF6B6B' : darkMode ? '#9CA3AF' : '#6B7280',
                  fontFamily: 'Noto Sans KR, sans-serif',
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          {/* 언어 배지 */}
          {langConfig && (
            <span className="text-sm px-2 py-1 rounded-full bg-gray-100 hidden sm:inline-flex">
              {langConfig.flag} {langConfig.name}
            </span>
          )}
          {/* 레벨 배지 */}
          {levelConfig && (
            <span
              className={`text-sm px-2 py-1 rounded-full hidden sm:inline-flex ${levelConfig.bg} ${levelConfig.color}`}
            >
              {levelConfig.emoji} {levelConfig.label}
            </span>
          )}
          {/* 다크모드 토글 */}
          <button
            onClick={onToggleDark}
            className="text-xl p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* 하단 탭 네비게이션 (모바일 전용) */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden items-center justify-around py-2 border-t"
        style={{
          background: darkMode ? '#1a1a2e' : 'white',
          borderColor: darkMode ? '#333' : '#E5E7EB',
        }}
      >
        {NAV_ITEMS.map(item => {
          const isActive = screen === item.screen;
          return (
            <button
              key={item.screen}
              onClick={() => onNavigate(item.screen)}
              className="flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-all"
              style={{ color: isActive ? '#FF6B6B' : darkMode ? '#9CA3AF' : '#6B7280' }}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute bottom-0 w-1 h-1 rounded-full"
                  style={{ background: '#FF6B6B' }}
                />
              )}
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs font-medium" style={{ fontFamily: 'Noto Sans KR, sans-serif' }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
