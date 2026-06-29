import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  APMSData, Subject, AttendanceRecord, TimetableSlot, 
  Assignment, Exam, AcademicEvent, SemesterResult, UserProfile, AttendanceStatus,
  Department, AcademicSemester, Division, Batch, Faculty
} from '../types';

interface AuthState {
  isAuthenticated: boolean;
  userEmail: string | null;
  username: string | null;
  role: 'admin' | 'student';
  userId: string | null;
}

interface AdminStats {
  studentsCount: number;
  departmentsCount: number;
  subjectsCount: number;
  averageAttendance: number;
  logs: { id: string; date: string; description: string; type: string }[];
}

interface APMSContextType {
  data: APMSData;
  auth: AuthState;
  loading: boolean;
  error: string | null;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (payload: {
    email: string;
    name: string;
    role: 'admin' | 'student';
    departmentId?: string;
    semesterId?: string;
    divisionId?: string;
    batchId?: string;
    rollNumber?: string;
    password?: string;
  }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  
  // Student core operations
  logAttendance: (subjectId: string, status: AttendanceStatus, date?: string) => Promise<void>;
  deleteAttendanceRecord: (recordId: string) => Promise<void>;
  addAssignment: (assignment: Omit<Assignment, 'id' | 'studentId'>) => Promise<void>;
  updateAssignment: (id: string, assignment: Partial<Assignment>) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;
  addSemesterResult: (result: Omit<SemesterResult, 'id' | 'studentId'>) => Promise<void>;
  updateSemesterResult: (id: string, result: Partial<SemesterResult>) => Promise<void>;
  deleteSemesterResult: (id: string) => Promise<void>;

  // Admin Specific Lists & Data
  adminStats: AdminStats | null;
  departments: Department[];
  semesters: AcademicSemester[];
  divisions: Division[];
  batches: Batch[];
  facultyList: Faculty[];
  allSubjects: Subject[];
  allTimetableSlots: TimetableSlot[];
  allExams: Exam[];
  allEvents: AcademicEvent[];
  
  // Admin Operations
  fetchAdminData: () => Promise<void>;
  addDepartment: (dept: { name: string; code: string }) => Promise<void>;
  deleteDepartment: (id: string) => Promise<void>;
  addSemester: (sem: { name: string; departmentId: string; academicYear: string; attendanceRequirement: number }) => Promise<void>;
  deleteSemester: (id: string) => Promise<void>;
  publishSemester: (semesterId: string) => Promise<void>;
  addDivision: (div: { name: string; semesterId: string }) => Promise<void>;
  deleteDivision: (id: string) => Promise<void>;
  addBatch: (batch: { name: string; divisionId: string }) => Promise<void>;
  deleteBatch: (id: string) => Promise<void>;
  addFaculty: (fac: { name: string; email: string; departmentId: string }) => Promise<void>;
  deleteFaculty: (id: string) => Promise<void>;
  
  // Admin Subject, Timetable, Exam, Event Operations
  addSubject: (subject: { name: string; code: string; credit: number; facultyId: string; semesterId: string; isPractical: boolean; attendanceMinRequired: number }) => Promise<void>;
  updateSubject: (id: string, subject: Partial<Subject>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  addTimetableSlot: (slot: Omit<TimetableSlot, 'id'>) => Promise<void>;
  updateTimetableSlot: (id: string, slot: Partial<TimetableSlot>) => Promise<void>;
  deleteTimetableSlot: (id: string) => Promise<void>;
  addExam: (exam: Omit<Exam, 'id'>) => Promise<void>;
  updateExam: (id: string, exam: Partial<Exam>) => Promise<void>;
  deleteExam: (id: string) => Promise<void>;
  addEvent: (event: Omit<AcademicEvent, 'id'>) => Promise<void>;
  updateEvent: (id: string, event: Partial<AcademicEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  
  // Document Extraction PDF
  bulkImportAAP: (extracted: { subjects: any[]; exams: any[]; events: any[] }) => Promise<void>;
  
  // Calculations
  getAttendanceStats: (subject: Subject) => {
    percentage: number;
    status: 'good' | 'warning' | 'critical';
    message: string;
    classesToAttend: number;
    classesCanMiss: number;
  };
  getCGPA: () => number;
}

const APMSContext = createContext<APMSContextType | undefined>(undefined);

export function APMSProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(() => {
    const saved = localStorage.getItem('apms_auth');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return { isAuthenticated: false, userEmail: null, username: null, role: 'student', userId: null };
  });

  const [data, setData] = useState<APMSData>({
    profile: { id: "", name: "", email: "", role: "student", rollNumber: "" },
    subjects: [],
    attendanceRecords: [],
    timetable: [],
    assignments: [],
    exams: [],
    events: [],
    results: []
  });

  // Admin specific lists
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [semesters, setSemesters] = useState<AcademicSemester[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [allTimetableSlots, setAllTimetableSlots] = useState<TimetableSlot[]>([]);
  const [allExams, setAllExams] = useState<Exam[]>([]);
  const [allEvents, setAllEvents] = useState<AcademicEvent[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync auth state to local storage
  useEffect(() => {
    localStorage.setItem('apms_auth', JSON.stringify(auth));
  }, [auth]);

  // Load student dashboard data
  const fetchStudentData = async (userId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/student/dashboard-data?userId=${userId}`);
      if (!res.ok) throw new Error("Failed to load dashboard data");
      const result = await res.json();
      setData(result);
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch student profile data.");
    } finally {
      setLoading(false);
    }
  };

  // Load admin data lists
  const fetchAdminData = async () => {
    try {
      const [statsRes, deptsRes, semsRes, divsRes, batsRes, facsRes, subsRes, ttRes, exRes, evRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/departments"),
        fetch("/api/admin/semesters"),
        fetch("/api/admin/divisions"),
        fetch("/api/admin/batches"),
        fetch("/api/admin/faculty"),
        fetch("/api/admin/subjects"),
        fetch("/api/admin/timetable"),
        fetch("/api/admin/exams"),
        fetch("/api/admin/calendar")
      ]);

      if (statsRes.ok) setAdminStats(await statsRes.json());
      if (deptsRes.ok) setDepartments(await deptsRes.json());
      if (semsRes.ok) setSemesters(await semsRes.json());
      if (divsRes.ok) setDivisions(await divsRes.json());
      if (batsRes.ok) setBatches(await batsRes.json());
      if (facsRes.ok) setFacultyList(await facsRes.json());
      if (subsRes.ok) setAllSubjects(await subsRes.json());
      if (ttRes.ok) setAllTimetableSlots(await ttRes.json());
      if (exRes.ok) setAllExams(await exRes.json());
      if (evRes.ok) setAllEvents(await evRes.json());
    } catch (err) {
      console.error("Failed to load admin lists:", err);
    }
  };

  // Trigger loading when auth changes
  useEffect(() => {
    if (auth.isAuthenticated && auth.userId) {
      if (auth.role === 'student') {
        fetchStudentData(auth.userId);
      } else if (auth.role === 'admin') {
        fetchAdminData();
      }
    }
  }, [auth.isAuthenticated, auth.userId, auth.role]);

  // Auth Operations
  const login = async (email: string, password?: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: password || "password" })
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Login failed");
      }

      const { user } = await response.json();
      setAuth({
        isAuthenticated: true,
        userEmail: user.email,
        username: user.name,
        role: user.role,
        userId: user.id
      });
      return true;
    } catch (err: any) {
      setError(err.message || "Login failed. Check your credentials.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: {
    email: string;
    name: string;
    role: 'admin' | 'student';
    departmentId?: string;
    semesterId?: string;
    divisionId?: string;
    batchId?: string;
    rollNumber?: string;
    password?: string;
  }): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          password: payload.password || "password"
        })
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Registration failed");
      }

      // Automatically log them in
      await login(payload.email, payload.password || "password");
      return true;
    } catch (err: any) {
      setError(err.message || "Registration failed.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setAuth({ isAuthenticated: false, userEmail: null, username: null, role: 'student', userId: null });
    setData({
      profile: { id: "", name: "", email: "", role: "student", rollNumber: "" },
      subjects: [],
      attendanceRecords: [],
      timetable: [],
      assignments: [],
      exams: [],
      events: [],
      results: []
    });
  };

  const updateProfile = async (profileUpdate: Partial<UserProfile>) => {
    if (!auth.userId) return;
    try {
      const res = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: auth.userId,
          ...profileUpdate
        })
      });
      if (res.ok) {
        if (profileUpdate.name) {
          setAuth(prev => ({ ...prev, username: profileUpdate.name! }));
        }
        if (auth.role === 'student') {
          fetchStudentData(auth.userId);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- Student Operations ---
  const logAttendance = async (subjectId: string, status: AttendanceStatus, dateInput?: string) => {
    if (!auth.userId) return;
    const date = dateInput || new Date().toISOString().split('T')[0];
    try {
      const res = await fetch('/api/student/log-attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: auth.userId, subjectId, date, status })
      });
      if (res.ok) {
        fetchStudentData(auth.userId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteAttendanceRecord = async (recordId: string) => {
    if (!auth.userId) return;
    try {
      const res = await fetch(`/api/student/attendance/${recordId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: auth.userId })
      });
      if (res.ok) {
        fetchStudentData(auth.userId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addAssignment = async (asg: Omit<Assignment, 'id' | 'studentId'>) => {
    if (!auth.userId) return;
    try {
      const res = await fetch('/api/student/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: auth.userId, ...asg })
      });
      if (res.ok) {
        fetchStudentData(auth.userId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateAssignment = async (id: string, fields: Partial<Assignment>) => {
    if (!auth.userId) return;
    try {
      const res = await fetch(`/api/student/assignments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: auth.userId, ...fields })
      });
      if (res.ok) {
        fetchStudentData(auth.userId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteAssignment = async (id: string) => {
    if (!auth.userId) return;
    try {
      const res = await fetch(`/api/student/assignments/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: auth.userId })
      });
      if (res.ok) {
        fetchStudentData(auth.userId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addSemesterResult = async (result: Omit<SemesterResult, 'id' | 'studentId'>) => {
    if (!auth.userId) return;
    try {
      const res = await fetch('/api/student/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: auth.userId, ...result })
      });
      if (res.ok) {
        fetchStudentData(auth.userId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateSemesterResult = async (id: string, fields: Partial<SemesterResult>) => {
    if (!auth.userId) return;
    try {
      const res = await fetch(`/api/student/results/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: auth.userId, ...fields })
      });
      if (res.ok) {
        fetchStudentData(auth.userId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteSemesterResult = async (id: string) => {
    if (!auth.userId) return;
    try {
      const res = await fetch(`/api/student/results/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: auth.userId })
      });
      if (res.ok) {
        fetchStudentData(auth.userId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- Admin CRUD Operations ---
  const addDepartment = async (dept: { name: string; code: string }) => {
    const res = await fetch("/api/admin/departments", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dept)
    });
    if (res.ok) fetchAdminData();
  };

  const deleteDepartment = async (id: string) => {
    const res = await fetch(`/api/admin/departments/${id}`, { method: 'DELETE' });
    if (res.ok) fetchAdminData();
  };

  const addSemester = async (sem: { name: string; departmentId: string; academicYear: string; attendanceRequirement: number }) => {
    const res = await fetch("/api/admin/semesters", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sem)
    });
    if (res.ok) fetchAdminData();
  };

  const deleteSemester = async (id: string) => {
    const res = await fetch(`/api/admin/semesters/${id}`, { method: 'DELETE' });
    if (res.ok) fetchAdminData();
  };

  const publishSemester = async (semesterId: string) => {
    const res = await fetch("/api/admin/publish-semester", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ semesterId })
    });
    if (res.ok) fetchAdminData();
  };

  const addDivision = async (div: { name: string; semesterId: string }) => {
    const res = await fetch("/api/admin/divisions", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(div)
    });
    if (res.ok) fetchAdminData();
  };

  const deleteDivision = async (id: string) => {
    const res = await fetch(`/api/admin/divisions/${id}`, { method: 'DELETE' });
    if (res.ok) fetchAdminData();
  };

  const addBatch = async (batch: { name: string; divisionId: string }) => {
    const res = await fetch("/api/admin/batches", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batch)
    });
    if (res.ok) fetchAdminData();
  };

  const deleteBatch = async (id: string) => {
    const res = await fetch(`/api/admin/batches/${id}`, { method: 'DELETE' });
    if (res.ok) fetchAdminData();
  };

  const addFaculty = async (fac: { name: string; email: string; departmentId: string }) => {
    const res = await fetch("/api/admin/faculty", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fac)
    });
    if (res.ok) fetchAdminData();
  };

