import fs from 'fs';
import path from 'path';

export interface DBUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string; // "password" for simplicity
  role: 'admin' | 'student';
}

export interface DBDepartment {
  id: string;
  name: string;
  code: string;
}

export interface DBSemester {
  id: string;
  name: string; // e.g., "Semester 5"
  departmentId: string;
  academicYear: string; // e.g., "2026-2027"
  attendanceRequirement: number; // e.g., 75
  published: boolean;
}

export interface DBDivision {
  id: string;
  name: string; // e.g., "Division A"
  semesterId: string;
}

export interface DBBatch {
  id: string;
  name: string; // e.g., "Batch 1"
  divisionId: string;
}

export interface DBFaculty {
  id: string;
  name: string;
  email: string;
  departmentId: string;
}

export interface DBSubject {
  id: string;
  name: string;
  code: string;
  credit: number;
  facultyId: string;
  semesterId: string;
  isPractical: boolean;
  attendanceMinRequired: number;
}

export interface DBTimetableSlot {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  subjectId: string;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  room: string;
  facultyId: string;
  divisionId: string;
  batchId?: string | null;
  sessionType?: string;
}

export interface DBAcademicEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  type: 'holiday' | 'exam' | 'practical' | 'event' | 'academic';
  description?: string;
  semesterId: string;
}

export interface DBExam {
  id: string;
  subjectId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  room: string;
  type: 'midterm' | 'endsem' | 'practical' | 'quiz' | 'test';
  semesterId: string;
}

export interface DBAssignment {
  id: string;
  studentId: string;
  title: string;
  subjectId: string;
  dueDate: string; // YYYY-MM-DD
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed';
  description?: string;
}

export interface DBAttendance {
  id: string;
  studentId: string;
  subjectId: string;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent' | 'cancelled';
}

export interface DBMarks {
  id: string;
  studentId: string;
  subjectId: string;
  internalMarks: number;
  internalMax: number;
  practicalMarks: number;
  practicalMax: number;
  semesterMarks: number;
  semesterMax: number;
  grade?: string;
}

export interface DBStudentProfile {
  id: string;
  userId: string;
  departmentId: string;
  semesterId: string;
  divisionId: string;
  batchId?: string;
  rollNumber: string;
  avatarUrl?: string;
  registeredAt?: string;
  accountStatus?: 'active' | 'inactive';
}

export interface DBResult {
  id: string;
  studentId: string;
  semesterNo: number;
  sgpa: number;
  cgpa: number;
  creditsEarned: number;
  totalCredits: number;
}

export interface APMSDatabaseSchema {
  users: DBUser[];
  departments: DBDepartment[];
  semesters: DBSemester[];
  divisions: DBDivision[];
  batches: DBBatch[];
  faculty: DBFaculty[];
  subjects: DBSubject[];
  timetable: DBTimetableSlot[];
  academicCalendar: DBAcademicEvent[];
  exams: DBExam[];
  assignments: DBAssignment[];
  attendance: DBAttendance[];
  marks: DBMarks[];
  studentProfiles: DBStudentProfile[];
  results: DBResult[];
  activityLogs: { id: string; date: string; description: string; type: string }[];
}

const DB_FILE = path.join(process.cwd(), 'db.json');

export class APMSDatabase {
  private schema: APMSDatabaseSchema;

  constructor() {
    this.schema = this.load();
  }

