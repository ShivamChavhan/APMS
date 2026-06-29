export type Priority = 'high' | 'medium' | 'low';
export type AssignmentStatus = 'pending' | 'completed';
export type AttendanceStatus = 'present' | 'absent' | 'cancelled';
export type ExamType = 'midterm' | 'endsem' | 'practical' | 'quiz' | 'test';
export type EventType = 'holiday' | 'exam' | 'practical' | 'event' | 'academic';
export type UserRole = 'admin' | 'student';

export interface Role {
  id: string;
  name: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface AcademicSemester {
  id: string;
  name: string; // e.g. "Semester 1", "Semester 2"
  departmentId: string;
  academicYear: string; // e.g. "2026-2027"
  attendanceRequirement: number; // e.g. 75
  published: boolean;
}

export interface Division {
  id: string;
  name: string; // e.g. "Division A", "Division B"
  semesterId: string;
}

export interface Batch {
  id: string;
  name: string; // e.g. "Batch 1", "Batch 2"
  divisionId: string;
}

export interface Faculty {
  id: string;
  name: string;
  email: string;
  departmentId: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId?: string;
  semesterId?: string;
  divisionId?: string;
  batchId?: string;
  rollNumber: string;
  avatarUrl?: string;
  departmentName?: string;
  semesterName?: string;
  divisionName?: string;
  batchName?: string;
}

export interface AdminStudent {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  departmentId: string;
  departmentName: string;
  semesterId: string;
  semesterName: string;
  divisionId: string;
  divisionName: string;
  batchId: string;
  batchName: string;
  registeredAt: string;
  accountStatus: 'active' | 'inactive';
  attendancePercent: number;
  cgpa: number;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  credit: number;
  facultyId: string;
  facultyName?: string;
  semesterId: string;
  isPractical: boolean;
  attendancePresent: number;
  attendanceTotal: number;
  attendanceMinRequired: number; // e.g. 75
  internalMarks: number; // Max 40
  internalMax: number;
  practicalMarks: number; // Max 60
  practicalMax: number;
  semesterMarks: number; // Max 100
  semesterMax: number;
  grade?: string; // e.g. 'O', 'A+', 'A'
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  subjectId: string;
  subjectName?: string;
  subjectCode?: string;
  date: string; // ISO string YYYY-MM-DD
  status: AttendanceStatus;
}

export interface TimetableSlot {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  subjectId: string;
  subjectName?: string;
  subjectCode?: string;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  room: string;
  facultyId: string;
  facultyName?: string;
  divisionId: string;
  batchId?: string;
}

export interface Assignment {
  id: string;
  studentId: string;
  title: string;
  subjectId: string;
  subjectName?: string;
  dueDate: string; // YYYY-MM-DD
  priority: Priority;
  status: AssignmentStatus;
  description?: string;
}

export interface Exam {
  id: string;
  subjectId: string;
  subjectName: string; // or code
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  room: string;
  type: ExamType;
  semesterId: string;
}

export interface AcademicEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  type: EventType;
  description?: string;
  semesterId: string;
}

export interface SemesterResult {
  id: string;
  studentId: string;
  semesterNo: number;
  sgpa: number;
  cgpa: number;
  creditsEarned: number;
  totalCredits: number;
}

export interface APMSData {
  profile: UserProfile;
  subjects: Subject[];
  attendanceRecords: AttendanceRecord[];
  timetable: TimetableSlot[];
  assignments: Assignment[];
  exams: Exam[];
  events: AcademicEvent[];
  results: SemesterResult[];
  
  // Admin-specific lists for management dashboard (client state cache)
  departments?: Department[];
  semesters?: AcademicSemester[];
  divisions?: Division[];
  batches?: Batch[];
  facultyList?: Faculty[];
  allStudentsCount?: number;
}
