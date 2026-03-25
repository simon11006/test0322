import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import { getTeacher, getStudentById, updateStudentProgress, getAdminConfig } from './lib/firestore';
import type { AppScreen, Level, NativeLanguage, Teacher, Student, AdminConfig } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import Navigation from './components/Navigation';
import HomeScreen from './components/HomeScreen';
import TranslationCardView from './components/TranslationCard';
import LevelTest from './components/LevelTest';
import LearningContent from './components/LearningContent';
import ProgressView from './components/ProgressView';
import LoginScreen from './components/auth/LoginScreen';
import TeacherAuth from './components/auth/TeacherAuth';
import StudentAuth from './components/auth/StudentAuth';
import AdminAuth from './components/auth/AdminAuth';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import AdminDashboard from './components/admin/AdminDashboard';

// ─── 인증 상태 ────────────────────────────────────────────────────────────────
type AuthState =
  | { mode: 'loading' }
  | { mode: 'login' }
  | { mode: 'teacher-auth' }
  | { mode: 'student-auth' }
  | { mode: 'admin-auth' }
  | { mode: 'teacher'; teacher: Teacher }
  | { mode: 'student'; student: Student; teacher: Teacher }
  | { mode: 'admin'; config: AdminConfig };

// ─── 루트 앱 ──────────────────────────────────────────────────────────────────
export default function App() {
  const [authState, setAuthState] = useState<AuthState>({ mode: 'loading' });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async firebaseUser => {
      if (firebaseUser) {
        // 교사 로그인 확인
        try {
          const teacher = await getTeacher(firebaseUser.uid);
          if (teacher) {
            setAuthState({ mode: 'teacher', teacher });
            return;
          }
        } catch {
          // ignore
        }
      }
      // 학생 세션 확인
      const session = sessionStorage.getItem('student_session');
      if (session) {
        try {
          const { studentId } = JSON.parse(session);
          const student = await getStudentById(studentId);
          if (student) {
            const teacher = await getTeacher(student.teacherId);
            if (teacher) {
              // 교사 API 키 없으면 관리자 기본 키 사용
              let effectiveTeacher = teacher;
              if (!teacher.geminiApiKey) {
                try {
                  const adminCfg = await getAdminConfig();
                  if (adminCfg.geminiApiKey) {
                    effectiveTeacher = {
                      ...teacher,
                      geminiApiKey: adminCfg.geminiApiKey,
                      pixabayApiKey: teacher.pixabayApiKey || adminCfg.pixabayApiKey,
                    };
                  }
                } catch { /* 관리자 키 없으면 그냥 진행 */ }
              }
              setAuthState({ mode: 'student', student, teacher: effectiveTeacher });
              return;
            }
          }
        } catch {
          sessionStorage.removeItem('student_session');
        }
      }
      setAuthState({ mode: 'login' });
    });
    return () => unsub();
  }, []);

  if (authState.mode === 'loading') return <LoadingScreen />;

  if (authState.mode === 'login') {
    return (
      <LoginScreen
        onTeacher={() => setAuthState({ mode: 'teacher-auth' })}
        onStudent={() => setAuthState({ mode: 'student-auth' })}
        onAdmin={() => setAuthState({ mode: 'admin-auth' })}
      />
    );
  }

  if (authState.mode === 'admin-auth') {
    return (
      <AdminAuth
        onSuccess={config => setAuthState({ mode: 'admin', config })}
        onBack={() => setAuthState({ mode: 'login' })}
      />
    );
  }

  if (authState.mode === 'admin') {
    return (
      <AdminDashboard
        config={authState.config}
        onConfigUpdate={config => setAuthState({ mode: 'admin', config })}
        onLogout={() => setAuthState({ mode: 'login' })}
      />
    );
  }

  if (authState.mode === 'teacher-auth') {
    return (
      <TeacherAuth
        onSuccess={teacher => setAuthState({ mode: 'teacher', teacher })}
        onBack={() => setAuthState({ mode: 'login' })}
      />
    );
  }

  if (authState.mode === 'student-auth') {
    return (
      <StudentAuth
        onSuccess={async (student, teacher) => {
          sessionStorage.setItem('student_session', JSON.stringify({ studentId: student.id }));
          updateStudentProgress(student.id, { lastActivity: Date.now() }).catch(() => {});
          // 교사 API 키 없으면 관리자 기본 키 사용
          let effectiveTeacher = teacher;
          if (!teacher.geminiApiKey) {
            try {
              const adminCfg = await getAdminConfig();
              if (adminCfg.geminiApiKey) {
                effectiveTeacher = {
                  ...teacher,
                  geminiApiKey: adminCfg.geminiApiKey,
                  pixabayApiKey: teacher.pixabayApiKey || adminCfg.pixabayApiKey,
                };
              }
            } catch { /* 관리자 키 없으면 그냥 진행 */ }
          }
          setAuthState({ mode: 'student', student, teacher: effectiveTeacher });
        }}
        onBack={() => setAuthState({ mode: 'login' })}
      />
    );
  }

  if (authState.mode === 'teacher') {
    return (
      <TeacherDashboard
        teacher={authState.teacher}
        onTeacherUpdate={teacher => setAuthState({ mode: 'teacher', teacher })}
        onLogout={() => setAuthState({ mode: 'login' })}
      />
    );
  }

  if (authState.mode === 'student') {
    return (
      <StudentApp
        student={authState.student}
        teacher={authState.teacher}
        onLogout={() => {
          sessionStorage.removeItem('student_session');
          setAuthState({ mode: 'login' });
        }}
      />
    );
  }

  return null;
}

