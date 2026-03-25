import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTeacherByClassCode, getStudents, findStudent } from '../../lib/firestore';
import type { Teacher, Student } from '../../types';
import { getLanguageName } from '../../utils/languages';

interface StudentAuthProps {
  onSuccess: (student: Student, teacher: Teacher) => void;
  onBack: () => void;
}

type Step = 'code' | 'name' | 'pin';

export default function StudentAuth({ onSuccess, onBack }: StudentAuthProps) {
  const [step, setStep] = useState<Step>('code');
  const [classCode, setClassCode] = useState('');
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedName, setSelectedName] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const found = await getTeacherByClassCode(classCode);
      if (!found) {
        setError('올바른 학급 코드를 입력해 주세요.');
        setLoading(false);
        return;
      }
      const list = await getStudents(found.id);
      if (list.length === 0) {
        setError('이 학급에 등록된 학생이 없습니다. 선생님께 문의하세요.');
        setLoading(false);
        return;
      }
      setTeacher(found);
      setStudents(list.sort((a, b) => a.name.localeCompare(b.name)));
      setStep('name');
    } catch {
      setError('오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleNameSelect = (name: string) => {
    setSelectedName(name);
    setPin('');
    setError('');
    setStep('pin');
  };

  const handlePinInput = (digit: string) => {
    if (digit === 'del') {
      setPin(p => p.slice(0, -1));
      return;
    }
    if (pin.length >= 4) return;
    const next = pin + digit;
    setPin(next);
    if (next.length === 4) verifyPin(next);
  };

  const verifyPin = async (enteredPin: string) => {
    if (!teacher) return;
    setLoading(true);
    setError('');
    try {
      const student = await findStudent(teacher.id, selectedName, enteredPin);
      if (!student) {
        setError('PIN이 올바르지 않습니다. 다시 시도해 주세요.');
        setPin('');
        setLoading(false);
        return;
      }
      onSuccess(student, teacher);
    } catch {
      setError('오류가 발생했습니다.');
      setPin('');
      setLoading(false);
    }
  };

  const stepBack = () => {
    setError('');
    if (step === 'pin') { setStep('name'); setPin(''); }
    else if (step === 'name') { setStep('code'); setTeacher(null); setStudents([]); }
    else onBack();
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
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
          padding: '36px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
      >
        <button
          onClick={stepBack}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#6b7280',
            fontSize: '14px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: 0,
          }}
        >
          ← 뒤로
        </button>

        {/* 진행 표시 */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '28px' }}>
          {(['code', 'name', 'pin'] as Step[]).map((s, i) => (
            <div
              key={s}
              style={{
                flex: 1,
                height: '4px',
                borderRadius: '2px',
                background: ['code', 'name', 'pin'].indexOf(step) >= i ? '#f5576c' : '#e5e7eb',
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: 학급 코드 */}
          {step === 'code' && (
            <motion.div
              key="code"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>🔑</div>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1f2937', margin: 0, fontFamily: 'Jua, sans-serif' }}>
                  학급 코드 입력
                </h2>
                <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '6px' }}>
                  선생님께 받은 6자리 코드를 입력하세요
                </p>
              </div>
              <form onSubmit={handleCodeSubmit}>
                <input
                  type="text"
                  value={classCode}
                  onChange={e => setClassCode(e.target.value.toUpperCase())}
                  placeholder="예: AB3K9Z"
                  maxLength={6}
                  required
                  style={{
                    ...inputStyle,
                    textAlign: 'center',
                    fontSize: '24px',
                    letterSpacing: '6px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                />
                {error && <ErrorMsg>{error}</ErrorMsg>}
                <SubmitBtn loading={loading}>다음 →</SubmitBtn>
              </form>
            </motion.div>
          )}

          {/* STEP 2: 이름 선택 */}
          {step === 'name' && (
            <motion.div
              key="name"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>👤</div>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1f2937', margin: 0, fontFamily: 'Jua, sans-serif' }}>
                  내 이름 선택
                </h2>
                <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '6px' }}>
                  {teacher?.name} 선생님 반
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto' }}>
                {students.map(s => (
                  <motion.button
                    key={s.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleNameSelect(s.name)}
                    style={{
                      padding: '14px 18px',
                      borderRadius: '12px',
                      border: '1.5px solid #e5e7eb',
                      background: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#1f2937',
                    }}
                  >
                    <span style={{ fontSize: '22px' }}>
                      {LANGUAGE_FLAGS[s.nativeLanguage] ?? '🌍'}
                    </span>
                    <span>{s.name}</span>
                    <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#9ca3af' }}>
                      {getLanguageName(s.nativeLanguage)}
                    </span>
                  </motion.button>
                ))}
              </div>
              {error && <ErrorMsg>{error}</ErrorMsg>}
            </motion.div>
          )}

          {/* STEP 3: PIN 입력 */}
          {step === 'pin' && (
            <motion.div
              key="pin"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>🔒</div>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1f2937', margin: 0, fontFamily: 'Jua, sans-serif' }}>
                  PIN 입력
                </h2>
                <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '6px' }}>
                  <strong>{selectedName}</strong> 님의 4자리 PIN
                </p>
              </div>

              {/* PIN 도트 표시 */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '28px' }}>
                {[0, 1, 2, 3].map(i => (
                  <div
                    key={i}
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: i < pin.length ? '#f5576c' : '#e5e7eb',
                      transition: 'background 0.2s',
                    }}
                  />
                ))}
              </div>

              {/* 숫자 키패드 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {['1','2','3','4','5','6','7','8','9','','0','del'].map(k => (
                  <motion.button
                    key={k || 'empty'}
                    whileTap={k ? { scale: 0.9 } : undefined}
                    onClick={() => k && handlePinInput(k)}
                    disabled={loading || !k}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1.5px solid #e5e7eb',
                      background: k === 'del' ? '#fee2e2' : k ? 'white' : 'transparent',
                      cursor: k ? 'pointer' : 'default',
                      fontSize: k === 'del' ? '20px' : '20px',
                      fontWeight: 700,
                      color: k === 'del' ? '#dc2626' : '#1f2937',
                      borderColor: k ? undefined : 'transparent',
                    }}
                  >
                    {k === 'del' ? '⌫' : k}
                  </motion.button>
                ))}
              </div>

              {loading && (
                <p style={{ textAlign: 'center', color: '#6b7280', marginTop: '16px', fontSize: '14px' }}>
                  확인 중...
                </p>
              )}
              {error && <ErrorMsg>{error}</ErrorMsg>}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// 언어별 국기 이모지
const LANGUAGE_FLAGS: Record<string, string> = {
  vi: '🇻🇳', zh: '🇨🇳', fil: '🇵🇭', mn: '🇲🇳',
  ru: '🇷🇺', ar: '🇸🇦', en: '🇺🇸', id: '🇮🇩',
  th: '🇹🇭', km: '🇰🇭', other: '🌍',
};

function ErrorMsg({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        background: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '10px',
        padding: '10px 14px',
        color: '#dc2626',
        fontSize: '14px',
        marginTop: '12px',
      }}
    >
      {children}
    </motion.div>
  );
}

function SubmitBtn({ children, loading }: { children: React.ReactNode; loading: boolean }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      type="submit"
      disabled={loading}
      style={{
        width: '100%',
        padding: '14px',
        marginTop: '16px',
        borderRadius: '12px',
        border: 'none',
        background: loading ? '#9ca3af' : 'linear-gradient(135deg, #f093fb, #f5576c)',
        color: 'white',
        fontSize: '16px',
        fontWeight: 700,
        cursor: loading ? 'not-allowed' : 'pointer',
      }}
    >
      {loading ? '확인 중...' : children}
    </motion.button>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px',
  borderRadius: '12px',
  border: '1.5px solid #e5e7eb',
  fontSize: '15px',
  outline: 'none',
  fontFamily: 'Noto Sans KR, sans-serif',
  boxSizing: 'border-box',
};