  const deleteFaculty = async (id: string) => {
    const res = await fetch(`/api/admin/faculty/${id}`, { method: 'DELETE' });
    if (res.ok) fetchAdminData();
  };

  const addSubject = async (sub: { name: string; code: string; credit: number; facultyId: string; semesterId: string; isPractical: boolean; attendanceMinRequired: number }) => {
    const res = await fetch("/api/admin/subjects", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub)
    });
    if (res.ok) fetchAdminData();
  };

  const updateSubject = async (id: string, sub: Partial<Subject>) => {
    const res = await fetch(`/api/admin/subjects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub)
    });
    if (res.ok) fetchAdminData();
  };

  const deleteSubject = async (id: string) => {
    const res = await fetch(`/api/admin/subjects/${id}`, { method: 'DELETE' });
    if (res.ok) fetchAdminData();
  };

  const addTimetableSlot = async (slot: Omit<TimetableSlot, 'id'>) => {
    const res = await fetch("/api/admin/timetable", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slot)
    });
    if (res.ok) fetchAdminData();
  };

  const updateTimetableSlot = async (id: string, slot: Partial<TimetableSlot>) => {
    const res = await fetch(`/api/admin/timetable/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slot)
    });
    if (res.ok) fetchAdminData();
  };

  const deleteTimetableSlot = async (id: string) => {
    const res = await fetch(`/api/admin/timetable/${id}`, { method: 'DELETE' });
    if (res.ok) fetchAdminData();
  };

  const addExam = async (exam: Omit<Exam, 'id'>) => {
    const res = await fetch("/api/admin/exams", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exam)
    });
    if (res.ok) fetchAdminData();
  };

  const updateExam = async (id: string, exam: Partial<Exam>) => {
    const res = await fetch(`/api/admin/exams/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exam)
    });
    if (res.ok) fetchAdminData();
  };

  const deleteExam = async (id: string) => {
    const res = await fetch(`/api/admin/exams/${id}`, { method: 'DELETE' });
    if (res.ok) fetchAdminData();
  };

  const addEvent = async (ev: Omit<AcademicEvent, 'id'>) => {
    const res = await fetch("/api/admin/calendar", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ev)
    });
    if (res.ok) fetchAdminData();
  };

  const updateEvent = async (id: string, ev: Partial<AcademicEvent>) => {
    const res = await fetch(`/api/admin/calendar/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ev)
    });
    if (res.ok) fetchAdminData();
  };

  const deleteEvent = async (id: string) => {
    const res = await fetch(`/api/admin/calendar/${id}`, { method: 'DELETE' });
    if (res.ok) fetchAdminData();
  };

  // Bulk import extracted data (for Admin editing context)
  const bulkImportAAP = async (extracted: { subjects: any[]; exams: any[]; events: any[] }) => {
    // We can do this on the admin screen directly by updating cache, or posting
    console.log("Extracted items received: ", extracted);
  };

  // Calculations
  const getAttendanceStats = (subject: Subject) => {
    const total = subject.attendanceTotal;
    const present = subject.attendancePresent;
    const minRequired = subject.attendanceMinRequired;
    
    const percentage = total > 0 ? Math.round((present / total) * 100) : 100;
    
    let status: 'good' | 'warning' | 'critical' = 'good';
    if (percentage < minRequired) {
      status = 'critical';
    } else if (percentage < minRequired + 5) {
      status = 'warning';
    }

    let message = "";
    let classesToAttend = 0;
    let classesCanMiss = 0;

    if (percentage < minRequired) {
      const target = minRequired / 100;
      classesToAttend = Math.ceil((total * target - present) / (1 - target));
      message = `Attendance below threshold (${minRequired}%). You must attend the next ${classesToAttend} classes consecutively to recover.`;
    } else {
      const target = minRequired / 100;
      classesCanMiss = Math.floor((present - total * target) / target);
      if (classesCanMiss > 0) {
        message = `Nice! You can safely miss the next ${classesCanMiss} classes and still stay above ${minRequired}%.`;
      } else {
        message = `You are exactly on the line. You cannot afford to miss any upcoming classes.`;
      }
    }

    return {
      percentage,
      status,
      message,
      classesToAttend: Math.max(0, classesToAttend),
      classesCanMiss: Math.max(0, classesCanMiss)
    };
  };

  const getCGPA = () => {
    if (data.results.length === 0) return 0;
    const totalEarned = data.results.reduce((acc, curr) => acc + (curr.sgpa * curr.creditsEarned), 0);
    const totalCredits = data.results.reduce((acc, curr) => acc + curr.creditsEarned, 0);
    return totalCredits > 0 ? Number((totalEarned / totalCredits).toFixed(2)) : 0;
  };

  return (
    <APMSContext.Provider value={{
      data,
      auth,
      loading,
      error,
      login,
      register,
      logout,
      updateProfile,
      logAttendance,
      deleteAttendanceRecord,
      addAssignment,
      updateAssignment,
      deleteAssignment,
      addSemesterResult,
      updateSemesterResult,
      deleteSemesterResult,
      
      adminStats,
      departments,
      semesters,
      divisions,
      batches,
      facultyList,
      allSubjects,
      allTimetableSlots,
      allExams,
      allEvents,
      
      fetchAdminData,
      addDepartment,
      deleteDepartment,
      addSemester,
      deleteSemester,
      publishSemester,
      addDivision,
      deleteDivision,
      addBatch,
      deleteBatch,
      addFaculty,
      deleteFaculty,
      addSubject,
      updateSubject,
      deleteSubject,
      addTimetableSlot,
      updateTimetableSlot,
      deleteTimetableSlot,
      addExam,
      updateExam,
      deleteExam,
      addEvent,
      updateEvent,
      deleteEvent,
      
      bulkImportAAP,
      getAttendanceStats,
      getCGPA
    }}>
      {children}
    </APMSContext.Provider>
  );
}

export function useAPMS() {
  const context = useContext(APMSContext);
  if (!context) {
    throw new Error('useAPMS must be used within an APMSProvider');
  }
  return context;
}
