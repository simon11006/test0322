import { useState } from 'react';
import { motion } from 'framer-motion';
import { validateApiKey } from '../utils/geminiClient';

interface ApiKeySetupProps {
  onApiKeySet: (key: string) => void;
}

export default function ApiKeySetup({ onApiKeySet }: ApiKeySetupProps) {
  const [apiKey, setApiKey] = useState('');
  const [saveToLocal, setSaveToLocal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showKey, setShowKey] = useState(false);

  // localStorage에 저장된 키 불러오기
  const savedKey = localStorage.getItem('gemini_api_key');

  const handleSubmit = async () => {
    const keyToUse = apiKey.trim() || savedKey?.trim() || '';
    if (!keyToUse) {
      setError('API 키를 입력해주세요.');
      return;
    }
    setLoading(true);
    setError('');
    const valid = await validateApiKey(keyToUse);
    setLoading(false);
    if (!valid) {
      setError('API 키가 올바르지 않습니다. 다시 확인해주세요.');
      return;
    }
    sessionStorage.setItem('gemini_api_key', keyToUse);
    if (saveToLocal) {
      localStorage.setItem('gemini_api_key', keyToUse);
    }
    onApiKeySet(keyToUse);
  };

  const handleUseSaved = () => {
    if (savedKey) {
      setApiKey(savedKey);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#FFF9F0' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md"
      >
        {/* 헤더 */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-6xl mb-4"
          >
            🌟
          </motion.div>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Jua, sans-serif', color: '#FF6B6B' }}>
            한국어 배워요!
          </h1>
          <p className="text-gray-500 text-sm">
            Gemini API 키를 입력하면 시작할 수 있어요
          </p>
        </div>

        {/* 저장된 키 알림 */}
        {savedKey && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-3 rounded-xl text-sm flex items-center gap-2"
            style={{ background: '#E8F9F7', color: '#4ECDC4' }}
          >
            <span>💾</span>
            <span>저장된 API 키가 있어요!</span>
            <button
              onClick={handleUseSaved}
              className="ml-auto text-xs px-2 py-1 rounded-lg font-medium"
              style={{ background: '#4ECDC4', color: 'white' }}
            >
              불러오기
            </button>
          </motion.div>
        )}

        {/* API 키 입력 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gemini API 키
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={e => { setApiKey(e.target.value); setError(''); }}
              placeholder="AIza..."
              className="w-full px-4 py-3 rounded-xl border-2 outline-none text-sm transition-all"
              style={{
                borderColor: error ? '#FF6B6B' : '#E5E7EB',
                fontFamily: 'monospace',
              }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showKey ? '🙈' : '👁️'}
            </button>
          </div>
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-sm"
              style={{ color: '#FF6B6B' }}
            >
              ⚠️ {error}
            </motion.p>
          )}
        </div>

        {/* 저장 옵션 */}
        <label className="flex items-center gap-2 mb-6 cursor-pointer">
          <input
            type="checkbox"
            checked={saveToLocal}
            onChange={e => setSaveToLocal(e.target.checked)}
            className="w-4 h-4 rounded"
            style={{ accentColor: '#FF6B6B' }}
          />
          <span className="text-sm text-gray-600">이 기기에 API 키 저장하기</span>
        </label>

        {/* 시작 버튼 */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-4 rounded-2xl text-white font-bold text-lg transition-all"
          style={{
            background: loading ? '#ccc' : 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
            fontFamily: 'Jua, sans-serif',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="inline-block"
              >
                ⚙️
              </motion.span>
              확인 중...
            </span>
          ) : (
            '학습 시작하기 🚀'
          )}
        </motion.button>

        {/* 안내 */}
        <p className="mt-4 text-xs text-center text-gray-400">
          API 키는 브라우저에만 저장되며 외부로 전송되지 않아요
        </p>
      </motion.div>
    </div>
  );
}
