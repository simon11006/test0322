import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AppScreen, Level, NativeLanguage } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import ApiKeySetup from './components/ApiKeySetup';
import Navigation from './components/Navigation';
import HomeScreen from './components/HomeScreen';
import TranslationCardView from './components/TranslationCard';
import LevelTest from './components/LevelTest';
import LearningContent from './components/LearningContent';
import ProgressView from './components/ProgressView';

export default function App() {
  const [apiKey, setApiKey] = useState<string>(() => {
    return sessionStorage.getItem('gemini_api_key') ?? '';
  });
  const [screen, setScreen] = useState<AppScreen>('home');
  const [nativeLanguage, setNativeLanguage] = useLocalStorage<NativeLanguage | undefined>('native_language', undefined);
  const [level, setLevel] = useLocalStorage<Level | undefined>('user_level', undefined);
  const [darkMode, setDarkMode] = useLocalStorage<boolean>('dark_mode', false);

  // API 키가 없으면 설정 화면
  if (!apiKey) {
    return <ApiKeySetup onApiKeySet={setApiKey} />;
  }

  const handleLevelSet = (newLevel: Level) => {
    setLevel(newLevel);
    setScreen('learning');
  };

  const handleNavigate = (target: AppScreen) => {
    // 레벨 미설정 시 학습 화면 접근 제한
    if (target === 'learning' && !level) {
      setScreen('level-test');
      return;
    }
    setScreen(target);
  };

  const bgColor = darkMode ? '#0f172a' : '#FFF9F0';
  const textColor = darkMode ? '#e2e8f0' : '#1f2937';

  return (
    <div
      className="min-h-screen"
      style={{ background: bgColor, color: textColor, fontFamily: 'Noto Sans KR, sans-serif' }}
    >
      <Navigation
        screen={screen}
        onNavigate={handleNavigate}
        nativeLanguage={nativeLanguage}
        level={level}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode((d: boolean) => !d)}
      />

      <main className="pt-2 max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          {screen === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <HomeScreen
                nativeLanguage={nativeLanguage}
                level={level}
                onNavigate={handleNavigate}
                onLanguageSelect={(lang: NativeLanguage) => {
                  setNativeLanguage(lang);
                }}
                darkMode={darkMode}
              />
            </motion.div>
          )}

          {screen === 'translate' && (
            <motion.div
              key="translate"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {nativeLanguage ? (
                <TranslationCardView
                  apiKey={apiKey}
                  nativeLanguage={nativeLanguage}
                  darkMode={darkMode}
                />
              ) : (
                <div className="p-4 text-center py-12">
                  <p className="text-gray-400 mb-3">먼저 홈에서 모국어를 선택해주세요!</p>
                  <button
                    onClick={() => setScreen('home')}
                    className="px-4 py-2 rounded-xl text-white"
                    style={{ background: '#FF6B6B' }}
                  >
                    홈으로 가기
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {screen === 'level-test' && (
            <motion.div
              key="level-test"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <LevelTest
                apiKey={apiKey}
                onLevelSet={handleLevelSet}
                darkMode={darkMode}
              />
            </motion.div>
          )}

          {screen === 'learning' && level && nativeLanguage && (
            <motion.div
              key="learning"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <LearningContent
                apiKey={apiKey}
                level={level}
                nativeLanguage={nativeLanguage}
                darkMode={darkMode}
              />
            </motion.div>
          )}

          {screen === 'learning' && (!level || !nativeLanguage) && (
            <motion.div
              key="learning-gate"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 text-center py-12"
            >
              <div className="text-5xl mb-3">📝</div>
              <p className="text-gray-400 mb-3">먼저 수준 진단을 받아야 해요!</p>
              <button
                onClick={() => setScreen('level-test')}
                className="px-4 py-2 rounded-xl text-white"
                style={{ background: '#4ECDC4' }}
              >
                진단 받기
              </button>
            </motion.div>
          )}

          {screen === 'progress' && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <ProgressView
                nativeLanguage={nativeLanguage ?? 'en'}
                level={level}
                darkMode={darkMode}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
