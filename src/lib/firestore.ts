import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Teacher, Student, NativeLanguage, AdminConfig } from '../types';

// ─── 학급 코드 생성 ───────────────────────────────────────────────────────────
function generateClassCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// ─── 교사 ─────────────────────────────────────────────────────────────────────
export async function getTeacher(id: string): Promise<Teacher | null> {
  const snap = await getDoc(doc(db, 'teachers', id));
  return snap.exists() ? (snap.data() as Teacher) : null;
}

/** 회원가입: 아이디 중복 확인 후 생성 */
export async function createTeacher(id: string, password: string, name: string): Promise<Teacher> {
  const existing = await getDoc(doc(db, 'teachers', id));
  if (existing.exists()) throw new Error('ID_TAKEN');
  const teacher: Teacher = {
    id,
    password,
    name,
    geminiApiKey: '',
    pixabayApiKey: '',
    classCode: generateClassCode(),
  };
  await setDoc(doc(db, 'teachers', id), teacher);
  return teacher;
}

/** 로그인: 아이디+비밀번호 확인 */
export async function loginTeacher(id: string, password: string): Promise<Teacher | null> {
  const snap = await getDoc(doc(db, 'teachers', id));
  if (!snap.exists()) return null;
  const teacher = snap.data() as Teacher;
  if (teacher.password !== password) return null;
  return teacher;
}

export async function updateTeacherPassword(id: string, newPassword: string): Promise<void> {
  await updateDoc(doc(db, 'teachers', id), { password: newPassword });
}

export async function updateTeacherApiKeys(
  id: string,
  geminiApiKey: string,
  pixabayApiKey: string,
): Promise<void> {
  await updateDoc(doc(db, 'teachers', id), { geminiApiKey, pixabayApiKey });
}

export async function getTeacherByClassCode(classCode: string): Promise<Teacher | null> {
  const q = query(
    collection(db, 'teachers'),
    where('classCode', '==', classCode.toUpperCase().trim()),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data() as Teacher;
}

// ─── 학생 ─────────────────────────────────────────────────────────────────────
export async function addStudent(
  teacherId: string,
  name: string,
  nativeLanguage: NativeLanguage,
  pin: string,
): Promise<Student> {
  const data: Omit<Student, 'id'> = {
    name,
    teacherId,
    nativeLanguage,
    pin,
    createdAt: Date.now(),
  };
  const ref = await addDoc(collection(db, 'students'), data);
  return { ...data, id: ref.id };
}

export async function getStudents(teacherId: string): Promise<Student[]> {
  const q = query(collection(db, 'students'), where('teacherId', '==', teacherId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ ...d.data(), id: d.id }) as Student);
}

export async function getStudentById(id: string): Promise<Student | null> {
  const snap = await getDoc(doc(db, 'students', id));
  return snap.exists() ? ({ ...snap.data(), id: snap.id } as Student) : null;
}

export async function deleteStudent(studentId: string): Promise<void> {
  await deleteDoc(doc(db, 'students', studentId));
}

export async function findStudent(
  teacherId: string,
  name: string,
  pin: string,
): Promise<Student | null> {
  const q = query(
    collection(db, 'students'),
    where('teacherId', '==', teacherId),
    where('name', '==', name),
    where('pin', '==', pin),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { ...snap.docs[0].data(), id: snap.docs[0].id } as Student;
}

// ─── 관리자 ───────────────────────────────────────────────────────────────────
const ADMIN_DOC = doc(db, 'config', 'admin');
const DEFAULT_ADMIN: AdminConfig = { password: '1234', geminiApiKey: '', pixabayApiKey: '' };

export async function getAdminConfig(): Promise<AdminConfig> {
  const snap = await getDoc(ADMIN_DOC);
  if (!snap.exists()) {
    await setDoc(ADMIN_DOC, DEFAULT_ADMIN);
    return DEFAULT_ADMIN;
  }
  return snap.data() as AdminConfig;
}

/** 관리자 로그인: 비밀번호 확인. 문서 없으면 초기 비밀번호로 생성 */
export async function loginAdmin(password: string): Promise<AdminConfig | null> {
  const snap = await getDoc(ADMIN_DOC);
  if (!snap.exists()) {
    if (password === DEFAULT_ADMIN.password) {
      await setDoc(ADMIN_DOC, DEFAULT_ADMIN);
      return DEFAULT_ADMIN;
    }
    return null;
  }
  const config = snap.data() as AdminConfig;
  if (config.password !== password) return null;
  return config;
}

export async function updateAdminPassword(newPassword: string): Promise<void> {
  await updateDoc(ADMIN_DOC, { password: newPassword });
}

export async function updateAdminApiKeys(geminiApiKey: string, pixabayApiKey: string): Promise<void> {
  await updateDoc(ADMIN_DOC, { geminiApiKey, pixabayApiKey });
}

// ─── 학생 진도 ─────────────────────────────────────────────────────────────────
export async function updateStudentProgress(
  studentId: string,
  updates: Partial<Pick<Student, 'level' | 'lastActivity' | 'wordsLearned' | 'quizzesTaken'>>,
): Promise<void> {
  await updateDoc(doc(db, 'students', studentId), updates);
}
