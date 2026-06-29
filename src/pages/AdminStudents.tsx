import React, { useState, useEffect } from 'react';
import { useAPMS } from '../context/APMSContext';
import { 
  Search, Edit2, KeyRound, Trash2, UserCheck, UserX, Filter, 
  GraduationCap, X, ChevronDown, BookOpen, Layers, AlertTriangle, 
  CheckCircle, Calendar, Hash, Mail, User, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AdminStudent } from '../types';

export default function AdminStudents() {
  const { 
    adminStudents, fetchAdminStudents, updateAdminStudent, resetStudentPassword, deleteStudent,
    departments, semesters, divisions, batches, fetchAdminData, loading
  } = useAPMS();

  // Load data on mount
  useEffect(() => {
    fetchAdminStudents();
    fetchAdminData();
  }, []);

  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSem, setSelectedSem] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Success message state
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 3500);
  };

  // Modals state
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    student: AdminStudent | null;
  }>({ isOpen: false, student: null });

  const [passwordModal, setPasswordModal] = useState<{
    isOpen: boolean;
    student: AdminStudent | null;
  }>({ isOpen: false, student: null });

  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    student: AdminStudent | null;
  }>({ isOpen: false, student: null });

  // Fields state for edit form
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    rollNumber: '',
    departmentId: '',
    semesterId: '',
    divisionId: '',
    batchId: '',
    accountStatus: 'active' as 'active' | 'inactive'
  });

  // Fields state for reset password form
  const [newPassword, setNewPassword] = useState('');

  // Update filtered semester/division/batch list on selection inside edit form
  const filteredFormSemesters = semesters.filter(s => s.departmentId === editForm.departmentId);
  const filteredFormDivisions = divisions.filter(d => d.semesterId === editForm.semesterId);
  const filteredFormBatches = batches.filter(b => b.divisionId === editForm.divisionId);

  // Trigger edit modal
  const handleOpenEdit = (student: AdminStudent) => {
    setEditForm({
      name: student.name,
      email: student.email,
      rollNumber: student.rollNumber,
      departmentId: student.departmentId,
      semesterId: student.semesterId,
      divisionId: student.divisionId,
      batchId: student.batchId || '',
      accountStatus: student.accountStatus || 'active'
    });
    setEditModal({ isOpen: true, student });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal.student) return;

    const success = await updateAdminStudent(editModal.student.id, editForm);
    if (success) {
      showSuccess(`Profile for ${editForm.name} updated successfully.`);
      setEditModal({ isOpen: false, student: null });
    } else {
      showError("Failed to update student profile.");
    }
  };

  // Trigger password reset modal
  const handleOpenPassword = (student: AdminStudent) => {
    setNewPassword('');
    setPasswordModal({ isOpen: true, student });
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModal.student || !newPassword) return;

    const success = await resetStudentPassword(passwordModal.student.id, newPassword);
    if (success) {
      showSuccess(`Password for ${passwordModal.student.name} reset successfully.`);
      setPasswordModal({ isOpen: false, student: null });
    } else {
      showError("Failed to reset student password.");
    }
  };

  // Trigger delete confirmation modal
  const handleOpenDelete = (student: AdminStudent) => {
    setDeleteConfirm({ isOpen: true, student });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.student) return;

    const success = await deleteStudent(deleteConfirm.student.id);
    if (success) {
      showSuccess(`Student account deleted successfully.`);
      setDeleteConfirm({ isOpen: false, student: null });
    } else {
      showError("Failed to delete student account.");
    }
  };

  // Quick toggle status directly in the table
  const handleToggleStatus = async (student: AdminStudent) => {
    const newStatus = student.accountStatus === 'active' ? 'inactive' : 'active';
    const success = await updateAdminStudent(student.id, { accountStatus: newStatus });
    if (success) {
      showSuccess(`${student.name} is now marked as ${newStatus}.`);
    } else {
      showError("Failed to toggle status.");
    }
  };

  // Filter students based on filter parameters
  const filteredStudents = adminStudents.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = !selectedDept || student.departmentId === selectedDept;
    const matchesSem = !selectedSem || student.semesterId === selectedSem;
    const matchesStatus = 
      selectedStatus === 'all' || 
      (selectedStatus === 'active' && student.accountStatus !== 'inactive') ||
      (selectedStatus === 'inactive' && student.accountStatus === 'inactive');

    return matchesSearch && matchesDept && matchesSem && matchesStatus;
  });

  // Calculate statistics
  const totalStudents = adminStudents.length;
  const activeStudents = adminStudents.filter(s => s.accountStatus !== 'inactive').length;
  const inactiveStudents = totalStudents - activeStudents;
  const averageAttendance = adminStudents.length > 0 
    ? Math.round(adminStudents.reduce((acc, curr) => acc + (curr.attendancePercent || 0), 0) / adminStudents.length) 
    : 85;

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Success/Error Toast notification */}
      <AnimatePresence>
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-6 left-1/2 z-50 px-4 py-2.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold rounded-xl text-xs flex items-center gap-2 shadow-lg backdrop-blur-md"
          >
            <CheckCircle size={16} />
            <span>{successMsg}</span>
          </motion.div>
        )}
        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-6 left-1/2 z-50 px-4 py-2.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold rounded-xl text-xs flex items-center gap-2 shadow-lg backdrop-blur-md"
          >
            <AlertTriangle size={16} />
            <span>{errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div>
        <span className="text-xs font-mono text-cyan-500 uppercase tracking-widest">Administrative Control</span>
        <h1 className="font-display font-bold text-3xl text-slate-100 tracking-tight mt-1">
          Student Directory & Accounts
        </h1>
        <p className="text-sm text-slate-400 mt-1">Manage enrollments, academic term mappings, account activity status, and credentials.</p>
      </div>

      {/* KPI Stats widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Enrolled</span>
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg">
              <GraduationCap size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-display text-slate-100">{totalStudents}</span>
            <span className="text-xs text-slate-500 font-mono">Students</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Status</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <UserCheck size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-display text-emerald-400">{activeStudents}</span>
            <span className="text-xs text-slate-500 font-mono">Permitted Access</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Suspended Accounts</span>
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg">
              <UserX size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-display text-rose-400">{inactiveStudents}</span>
            <span className="text-xs text-slate-500 font-mono">Deactivated</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg. Class Attendance</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <BookOpen size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-display text-slate-100">{averageAttendance}%</span>
            <span className="text-xs text-slate-500 font-mono">Overall Ratio</span>
          </div>
        </div>
      </div>

      {/* Filters Board */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/20 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs uppercase tracking-wider">
            <Filter size={14} className="text-cyan-400" />
            <span>Search & Advanced Directory Filters</span>
          </div>
          {(searchQuery || selectedDept || selectedSem || selectedStatus !== 'all') && (
            <button 
              onClick={() => {
                setSearchQuery('');
                setSelectedDept('');
                setSelectedSem('');
                setSelectedStatus('all');
              }}
              className="text-cyan-500 text-xs font-mono hover:underline flex items-center gap-1"
            >
              <X size={12} />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search query input */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
              <Search size={14} />
            </span>
            <input 
              type="text" 
              placeholder="Search by name, email, roll..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-850 focus:border-cyan-500 rounded-xl text-slate-100 text-xs placeholder-slate-500 focus:outline-none transition"
            />
          </div>

          {/* Department filter */}
          <div className="relative">
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setSelectedSem(''); // reset sem if dept changes
              }}
              className="w-full bg-slate-950 border border-slate-850 focus:border-cyan-500 rounded-xl text-slate-100 text-xs py-2 px-3 focus:outline-none appearance-none"
            >
              <option value="">-- All Departments --</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
              <ChevronDown size={14} />
            </div>
          </div>

          {/* Semester filter */}
          <div className="relative">
            <select
              value={selectedSem}
              onChange={(e) => setSelectedSem(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 focus:border-cyan-500 rounded-xl text-slate-100 text-xs py-2 px-3 focus:outline-none appearance-none"
            >
              <option value="">-- All Semesters --</option>
              {semesters.filter(s => !selectedDept || s.departmentId === selectedDept).map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
              <ChevronDown size={14} />
            </div>
          </div>

          {/* Status filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-850 focus:border-cyan-500 rounded-xl text-slate-100 text-xs py-2 px-3 focus:outline-none appearance-none"
            >
              <option value="all">-- All Statuses --</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
              <ChevronDown size={14} />
            </div>
          </div>
        </div>
      </div>

      {/* Directory Table Grid */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/10">
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/40">
          <h3 className="text-sm font-bold text-slate-200">Student Enrollment Registry</h3>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            {filteredStudents.length} of {totalStudents} listed
          </span>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-500 font-mono text-xs">
            Querying registry...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-20 text-slate-500 font-mono text-xs">
            No enrolled students match current query filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-850 text-slate-400 text-[10px] font-mono uppercase tracking-wider bg-slate-950/20">
                  <th className="px-6 py-3.5 font-semibold">Roll / ID</th>
                  <th className="px-6 py-3.5 font-semibold">Student Name</th>
                  <th className="px-6 py-3.5 font-semibold">Branch Mapping</th>
                  <th className="px-6 py-3.5 font-semibold">Division / Batch</th>
                  <th className="px-6 py-3.5 font-semibold text-center">Class Att %</th>
                  <th className="px-6 py-3.5 text-center font-semibold">CGPA</th>
                  <th className="px-6 py-3.5 font-semibold">Registered At</th>
                  <th className="px-6 py-3.5 font-semibold">Status</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                <AnimatePresence>
                  {filteredStudents.map((student) => {
                    const initials = student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                    const isInactive = student.accountStatus === 'inactive';
                    
                    return (
                      <motion.tr 
                        key={student.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-slate-900/30 text-xs transition-colors duration-150"
                      >
                        {/* Roll Number */}
                        <td className="px-6 py-4 font-mono font-bold text-slate-300">
                          {student.rollNumber}
                        </td>

                        {/* Name and Email */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-bold text-xs">
                              {initials}
                            </div>
                            <div>
                              <p className="font-bold text-slate-200">{student.name}</p>
                              <p className="text-[10px] text-slate-500 font-mono">{student.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Department & Semester */}
                        <td className="px-6 py-4 text-slate-300">
                          <div>
                            <p className="font-medium text-slate-200">{student.departmentName}</p>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">{student.semesterName}</p>
                          </div>
                        </td>

                        {/* Division & Batch */}
                        <td className="px-6 py-4 text-slate-400">
                          <div>
                            <p className="font-medium text-slate-300">{student.divisionName}</p>
                            {student.batchName && (
                              <p className="text-[10px] text-slate-500 mt-0.5">Batch: {student.batchName}</p>
                            )}
                          </div>
                        </td>

                        {/* Attendance Percent */}
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                            student.attendancePercent >= 75 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            student.attendancePercent >= 65 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {student.attendancePercent}%
                          </span>
                        </td>

                        {/* CGPA */}
                        <td className="px-6 py-4 text-center font-mono font-bold text-slate-300">
                          {student.cgpa}
                        </td>

                        {/* Registered Date */}
                        <td className="px-6 py-4 text-slate-500 font-mono text-[10px]">
                          {student.registeredAt ? new Date(student.registeredAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Seed Enrollment'}
                        </td>

                        {/* Account Status */}
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => handleToggleStatus(student)}
                            className={`px-2.5 py-0.5 text-[10px] uppercase font-mono font-bold rounded-full transition flex items-center gap-1.5 border ${
                              isInactive 
                                ? 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300 hover:border-slate-500' 
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20'
                            }`}
                            title={isInactive ? "Click to Activate" : "Click to Suspend"}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isInactive ? 'bg-slate-500' : 'bg-emerald-400 animate-pulse'}`} />
                            <span>{isInactive ? 'Inactive' : 'Active'}</span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEdit(student)}
                              className="p-1.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 rounded-lg transition"
                              title="Edit Profile"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleOpenPassword(student)}
                              className="p-1.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 hover:border-amber-500/30 rounded-lg transition"
                              title="Reset Password"
                            >
                              <KeyRound size={13} />
                            </button>
                            <button
                              onClick={() => handleOpenDelete(student)}
                              className="p-1.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 rounded-lg transition"
                              title="Delete Student"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Student Modal */}
      <AnimatePresence>
        {editModal.isOpen && editModal.student && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setEditModal({ isOpen: false, student: null })}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden relative z-10 max-h-[90vh] flex flex-col"
            >
              <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center shrink-0">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Edit2 size={16} className="text-cyan-400" />
                  <span>Edit Student Profile</span>
                </h3>
                <button 
                  onClick={() => setEditModal({ isOpen: false, student: null })}
                  className="text-slate-400 hover:text-slate-200"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="p-6 space-y-4 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Full Name</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                        <User size={14} />
                      </span>
                      <input 
                        type="text"
                        required
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:border-cyan-500 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Email Address</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                        <Mail size={14} />
                      </span>
                      <input 
                        type="email"
                        required
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:border-cyan-500 focus:outline-none transition"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Roll Number */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Roll Number / Student ID</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                        <Hash size={14} />
                      </span>
                      <input 
                        type="text"
                        required
                        value={editForm.rollNumber}
                        onChange={(e) => setEditForm({ ...editForm, rollNumber: e.target.value })}
                        className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:border-cyan-500 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Account Status Option */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Account Status</label>
                    <select
                      value={editForm.accountStatus}
                      onChange={(e) => setEditForm({ ...editForm, accountStatus: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs py-2 px-3 focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="active">Active (Access Allowed)</option>
                      <option value="inactive">Suspended (Access Denied)</option>
                    </select>
                  </div>
                </div>

                {/* Term mapping selectors */}
                <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-850 space-y-3">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">Academic Mapping</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Department */}
                    <div>
                      <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Branch / Dept</label>
                      <select
                        required
                        value={editForm.departmentId}
                        onChange={(e) => setEditForm({ ...editForm, departmentId: e.target.value, semesterId: '', divisionId: '', batchId: '' })}
                        className="w-full bg-slate-950 border border-slate-850 focus:border-cyan-500 rounded-xl text-slate-100 text-xs py-2 px-3 focus:outline-none"
                      >
                        <option value="">-- Choose Dept --</option>
                        {departments.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Semester */}
                    <div>
                      <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Semester Term</label>
                      <select
                        required
                        value={editForm.semesterId}
                        onChange={(e) => setEditForm({ ...editForm, semesterId: e.target.value, divisionId: '', batchId: '' })}
                        className="w-full bg-slate-950 border border-slate-850 focus:border-cyan-500 rounded-xl text-slate-100 text-xs py-2 px-3 focus:outline-none"
                      >
                        <option value="">-- Choose Semester --</option>
                        {filteredFormSemesters.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Division */}
                    <div>
                      <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Division Track</label>
                      <select
                        required
                        value={editForm.divisionId}
                        onChange={(e) => setEditForm({ ...editForm, divisionId: e.target.value, batchId: '' })}
                        className="w-full bg-slate-950 border border-slate-850 focus:border-cyan-500 rounded-xl text-slate-100 text-xs py-2 px-3 focus:outline-none"
                      >
                        <option value="">-- Choose Division --</option>
                        {filteredFormDivisions.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Batch */}
                    <div>
                      <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Practical Batch</label>
                      <select
                        required
                        value={editForm.batchId}
                        onChange={(e) => setEditForm({ ...editForm, batchId: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-850 focus:border-cyan-500 rounded-xl text-slate-100 text-xs py-2 px-3 focus:outline-none"
                      >
                        <option value="">-- Choose Batch --</option>
                        {filteredFormBatches.map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 shrink-0 flex items-center justify-end gap-2">
                  <button 
                    type="button"
                    onClick={() => setEditModal({ isOpen: false, student: null })}
                    className="px-4 py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 text-xs font-semibold rounded-xl transition shadow-cyan-500/20 shadow-md"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reset Password Modal */}
      <AnimatePresence>
        {passwordModal.isOpen && passwordModal.student && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setPasswordModal({ isOpen: false, student: null })}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden relative z-10"
            >
              <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <KeyRound size={16} className="text-amber-400" />
                  <span>Reset Student Password</span>
                </h3>
                <button 
                  onClick={() => setPasswordModal({ isOpen: false, student: null })}
                  className="text-slate-400 hover:text-slate-200"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSavePassword} className="p-6 space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed">
                  You are resetting the password for student <strong className="text-slate-200">{passwordModal.student.name}</strong> ({passwordModal.student.email}). They will use this new password to sign in.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">New Password</label>
                  <input 
                    type="text"
                    required
                    placeholder="Enter new password (e.g. password)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:border-cyan-500 focus:outline-none transition"
                  />
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
                  <button 
                    type="button"
                    onClick={() => setPasswordModal({ isOpen: false, student: null })}
                    className="px-4 py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-semibold rounded-xl transition shadow-amber-500/20 shadow-md"
                  >
                    Reset Password
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm.isOpen && deleteConfirm.student && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setDeleteConfirm({ isOpen: false, student: null })}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel w-full max-w-sm bg-slate-900 border border-slate-850 rounded-2xl shadow-xl overflow-hidden relative z-10"
            >
              <div className="px-6 py-4 border-b border-slate-850 bg-rose-950/20 flex justify-between items-center">
                <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
                  <AlertTriangle size={18} />
                  <span>Confirm Account Deletion</span>
                </h3>
                <button 
                  onClick={() => setDeleteConfirm({ isOpen: false, student: null })}
                  className="text-slate-400 hover:text-slate-200"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Are you absolutely sure you want to delete <strong className="text-slate-100">{deleteConfirm.student.name}</strong>?
                </p>
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[11px] text-rose-300 leading-normal flex items-start gap-2">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <span>Warning: This will permanently delete the user account, student profile, all historic attendance registers, internal marks, practical marks, and semester results. This action is irreversible.</span>
                </div>

                <div className="pt-4 border-t border-slate-850 flex items-center justify-end gap-2">
                  <button 
                    type="button"
                    onClick={() => setDeleteConfirm({ isOpen: false, student: null })}
                    className="px-4 py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={handleConfirmDelete}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-slate-100 text-xs font-bold rounded-xl transition shadow-rose-600/20 shadow-md"
                  >
                    Permanently Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
