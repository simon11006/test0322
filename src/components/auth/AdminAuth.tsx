import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { loginAdmin } from '../../lib/firestore';
import type { AdminConfig } from '../../types';

interface AdminAuthProps {
  onSuccess: (config: AdminConfig) => void;
  onBack: () => void;
}

export default function AdminAuth({ onSuccess, onBack }: AdminAuthProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isSubmitting = useRef(false);

  const handleLogin = async () => {
    if (isSubmitting.current) return;
    if (!password.trim()) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    isSubmitting.current = true;
    setLoading(true);
    setError('');

    try {
      const config = await loginAdmin(password);
      if (!config) {
        setError('비밀번호가 올바르지 않습니다.');
        return;
      }
      localStorage.setItem('admin_session', 'true');
      onSuccess(config);
    } catch {
      setError('오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: 'Noto Sans KR, sans-serif',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '24px',
          padding: '40px 32px',
          width: '100%',
          maxWidth: '360px',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '56px', marginBottom: '12px' }}>🔐</div>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: 'white',
              margin: 0,
              fontFamily: 'Jua, sans-serif',
            }}
          >
            관리자 로그인
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginTop: '8px' }}>
            시스템 관리자 전용
          </p>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              display: 'block',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '13px',
              marginBottom: '8px',
              fontWeight: 600,
            }}
          >
            아이디
          </label>
          <div
            style={{
              padding: '14px 16px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.4)',
              fontSize: '15px',
            }}
          >
            admin
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label
            style={{
              display: 'block',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '13px',
              marginBottom: '8px',
              fontWeight: 600,
            }}
          >
            비밀번호
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !loading && handleLogin()}
            placeholder="비밀번호 입력"
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.07)',
              border: error
                ? '1px solid #ef4444'
                : '1px solid rgba(255,255,255,0.15)',
              color: 'white',
              fontSize: '15px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {error && (
            <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '6px' }}>{error}</p>
          )}
        </div>

        <motion.button
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '14px',
            border: 'none',
            background: loading
              ? 'rgba(255,255,255,0.1)'
              : 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            fontSize: '16px',
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '12px',
          }}
        >
          {loading ? '확인 중...' : '로그인'}
        </motion.button>

        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '12px',
            border: 'none',
            background: 'transparent',
            color: 'rgba(255,255,255,0.4)',
            fontSize: '14px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          ← 뒤로
        </button>
      </motion.div>
    </div>
  );
}
