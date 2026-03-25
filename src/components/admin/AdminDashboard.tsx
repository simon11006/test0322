import { useState } from 'react';
import { motion } from 'framer-motion';
import { updateAdminPassword, updateAdminApiKeys, getAdminConfig } from '../../lib/firestore';
import type { AdminConfig } from '../../types';

interface AdminDashboardProps {
  config: AdminConfig;
  onConfigUpdate: (config: AdminConfig) => void;
  onLogout: () => void;
}

type Tab = 'api' | 'password';

export default function AdminDashboard({ config, onConfigUpdate, onLogout }: AdminDashboardProps) {
  const [tab, setTab] = useState<Tab>('api');

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#0f172a',
        fontFamily: 'Noto Sans KR, sans-serif',
        color: 'white',
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '32px' }}>🔐</span>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'Jua, sans-serif' }}>
              관리자 대시보드
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>시스템 관리자</div>
          </div>
        </div>
        <button
          onClick={onLogout}
          style={{
            padding: '8px 16px',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'transparent',
            color: 'rgba(255,255,255,0.6)',
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          로그아웃
        </button>
      </div>

      {/* 탭 */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          padding: '16px 20px 0',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {([['api', '🔑', '기본 API 키'], ['password', '🔒', '비밀번호 변경']] as const).map(
          ([key, icon, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                padding: '10px 20px',
                borderRadius: '10px 10px 0 0',
                border: 'none',
                background: tab === key ? 'rgba(102,126,234,0.2)' : 'transparent',
                color: tab === key ? '#a5b4fc' : 'rgba(255,255,255,0.4)',
                fontSize: '14px',
                fontWeight: tab === key ? 700 : 400,
                cursor: 'pointer',
                borderBottom: tab === key ? '2px solid #667eea' : '2px solid transparent',
              }}
            >
              {icon} {label}
            </button>
          ),
        )}
      </div>

      {/* 탭 내용 */}
      <div style={{ padding: '24px 20px', maxWidth: '600px', margin: '0 auto' }}>
        {tab === 'api' && (
          <ApiKeysTab config={config} onConfigUpdate={onConfigUpdate} />
        )}
        {tab === 'password' && (
          <PasswordTab onConfigUpdate={onConfigUpdate} />
        )}
      </div>
    </div>
  );
}

