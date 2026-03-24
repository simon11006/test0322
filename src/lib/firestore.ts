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
import type { Teacher, Student, NativeLanguage, Level } from '../types';

// ─── 학급 코드 생성 ───────────────────────────────────────────────────────────
function generateClassCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// ─── 교사 ─────────────────────────────────────────────────────────────────────
export async function getTeacher(uid: string): Promise<Teacher | null> {
  const snap = await getDoc(doc(db, 'teachers', uid));
  return snap.exists() ? (snap.data() as Teacher) : null;
}

export async function createTeacher(uid: string, name: string, email: string): Promise<Teacher> {
  const teacher: Teacher = {
    uid,
    name,
    email,
    geminiApiKey: '',
    pixabayApiKey: '',
    classCode: generateClassCode(),
  };
  await setDoc(doc(db, 'teachers', uid), teacher);
  return teacher;
}

export async function updateTeacherApiKeys(
  uid: string,
  geminiApiKey: string,
  pixabayApiKey: string,
): Promise<void> {
  await updateDoc(doc(db, 'teachers', uid), { geminiApiKey, pixabayApiKey });
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

export async function updateStudentProgress(
  studentId: string,
  updates: Partial<Pick<Student, 'level' | 'lastActivity' | 'wordsLearned' | 'quizzesTaken'>>,
): Promise<void> {
  await updateDoc(doc(db, 'students', studentId), updates);
}
