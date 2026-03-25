import { motion } from 'framer-motion';

interface LoginScreenProps {
  onTeacher: () => void;
  onStudent: () => void;
}

export default function LoginScreen({ onTeacher, onStudent }: LoginScreenProps) {
  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: 'Noto Sans KR, sans-serif',
      }}
    >
      {/* 로고 영역 */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', marginBottom: '48px' }}
      >
        <div style={{ fontSize: '72px', marginBottom: '16px' }}>🌏</div>
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 800,
            color: 'white',
            margin: 0,
            textShadow: '0 2px 8px rgba(0,0,0,0.2)',
            fontFamily: 'Jua, sans-serif',
          }}
        >
          한국어 배움터
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '16px', marginTop: '8px' }}>
          다문화 학생을 위한 한국어 학습 앱
        </p>
      </motion.div>

      {/* 로그인 버튼 영역 */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          width: '100%',
          maxWidth: '360px',
        }}
      >
        <motion.button
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={onStudent}
          style={{
            padding: '24px',
            borderRadius: '20px',
            border: 'none',
            background: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          }}
        >
          <span style={{ fontSize: '48px' }}>🧒</span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#1f2937', fontFamily: 'Jua, sans-serif' }}>
              학생 로그인
            </div>
            <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>
              선생님이 만들어 준 학급 코드로 입장
            </div>
          </div>
          <span style={{ marginLeft: 'auto', fontSize: '20px', color: '#9ca3af' }}>→</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={onTeacher}
          style={{
            padding: '24px',
            borderRadius: '20px',
            border: '2px solid rgba(255,255,255,0.5)',
            background: 'rgba(255,255,255,0.15)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            backdropFilter: 'blur(10px)',
          }}
        >
          <span style={{ fontSize: '48px' }}>👨‍🏫</span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'white', fontFamily: 'Jua, sans-serif' }}>
              교사 로그인
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginTop: '2px' }}>
              학생 관리 및 API 설정
            </div>
          </div>
          <span style={{ marginLeft: 'auto', fontSize: '20px', color: 'rgba(255,255,255,0.7)' }}>→</span>
        </motion.button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '40px' }}
      >
        © 2025 한국어 배움터
      </motion.p>
    </div>
  );
}
