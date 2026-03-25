import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getStudents,
  addStudent,
  deleteStudent,
  updateTeacherApiKeys,
} from '../../lib/firestore';
import { testGeminiKey, testPixabayKey, type TestStatus } from '../../lib/apiTest';
import type { Teacher, Student, NativeLanguage, Level } from '../../types';
import { SUPPORTED_LANGUAGES } from '../../utils/languages';

interface Props {
  teacher: Teacher;
  onTeacherUpdate: (t: Teacher) => void;
  onLogout: () => void;
}

type Tab = 'students' | 'progress' | 'settings';

const LEVEL_LABELS: Record<Level, string> = { 1: '기초', 2: '초급', 3: '중급' };
const LEVEL_COLORS: Record<Level, string> = { 1: '#10b981', 2: '#3b82f6', 3: '#f59e0b' };
const LANG_FLAGS: Record<string, string> = {
  vi: '🇻🇳', zh: '🇨🇳', fil: '🇵🇭', mn: '🇲🇳',
  ru: '🇷🇺', ar: '🇸🇦', en: '🇺🇸', id: '🇮🇩',
  th: '🇹🇭', km: '🇰🇭', other: '🌍',
};

export default function TeacherDashboard({ teacher, onTeacherUpdate, onLogout }: Props) {
  const [tab, setTab] = useState<Tab>('students');
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const list = await getStudents(teacher.id);
      setStudents(list.sort((a, b) => a.name.localeCompare(b.name)));
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleLogout = () => {
    onLogout();
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#f8fafc',
        fontFamily: 'Noto Sans KR, sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 12px rgba(102,126,234,0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '28px' }}>👨‍🏫</span>
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: '16px', fontFamily: 'Jua, sans-serif' }}>
              {teacher.name} 선생님
            </div>
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px' }}>
              학급 코드: <strong>{teacher.classCode}</strong>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '8px',
            color: 'white',
            padding: '6px 14px',
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          로그아웃
        </button>
      </div>

      {/* 탭 바 */}
      <div
        style={{
          display: 'flex',
          background: 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '0 16px',
        }}
      >
        {([
          { key: 'students', label: '학생 관리', icon: '👥' },
          { key: 'progress', label: '학습 현황', icon: '📊' },
          { key: 'settings', label: '설정', icon: '⚙️' },
        ] as { key: Tab; label: string; icon: string }[]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex: 1,
              padding: '14px 8px',
              background: 'none',
              border: 'none',
              borderBottom: tab === t.key ? '3px solid #667eea' : '3px solid transparent',
              color: tab === t.key ? '#667eea' : '#6b7280',
              fontWeight: tab === t.key ? 700 : 400,
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 16px' }}>
        <AnimatePresence mode="wait">
          {tab === 'students' && (
            <StudentsTab
              key="students"
              teacher={teacher}
              students={students}
              loading={loadingStudents}
              onRefresh={fetchStudents}
              onStudentsChange={setStudents}
            />
          )}
          {tab === 'progress' && (
            <ProgressTab key="progress" students={students} loading={loadingStudents} />
          )}
          {tab === 'settings' && (
            <SettingsTab
              key="settings"
              teacher={teacher}
              onTeacherUpdate={onTeacherUpdate}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── 학생 관리 탭 ─────────────────────────────────────────────────────────────
function StudentsTab({
  teacher,
  students,
  loading,
  onRefresh,
  onStudentsChange,
}: {
  teacher: Teacher;
  students: Student[];
  loading: boolean;
  onRefresh: () => void;
  onStudentsChange: (list: Student[]) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', nativeLanguage: 'vi' as NativeLanguage, pin: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.pin.length !== 4 || !/^\d{4}$/.test(form.pin)) {
      setFormError('PIN은 숫자 4자리여야 합니다.');
      return;
    }
    if (students.some(s => s.name === form.name.trim())) {
      setFormError('이미 같은 이름의 학생이 있습니다.');
      return;
    }
    setFormError('');
    setSubmitting(true);
    try {
      const newStudent = await addStudent(
        teacher.id,
        form.name.trim(),
        form.nativeLanguage,
        form.pin,
      );
      onStudentsChange([...students, newStudent].sort((a, b) => a.name.localeCompare(b.name)));
      setForm({ name: '', nativeLanguage: 'vi', pin: '' });
      setShowForm(false);
    } catch {
      setFormError('학생 추가 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" 학생을 삭제하시겠습니까?`)) return;
    setDeleting(id);
    try {
      await deleteStudent(id);
      onStudentsChange(students.filter(s => s.id !== id));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* API 키 미설정 경고 */}
      {!teacher.geminiApiKey && (
        <div
          style={{
            background: '#fffbeb',
            border: '1px solid #fbbf24',
            borderRadius: '12px',
            padding: '14px 16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            color: '#92400e',
          }}
        >
          ⚠️ <span><strong>설정 탭</strong>에서 Gemini API 키를 먼저 입력해야 학생들이 앱을 사용할 수 있습니다.</span>
        </div>
      )}

      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#1f2937', fontFamily: 'Jua, sans-serif' }}>
          학생 목록 ({students.length}명)
        </h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={onRefresh} style={iconBtnStyle} title="새로고침">🔄</button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            + 학생 추가
          </motion.button>
        </div>
      </div>

      {/* 학생 추가 폼 */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAdd}
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '16px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              border: '1.5px solid #e0e7ff',
              overflow: 'hidden',
            }}
          >
            <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 700, color: '#4f46e5' }}>
              새 학생 등록
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>이름</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="학생 이름"
                  required
                  style={formInputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>PIN (4자리 숫자)</label>
                <input
                  value={form.pin}
                  onChange={e => setForm(f => ({ ...f, pin: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                  placeholder="0000"
                  required
                  style={{ ...formInputStyle, letterSpacing: '4px' }}
                />
              </div>
            </div>
            <div style={{ marginTop: '12px' }}>
              <label style={labelStyle}>모국어</label>
              <select
                value={form.nativeLanguage}
                onChange={e => setForm(f => ({ ...f, nativeLanguage: e.target.value as NativeLanguage }))}
                style={formInputStyle}
              >
                {SUPPORTED_LANGUAGES.map(l => (
                  <option key={l.code} value={l.code}>
                    {LANG_FLAGS[l.code] ?? '🌍'} {l.name}
                  </option>
                ))}
              </select>
            </div>
            {formError && (
              <p style={{ color: '#dc2626', fontSize: '13px', margin: '8px 0 0' }}>{formError}</p>
            )}
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => { setShowForm(false); setFormError(''); }}
                style={{ ...cancelBtnStyle }}
              >
                취소
              </button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={submitting}
                style={saveBtnStyle}
              >
                {submitting ? '추가 중...' : '학생 등록'}
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* 학생 리스트 */}
      {loading ? (
        <LoadingSpinner />
      ) : students.length === 0 ? (
        <EmptyState icon="👥" message="등록된 학생이 없습니다." sub="위의 '학생 추가' 버튼을 눌러 학생을 등록하세요." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {students.map(s => (
            <motion.div
              key={s.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'white',
                borderRadius: '14px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
              }}
            >
              <span style={{ fontSize: '28px' }}>{LANG_FLAGS[s.nativeLanguage] ?? '🌍'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '15px', color: '#1f2937' }}>{s.name}</div>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                  {SUPPORTED_LANGUAGES.find(l => l.code === s.nativeLanguage)?.name ?? s.nativeLanguage}
                  {s.level && (
                    <span
                      style={{
                        marginLeft: '8px',
                        background: LEVEL_COLORS[s.level] + '20',
                        color: LEVEL_COLORS[s.level],
                        padding: '2px 8px',
                        borderRadius: '20px',
                        fontWeight: 600,
                        fontSize: '11px',
                      }}
                    >
                      {LEVEL_LABELS[s.level]}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ fontSize: '12px', color: '#d1d5db', marginRight: '8px' }}>
                PIN: {'•'.repeat(4)}
              </div>
              <button
                onClick={() => handleDelete(s.id, s.name)}
                disabled={deleting === s.id}
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  color: '#dc2626',
                  padding: '6px 10px',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                {deleting === s.id ? '...' : '삭제'}
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── 학습 현황 탭 ─────────────────────────────────────────────────────────────
function ProgressTab({ students, loading }: { students: Student[]; loading: boolean }) {
  const formatDate = (ts?: number) => {
    if (!ts) return '없음';
    const d = new Date(ts);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '어제';
    return `${diffDays}일 전`;
  };

  const active = students.filter(s => s.lastActivity && Date.now() - s.lastActivity < 7 * 86400000).length;
  const hasLevel = students.filter(s => s.level).length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* 요약 카드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
        {[
          { icon: '👥', value: students.length, label: '전체 학생' },
          { icon: '✅', value: hasLevel, label: '레벨 확인 완료' },
          { icon: '🔥', value: active, label: '이번 주 활동' },
        ].map(c => (
          <div
            key={c.label}
            style={{
              background: 'white',
              borderRadius: '14px',
              padding: '16px 12px',
              textAlign: 'center',
              boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ fontSize: '28px' }}>{c.icon}</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#1f2937', fontFamily: 'Jua, sans-serif' }}>
              {c.value}
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* 학생별 현황 */}
      <h2 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: 700, color: '#1f2937', fontFamily: 'Jua, sans-serif' }}>
        학생별 학습 현황
      </h2>

      {loading ? (
        <LoadingSpinner />
      ) : students.length === 0 ? (
        <EmptyState icon="📊" message="등록된 학생이 없습니다." sub="학생 관리 탭에서 학생을 등록하세요." />
      ) : (
        <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          {/* 테이블 헤더 */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 70px 80px 70px 70px',
              padding: '10px 16px',
              background: '#f9fafb',
              borderBottom: '1px solid #e5e7eb',
              fontSize: '12px',
              fontWeight: 700,
              color: '#6b7280',
            }}
          >
            <span>이름</span>
            <span style={{ textAlign: 'center' }}>레벨</span>
            <span style={{ textAlign: 'center' }}>마지막 접속</span>
            <span style={{ textAlign: 'center' }}>단어</span>
            <span style={{ textAlign: 'center' }}>퀴즈</span>
          </div>
          {students.map((s, i) => (
            <div
              key={s.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 70px 80px 70px 70px',
                padding: '12px 16px',
                alignItems: 'center',
                borderBottom: i < students.length - 1 ? '1px solid #f3f4f6' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>{LANG_FLAGS[s.nativeLanguage] ?? '🌍'}</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>{s.name}</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                {s.level ? (
                  <span
                    style={{
                      background: LEVEL_COLORS[s.level] + '20',
                      color: LEVEL_COLORS[s.level],
                      padding: '2px 8px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    {LEVEL_LABELS[s.level]}
                  </span>
                ) : (
                  <span style={{ color: '#d1d5db', fontSize: '12px' }}>-</span>
                )}
              </div>
              <div style={{ textAlign: 'center', fontSize: '12px', color: '#6b7280' }}>
                {formatDate(s.lastActivity)}
              </div>
              <div style={{ textAlign: 'center', fontSize: '13px', fontWeight: 600, color: '#1f2937' }}>
                {s.wordsLearned ?? 0}
              </div>
              <div style={{ textAlign: 'center', fontSize: '13px', fontWeight: 600, color: '#1f2937' }}>
                {s.quizzesTaken ?? 0}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── 설정 탭 ──────────────────────────────────────────────────────────────────
function SettingsTab({
  teacher,
  onTeacherUpdate,
}: {
  teacher: Teacher;
  onTeacherUpdate: (t: Teacher) => void;
}) {
  const [geminiKey, setGeminiKey] = useState(teacher.geminiApiKey);
  const [pixabayKey, setPixabayKey] = useState(teacher.pixabayApiKey);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showGemini, setShowGemini] = useState(false);
  const [copied, setCopied] = useState(false);
  const [geminiTest, setGeminiTest] = useState<TestStatus>('idle');
  const [geminiMsg, setGeminiMsg] = useState('');
  const [pixabayTest, setPixabayTest] = useState<TestStatus>('idle');
  const [pixabayMsg, setPixabayMsg] = useState('');

  const handleTestGemini = async () => {
    setGeminiTest('testing');
    const result = await testGeminiKey(geminiKey);
    setGeminiTest(result.ok ? 'ok' : 'fail');
    setGeminiMsg(result.message);
  };

  const handleTestPixabay = async () => {
    setPixabayTest('testing');
    const result = await testPixabayKey(pixabayKey);
    setPixabayTest(result.ok ? 'ok' : 'fail');
    setPixabayMsg(result.message);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateTeacherApiKeys(teacher.id, geminiKey.trim(), pixabayKey.trim());
      onTeacherUpdate({ ...teacher, geminiApiKey: geminiKey.trim(), pixabayApiKey: pixabayKey.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(teacher.classCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
    >
      {/* 학급 코드 */}
      <div style={cardStyle}>
        <h3 style={sectionTitle}>학급 코드</h3>
        <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '14px' }}>
          학생들이 이 코드를 입력해 로그인합니다. 학생들에게 알려주세요.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              flex: 1,
              background: '#f3f4f6',
              borderRadius: '12px',
              padding: '14px 20px',
              textAlign: 'center',
              fontSize: '28px',
              fontWeight: 800,
              letterSpacing: '8px',
              color: '#1f2937',
              fontFamily: 'monospace',
            }}
          >
            {teacher.classCode}
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={copyCode}
            style={{
              padding: '14px 18px',
              borderRadius: '12px',
              border: 'none',
              background: copied ? '#10b981' : '#667eea',
              color: 'white',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '13px',
              whiteSpace: 'nowrap',
            }}
          >
            {copied ? '복사됨!' : '복사'}
          </motion.button>
        </div>
      </div>

      {/* API 키 설정 */}
      <form onSubmit={handleSave} style={cardStyle}>
        <h3 style={sectionTitle}>API 키 설정</h3>
        <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px' }}>
          여기서 입력한 API 키로 학생들이 앱을 사용합니다.
        </p>

        {/* Gemini API */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>
            Gemini API 키 <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 8px' }}>
            AI 번역 및 학습 콘텐츠 생성에 사용됩니다.
          </p>
          <div style={{ position: 'relative' }}>
            <input
              type={showGemini ? 'text' : 'password'}
              value={geminiKey}
              onChange={e => setGeminiKey(e.target.value)}
              placeholder="AIzaSy..."
              style={{ ...formInputStyle, paddingRight: '48px' }}
            />
            <button
              type="button"
              onClick={() => setShowGemini(!showGemini)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
              }}
            >
              {showGemini ? '🙈' : '👁️'}
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={handleTestGemini}
              disabled={geminiTest === 'testing'}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1.5px solid #667eea',
                background: 'transparent',
                color: '#667eea',
                fontSize: '12px',
                fontWeight: 700,
                cursor: geminiTest === 'testing' ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {geminiTest === 'testing' ? '테스트 중...' : '🔍 키 테스트'}
            </button>
            {geminiTest !== 'idle' && geminiTest !== 'testing' && (
              <span style={{ fontSize: '12px', color: geminiTest === 'ok' ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                {geminiTest === 'ok' ? '✅' : '❌'} {geminiMsg}
              </span>
            )}
          </div>
          {!geminiKey && (
            <p style={{ fontSize: '12px', color: '#f59e0b', margin: '6px 0 0' }}>
              ⚠️ API 키가 없으면 학생들이 앱을 사용할 수 없습니다.
            </p>
          )}
        </div>

        {/* Pixabay API */}
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>
            Pixabay API 키 <span style={{ color: '#9ca3af', fontSize: '12px' }}>(선택)</span>
          </label>
          <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 8px' }}>
            단어 카드 이미지 생성에 사용됩니다. 없으면 AI 이미지 생성을 사용합니다.
          </p>
          <input
            type="text"
            value={pixabayKey}
            onChange={e => setPixabayKey(e.target.value)}
            placeholder="Pixabay API 키 (선택)"
            style={formInputStyle}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={handleTestPixabay}
              disabled={pixabayTest === 'testing'}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1.5px solid #667eea',
                background: 'transparent',
                color: '#667eea',
                fontSize: '12px',
                fontWeight: 700,
                cursor: pixabayTest === 'testing' ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {pixabayTest === 'testing' ? '테스트 중...' : '🔍 키 테스트'}
            </button>
            {pixabayTest !== 'idle' && pixabayTest !== 'testing' && (
              <span style={{ fontSize: '12px', color: pixabayTest === 'ok' ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                {pixabayTest === 'ok' ? '✅' : '❌'} {pixabayMsg}
              </span>
            )}
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={saving}
          style={{
            ...saveBtnStyle,
            width: '100%',
            padding: '14px',
            fontSize: '15px',
            background: saved ? '#10b981' : saving ? '#9ca3af' : 'linear-gradient(135deg, #667eea, #764ba2)',
          }}
        >
          {saved ? '✅ 저장되었습니다!' : saving ? '저장 중...' : '변경사항 저장'}
        </motion.button>
      </form>

      {/* 교사 정보 */}
      <div style={cardStyle}>
        <h3 style={sectionTitle}>교사 정보</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { label: '이름', value: teacher.name },
            { label: '아이디', value: teacher.id },
          ].map(r => (
            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: '#6b7280' }}>{r.label}</span>
              <span style={{ fontWeight: 600, color: '#1f2937' }}>{r.value}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── 공통 컴포넌트 ────────────────────────────────────────────────────────────
function LoadingSpinner() {
  return (
    <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
      <div style={{ fontSize: '32px', marginBottom: '8px' }}>⏳</div>
      <p style={{ margin: 0, fontSize: '14px' }}>불러오는 중...</p>
    </div>
  );
}

function EmptyState({ icon, message, sub }: { icon: string; message: string; sub: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
      <div style={{ fontSize: '48px', marginBottom: '12px' }}>{icon}</div>
      <p style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 700, color: '#6b7280' }}>{message}</p>
      <p style={{ margin: 0, fontSize: '13px' }}>{sub}</p>
    </div>
  );
}

// ─── 공통 스타일 ──────────────────────────────────────────────────────────────
const cardStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: '16px',
  padding: '20px',
  boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
};

const sectionTitle: React.CSSProperties = {
  margin: '0 0 6px',
  fontSize: '16px',
  fontWeight: 700,
  color: '#1f2937',
  fontFamily: 'Jua, sans-serif',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 600,
  color: '#374151',
  marginBottom: '6px',
};

const formInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '10px',
  border: '1.5px solid #e5e7eb',
  fontSize: '14px',
  outline: 'none',
  fontFamily: 'Noto Sans KR, sans-serif',
  boxSizing: 'border-box',
};

const saveBtnStyle: React.CSSProperties = {
  padding: '10px 20px',
  borderRadius: '10px',
  border: 'none',
  background: 'linear-gradient(135deg, #667eea, #764ba2)',
  color: 'white',
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: '14px',
};

const cancelBtnStyle: React.CSSProperties = {
  padding: '10px 20px',
  borderRadius: '10px',
  border: '1.5px solid #e5e7eb',
  background: 'white',
  color: '#6b7280',
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: '14px',
};

const iconBtnStyle: React.CSSProperties = {
  background: 'white',
  border: '1.5px solid #e5e7eb',
  borderRadius: '8px',
  padding: '7px 10px',
  cursor: 'pointer',
  fontSize: '14px',
};
