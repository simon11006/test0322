import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '../../lib/firebase';

// 관리자 Firebase Auth 이메일 (고정)
export const ADMIN_EMAIL = 'admin@korean-app.local';

// Firebase Auth는 6자 이상 필요 → 짧은 비밀번호는 내부적으로 패딩
export function padAdminPassword(pw: string): string {
  return pw.padEnd(6, '_');
}

interface AdminAuthProps {
  onBack: () => void;
}

export default function AdminAuth({ onBack }: AdminAuthProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!password.trim()) {
      setError('비밀번호를 입력해주세요.');
      return;
    }
    setLoading(true);
    setError('');
    const firebasePw = padAdminPassword(password);
    try {
      await signInWithEmailAndPassword(auth, ADMIN_EMAIL, firebasePw);
      // 성공 → App.tsx의 onAuthStateChanged가 admin 대시보드로 라우팅
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('user-not-found') || msg.includes('invalid-credential') || msg.includes('CONFIGURATION_NOT_FOUND')) {
        // 최초 접근 시 계정 자동 생성 (초기 비밀번호 "1234")
        try {
          await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, firebasePw);
          // 성공 → onAuthStateChanged가 처리
        } catch (createErr: unknown) {
          const createMsg = createErr instanceof Error ? createErr.message : '';
          if (createMsg.includes('email-already-in-use')) {
            setError('비밀번호가 올바르지 않습니다.');
          } else {
            setError('오류가 발생했습니다. 다시 시도해 주세요.');
          }
        }
      } else if (msg.includes('wrong-password') || msg.includes('invalid-login-credentials')) {
        setError('비밀번호가 올바르지 않습니다.');
      } else {
        setError('오류가 발생했습니다. 다시 시도해 주세요.');
      }
    } finally {
      setLoading(false);
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
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'white', margin: 0, fontFamily: 'Jua, sans-serif' }}>
            관리자 로그인
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginTop: '8px' }}>
            시스템 관리자 전용
          </p>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginBottom: '8px', fontWeight: 600 }}>
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
          <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginBottom: '8px', fontWeight: 600 }}>
            비밀번호
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="비밀번호 입력"
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.07)',
              border: error ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.15)',
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
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '14px',
            border: 'none',
            background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #667eea, #764ba2)',
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
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '12px',
            border: 'none',
            background: 'transparent',
            color: 'rgba(255,255,255,0.4)',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          ← 뒤로
        </button>
      </motion.div>
    </div>
  );
}
