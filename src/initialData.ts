import { APMSData } from './types';

export const INITIAL_DATA: APMSData = {
  profile: {
    id: "u-shivam",
    name: "Shivam Chavhan",
    email: "shivamchavhan225@gmail.com",
    role: "student",
    departmentId: "dept-cs",
    semesterId: "sem-cs-5",
    divisionId: "div-cs-5-a",
    batchId: "batch-cs-5-a1",
    rollNumber: "CSE-2023-042",
    avatarUrl: "",
    departmentName: "Computer Science & Engineering",
    semesterName: "Semester 5",
    divisionName: "Division A",
    batchName: "Batch A1"
  },
  subjects: [
    {
      id: "sub-1",
      name: "Database Management Systems",
      code: "CS301",
      credit: 4,
      facultyId: "fac-1",
      facultyName: "Dr. Ananya Rao",
      semesterId: "sem-cs-5",
      isPractical: false,
      attendancePresent: 28,
      attendanceTotal: 32,
      attendanceMinRequired: 75,
      internalMarks: 34,
      internalMax: 40,
      practicalMarks: 0,
      practicalMax: 0,
      semesterMarks: 78,
      semesterMax: 100,
      grade: "A+"
    },
    {
      id: "sub-2",
      name: "Computer Networks",
      code: "CS302",
      credit: 4,
      facultyId: "fac-2",
      facultyName: "Prof. Rajesh Kumar",
      semesterId: "sem-cs-5",
      isPractical: false,
      attendancePresent: 22,
      attendanceTotal: 30,
      attendanceMinRequired: 75,
      internalMarks: 31,
      internalMax: 40,
      practicalMarks: 0,
      practicalMax: 0,
      semesterMarks: 82,
      semesterMax: 100,
      grade: "A+"
    },
    {
      id: "sub-3",
      name: "Software Engineering",
      code: "CS303",
      credit: 3,
      facultyId: "fac-3",
      facultyName: "Dr. Sarah D'Souza",
      semesterId: "sem-cs-5",
      isPractical: false,
      attendancePresent: 20,
      attendanceTotal: 28,
      attendanceMinRequired: 75,
      internalMarks: 36,
      internalMax: 40,
      practicalMarks: 0,
      practicalMax: 0,
      semesterMarks: 91,
      semesterMax: 100,
      grade: "O"
    },
    {
      id: "sub-4",
      name: "Web Technologies Lab",
      code: "CS304",
      credit: 2,
      facultyId: "fac-4",
      facultyName: "Mr. Vicky Patil",
      semesterId: "sem-cs-5",
      isPractical: true,
      attendancePresent: 14,
      attendanceTotal: 16,
      attendanceMinRequired: 75,
      internalMarks: 18,
      internalMax: 20,
      practicalMarks: 27,
      practicalMax: 30,
      semesterMarks: 45,
      semesterMax: 50,
      grade: "O"
    },
    {
      id: "sub-5",
      name: "Artificial Intelligence",
      code: "CS305",
      credit: 3,
      facultyId: "fac-5",
      facultyName: "Prof. Amit Verma",
      semesterId: "sem-cs-5",
      isPractical: false,
      attendancePresent: 16,
      attendanceTotal: 25,
      attendanceMinRequired: 75,
      internalMarks: 25,
      internalMax: 40,
      practicalMarks: 0,
      practicalMax: 0,
      semesterMarks: 65,
      semesterMax: 100,
      grade: "B"
    }
  ],
  attendanceRecords: [
    { id: "att-1", studentId: "u-shivam", subjectId: "sub-1", subjectName: "Database Management Systems", subjectCode: "CS301", date: "2026-06-22", status: "present" },
    { id: "att-2", studentId: "u-shivam", subjectId: "sub-1", subjectName: "Database Management Systems", subjectCode: "CS301", date: "2026-06-23", status: "present" },
    { id: "att-3", studentId: "u-shivam", subjectId: "sub-1", subjectName: "Database Management Systems", subjectCode: "CS301", date: "2026-06-24", status: "present" },
    { id: "att-4", studentId: "u-shivam", subjectId: "sub-1", subjectName: "Database Management Systems", subjectCode: "CS301", date: "2026-06-25", status: "absent" },
    
    { id: "att-5", studentId: "u-shivam", subjectId: "sub-2", subjectName: "Computer Networks", subjectCode: "CS302", date: "2026-06-22", status: "present" },
    { id: "att-6", studentId: "u-shivam", subjectId: "sub-2", subjectName: "Computer Networks", subjectCode: "CS302", date: "2026-06-24", status: "present" },
    { id: "att-7", studentId: "u-shivam", subjectId: "sub-2", subjectName: "Computer Networks", subjectCode: "CS302", date: "2026-06-26", status: "absent" },
    
    { id: "att-8", studentId: "u-shivam", subjectId: "sub-3", subjectName: "Software Engineering", subjectCode: "CS303", date: "2026-06-23", status: "present" },
    { id: "att-9", studentId: "u-shivam", subjectId: "sub-3", subjectName: "Software Engineering", subjectCode: "CS303", date: "2026-06-25", status: "present" },
    
    { id: "att-10", studentId: "u-shivam", subjectId: "sub-4", subjectName: "Web Technologies Lab", subjectCode: "CS304", date: "2026-06-23", status: "present" },
    
    { id: "att-11", studentId: "u-shivam", subjectId: "sub-5", subjectName: "Artificial Intelligence", subjectCode: "CS305", date: "2026-06-22", status: "absent" },
    { id: "att-12", studentId: "u-shivam", subjectId: "sub-5", subjectName: "Artificial Intelligence", subjectCode: "CS305", date: "2026-06-24", status: "absent" },
    { id: "att-13", studentId: "u-shivam", subjectId: "sub-5", subjectName: "Artificial Intelligence", subjectCode: "CS305", date: "2026-06-26", status: "present" }
  ],
  timetable: [
    { id: "tt-1", day: "Monday", subjectId: "sub-1", subjectName: "Database Management Systems", subjectCode: "CS301", startTime: "09:00", endTime: "10:00", room: "LH-201", facultyId: "fac-1", facultyName: "Dr. Ananya Rao", divisionId: "div-cs-5-a" },
    { id: "tt-2", day: "Monday", subjectId: "sub-2", subjectName: "Computer Networks", subjectCode: "CS302", startTime: "10:15", endTime: "11:15", room: "LH-202", facultyId: "fac-2", facultyName: "Prof. Rajesh Kumar", divisionId: "div-cs-5-a" },
    { id: "tt-3", day: "Monday", subjectId: "sub-5", subjectName: "Artificial Intelligence", subjectCode: "CS305", startTime: "11:30", endTime: "12:30", room: "LH-305", facultyId: "fac-5", facultyName: "Prof. Amit Verma", divisionId: "div-cs-5-a" },
    
    { id: "tt-4", day: "Tuesday", subjectId: "sub-3", subjectName: "Software Engineering", subjectCode: "CS303", startTime: "09:00", endTime: "10:00", room: "LH-104", facultyId: "fac-3", facultyName: "Dr. Sarah D'Souza", divisionId: "div-cs-5-a" },
    { id: "tt-5", day: "Tuesday", subjectId: "sub-4", subjectName: "Web Technologies Lab", subjectCode: "CS304", startTime: "14:00", endTime: "16:00", room: "Lab-4", facultyId: "fac-4", facultyName: "Mr. Vicky Patil", divisionId: "div-cs-5-a", batchId: "batch-cs-5-a1" },
    
    { id: "tt-6", day: "Wednesday", subjectId: "sub-1", subjectName: "Database Management Systems", subjectCode: "CS301", startTime: "09:00", endTime: "10:00", room: "LH-201", facultyId: "fac-1", facultyName: "Dr. Ananya Rao", divisionId: "div-cs-5-a" },
    { id: "tt-7", day: "Wednesday", subjectId: "sub-2", subjectName: "Computer Networks", subjectCode: "CS302", startTime: "10:15", endTime: "11:15", room: "LH-202", facultyId: "fac-2", facultyName: "Prof. Rajesh Kumar", divisionId: "div-cs-5-a" },
    { id: "tt-8", day: "Wednesday", subjectId: "sub-5", subjectName: "Artificial Intelligence", subjectCode: "CS305", startTime: "11:30", endTime: "12:30", room: "LH-305", facultyId: "fac-5", facultyName: "Prof. Amit Verma", divisionId: "div-cs-5-a" },
    
    { id: "tt-9", day: "Thursday", subjectId: "sub-3", subjectName: "Software Engineering", subjectCode: "CS303", startTime: "09:00", endTime: "10:00", room: "LH-104", facultyId: "fac-3", facultyName: "Dr. Sarah D'Souza", divisionId: "div-cs-5-a" },
    
    { id: "tt-10", day: "Friday", subjectId: "sub-2", subjectName: "Computer Networks", subjectCode: "CS302", startTime: "10:15", endTime: "11:15", room: "LH-202", facultyId: "fac-2", facultyName: "Prof. Rajesh Kumar", divisionId: "div-cs-5-a" },
    { id: "tt-11", day: "Friday", subjectId: "sub-5", subjectName: "Artificial Intelligence", subjectCode: "CS305", startTime: "11:30", endTime: "12:30", room: "LH-305", facultyId: "fac-5", facultyName: "Prof. Amit Verma", divisionId: "div-cs-5-a" }
  ],
  assignments: [
    { id: "as-1", studentId: "u-shivam", title: "Normalization & SQL Queries Assignment", subjectId: "sub-1", subjectName: "Database Management Systems", dueDate: "2026-07-02", priority: "high", status: "pending", description: "Design a relational database and write answers for normalization questions." },
    { id: "as-2", studentId: "u-shivam", title: "IP Subnetting and Routing Lab Report", subjectId: "sub-2", subjectName: "Computer Networks", dueDate: "2026-07-05", priority: "medium", status: "pending", description: "Calculate IPv4 subnet addresses, masks, and ranges." },
    { id: "as-3", studentId: "u-shivam", title: "SRS Document Draft", subjectId: "sub-3", subjectName: "Software Engineering", dueDate: "2026-06-30", priority: "high", status: "completed", description: "Draft the SRS for the selected project using IEEE 830 standard." },
    { id: "as-4", studentId: "u-shivam", title: "Full-Stack React Student Dashboard", subjectId: "sub-4", subjectName: "Web Technologies Lab", dueDate: "2026-07-10", priority: "high", status: "pending", description: "Create a fully functional React SPA dashboard." }
  ],
  exams: [
    { id: "ex-1", subjectId: "sub-1", subjectName: "Database Management Systems", date: "2026-07-15", time: "10:00", room: "Exam Hall A", type: "endsem", semesterId: "sem-cs-5" },
    { id: "ex-2", subjectId: "sub-2", subjectName: "Computer Networks", date: "2026-07-17", time: "10:00", room: "Exam Hall A", type: "endsem", semesterId: "sem-cs-5" },
    { id: "ex-3", subjectId: "sub-3", subjectName: "Software Engineering", date: "2026-07-19", time: "14:00", room: "LH-104", type: "endsem", semesterId: "sem-cs-5" },
    { id: "ex-4", subjectId: "sub-5", subjectName: "Artificial Intelligence", date: "2026-07-22", time: "10:00", room: "Exam Hall B", type: "endsem", semesterId: "sem-cs-5" }
  ],
  events: [
    { id: "ev-1", title: "Midterm Exams (MSE)", date: "2026-07-01", type: "exam", description: "Mid-semester evaluation written exams.", semesterId: "sem-cs-5" },
    { id: "ev-2", title: "Practical Labs Assessment", date: "2026-07-12", type: "practical", description: "Final practical session evaluation and external viva voce.", semesterId: "sem-cs-5" },
    { id: "ev-3", title: "Independence Day Holiday", date: "2026-08-15", type: "holiday", description: "National Holiday.", semesterId: "sem-cs-5" },
    { id: "ev-4", title: "Tech-Fest 2026 (Syntra)", date: "2026-07-08", type: "event", description: "Annual department tech-fest and coding hackathon.", semesterId: "sem-cs-5" }
  ],
  results: [
    { id: "res-1", studentId: "u-shivam", semesterNo: 1, sgpa: 8.8, cgpa: 8.8, creditsEarned: 22, totalCredits: 22 },
    { id: "res-2", studentId: "u-shivam", semesterNo: 2, sgpa: 8.95, cgpa: 8.88, creditsEarned: 24, totalCredits: 24 },
    { id: "res-3", studentId: "u-shivam", semesterNo: 3, sgpa: 8.6, cgpa: 8.78, creditsEarned: 22, totalCredits: 22 },
    { id: "res-4", studentId: "u-shivam", semesterNo: 4, sgpa: 9.12, cgpa: 8.86, creditsEarned: 20, totalCredits: 20 }
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
  facultyList: [
    { id: "fac-1", name: "Dr. Ananya Rao", email: "rao@apms.edu", departmentId: "dept-cs" },
    { id: "fac-2", name: "Prof. Rajesh Kumar", email: "kumar@apms.edu", departmentId: "dept-cs" },
    { id: "fac-3", name: "Dr. Sarah D'Souza", email: "dsouza@apms.edu", departmentId: "dept-cs" },
    { id: "fac-4", name: "Mr. Vicky Patil", email: "patil@apms.edu", departmentId: "dept-cs" },
    { id: "fac-5", name: "Prof. Amit Verma", email: "verma@apms.edu", departmentId: "dept-cs" }
  ],
  allStudentsCount: 128
};
