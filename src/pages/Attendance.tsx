import React, { useState } from 'react';
import { useAPMS } from '../context/APMSContext';
import { Subject, AttendanceStatus } from '../types';
import { 
  CalendarCheck, Trash2, CheckCircle, AlertTriangle, 
  Clock, RefreshCw, Sparkles, Filter, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Attendance() {
  const { 
    data, logAttendance, deleteAttendanceRecord, getAttendanceStats, fetchAdminData 
  } = useAPMS();

  const [filterType, setFilterType] = useState<'all' | 'warning' | 'safe'>('all');

  const handleQuickLog = (subId: string, status: AttendanceStatus) => {
    logAttendance(subId, status);
  };

  const filteredSubjects = data.subjects.filter(sub => {
    const stats = getAttendanceStats(sub);
    if (filterType === 'warning') return stats.percentage < sub.attendanceMinRequired;
    if (filterType === 'safe') return stats.percentage >= sub.attendanceMinRequired;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-cyan-500 uppercase tracking-widest">Enrollment Tracking</span>
          <h1 className="font-display font-bold text-3xl text-slate-100 mt-1">Attendance Tracker</h1>
          <p className="text-sm text-slate-400 mt-1">Manage class logs, track status benchmarks, and compute safe miss thresholds</p>
        </div>
      </div>

      {/* Filter and overview metrics */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-2">
        <div className="flex gap-2">
          {(['all', 'warning', 'safe'] as const).map((type) => (
            <button
              key={type}
              id={`filter-btn-${type}`}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition capitalize cursor-pointer ${
                filterType === type 
                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' 
                  : 'bg-slate-900 text-slate-400 border-slate-800/80 hover:text-slate-300'
              }`}
            >
              {type === 'warning' ? 'Critical (<75%)' : type === 'safe' ? 'Safe (>=75%)' : 'All Modules'}
            </button>
          ))}
        </div>
        <div className="text-xs text-slate-500 font-mono">
          Showing {filteredSubjects.length} of {data.subjects.length} enrolled courses
        </div>
      </div>

      {/* Grid listing of Enrolled Subjects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubjects.map((sub) => {
          const stats = getAttendanceStats(sub);
          const isWarning = stats.percentage < sub.attendanceMinRequired;
          
          return (
            <div key={sub.id} className="glass-panel p-5 rounded-2xl border border-slate-800/60 flex flex-col justify-between hover:border-slate-800 transition relative">
              
              {/* Card Title Header info */}
              <div className="flex items-start justify-between gap-3">
                <div className="overflow-hidden">
                  <span className="text-[10px] font-mono text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/10">{sub.code}</span>
                  <h3 className="text-base font-bold text-slate-100 truncate mt-2">{sub.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 truncate">{sub.facultyName || "To Be Assigned"}</p>
                </div>

                {/* Progress Circle visual metric */}
                <div className="shrink-0 relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle 
                      cx="32" cy="32" r="28" 
                      className="text-slate-800" strokeWidth="4" fill="transparent" stroke="currentColor"
                    />
                    <circle 
                      cx="32" cy="32" r="28" 
                      className={isWarning ? "text-rose-500" : "text-cyan-500"}
                      strokeWidth="4" fill="transparent" stroke="currentColor"
                      strokeDasharray={2 * Math.PI * 28}
                      strokeDashoffset={2 * Math.PI * 28 * (1 - stats.percentage / 100)}
                    />
                  </svg>
                  <span className="absolute text-xs font-bold font-mono">{stats.percentage}%</span>
                </div>
              </div>

              {/* Attendance Counts info */}
              <div className="mt-4 p-3 bg-slate-900/40 rounded-xl border border-slate-800/40 grid grid-cols-3 text-center">
                <div>
                  <span className="text-[10px] text-slate-500 font-mono block">Attended</span>
                  <strong className="text-slate-100 text-sm font-mono">{sub.attendancePresent}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-mono block">Conducted</span>
                  <strong className="text-slate-100 text-sm font-mono">{sub.attendanceTotal}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-mono block">Required</span>
                  <strong className="text-slate-400 text-sm font-mono">{sub.attendanceMinRequired}%</strong>
                </div>
              </div>

              {/* Dynamic Action advice depending on attendance metrics */}
              <div className="mt-3.5 flex gap-2 p-2.5 rounded-lg text-xs leading-normal font-medium bg-slate-900/60 border border-slate-800">
                {isWarning ? (
                  <AlertTriangle size={14} className="text-rose-400 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle size={14} className="text-cyan-400 shrink-0 mt-0.5" />
                )}
                <span className={isWarning ? "text-rose-400" : "text-slate-300"}>{stats.message}</span>
              </div>

              {/* Quick Logger controls */}
              <div className="mt-5 border-t border-slate-800/80 pt-4 flex items-center justify-between gap-3">
                <span className="text-[10px] font-mono text-slate-500">Log class log:</span>
                <div className="flex gap-2">
                  <button
                    id={`quick-present-btn-${sub.id}`}
                    onClick={() => handleQuickLog(sub.id, 'present')}
                    className="px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500 hover:text-slate-950 border border-cyan-500/20 hover:border-transparent text-cyan-400 text-xs font-semibold rounded-lg transition duration-150 cursor-pointer"
                  >
                    + Present
                  </button>
                  <button
                    id={`quick-absent-btn-${sub.id}`}
                    onClick={() => handleQuickLog(sub.id, 'absent')}
                    className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500 hover:text-slate-950 border border-rose-500/20 hover:border-transparent text-rose-400 text-xs font-semibold rounded-lg transition duration-150 cursor-pointer"
                  >
                    + Absent
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Attendance History logs section */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-4">
          <CalendarCheck size={18} className="text-cyan-400" />
          <span>Detailed Attendance Logs</span>
        </h3>

        <div className="overflow-x-auto max-h-80">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-wider font-mono">
                <th className="py-3 px-4 font-semibold">Subject</th>
                <th className="py-3 px-4 font-semibold">Date Logged</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.attendanceRecords.length > 0 ? (
                data.attendanceRecords.map((record) => {
                  const sub = data.subjects.find(s => s.id === record.subjectId);
                  return (
                    <tr key={record.id} className="border-b border-slate-800/60 hover:bg-slate-900/10 transition">
                      <td className="py-3 px-4 font-medium text-slate-200">
                        {sub?.name || "Deleted Subject"} <span className="text-xs text-slate-500">({sub?.code})</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">{new Date(record.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono capitalize ${
                          record.status === 'present' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => deleteAttendanceRecord(record.id)}
                          className="text-slate-500 hover:text-rose-400 transition cursor-pointer"
                          title="Revoke Attendance Record"
                        >
                          <Trash2 size={14} className="ml-auto" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-slate-500 font-mono">
                    No attendance logs found in database. Log present/absent above!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