  private load(): APMSDatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      } catch (err) {
        console.error("Failed to parse db.json, generating default database structure:", err);
      }
    }
    const defaultSchema = this.generateDefaultSchema();
    this.saveSchema(defaultSchema);
    return defaultSchema;
  }

  public save(): void {
    this.saveSchema(this.schema);
  }

  private saveSchema(data: APMSDatabaseSchema): void {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error("Failed to write db.json:", err);
    }
  }

  private generateDefaultSchema(): APMSDatabaseSchema {
    return {
      users: [
        { id: "u-admin", email: "admin@apms.edu", name: "Admin Professor", passwordHash: "password", role: "admin" },
        { id: "u-shivam", email: "shivamchavhan225@gmail.com", name: "Shivam Chavhan", passwordHash: "password", role: "student" },
        { id: "u-student", email: "student@apms.edu", name: "John Doe", passwordHash: "password", role: "student" }
      ],
      departments: [
        { id: "dept-cs", name: "Computer Science & Engineering", code: "CSE" },
        { id: "dept-ee", name: "Electrical Engineering", code: "EE" },
        { id: "dept-me", name: "Mechanical Engineering", code: "ME" }
      ],
      semesters: [
        { id: "sem-cs-5", name: "Semester 5", departmentId: "dept-cs", academicYear: "2026-2027", attendanceRequirement: 75, published: true },
        { id: "sem-cs-6", name: "Semester 6", departmentId: "dept-cs", academicYear: "2026-2027", attendanceRequirement: 75, published: false }
      ],
      divisions: [
        { id: "div-cs-5-a", name: "Division A", semesterId: "sem-cs-5" },
        { id: "div-cs-5-b", name: "Division B", semesterId: "sem-cs-5" }
      ],
      batches: [
        { id: "batch-cs-5-a1", name: "Batch A1", divisionId: "div-cs-5-a" },
        { id: "batch-cs-5-a2", name: "Batch A2", divisionId: "div-cs-5-a" }
      ],
      faculty: [
        { id: "fac-1", name: "Dr. Ananya Rao", email: "rao@apms.edu", departmentId: "dept-cs" },
        { id: "fac-2", name: "Prof. Rajesh Kumar", email: "kumar@apms.edu", departmentId: "dept-cs" },
        { id: "fac-3", name: "Dr. Sarah D'Souza", email: "dsouza@apms.edu", departmentId: "dept-cs" },
        { id: "fac-4", name: "Mr. Vicky Patil", email: "patil@apms.edu", departmentId: "dept-cs" },
        { id: "fac-5", name: "Prof. Amit Verma", email: "verma@apms.edu", departmentId: "dept-cs" }
      ],
      subjects: [
        { id: "sub-1", name: "Database Management Systems", code: "CS301", credit: 4, facultyId: "fac-1", semesterId: "sem-cs-5", isPractical: false, attendanceMinRequired: 75 },
        { id: "sub-2", name: "Computer Networks", code: "CS302", credit: 4, facultyId: "fac-2", semesterId: "sem-cs-5", isPractical: false, attendanceMinRequired: 75 },
        { id: "sub-3", name: "Software Engineering", code: "CS303", credit: 3, facultyId: "fac-3", semesterId: "sem-cs-5", isPractical: false, attendanceMinRequired: 75 },
        { id: "sub-4", name: "Web Technologies Lab", code: "CS304", credit: 2, facultyId: "fac-4", semesterId: "sem-cs-5", isPractical: true, attendanceMinRequired: 75 },
        { id: "sub-5", name: "Artificial Intelligence", code: "CS305", credit: 3, facultyId: "fac-5", semesterId: "sem-cs-5", isPractical: false, attendanceMinRequired: 75 }
      ],
      timetable: [
        { id: "tt-1", day: "Monday", subjectId: "sub-1", startTime: "09:00", endTime: "10:00", room: "LH-201", facultyId: "fac-1", divisionId: "div-cs-5-a", batchId: null },
        { id: "tt-2", day: "Monday", subjectId: "sub-2", startTime: "10:15", endTime: "11:15", room: "LH-202", facultyId: "fac-2", divisionId: "div-cs-5-a", batchId: null },
        { id: "tt-3", day: "Monday", subjectId: "sub-5", startTime: "11:30", endTime: "12:30", room: "LH-305", facultyId: "fac-5", divisionId: "div-cs-5-a", batchId: null },
        { id: "tt-4", day: "Tuesday", subjectId: "sub-3", startTime: "09:00", endTime: "10:00", room: "LH-104", facultyId: "fac-3", divisionId: "div-cs-5-a", batchId: null },
        { id: "tt-5", day: "Tuesday", subjectId: "sub-4", startTime: "14:00", endTime: "16:00", room: "Lab-4", facultyId: "fac-4", divisionId: "div-cs-5-a", batchId: "batch-cs-5-a1" },
        { id: "tt-6", day: "Wednesday", subjectId: "sub-1", startTime: "09:00", endTime: "10:00", room: "LH-201", facultyId: "fac-1", divisionId: "div-cs-5-a", batchId: null },
        { id: "tt-7", day: "Wednesday", subjectId: "sub-2", startTime: "10:15", endTime: "11:15", room: "LH-202", facultyId: "fac-2", divisionId: "div-cs-5-a", batchId: null },
        { id: "tt-8", day: "Wednesday", subjectId: "sub-5", startTime: "11:30", endTime: "12:30", room: "LH-305", facultyId: "fac-5", divisionId: "div-cs-5-a", batchId: null },
        { id: "tt-9", day: "Thursday", subjectId: "sub-3", startTime: "09:00", endTime: "10:00", room: "LH-104", facultyId: "fac-3", divisionId: "div-cs-5-a", batchId: null },
        { id: "tt-10", day: "Friday", subjectId: "sub-2", startTime: "10:15", endTime: "11:15", room: "LH-202", facultyId: "fac-2", divisionId: "div-cs-5-a", batchId: null },
        { id: "tt-11", day: "Friday", subjectId: "sub-5", startTime: "11:30", endTime: "12:30", room: "LH-305", facultyId: "fac-5", divisionId: "div-cs-5-a", batchId: null }
      ],
      academicCalendar: [
        { id: "ev-1", title: "Midterm Exams (MSE)", date: "2026-07-01", type: "exam", description: "Mid-semester evaluation written exams.", semesterId: "sem-cs-5" },
        { id: "ev-2", title: "Practical Labs Assessment", date: "2026-07-12", type: "practical", description: "Final practical session evaluation and external viva voce.", semesterId: "sem-cs-5" },
        { id: "ev-3", title: "Independence Day Holiday", date: "2026-08-15", type: "holiday", description: "National Holiday.", semesterId: "sem-cs-5" },
        { id: "ev-4", title: "Tech-Fest 2026 (Syntra)", date: "2026-07-08", type: "event", description: "Annual department tech-fest and coding hackathon.", semesterId: "sem-cs-5" }
      ],
      exams: [
        { id: "ex-1", subjectId: "sub-1", date: "2026-07-15", time: "10:00", room: "Exam Hall A", type: "endsem", semesterId: "sem-cs-5" },
        { id: "ex-2", subjectId: "sub-2", date: "2026-07-17", time: "10:00", room: "Exam Hall A", type: "endsem", semesterId: "sem-cs-5" },
        { id: "ex-3", subjectId: "sub-3", date: "2026-07-19", time: "14:00", room: "LH-104", type: "endsem", semesterId: "sem-cs-5" },
        { id: "ex-4", subjectId: "sub-5", date: "2026-07-22", time: "10:00", room: "Exam Hall B", type: "endsem", semesterId: "sem-cs-5" }
      ],
      assignments: [
        { id: "as-1", studentId: "u-student", title: "Normalization & SQL Queries Assignment", subjectId: "sub-1", dueDate: "2026-07-02", priority: "high", status: "pending", description: "Design a relational database and write answers for normalization questions." },
        { id: "as-2", studentId: "u-student", title: "IP Subnetting and Routing Lab Report", subjectId: "sub-2", dueDate: "2026-07-05", priority: "medium", status: "pending", description: "Calculate IPv4 subnet addresses, masks, and ranges." },
        { id: "as-3", studentId: "u-student", title: "SRS Document Draft", subjectId: "sub-3", dueDate: "2026-06-30", priority: "high", status: "completed", description: "Draft the SRS for the selected project using IEEE 830 standard." },
        { id: "as-4", studentId: "u-student", title: "Full-Stack React Student Dashboard", subjectId: "sub-4", dueDate: "2026-07-10", priority: "high", status: "pending", description: "Create a fully functional React SPA dashboard." }
      ],
      attendance: [
        { id: "att-1", studentId: "u-student", subjectId: "sub-1", date: "2026-06-22", status: "present" },
        { id: "att-2", studentId: "u-student", subjectId: "sub-1", date: "2026-06-23", status: "present" },
        { id: "att-3", studentId: "u-student", subjectId: "sub-1", date: "2026-06-24", status: "present" },
        { id: "att-4", studentId: "u-student", subjectId: "sub-1", date: "2026-06-25", status: "absent" },
        { id: "att-5", studentId: "u-student", subjectId: "sub-2", date: "2026-06-22", status: "present" },
        { id: "att-6", studentId: "u-student", subjectId: "sub-2", date: "2026-06-24", status: "present" },
        { id: "att-7", studentId: "u-student", subjectId: "sub-2", date: "2026-06-26", status: "absent" },
        { id: "att-8", studentId: "u-student", subjectId: "sub-3", date: "2026-06-23", status: "present" },
        { id: "att-9", studentId: "u-student", subjectId: "sub-3", date: "2026-06-25", status: "present" },
        { id: "att-10", studentId: "u-student", subjectId: "sub-4", date: "2026-06-23", status: "present" },
        { id: "att-11", studentId: "u-student", subjectId: "sub-5", date: "2026-06-22", status: "absent" },
        { id: "att-12", studentId: "u-student", subjectId: "sub-5", date: "2026-06-24", status: "absent" },
        { id: "att-13", studentId: "u-student", subjectId: "sub-5", date: "2026-06-26", status: "present" }
      ],
      marks: [
        { id: "mk-1", studentId: "u-student", subjectId: "sub-1", internalMarks: 34, internalMax: 40, practicalMarks: 0, practicalMax: 0, semesterMarks: 78, semesterMax: 100, grade: "A+" },
        { id: "mk-2", studentId: "u-student", subjectId: "sub-2", internalMarks: 31, internalMax: 40, practicalMarks: 0, practicalMax: 0, semesterMarks: 82, semesterMax: 100, grade: "A+" },
        { id: "mk-3", studentId: "u-student", subjectId: "sub-3", internalMarks: 36, internalMax: 40, practicalMarks: 0, practicalMax: 0, semesterMarks: 91, semesterMax: 100, grade: "O" },
        { id: "mk-4", studentId: "u-student", subjectId: "sub-4", internalMarks: 18, internalMax: 20, practicalMarks: 27, practicalMax: 30, semesterMarks: 45, semesterMax: 50, grade: "O" },
        { id: "mk-5", studentId: "u-student", subjectId: "sub-5", internalMarks: 25, internalMax: 40, practicalMarks: 0, practicalMax: 0, semesterMarks: 65, semesterMax: 100, grade: "B" }
      ],
      studentProfiles: [
        {
          id: "prof-shivam",
          userId: "u-shivam",
          departmentId: "dept-cs",
          semesterId: "sem-cs-5",
          divisionId: "div-cs-5-a",
          batchId: "batch-cs-5-a1",
          rollNumber: "CSE-2023-042",
          avatarUrl: ""
        },
        {
          id: "prof-student",
          userId: "u-student",
          departmentId: "dept-cs",
          semesterId: "sem-cs-5",
          divisionId: "div-cs-5-a",
          batchId: "batch-cs-5-a1",
          rollNumber: "CSE-2023-042",
          avatarUrl: ""
        }
      ],
      results: [
        { id: "res-1", studentId: "u-student", semesterNo: 1, sgpa: 8.8, cgpa: 8.8, creditsEarned: 22, totalCredits: 22 },
        { id: "res-2", studentId: "u-student", semesterNo: 2, sgpa: 8.95, cgpa: 8.88, creditsEarned: 24, totalCredits: 24 },
        { id: "res-3", studentId: "u-student", semesterNo: 3, sgpa: 8.6, cgpa: 8.78, creditsEarned: 22, totalCredits: 22 },
        { id: "res-4", studentId: "u-student", semesterNo: 4, sgpa: 9.12, cgpa: 8.86, creditsEarned: 20, totalCredits: 20 }
      ],
      activityLogs: [
        { id: "act-1", date: "2026-06-27T10:00:00Z", description: "Admin published Semester 5 for Department Computer Science & Engineering", type: "publish" },
        { id: "act-2", date: "2026-06-27T12:00:00Z", description: "Registered student Shivam Chavhan in CSE", type: "register" }
      ]
    };
  }

  // --- QUERY APIS ---

  public getUsers() { return this.schema.users; }
  public getDepartments() { return this.schema.departments; }
  public getSemesters() { return this.schema.semesters; }
  public getDivisions() { return this.schema.divisions; }
  public getBatches() { return this.schema.batches; }
  public getFaculty() { return this.schema.faculty; }
  public getSubjects() { return this.schema.subjects; }
  public getTimetable() { return this.schema.timetable; }
  public getCalendar() { return this.schema.academicCalendar; }
  public getExams() { return this.schema.exams; }
  public getAssignments() { return this.schema.assignments; }
  public getAttendance() { return this.schema.attendance; }
  public getMarks() { return this.schema.marks; }
  public getStudentProfiles() { return this.schema.studentProfiles; }
  public getResults() { return this.schema.results; }
  public getActivityLogs() { return this.schema.activityLogs; }

  // --- MUTATORS ---

  public logActivity(description: string, type: string) {
    this.schema.activityLogs.unshift({
      id: `act-${Date.now()}`,
      date: new Date().toISOString(),
      description,
      type
    });
    this.save();
  }

  // User Actions
  public createUser(user: Omit<DBUser, 'id'>): DBUser {
    const newUser = { ...user, id: `u-${Date.now()}` };
    this.schema.users.push(newUser);
    this.save();
    return newUser;
  }

  public createStudentProfile(profile: DBStudentProfile): void {
    this.schema.studentProfiles.push(profile);
    this.save();
  }

  public getProfileByUserId(userId: string) {
    return this.schema.studentProfiles.find(p => p.userId === userId);
  }

  // Admin Configs
  public addDepartment(dept: Omit<DBDepartment, 'id'>) {
    const id = `dept-${Date.now()}`;
    const newDept = { ...dept, id };
    this.schema.departments.push(newDept);
    this.save();
    return newDept;
  }

  public addSemester(sem: Omit<DBSemester, 'id' | 'published'>) {
    const id = `sem-${Date.now()}`;
    const newSem = { ...sem, id, published: false };
    this.schema.semesters.push(newSem);
    this.save();
    return newSem;
  }

  public addDivision(div: Omit<DBDivision, 'id'>) {
    const id = `div-${Date.now()}`;
    const newDiv = { ...div, id };
    this.schema.divisions.push(newDiv);
    this.save();
    return newDiv;
  }

  public addBatch(batch: Omit<DBBatch, 'id'>) {
    const id = `batch-${Date.now()}`;
    const newBatch = { ...batch, id };
    this.schema.batches.push(newBatch);
    this.save();
    return newBatch;
  }

  public addFaculty(fac: Omit<DBFaculty, 'id'>) {
    const id = `fac-${Date.now()}`;
    const newFac = { ...fac, id };
    this.schema.faculty.push(newFac);
    this.save();
    return newFac;
  }

  public addSubject(sub: Omit<DBSubject, 'id'>) {
    const id = `sub-${Date.now()}`;
    const newSub = { ...sub, id };
    this.schema.subjects.push(newSub);
    this.save();
    return newSub;
  }

  public updateSubject(id: string, fields: Partial<DBSubject>) {
    this.schema.subjects = this.schema.subjects.map(s => s.id === id ? { ...s, ...fields } : s);
    this.save();
  }

  public deleteDepartment(id: string) {
    this.schema.departments = this.schema.departments.filter(d => d.id !== id);
    const semIdsToRemove = this.schema.semesters.filter(s => s.departmentId === id).map(s => s.id);
    this.schema.semesters = this.schema.semesters.filter(s => s.departmentId !== id);
    
    const divIdsToRemove = this.schema.divisions.filter(div => semIdsToRemove.includes(div.semesterId)).map(div => div.id);
    this.schema.divisions = this.schema.divisions.filter(div => !semIdsToRemove.includes(div.semesterId));
    
    this.schema.batches = this.schema.batches.filter(b => !divIdsToRemove.includes(b.divisionId));
    this.schema.faculty = this.schema.faculty.filter(f => f.departmentId !== id);
    
    const subjectIdsToRemove = this.schema.subjects.filter(sub => semIdsToRemove.includes(sub.semesterId)).map(sub => sub.id);
    this.schema.subjects = this.schema.subjects.filter(sub => !semIdsToRemove.includes(sub.semesterId));
    
    this.schema.timetable = this.schema.timetable.filter(tt => !subjectIdsToRemove.includes(tt.subjectId));
    this.schema.exams = this.schema.exams.filter(ex => !subjectIdsToRemove.includes(ex.subjectId));
    this.save();
  }

  public deleteSemester(id: string) {
    this.schema.semesters = this.schema.semesters.filter(s => s.id !== id);
    const divIdsToRemove = this.schema.divisions.filter(d => d.semesterId === id).map(d => d.id);
    this.schema.divisions = this.schema.divisions.filter(d => d.semesterId !== id);
    this.schema.batches = this.schema.batches.filter(b => !divIdsToRemove.includes(b.divisionId));
    
    const subIds = this.schema.subjects.filter(s => s.semesterId === id).map(s => s.id);
    this.schema.subjects = this.schema.subjects.filter(s => s.semesterId !== id);
    this.schema.timetable = this.schema.timetable.filter(tt => !subIds.includes(tt.subjectId));
    this.schema.exams = this.schema.exams.filter(ex => !subIds.includes(ex.subjectId));
    this.save();
  }

  public deleteDivision(id: string) {
    this.schema.divisions = this.schema.divisions.filter(d => d.id !== id);
    this.schema.batches = this.schema.batches.filter(b => b.divisionId !== id);
    this.schema.timetable = this.schema.timetable.filter(tt => tt.divisionId !== id);
    this.save();
  }

  public deleteBatch(id: string) {
    this.schema.batches = this.schema.batches.filter(b => b.id !== id);
    this.schema.timetable = this.schema.timetable.map(tt => tt.batchId === id ? { ...tt, batchId: null } : tt);
    this.save();
  }

  public deleteFaculty(id: string) {
    this.schema.faculty = this.schema.faculty.filter(f => f.id !== id);
    this.schema.subjects = this.schema.subjects.map(s => s.facultyId === id ? { ...s, facultyId: "" } : s);
    this.schema.timetable = this.schema.timetable.map(tt => tt.facultyId === id ? { ...tt, facultyId: "" } : tt);
    this.save();
  }

  public deleteSubject(id: string) {
    this.schema.subjects = this.schema.subjects.filter(s => s.id !== id);
    this.schema.timetable = this.schema.timetable.filter(t => t.subjectId !== id);
    this.schema.exams = this.schema.exams.filter(e => e.subjectId !== id);
    this.schema.assignments = this.schema.assignments.filter(a => a.subjectId !== id);
    this.schema.attendance = this.schema.attendance.filter(a => a.subjectId !== id);
    this.schema.marks = this.schema.marks.filter(m => m.subjectId !== id);
    this.save();
  }

  public addTimetableSlot(slot: Omit<DBTimetableSlot, 'id'>) {
    const id = `tt-${Date.now()}`;
    const newSlot = { ...slot, id };
    this.schema.timetable.push(newSlot);
    this.save();
    return newSlot;
  }

  public updateTimetableSlot(id: string, fields: Partial<DBTimetableSlot>) {
    this.schema.timetable = this.schema.timetable.map(t => t.id === id ? { ...t, ...fields } : t);
    this.save();
  }

  public deleteTimetableSlot(id: string) {
    this.schema.timetable = this.schema.timetable.filter(t => t.id !== id);
    this.save();
  }

  public addCalendarEvent(event: Omit<DBAcademicEvent, 'id'>) {
    const id = `ev-${Date.now()}`;
    const newEvent = { ...event, id };
    this.schema.academicCalendar.push(newEvent);
    this.save();
    return newEvent;
  }

  public updateCalendarEvent(id: string, fields: Partial<DBAcademicEvent>) {
    this.schema.academicCalendar = this.schema.academicCalendar.map(e => e.id === id ? { ...e, ...fields } : e);
    this.save();
  }

  public deleteCalendarEvent(id: string) {
    this.schema.academicCalendar = this.schema.academicCalendar.filter(e => e.id !== id);
    this.save();
  }

  public addExam(exam: Omit<DBExam, 'id'>) {
    const id = `ex-${Date.now()}`;
    const newExam = { ...exam, id };
    this.schema.exams.push(newExam);
    this.save();
    return newExam;
  }

  public updateExam(id: string, fields: Partial<DBExam>) {
    this.schema.exams = this.schema.exams.map(e => e.id === id ? { ...e, ...fields } : e);
    this.save();
  }

  public deleteExam(id: string) {
    this.schema.exams = this.schema.exams.filter(e => e.id !== id);
    this.save();
  }

  // Publish Semester
  public publishSemester(semesterId: string): { success: boolean, count: number } {
    const semIndex = this.schema.semesters.findIndex(s => s.id === semesterId);
    if (semIndex === -1) return { success: false, count: 0 };
    
    this.schema.semesters[semIndex].published = true;
    
    // Find students under this department and semester to link
    const sem = this.schema.semesters[semIndex];
    const matchingProfiles = this.schema.studentProfiles.filter(p => p.departmentId === sem.departmentId && p.semesterId === semesterId);
    
    // For each student, find all subjects of this semester and make sure they have a marks entry and are registered
    const semesterSubjects = this.schema.subjects.filter(s => s.semesterId === semesterId);
    
    let createdCount = 0;
    matchingProfiles.forEach(profile => {
      semesterSubjects.forEach(sub => {
        // Create baseline marks record if missing
        const exists = this.schema.marks.some(m => m.studentId === profile.userId && m.subjectId === sub.id);
        if (!exists) {
          this.schema.marks.push({
            id: `mk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            studentId: profile.userId,
            subjectId: sub.id,
            internalMarks: 0,
            internalMax: 40,
            practicalMarks: 0,
            practicalMax: sub.isPractical ? 30 : 0,
            semesterMarks: 0,
            semesterMax: sub.isPractical ? 50 : 100,
            grade: "-"
          });
          createdCount++;
        }
      });
    });

    const dept = this.schema.departments.find(d => d.id === sem.departmentId);
    this.logActivity(`Published ${sem.name} for ${dept?.name || "Department"}. Activated subjects & baselines for students.`, "publish");
    
    this.save();
    return { success: true, count: matchingProfiles.length };
  }

  // Student specific mutations
  public logAttendance(attendance: Omit<DBAttendance, 'id'>) {
    const id = `att-${Date.now()}`;
    const newRecord = { ...attendance, id };
    this.schema.attendance.push(newRecord);
    this.save();
    return newRecord;
  }

  public deleteAttendance(id: string, userId: string): boolean {
    const recordIdx = this.schema.attendance.findIndex(a => a.id === id && a.studentId === userId);
    if (recordIdx === -1) return false;
    this.schema.attendance.splice(recordIdx, 1);
    this.save();
    return true;
  }

  public addAssignment(asg: Omit<DBAssignment, 'id' | 'status'>) {
    const id = `as-${Date.now()}`;
    const newAsg: DBAssignment = { ...asg, id, status: 'pending' };
    this.schema.assignments.push(newAsg);
    this.save();
    return newAsg;
  }

  public updateAssignment(id: string, userId: string, fields: Partial<DBAssignment>) {
    this.schema.assignments = this.schema.assignments.map(a => 
      (a.id === id && a.studentId === userId) ? { ...a, ...fields } : a
    );
    this.save();
  }

  public deleteAssignment(id: string, userId: string) {
    this.schema.assignments = this.schema.assignments.filter(a => !(a.id === id && a.studentId === userId));
    this.save();
  }

  public addResult(result: Omit<DBResult, 'id'>) {
    const id = `res-${Date.now()}`;
    const newRes = { ...result, id };
    this.schema.results.push(newRes);
    this.save();
    return newRes;
  }

  public updateResult(id: string, userId: string, fields: Partial<DBResult>) {
    this.schema.results = this.schema.results.map(r => 
      (r.id === id && r.studentId === userId) ? { ...r, ...fields } : r
    );
    this.save();
  }

  public deleteResult(id: string, userId: string) {
    this.schema.results = this.schema.results.filter(r => !(r.id === id && r.studentId === userId));
    this.save();
  }

  public updateProfile(userId: string, fields: { name?: string, email?: string, avatarUrl?: string, rollNumber?: string, departmentId?: string, semesterId?: string, divisionId?: string, batchId?: string }) {
    // Update user name and email
    const user = this.schema.users.find(u => u.id === userId);
    if (user) {
      if (fields.name) user.name = fields.name;
      if (fields.email) user.email = fields.email;
    }
    // Update student profile details
    const profile = this.schema.studentProfiles.find(p => p.userId === userId);
    if (profile) {
      if (fields.rollNumber) profile.rollNumber = fields.rollNumber;
      if (fields.avatarUrl !== undefined) profile.avatarUrl = fields.avatarUrl;
      if (fields.departmentId) profile.departmentId = fields.departmentId;
      if (fields.semesterId) profile.semesterId = fields.semesterId;
      if (fields.divisionId) profile.divisionId = fields.divisionId;
      if (fields.batchId) profile.batchId = fields.batchId;
    }
    this.save();
  }

  public deleteStudent(userId: string): boolean {
    const userIdx = this.schema.users.findIndex(u => u.id === userId);
    if (userIdx === -1) return false;
    
    const user = this.schema.users[userIdx];
    if (user.role !== 'student') return false;

    // Remove user
    this.schema.users.splice(userIdx, 1);

    // Remove student profile
    this.schema.studentProfiles = this.schema.studentProfiles.filter(p => p.userId !== userId);

    // Remove academic data connected to userId
    this.schema.attendance = this.schema.attendance.filter(a => a.studentId !== userId);
    this.schema.results = this.schema.results.filter(r => r.studentId !== userId);
    this.schema.assignments = this.schema.assignments.filter(a => a.studentId !== userId);
    this.schema.marks = this.schema.marks.filter(m => m.studentId !== userId);

    this.save();
    return true;
  }
}