// ─── API 키 탭 ────────────────────────────────────────────────────────────────
function ApiKeysTab({
  config,
  onConfigUpdate,
}: {
  config: AdminConfig;
  onConfigUpdate: (c: AdminConfig) => void;
}) {
  const [geminiKey, setGeminiKey] = useState(config.geminiApiKey);
  const [pixabayKey, setPixabayKey] = useState(config.pixabayApiKey);
  const [showGemini, setShowGemini] = useState(false);
  const [showPixabay, setShowPixabay] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await updateAdminApiKeys(geminiKey.trim(), pixabayKey.trim());
      onConfigUpdate({ ...config, geminiApiKey: geminiKey.trim(), pixabayApiKey: pixabayKey.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      {/* 안내 배너 */}
      <div
        style={{
          background: 'rgba(102,126,234,0.1)',
          border: '1px solid rgba(102,126,234,0.3)',
          borderRadius: '14px',
          padding: '16px',
          marginBottom: '24px',
          fontSize: '14px',
          color: '#a5b4fc',
          lineHeight: 1.6,
        }}
      >
        💡 여기에 입력한 API 키는 <strong>교사가 자신의 키를 설정하지 않은 경우</strong> 자동으로 사용됩니다.
        모든 학생의 학습이 중단 없이 진행됩니다.
      </div>

      {/* Gemini API 키 */}
      <div style={{ marginBottom: '20px' }}>
        <label
          style={{
            display: 'block',
            color: 'rgba(255,255,255,0.7)',
            fontSize: '13px',
            fontWeight: 700,
            marginBottom: '8px',
          }}
        >
          Gemini API 키 <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type={showGemini ? 'text' : 'password'}
            value={geminiKey}
            onChange={e => setGeminiKey(e.target.value)}
            placeholder="AIza..."
            style={{
              flex: 1,
              padding: '14px 16px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'white',
              fontSize: '14px',
              outline: 'none',
            }}
          />
          <button
            onClick={() => setShowGemini(v => !v)}
            style={{
              padding: '14px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            {showGemini ? '🙈' : '👁️'}
          </button>
        </div>
        {!geminiKey && (
          <p style={{ color: '#f59e0b', fontSize: '12px', marginTop: '6px' }}>
            ⚠️ 키가 없으면 교사가 자신의 키를 설정하지 않은 경우 학생이 앱을 사용할 수 없습니다.
          </p>
        )}
      </div>

      {/* Pixabay API 키 */}
      <div style={{ marginBottom: '28px' }}>
        <label
          style={{
            display: 'block',
            color: 'rgba(255,255,255,0.7)',
            fontSize: '13px',
            fontWeight: 700,
            marginBottom: '8px',
          }}
        >
          Pixabay API 키 <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>(선택)</span>
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type={showPixabay ? 'text' : 'password'}
            value={pixabayKey}
            onChange={e => setPixabayKey(e.target.value)}
            placeholder="선택 사항"
            style={{
              flex: 1,
              padding: '14px 16px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'white',
              fontSize: '14px',
              outline: 'none',
            }}
          />
          <button
            onClick={() => setShowPixabay(v => !v)}
            style={{
              padding: '14px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            {showPixabay ? '🙈' : '👁️'}
          </button>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSave}
        disabled={saving}
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: '14px',
          border: 'none',
          background: saved
            ? 'linear-gradient(135deg, #10b981, #059669)'
            : 'linear-gradient(135deg, #667eea, #764ba2)',
          color: 'white',
          fontSize: '16px',
          fontWeight: 700,
          cursor: saving ? 'not-allowed' : 'pointer',
        }}
      >
        {saving ? '저장 중...' : saved ? '✅ 저장됨' : '저장하기'}
      </motion.button>
    </motion.div>
  );
}

// ─── 비밀번호 변경 탭 ─────────────────────────────────────────────────────────
function PasswordTab({ onConfigUpdate }: { onConfigUpdate: (c: AdminConfig) => void }) {
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setError('');
    setSuccess(false);

    if (!currentPw || !newPw || !confirmPw) {
      setError('모든 항목을 입력해주세요.');
      return;
    }
    if (newPw.length < 4) {
      setError('새 비밀번호는 4자 이상이어야 합니다.');
      return;
    }
    if (newPw !== confirmPw) {
      setError('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    setSaving(true);
    try {
      // 현재 비밀번호 Firestore에서 재확인
      const config = await getAdminConfig();
      if (currentPw !== config.password) {
        setError('현재 비밀번호가 올바르지 않습니다.');
        return;
      }
      await updateAdminPassword(newPw);
      onConfigUpdate({ ...config, password: newPw });
      setSuccess(true);
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    } catch {
      setError('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '24px',
        }}
      >
        {[
          { label: '현재 비밀번호', value: currentPw, setter: setCurrentPw, placeholder: '현재 비밀번호' },
          { label: '새 비밀번호', value: newPw, setter: setNewPw, placeholder: '새 비밀번호 (4자 이상)' },
          { label: '새 비밀번호 확인', value: confirmPw, setter: setConfirmPw, placeholder: '새 비밀번호 재입력' },
        ].map(({ label, value, setter, placeholder }) => (
          <div key={label} style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                color: 'rgba(255,255,255,0.6)',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '8px',
              }}
            >
              {label}
            </label>
            <input
              type="password"
              value={value}
              onChange={e => setter(e.target.value)}
              placeholder={placeholder}
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        ))}

        {error && (
          <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '12px' }}>⚠️ {error}</p>
        )}
        {success && (
          <p style={{ color: '#10b981', fontSize: '13px', marginBottom: '12px' }}>
            ✅ 비밀번호가 변경되었습니다.
          </p>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '14px',
            border: 'none',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            fontSize: '16px',
            fontWeight: 700,
            cursor: saving ? 'not-allowed' : 'pointer',
            marginTop: '4px',
          }}
        >
          {saving ? '변경 중...' : '비밀번호 변경'}
        </motion.button>
      </div>
    </motion.div>
  );
}
