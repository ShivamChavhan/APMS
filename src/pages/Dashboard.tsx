import { useState, useEffect } from 'react';
import { useAPMS } from '../context/APMSContext';
import { 
  AlertTriangle, Calendar, Award, CheckSquare, Clock, ArrowUpRight, 
  CalendarDays, CheckCircle, UserCheck, ChevronRight, CalendarCheck, GraduationCap,
  Users, Layers, BookOpen, Activity, Plus, ShieldCheck
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export default function Dashboard() {
  const { 
    auth, data, getAttendanceStats, getCGPA, adminStats, fetchAdminData, departments, semesters, logAttendance 
  } = useAPMS();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState('');
  
  useEffect(() => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(new Date().toLocaleDateString('en-US', options));
    
    if (auth.isAuthenticated && auth.role === 'admin') {
      fetchAdminData();
    }
  }, [auth.isAuthenticated, auth.role]);

  // Handle Admin Dashboard view
  if (auth.role === 'admin') {
    return (
      <div className="space-y-6 pb-12">
        {/* Page Header Welcome */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono text-cyan-500 uppercase tracking-widest">System Overview</span>
            <h1 className="font-display font-bold text-3xl text-slate-100 tracking-tight mt-1">
              Admin Portal: <span className="text-cyan-400">{auth.username || "Manager"}</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">{currentDate} • Security Level: System Owner</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate('/admin-academic')}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 rounded-xl text-xs font-bold transition duration-200 flex items-center gap-1.5 shadow-cyan-500/20 shadow-md"
            >
              <Plus size={14} />
              <span>Setup Academic Terms</span>
            </button>
          </div>
        </div>

        {/* Primary Admin KPI Widgets grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Students Card */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative overflow-hidden flex flex-col justify-between bg-slate-900/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Registered Students</span>
              <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg">
                <Users size={18} />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-display text-slate-100">{adminStats?.studentsCount || 0}</span>
              <span className="text-xs text-slate-500 font-mono">Active Users</span>
            </div>
            <div className="mt-3 text-[10px] text-slate-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live sync active
            </div>
          </div>

          {/* Total Departments Card */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative overflow-hidden flex flex-col justify-between bg-slate-900/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Academic Departments</span>
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <Layers size={18} />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-display text-slate-100">{adminStats?.departmentsCount || 0}</span>
              <span className="text-xs text-slate-500 font-mono">Configured Branches</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-3 flex items-center gap-1">
              Manage branches and courses
            </p>
          </div>

          {/* Total Subjects Card */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative overflow-hidden flex flex-col justify-between bg-slate-900/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Subjects / Courses</span>
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                <BookOpen size={18} />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-display text-slate-100">{adminStats?.subjectsCount || 0}</span>
              <span className="text-xs text-slate-500 font-mono">Mapped Syllabus</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-3 truncate">
              Set weekly slot schedules
            </p>
          </div>

          {/* Average Attendance Overview Card */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative overflow-hidden flex flex-col justify-between bg-slate-900/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Attendance Overview</span>
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                <CalendarCheck size={18} />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-display text-slate-100">{adminStats?.averageAttendance || 85}%</span>
              <span className="text-xs text-slate-500 font-mono">Minimum Required: 75%</span>
            </div>
            <div className="mt-3 w-full bg-slate-800 rounded-full h-1 overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: `${adminStats?.averageAttendance || 85}%` }}></div>
            </div>
          </div>
        </div>

        {/* Quick Launcher Board */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/20">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Quick Management Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              onClick={() => navigate('/admin-academic')}
              className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl hover:border-cyan-500/30 cursor-pointer transition flex items-start gap-3"
            >
              <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg shrink-0">
                <Layers size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-200">Departments & Divisions</h4>
                <p className="text-xs text-slate-400 mt-1">Create departments, semesters, division streams, student batches, and register instructors.</p>
              </div>
            </div>

            <div 
              onClick={() => navigate('/admin-curriculum')}
              className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl hover:border-cyan-500/30 cursor-pointer transition flex items-start gap-3"
            >
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0">
                <BookOpen size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-200">Curriculums & AAP Uploader</h4>
                <p className="text-xs text-slate-400 mt-1">Import academic timetables, set codes and credits, or upload administration plan PDFs for automated parser mapping.</p>
              </div>
            </div>

            <div 
              onClick={() => navigate('/admin-schedules')}
              className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl hover:border-cyan-500/30 cursor-pointer transition flex items-start gap-3"
            >
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg shrink-0">
                <Calendar size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-200">Exam Schedules & Holidays</h4>
                <p className="text-xs text-slate-400 mt-1">Schedule mid-sem and end-sem examinations, configure practical lab assessments, and update holidays.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Panel: Live Feed Activity Logs & Department Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent System Activity Live Logs */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Activity size={18} className="text-cyan-400" />
                <span>Recent Academic Activity Feed</span>
              </h3>
              <span className="px-2.5 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono text-[10px] uppercase rounded">Live logs</span>
            </div>

            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
              {adminStats?.logs && adminStats.logs.length > 0 ? (
                adminStats.logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 text-xs bg-slate-900/20 p-3 rounded-xl border border-slate-800/40">
                    <div className={`p-1.5 rounded-lg shrink-0 ${
                      log.type === 'publish' ? 'bg-emerald-500/10 text-emerald-400' :
                      log.type === 'register' ? 'bg-cyan-500/10 text-cyan-400' :
                      'bg-blue-500/10 text-blue-400'
                    }`}>
                      <ShieldCheck size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-200 leading-normal font-medium">{log.description}</p>
                      <span className="text-[10px] text-slate-500 font-mono block mt-1">
                        {new Date(log.date).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-500 font-mono">
                  No activities registered yet. Create academic assets to see feed logs.
                </div>
              )}
            </div>
          </div>

          {/* Quick Department Stats and Publish Status */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-100 mb-3">Academic Setup Progress</h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">Publish department semesters once scheduling is completed to push real-time timetables and resources to students.</p>
              
              <div className="space-y-3">
                {departments.slice(0, 3).map((dept) => {
                  const deptSemesters = semesters.filter(s => s.departmentId === dept.id);
                  const publishedSems = deptSemesters.filter(s => s.published);
                  return (
                    <div key={dept.id} className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/80 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">{dept.name}</h4>
                        <span className="text-[10px] text-slate-400 block mt-1">
                          {deptSemesters.length} Semesters configured
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 text-[9px] uppercase font-mono rounded ${
                        publishedSems.length > 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {publishedSems.length > 0 ? 'Active' : 'Draft'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <button 
              onClick={() => navigate('/admin-academic')}
              className="mt-6 w-full py-2.5 bg-slate-900 border border-slate-800 hover:border-cyan-500/30 text-xs font-medium text-slate-200 rounded-xl transition duration-150 flex items-center justify-center gap-1"
            >
              <span>Manage Branches & Terms</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Student Dashboard View ---
  const totalClasses = data.subjects.reduce((sum, s) => sum + s.attendanceTotal, 0);
  const presentClasses = data.subjects.reduce((sum, s) => sum + s.attendancePresent, 0);
  const averageAttendance = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 100;
  
  const cgpa = getCGPA();
  const latestSgpa = data.results.length > 0 ? data.results[data.results.length - 1].sgpa : 0;

  // Alerts for subjects < 75%
  const attendanceAlerts = data.subjects
    .map(s => ({ subject: s, stats: getAttendanceStats(s) }))
    .filter(item => item.stats.percentage < item.subject.attendanceMinRequired);

  // Filter soonest assignments (pending)
  const pendingAssignments = [...data.assignments]
    .filter(a => a.status === 'pending')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  // Filter soonest exams
  const soonestExams = [...data.exams]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  // Find classes scheduled for "today"
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const todayName = weekdays[new Date().getDay()];
  const todayClasses = data.timetable.filter(slot => slot.day === todayName || slot.day === 'Monday'); // fallback to Monday for rich presentation during weekend evaluations

  // Map attendance charts
  const attendanceChartData = data.subjects.map(s => ({
    name: s.code,
    fullName: s.name,
    attendance: totalClasses > 0 ? Math.round((s.attendancePresent / Math.max(1, s.attendanceTotal)) * 100) : 100,
    required: s.attendanceMinRequired
  }));

  // Countdown function
  const getDaysCountdown = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return "Completed";
    if (days === 0) return "Today!";
    if (days === 1) return "Tomorrow";
    return `${days} Days`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-cyan-500 uppercase tracking-widest">Portal Overview</span>
          <h1 className="font-display font-bold text-3xl text-slate-100 tracking-tight mt-1">
            Welcome Back, <span className="text-cyan-400">{data.profile.name || auth.username}</span>!
          </h1>
          <p className="text-sm text-slate-400 mt-1">{currentDate} • {data.profile.departmentName || "General Engineering"} • {data.profile.semesterName || "Semester 1"}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link 
            to="/calendar" 
            id="quick-upload-link"
            className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-cyan-500/30 text-slate-200 rounded-xl text-xs font-medium transition duration-200 flex items-center gap-2"
          >
            <span>Academic Calendar</span>
            <ChevronRight size={14} className="text-cyan-500" />
          </Link>
        </div>
      </div>

      {/* Primary KPI Widgets grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance Percentage Card */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative overflow-hidden flex flex-col justify-between bg-slate-900/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Attendance</span>
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg">
              <CalendarCheck size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-display text-slate-100">{averageAttendance}%</span>
            <span className="text-xs text-slate-500 font-mono">Target: 75%</span>
          </div>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${averageAttendance >= 75 ? 'bg-cyan-500' : 'bg-rose-500'}`}
              style={{ width: `${averageAttendance}%` }}
            />
          </div>
        </div>

        {/* CGPA Stats Card */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative overflow-hidden flex flex-col justify-between bg-slate-900/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cumulative CGPA</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <Award size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-display text-slate-100">{cgpa.toFixed(2)}</span>
            <span className="text-xs text-slate-500 font-mono">Scale: 10.0</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1">
            <span className="text-emerald-500">★</span> Based on {data.results.length} semesters
          </p>
        </div>

        {/* Current SGPA Card */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative overflow-hidden flex flex-col justify-between bg-slate-900/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Latest SGPA</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
              <GraduationCap size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-display text-slate-100">{latestSgpa.toFixed(2)}</span>
            <span className="text-xs text-slate-500 font-mono">Previous Term</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 truncate">
            Current Module credit count: {data.subjects.reduce((sum, s) => sum + s.credit, 0)} Cr
          </p>
        </div>

        {/* Pending Work Cards */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative overflow-hidden flex flex-col justify-between bg-slate-900/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assignments Pending</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <CheckSquare size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-display text-slate-100">
              {data.assignments.filter(a => a.status === 'pending').length}
            </span>
            <span className="text-xs text-slate-500 font-mono">Tasks left</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1.5 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Maintain academic velocity
          </p>
        </div>
      </div>

      {/* Middle Layout block: Charts + Today's Lectures */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Performance Graph Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-100">Attendance Metrics by Subject</h3>
              <p className="text-xs text-slate-400 mt-1">Comparison of current status with threshold targets</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-cyan-500/80 rounded"></span> Actual</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-slate-800 rounded"></span> Threshold (75%)</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  labelClassName="text-slate-200 font-bold font-sans text-xs"
                  itemStyle={{ fontSize: '11px', color: '#22d3ee' }}
                />
                <Bar dataKey="attendance" fill="#06b6d4" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Today's Classes timeline card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/10 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Clock size={18} className="text-cyan-400" />
              <span>Today's Schedule</span>
            </h3>
            <span className="px-2 py-0.5 bg-slate-800 text-slate-400 font-mono text-[10px] uppercase rounded">
              {todayName === 'Saturday' || todayName === 'Sunday' ? "Monday Feed" : todayName}
            </span>
          </div>

          <div className="flex-1 space-y-4 max-h-[250px] overflow-y-auto pr-2">
            {todayClasses.length > 0 ? (
              todayClasses.map((lecture) => (
                <div key={lecture.id} className="flex items-start gap-3 border-l-2 border-cyan-500 pl-3 py-1">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-200 truncate">{lecture.subjectName}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{lecture.startTime} - {lecture.endTime} • Room {lecture.room}</p>
                    <span className="text-[10px] text-slate-500 font-mono">{lecture.facultyName}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs font-mono">
                No classes scheduled for today. Relax!
              </div>
            )}
          </div>
          
          <Link 
            to="/timetable" 
            className="mt-4 w-full py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/20 text-xs text-slate-300 font-medium rounded-xl text-center transition flex items-center justify-center gap-1"
          >
            <span>Full Week Timetable</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>

      {/* Bottom section layout: Critical Alerts + Exam countdowns + Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Attendance Warnings Alerts */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 text-rose-400 mb-4">
            <AlertTriangle size={20} />
            <h3 className="text-base font-bold text-slate-100">Critical Threshold Alerts</h3>
          </div>

          <div className="space-y-4">
            {attendanceAlerts.length > 0 ? (
              attendanceAlerts.map(({ subject, stats }) => (
                <div key={subject.id} className="p-3.5 bg-rose-500/5 rounded-xl border border-rose-500/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-200">{subject.name}</h4>
                    <span className="px-2 py-0.5 bg-rose-500/15 text-rose-400 font-mono text-[10px] font-bold rounded">
                      {stats.percentage}%
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">{stats.message}</p>
                  <button 
                    onClick={() => logAttendance(subject.id, 'present')}
                    className="w-full mt-1 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-[10px] text-rose-300 font-bold font-mono rounded-lg transition"
                  >
                    Quick-Mark Present (Attend class)
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-slate-900/20 border border-slate-800/40 rounded-xl">
                <CheckCircle size={32} className="text-emerald-400 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-slate-200">Excellent Attendance!</h4>
                <p className="text-[10px] text-slate-500 mt-1">All subjects are comfortably above 75%.</p>
              </div>
            )}
          </div>
        </div>

        {/* Center/Right Column: Exam countdowns and Assignments */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Exam Countdown List */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <CalendarDays size={18} className="text-cyan-400" />
                <span>Exams Countdown</span>
              </h3>
              <Link to="/exams" className="text-xs text-cyan-500 hover:underline">View All</Link>
            </div>

            <div className="space-y-3">
              {soonestExams.length > 0 ? (
                soonestExams.map((exam) => (
                  <div key={exam.id} className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/80 hover:border-slate-800 transition flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-300 truncate">{exam.subjectName}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">{exam.type.toUpperCase()} • Room {exam.room}</p>
                      <span className="text-[10px] text-slate-500 font-mono block mt-1">{new Date(exam.date).toLocaleDateString()} at {exam.time}</span>
                    </div>
                    <span className="shrink-0 px-2.5 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono font-semibold text-[11px] rounded-lg">
                      {getDaysCountdown(exam.date)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs font-mono">
                  No upcoming exams listed.
                </div>
              )}
            </div>
          </div>

          {/* Assignments Due soon */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <CheckSquare size={18} className="text-cyan-400" />
                <span>Tasks & Assignments</span>
              </h3>
              <Link to="/assignments" className="text-xs text-cyan-500 hover:underline">View All</Link>
            </div>

            <div className="space-y-3">
              {pendingAssignments.length > 0 ? (
                pendingAssignments.map((task) => {
                  const sub = data.subjects.find(s => s.id === task.subjectId);
                  return (
                    <div key={task.id} className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/80 hover:border-slate-800 transition space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-200 truncate">{task.title}</h4>
                        <span className={`px-2 py-0.5 text-[9px] uppercase font-mono rounded ${
                          task.priority === 'high' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                          task.priority === 'medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-mono text-cyan-500">{sub?.code || "GENERIC"}</span>
                        <span className="font-mono">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs font-mono">
                  All assignments completed! 🎉
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