// ─── 학생용 앱 ────────────────────────────────────────────────────────────────
function StudentApp({
  student,
  teacher,
  onLogout,
}: {
  student: Student;
  teacher: Teacher;
  onLogout: () => void;
}) {
  const apiKey = teacher.geminiApiKey;

  // Pixabay 키를 localStorage에 동기화
  useEffect(() => {
    if (teacher.pixabayApiKey) {
      localStorage.setItem('pixabay_api_key', teacher.pixabayApiKey);
    }
  }, [teacher.pixabayApiKey]);

  const [screen, setScreen] = useState<AppScreen>('home');
  // 학생의 저장된 레벨/언어 우선 사용, 없으면 localStorage
  const [nativeLanguage, setNativeLanguage] = useLocalStorage<NativeLanguage | undefined>(
    `native_language_${student.id}`,
    student.nativeLanguage,
  );
  const [level, setLevel] = useLocalStorage<Level | undefined>(
    `user_level_${student.id}`,
    student.level,
  );
  const [darkMode, setDarkMode] = useLocalStorage<boolean>('dark_mode', false);

  const handleLevelSet = useCallback(
    (newLevel: Level) => {
      setLevel(newLevel);
      setScreen('learning');
      // Firestore에 레벨 저장
      updateStudentProgress(student.id, { level: newLevel }).catch(() => {});
    },
    [student.id, setLevel],
  );

  const handleNavigate = (target: AppScreen) => {
    if (target === 'learning' && !level) {
      setScreen('level-test');
      return;
    }
    setScreen(target);
  };

  // API 키 미설정 안내
  if (!apiKey) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: '#f8fafc',
          fontFamily: 'Noto Sans KR, sans-serif',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '360px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1f2937', marginBottom: '8px' }}>
            앱 준비 중
          </h2>
          <p style={{ color: '#6b7280', fontSize: '15px', lineHeight: 1.6 }}>
            선생님이 아직 API 키를 설정하지 않았습니다.
            <br />
            선생님께 설정을 요청해 주세요.
          </p>
          <button
            onClick={onLogout}
            style={{
              marginTop: '20px',
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              background: '#667eea',
              color: 'white',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '15px',
            }}
          >
            로그아웃
          </button>
        </div>
      </div>
    );
  }

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
        studentName={student.name}
        onLogout={onLogout}
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
                onLanguageSelect={(lang: NativeLanguage) => setNativeLanguage(lang)}
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
                <TranslationCardView apiKey={apiKey} nativeLanguage={nativeLanguage} darkMode={darkMode} />
              ) : (
                <NeedLanguage onHome={() => setScreen('home')} />
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
              <LevelTest apiKey={apiKey} onLevelSet={handleLevelSet} darkMode={darkMode} />
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

// ─── 보조 컴포넌트 ────────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        style={{ fontSize: '40px' }}
      >
        🌏
      </motion.div>
      <p style={{ color: 'white', fontSize: '16px', fontFamily: 'Jua, sans-serif' }}>로딩 중...</p>
    </div>
  );
}

function NeedLanguage({ onHome }: { onHome: () => void }) {
  return (
    <div className="p-4 text-center py-12">
      <p className="text-gray-400 mb-3">먼저 홈에서 모국어를 선택해주세요!</p>
      <button
        onClick={onHome}
        className="px-4 py-2 rounded-xl text-white"
        style={{ background: '#FF6B6B' }}
      >
        홈으로 가기
      </button>
    </div>
  );
}
