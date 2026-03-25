import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { createTeacher, getTeacher } from '../../lib/firestore';
import type { Teacher } from '../../types';

interface TeacherAuthProps {
  onSuccess: (teacher: Teacher) => void;
  onBack: () => void;
  onAdmin: () => void;
}

// 아이디를 Firebase Auth용 이메일로 변환
// 이미 이메일 형식이면 그대로, 아니면 @korean-app.local 추가
function toFirebaseEmail(id: string): string {
  return id.includes('@') ? id : `${id}@korean-app.local`;
}

export default function TeacherAuth({ onSuccess, onBack, onAdmin }: TeacherAuthProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const email = toFirebaseEmail(userId.trim());
    try {
      if (mode === 'register') {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name });
        const teacher = await createTeacher(cred.user.uid, name, userId.trim());
        onSuccess(teacher);
      } else {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const teacher = await getTeacher(cred.user.uid);
        if (!teacher) {
          setError('교사 계정 정보를 찾을 수 없습니다.');
          setLoading(false);
          return;
        }
        onSuccess(teacher);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('email-already-in-use')) setError('이미 사용 중인 아이디입니다.');
      else if (msg.includes('wrong-password') || msg.includes('invalid-credential'))
        setError('아이디 또는 비밀번호가 올바르지 않습니다.');
      else if (msg.includes('user-not-found')) setError('등록된 계정을 찾을 수 없습니다.');
      else if (msg.includes('weak-password')) setError('비밀번호는 6자 이상이어야 합니다.');
      else setError('오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: 'Noto Sans KR, sans-serif',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          background: 'white',
          borderRadius: '24px',
          padding: '40px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#6b7280',
            fontSize: '14px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: 0,
          }}
        >
          ← 뒤로
        </button>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>👨‍🏫</div>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#1f2937',
              margin: 0,
              fontFamily: 'Jua, sans-serif',
            }}
          >
            교사 {mode === 'login' ? '로그인' : '회원가입'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {mode === 'register' && (
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                이름
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="홍길동"
                required
                style={inputStyle}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              아이디
            </label>
            <input
              type="text"
              value={userId}
              onChange={e => setUserId(e.target.value)}
              placeholder="아이디 입력"
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={mode === 'register' ? '6자 이상 입력' : '비밀번호'}
              required
              style={inputStyle}
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '10px',
                padding: '12px',
                color: '#dc2626',
                fontSize: '14px',
              }}
            >
              {error}
            </motion.div>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            style={{
              padding: '14px',
              borderRadius: '12px',
              border: 'none',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              fontSize: '16px',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '4px',
            }}
          >
            {loading ? '처리 중...' : mode === 'login' ? '로그인' : '가입하기'}
          </motion.button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#667eea',
              fontSize: '14px',
              textDecoration: 'underline',
            }}
          >
            {mode === 'login' ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
          </button>
        </div>

        {/* 관리자 로그인 */}
        <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f3f4f6' }}>
          <button
            onClick={onAdmin}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#d1d5db',
              fontSize: '12px',
            }}
          >
            🔐 관리자 로그인
          </button>
        </div>
      </motion.div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '10px',
  border: '1.5px solid #e5e7eb',
  fontSize: '15px',
  outline: 'none',
  fontFamily: 'Noto Sans KR, sans-serif',
  boxSizing: 'border-box',
};
