import React, { useState, useEffect } from 'react';
import { useAPMS } from '../context/APMSContext';
import { 
  Plus, Layers, Calendar, Users, ShieldAlert, CheckCircle, Trash2, 
  Send, School, ArrowRight, BookOpen, UserPlus, FileCheck
} from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminAcademic() {
  const { 
    departments, semesters, divisions, batches, facultyList,
    addDepartment, deleteDepartment, addSemester, deleteSemester, publishSemester, 
    addDivision, deleteDivision, addBatch, deleteBatch, addFaculty, deleteFaculty, fetchAdminData, loading
  } = useAPMS();

  // Load latest on mount
  useEffect(() => {
    fetchAdminData();
  }, []);

  // Form states
  const [deptForm, setDeptForm] = useState({ name: '', code: '' });
  const [semForm, setSemForm] = useState({ name: '', departmentId: '', academicYear: '2026-27', attendanceRequirement: 75 });
  const [divForm, setDivForm] = useState({ name: '', semesterId: '' });
  const [batchForm, setBatchForm] = useState({ name: '', divisionId: '' });
  const [facForm, setFacForm] = useState({ name: '', email: '', departmentId: '' });

  const [activeTab, setActiveTab] = useState<'departments' | 'semesters' | 'divisions' | 'faculty'>('departments');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    confirmClass?: string;
    onConfirm: () => void | Promise<void>;
  } | null>(null);

  const triggerConfirm = (
    title: string, 
    message: string, 
    onConfirm: () => void | Promise<void>,
    confirmText = "Confirm Delete",
    confirmClass = "bg-rose-500 hover:bg-rose-400 text-slate-950"
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      confirmText,
      confirmClass,
      onConfirm: async () => {
        await onConfirm();
        setConfirmModal(null);
      }
    });
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptForm.name || !deptForm.code) return;
    await addDepartment(deptForm);
    showSuccess(`Department '${deptForm.name}' created successfully!`);
    setDeptForm({ name: '', code: '' });
  };

  const handleCreateSem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!semForm.name || !semForm.departmentId) return;
    await addSemester(semForm);
    showSuccess(`Academic Term '${semForm.name}' created successfully!`);
    setSemForm({ name: '', departmentId: '', academicYear: '2026-27', attendanceRequirement: 75 });
  };

  const handleCreateDiv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!divForm.name || !divForm.semesterId) return;
    await addDivision(divForm);
    showSuccess(`Division '${divForm.name}' created successfully!`);
    setDivForm({ name: '', semesterId: '' });
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchForm.name || !batchForm.divisionId) return;
    await addBatch(batchForm);
    showSuccess(`Batch '${batchForm.name}' created successfully!`);
    setBatchForm({ name: '', divisionId: '' });
  };

  const handleCreateFac = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facForm.name || !facForm.email || !facForm.departmentId) return;
    await addFaculty(facForm);
    showSuccess(`Faculty instructor '${facForm.name}' registered!`);
    setFacForm({ name: '', email: '', departmentId: '' });
  };

  const handlePublishSemester = async (semesterId: string) => {
    triggerConfirm(
      "Publish Semester?",
      "Are you sure you want to PUBLISH this semester? This will activate all its mapped subjects, auto-allocate student enrollments, and set up baseline attendance tracker files for enrolled students.",
      async () => {
        await publishSemester(semesterId);
        showSuccess("Semester published! Academic data and student dashboard baselines are now live.");
      },
      "Publish Term",
      "bg-cyan-500 hover:bg-cyan-400 text-slate-950"
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div>
        <span className="text-xs font-mono text-cyan-500 uppercase tracking-widest">Academic Architecture</span>
        <h1 className="font-display font-bold text-3xl text-slate-100 tracking-tight mt-1">Setup Academic Structure</h1>
        <p className="text-sm text-slate-400 mt-1">Configure departments, academic terms, divisions, student lab batches, and assign faculty profiles.</p>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-mono flex items-center gap-2">
          <CheckCircle size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Primary Sub-Navigation Row */}
      <div className="flex border-b border-slate-800 gap-2 pb-px overflow-x-auto">
        <button
          onClick={() => setActiveTab('departments')}
          className={`px-4 py-2 text-xs font-mono font-bold tracking-wider uppercase border-b-2 transition ${
            activeTab === 'departments' 
              ? 'border-cyan-500 text-cyan-400 font-bold' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Branches & Depts
        </button>
        <button
          onClick={() => setActiveTab('semesters')}
          className={`px-4 py-2 text-xs font-mono font-bold tracking-wider uppercase border-b-2 transition ${
            activeTab === 'semesters' 
              ? 'border-cyan-500 text-cyan-400 font-bold' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Semesters & Terms
        </button>
        <button
          onClick={() => setActiveTab('divisions')}
          className={`px-4 py-2 text-xs font-mono font-bold tracking-wider uppercase border-b-2 transition ${
            activeTab === 'divisions' 
              ? 'border-cyan-500 text-cyan-400 font-bold' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Divisions & Batches
        </button>
        <button
          onClick={() => setActiveTab('faculty')}
          className={`px-4 py-2 text-xs font-mono font-bold tracking-wider uppercase border-b-2 transition ${
            activeTab === 'faculty' 
              ? 'border-cyan-500 text-cyan-400 font-bold' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Faculty Roster
        </button>
      </div>

      {/* Content views */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* VIEW 1: DEPARTMENTS */}
        {activeTab === 'departments' && (
          <>
            <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
                <School size={18} className="text-cyan-400" />
                <span>Registered Branches</span>
              </h2>
              
              <div className="space-y-3">
                {departments.length > 0 ? (
                  departments.map(dept => (
                    <div key={dept.id} className="p-4 bg-slate-900/40 rounded-xl border border-slate-850 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-200">{dept.name}</h4>
                        <span className="text-xs text-slate-500 font-mono mt-0.5 block">CODE: {dept.code} • ID: {dept.id}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded uppercase font-mono border border-cyan-500/15">Active</span>
                        <button
                          onClick={() => {
                            triggerConfirm(
                              "Delete Department?",
                              `Are you sure you want to delete department "${dept.name}"? This will cascade delete all its semesters, subjects, timetable, and faculty.`,
                              async () => {
                                await deleteDepartment(dept.id);
                                showSuccess(`Department '${dept.name}' deleted successfully!`);
                              }
                            );
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                          title="Delete Department"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-500 font-mono text-xs">No branches configured yet.</div>
                )}
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">Add New Branch</h3>
              <form onSubmit={handleCreateDept} className="space-y-4">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1.5">Branch / Department Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Computer Science Engineering"
                    value={deptForm.name}
                    onChange={e => setDeptForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1.5">Department Code Prefix</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CSE"
                    value={deptForm.code}
                    onChange={e => setDeptForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 rounded-xl text-xs font-bold transition duration-150 flex items-center justify-center gap-1.5 shadow-cyan-500/20 shadow-md"
                >
                  <Plus size={14} />
                  <span>Register Department</span>
                </button>
              </form>
            </div>
          </>
        )}

        {/* VIEW 2: SEMESTERS */}
        {activeTab === 'semesters' && (
          <>
            <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
                <Calendar size={18} className="text-cyan-400" />
                <span>Academic Semesters & Publish</span>
              </h2>
              
              <div className="space-y-4">
                {semesters.length > 0 ? (
                  semesters.map(sem => {
                    const dept = departments.find(d => d.id === sem.departmentId);
                    return (
                      <div key={sem.id} className="p-4 bg-slate-900/40 rounded-xl border border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-200">{sem.name}</h4>
                            <span className="text-[10px] font-mono text-cyan-500 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                              {dept?.code || "GENERIC"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">Academic Year: {sem.academicYear} • Minimum Required Attendance: {sem.attendanceRequirement}%</p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {sem.published ? (
                            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-bold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                              <CheckCircle size={14} />
                              <span>Live / Published</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => handlePublishSemester(sem.id)}
                              className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold font-mono text-xs rounded-xl shadow-cyan-500/10 shadow-md transition duration-150"
                            >
                              Publish Term
                            </button>
                          )}
                          <button
                            onClick={() => {
                              triggerConfirm(
                                "Delete Semester?",
                                `Are you sure you want to delete semester "${sem.name}"? This will cascade delete its divisions, batches, subjects, and timetables.`,
                                async () => {
                                  await deleteSemester(sem.id);
                                  showSuccess(`Semester '${sem.name}' deleted successfully!`);
                                }
                              );
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                            title="Delete Semester"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-slate-500 font-mono text-xs">No academic terms configured yet.</div>
                )}
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">Create Academic Term</h3>
              <form onSubmit={handleCreateSem} className="space-y-4">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1.5">Department / Branch</label>
                  <select
                    required
                    value={semForm.departmentId}
                    onChange={e => setSemForm(prev => ({ ...prev, departmentId: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">-- Select Department --</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1.5">Semester Name / Level</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Semester V (CSE)"
                    value={semForm.name}
                    onChange={e => setSemForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1.5">Academic Session Year</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2026-27"
                    value={semForm.academicYear}
                    onChange={e => setSemForm(prev => ({ ...prev, academicYear: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1.5">Min Attendance Target (%)</label>
                  <input
                    type="number"
                    required
                    min={50}
                    max={100}
                    value={semForm.attendanceRequirement}
                    onChange={e => setSemForm(prev => ({ ...prev, attendanceRequirement: Number(e.target.value) }))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 rounded-xl text-xs font-bold transition duration-150 flex items-center justify-center gap-1.5 shadow-cyan-500/20 shadow-md"
                >
                  <Plus size={14} />
                  <span>Register Semester</span>
                </button>
              </form>
            </div>
          </>
        )}

        {/* VIEW 3: DIVISIONS & BATCHES */}
        {activeTab === 'divisions' && (
          <>
            <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-200 flex items-center gap-2 mb-4">
                  <Users size={18} className="text-cyan-400" />
                  <span>Division Streams & Batch Classes</span>
                </h2>
                
                <div className="space-y-4">
                  {divisions.length > 0 ? (
                    divisions.map(div => {
                      const sem = semesters.find(s => s.id === div.semesterId);
                      const divBatches = batches.filter(b => b.divisionId === div.id);
                      return (
                        <div key={div.id} className="p-4 bg-slate-900/40 rounded-xl border border-slate-850 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-bold text-slate-200">Division Stream: {div.name}</h4>
                              <p className="text-[11px] text-slate-400">Belongs to Term: {sem?.name || "General"}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded">Active Stream</span>
                              <button
                                onClick={() => {
                                  triggerConfirm(
                                    "Delete Division?",
                                    `Are you sure you want to delete division "${div.name}"? This will also delete all its batches.`,
                                    async () => {
                                      await deleteDivision(div.id);
                                      showSuccess(`Division '${div.name}' deleted!`);
                                    }
                                  );
                                }}
                                className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                                title="Delete Division"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>

                          {/* Batches mapping */}
                          <div className="pl-4 border-l border-slate-800 space-y-2">
                            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1">Practical Lab Batches</span>
                            {divBatches.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {divBatches.map(b => (
                                  <span key={b.id} className="text-xs font-mono bg-slate-950 border border-slate-850 text-slate-300 px-3 py-1 rounded-lg flex items-center gap-1.5">
                                    <span>{b.name}</span>
                                    <button
                                      onClick={() => {
                                        triggerConfirm(
                                          "Delete Batch?",
                                          `Are you sure you want to delete batch "${b.name}"?`,
                                          async () => {
                                            await deleteBatch(b.id);
                                            showSuccess(`Batch '${b.name}' deleted!`);
                                          }
                                        );
                                      }}
                                      className="text-slate-500 hover:text-rose-400 p-0.5 rounded transition cursor-pointer"
                                      title="Delete Batch"
                                    >
                                      <Trash2 size={10} />
                                    </button>
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[10px] text-slate-500 font-mono italic">No practical lab batches mapped to this division yet.</p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 text-slate-500 font-mono text-xs">No divisions or stream tracks mapped yet.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar Forms for Divisions and Batches */}
            <div className="space-y-4">
              {/* Form 1: Division */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3">Add Division</h3>
                <form onSubmit={handleCreateDiv} className="space-y-3">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Target Term</label>
                    <select
                      required
                      value={divForm.semesterId}
                      onChange={e => setDivForm(prev => ({ ...prev, semesterId: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">-- Select Semester --</option>
                      {semesters.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Division Identifier</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Division A"
                      value={divForm.name}
                      onChange={e => setDivForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-md shadow-cyan-500/10"
                  >
                    <Plus size={14} />
                    <span>Create Division</span>
                  </button>
                </form>
              </div>

              {/* Form 2: Batch */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/20">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3">Add Lab Batch</h3>
                <form onSubmit={handleCreateBatch} className="space-y-3">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Target Division</label>
                    <select
                      required
                      value={batchForm.divisionId}
                      onChange={e => setBatchForm(prev => ({ ...prev, divisionId: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">-- Select Division --</option>
                      {divisions.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Batch Identifier</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Batch A1"
                      value={batchForm.name}
                      onChange={e => setBatchForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 hover:bg-cyan-500/20 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                  >
                    <Plus size={14} />
                    <span>Map Lab Batch</span>
                  </button>
                </form>
              </div>
            </div>
          </>
        )}

        {/* VIEW 4: FACULTY */}
        {activeTab === 'faculty' && (
          <>
            <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
                <UserPlus size={18} className="text-cyan-400" />
                <span>Faculty Instructor Roster</span>
              </h2>
              
              <div className="space-y-3">
                {facultyList.length > 0 ? (
                  facultyList.map(fac => {
                    const dept = departments.find(d => d.id === fac.departmentId);
                    return (
                      <div key={fac.id} className="p-4 bg-slate-900/40 rounded-xl border border-slate-850 flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-slate-200">{fac.name}</h4>
                          <span className="text-[11px] text-slate-500 mt-0.5 block">{fac.email} • Dept: {dept?.name || "General"}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-400 px-2.5 py-1 rounded-xl border border-cyan-500/15">Faculty</span>
                          <button
                            onClick={() => {
                              triggerConfirm(
                                "Remove Faculty?",
                                `Are you sure you want to remove faculty member "${fac.name}"?`,
                                async () => {
                                  await deleteFaculty(fac.id);
                                  showSuccess(`Faculty '${fac.name}' removed!`);
                                }
                              );
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                            title="Remove Faculty"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-slate-500 font-mono text-xs">No faculty instructors registered yet.</div>
                )}
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">Register Faculty</h3>
              <form onSubmit={handleCreateFac} className="space-y-4">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1.5">Instructor Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Richard Feynman"
                    value={facForm.name}
                    onChange={e => setFacForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1.5">Corporate Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. r.feynman@university.edu"
                    value={facForm.email}
                    onChange={e => setFacForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1.5">Host Department</label>
                  <select
                    required
                    value={facForm.departmentId}
                    onChange={e => setFacForm(prev => ({ ...prev, departmentId: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">-- Select Department --</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 rounded-xl text-xs font-bold transition duration-150 flex items-center justify-center gap-1.5 shadow-cyan-500/20 shadow-md"
                >
                  <Plus size={14} />
                  <span>Register Faculty</span>
                </button>
              </form>
            </div>
          </>
        )}

      </div>

      {confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative select-none"
          >
            <h3 className="font-display font-bold text-lg text-slate-100 mb-2">{confirmModal.title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">{confirmModal.message}</p>
            <div className="flex justify-end gap-3 font-mono">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await confirmModal.onConfirm();
                }}
                className={`px-4 py-2 font-bold rounded-xl text-xs transition cursor-pointer ${confirmModal.confirmClass || "bg-rose-500 hover:bg-rose-400 text-slate-950"}`}
              >
                {confirmModal.confirmText || "Confirm Delete"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
