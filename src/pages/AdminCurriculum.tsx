import React, { useState, useEffect } from 'react';
import { useAPMS } from '../context/APMSContext';
import { 
  Plus, BookOpen, Trash2, Edit2, UploadCloud, Calendar, FileText, 
  Clock, CheckCircle, ShieldAlert, Loader2, Play, Info
} from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminCurriculum() {
  const { 
    semesters, divisions, batches, facultyList,
    allSubjects, allTimetableSlots, addSubject, updateSubject, deleteSubject,
    addTimetableSlot, updateTimetableSlot, deleteTimetableSlot, fetchAdminData, addExam, addEvent
  } = useAPMS();

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Tabs
  const [activeSubTab, setActiveSubTab] = useState<'subjects' | 'timetable' | 'pdf'>('subjects');

  // Form states
  const [subForm, setSubForm] = useState({
    name: '', code: '', credit: 4, facultyId: '', semesterId: '', isPractical: false, attendanceMinRequired: 75
  });

  const [slotForm, setSlotForm] = useState({
    day: 'Monday', subjectId: '', startTime: '09:00', endTime: '10:00', room: 'LH-101', facultyId: '', divisionId: '', batchId: '', sessionType: 'Theory'
  });

  // Division-wise timetable filtering, search, and sessionType/batch filters
  const [filterDivisionId, setFilterDivisionId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterSessionType, setFilterSessionType] = useState<string>('All');
  const [filterBatch, setFilterBatch] = useState<string>('All');

  // Edit slot modal states
  const [editingSlot, setEditingSlot] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    day: 'Monday', subjectId: '', startTime: '09:00', endTime: '10:00', room: 'LH-101', facultyId: '', divisionId: '', batchId: '', sessionType: 'Theory'
  });

  // Auto-select first division on load
  useEffect(() => {
    if (divisions.length > 0 && !filterDivisionId) {
      setFilterDivisionId(divisions[0].id);
    }
  }, [divisions, filterDivisionId]);

  // PDF Parser state
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<{
    subjects: any[];
    exams: any[];
    events: any[];
  } | null>(null);
  const [importedStatus, setImportedStatus] = useState(false);

  // Status updates
  const [notif, setNotif] = useState<string | null>(null);
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

  const showNotif = (msg: string) => {
    setNotif(msg);
    setTimeout(() => setNotif(null), 3500);
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subForm.name || !subForm.code || !subForm.semesterId) return;
    await addSubject(subForm);
    showNotif(`Subject '${subForm.name}' configured successfully!`);
    setSubForm({ name: '', code: '', credit: 4, facultyId: '', semesterId: '', isPractical: false, attendanceMinRequired: 75 });
  };

  const handleDeleteSubject = async (id: string) => {
    triggerConfirm(
      "Delete Subject?",
      "Delete subject? This will remove all associated grades and attendance logs.",
      async () => {
        await deleteSubject(id);
        showNotif("Subject deleted from curriculum.");
      }
    );
  };

  const checkConflict = (newSlot: { day: string; startTime: string; endTime: string; divisionId: string; batchId?: string | null; facultyId: string; room: string }, slotIdToExclude?: string) => {
    const toMins = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + (m || 0);
    };

    const startNew = toMins(newSlot.startTime);
    const endNew = toMins(newSlot.endTime);

    return allTimetableSlots.find(existing => {
      if (slotIdToExclude && existing.id === slotIdToExclude) return false;
      if (existing.day !== newSlot.day) return false;

      const startEx = toMins(existing.startTime);
      const endEx = toMins(existing.endTime);
      const isOverlapping = startNew < endEx && startEx < endNew;
      if (!isOverlapping) return false;

      // Conflict criteria:
      // Same Division, Same Batch (or overlap where one is All/null), Same Faculty, Same Room, Same Time
      const sameDiv = existing.divisionId === newSlot.divisionId;
      const sameBatch = existing.batchId === newSlot.batchId || existing.batchId === null || newSlot.batchId === null;
      const sameFaculty = existing.facultyId === newSlot.facultyId;
      const sameRoom = existing.room === newSlot.room;

      return sameDiv && sameBatch && sameFaculty && sameRoom;
    });
  };

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotForm.subjectId || !slotForm.divisionId || !slotForm.facultyId) return;
    
    const newPayload = {
      day: slotForm.day as any,
      subjectId: slotForm.subjectId,
      startTime: slotForm.startTime,
      endTime: slotForm.endTime,
      room: slotForm.room,
      facultyId: slotForm.facultyId,
      divisionId: slotForm.divisionId,
      batchId: slotForm.batchId || null,
      sessionType: slotForm.sessionType || 'Theory'
    };

    const conflict = checkConflict(newPayload);
    if (conflict) {
      const conflictSub = allSubjects.find(s => s.id === conflict.subjectId);
      triggerConfirm(
        "Scheduling Conflict Detected",
        `There is already a class scheduled at this time that conflicts with your request:
        Subject: ${conflictSub?.name || 'Unknown'}
        Room: ${conflict.room}
        Day: ${conflict.day} (${conflict.startTime} - ${conflict.endTime})
        
        Do you want to proceed and force schedule anyway?`,
        async () => {
          await addTimetableSlot(newPayload);
          showNotif("Timetable slot force-scheduled!");
          setSlotForm(prev => ({
            ...prev,
            subjectId: '',
            facultyId: '',
            room: 'LH-101'
          }));
        },
        "Force Schedule",
        "bg-amber-500 hover:bg-amber-400 text-slate-950"
      );
      return;
    }

    await addTimetableSlot(newPayload);
    showNotif("Timetable slot scheduled!");
    setSlotForm(prev => ({
      ...prev,
      subjectId: '',
      facultyId: '',
      room: 'LH-101'
    }));
  };

  const handleUpdateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;

    const updatedPayload = {
      day: editForm.day as any,
      subjectId: editForm.subjectId,
      startTime: editForm.startTime,
      endTime: editForm.endTime,
      room: editForm.room,
      facultyId: editForm.facultyId,
      divisionId: editForm.divisionId,
      batchId: editForm.batchId || null,
      sessionType: editForm.sessionType
    };

    const conflict = checkConflict(updatedPayload, editingSlot.id);
    if (conflict) {
      const conflictSub = allSubjects.find(s => s.id === conflict.subjectId);
      triggerConfirm(
        "Scheduling Conflict Detected",
        `There is already a class scheduled at this time that conflicts with your update:
        Subject: ${conflictSub?.name || 'Unknown'}
        Room: ${conflict.room}
        Day: ${conflict.day} (${conflict.startTime} - ${conflict.endTime})
        
        Do you want to proceed and force update anyway?`,
        async () => {
          await updateTimetableSlot(editingSlot.id, updatedPayload);
          showNotif("Timetable slot force-updated!");
          setEditingSlot(null);
        },
        "Force Update",
        "bg-amber-500 hover:bg-amber-400 text-slate-950"
      );
      return;
    }

    await updateTimetableSlot(editingSlot.id, updatedPayload);
    showNotif("Timetable slot updated!");
    setEditingSlot(null);
  };

  const handleDeleteSlot = async (id: string) => {
    triggerConfirm(
      "Remove Timetable Slot?",
      "Are you sure you want to remove this timetable slot?",
      async () => {
        await deleteTimetableSlot(id);
        showNotif("Slot removed.");
      }
    );
  };

  // PDF File Upload Handler
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPdfLoading(true);
    setPdfError(null);
    setExtractedData(null);
    setImportedStatus(false);

    try {
      // Read file as base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        try {
          const res = await fetch('/api/parse-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pdfData: base64String, fileName: file.name })
          });

          if (!res.ok) {
            const errJson = await res.json();
            throw new Error(errJson.error || "Failed to process document");
          }

          const result = await res.json();
          setExtractedData(result.data);
          showNotif("Syllabus / AAP parsed successfully via AI extraction engine!");
        } catch (apiErr: any) {
          setPdfError(apiErr.message || "An error occurred during API processing.");
        } finally {
          setPdfLoading(false);
        }
      };
      reader.readAsDataURL(file);

    } catch (err: any) {
      setPdfError(err.message || "Failed to read file.");
      setPdfLoading(false);
    }
  };

  // Import Staged items from Gemini
  const handleImportStaged = async () => {
    if (!extractedData) return;
    setPdfLoading(true);
    try {
      // Pick a default semester and faculty if not mapped
      const targetSemesterId = semesters[0]?.id;
      const defaultFacultyId = facultyList[0]?.id || "fac-1";

      if (!targetSemesterId) {
        alert("Please create at least one Semester in Academic Setup first so subjects can be mapped.");
        setPdfLoading(false);
        return;
      }

      // 1. Import subjects
      for (const item of extractedData.subjects) {
        await addSubject({
          name: item.name,
          code: item.code,
          credit: Number(item.credit) || 4,
          facultyId: defaultFacultyId,
          semesterId: targetSemesterId,
          isPractical: item.name.toLowerCase().includes("lab") || item.name.toLowerCase().includes("practical"),
          attendanceMinRequired: 75
        });
      }

      // 2. Import Exams
      for (const item of extractedData.exams) {
        // Find subject or match to generic
        const matchedSub = allSubjects.find(s => s.name.toLowerCase() === item.subjectName.toLowerCase());
        await addExam({
          subjectId: matchedSub?.id || allSubjects[0]?.id || "sub-1",
          date: item.date || "2026-07-15",
          time: item.time || "10:00",
          room: item.room || "LH-101",
          type: item.type || "endsem",
          semesterId: targetSemesterId
        });
      }

      // 3. Import Events
      for (const item of extractedData.events) {
        await addEvent({
          title: item.title,
          date: item.date || "2026-07-01",
          type: item.type || "academic",
          description: item.description || "",
          semesterId: targetSemesterId
        });
      }

      setImportedStatus(true);
      setExtractedData(null);
      showNotif("Bulk Import successfully populated all tables!");
    } catch (err) {
      console.error(err);
      alert("Failed during bulk data creation.");
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div>
        <span className="text-xs font-mono text-cyan-500 uppercase tracking-widest">Syllabus & Timetables</span>
        <h1 className="font-display font-bold text-3xl text-slate-100 tracking-tight mt-1">Curriculum & Timetable Slots</h1>
        <p className="text-sm text-slate-400 mt-1">Assign subjects, set weekly slot timelines, or upload Administration Plan (AAP) PDFs to parse instantly.</p>
      </div>

      {notif && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-mono flex items-center gap-2">
          <CheckCircle size={16} />
          <span>{notif}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-2 pb-px overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('subjects')}
          className={`px-4 py-2 text-xs font-mono font-bold tracking-wider uppercase border-b-2 transition ${
            activeSubTab === 'subjects' ? 'border-cyan-500 text-cyan-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Syllabus Subjects
        </button>
        <button
          onClick={() => setActiveSubTab('timetable')}
          className={`px-4 py-2 text-xs font-mono font-bold tracking-wider uppercase border-b-2 transition ${
            activeSubTab === 'timetable' ? 'border-cyan-500 text-cyan-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Weekly Lecture Timetables
        </button>
        <button
          onClick={() => setActiveSubTab('pdf')}
          className={`px-4 py-2 text-xs font-mono font-bold tracking-wider uppercase border-b-2 transition ${
            activeSubTab === 'pdf' ? 'border-cyan-500 text-cyan-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          AAP PDF AI Parser
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* TAB 1: SUBJECTS CURRICULUM */}
        {activeSubTab === 'subjects' && (
          <>
            <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
                <BookOpen size={18} className="text-cyan-400" />
                <span>Active Syllabus Courses</span>
              </h2>

              <div className="space-y-3">
                {allSubjects.length > 0 ? (
                  allSubjects.map(sub => {
                    const sem = semesters.find(s => s.id === sub.semesterId);
                    const fac = facultyList.find(f => f.id === sub.facultyId);
                    return (
                      <div key={sub.id} className="p-4 bg-slate-900/40 rounded-xl border border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-800 transition">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/15">
                              {sub.code}
                            </span>
                            <h4 className="text-sm font-bold text-slate-200">{sub.name}</h4>
                          </div>
                          <p className="text-xs text-slate-400 mt-1.5">
                            Credits: {sub.credit} • Faculty: {fac?.name || "To Be Assigned"} • Target: {sem?.name || "Unassigned Term"}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                              sub.isPractical ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/15' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {sub.isPractical ? "Practical/Lab Session" : "Theory/Lecture"}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">
                              Min Attendance Req: {sub.attendanceMinRequired}%
                            </span>
                          </div>
                        </div>

                        <button 
                          onClick={() => handleDeleteSubject(sub.id)}
                          className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition self-end sm:self-center"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-slate-500 font-mono text-xs">No subjects mapped in curriculum yet.</div>
                )}
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">Add Course Subject</h3>
              <form onSubmit={handleCreateSubject} className="space-y-4">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Target Semester Term</label>
                  <select
                    required
                    value={subForm.semesterId}
                    onChange={e => setSubForm(prev => ({ ...prev, semesterId: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">-- Select Semester --</option>
                    {semesters.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Course Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Artificial Intelligence"
                    value={subForm.name}
                    onChange={e => setSubForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">Subject Code</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CS-501"
                      value={subForm.code}
                      onChange={e => setSubForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">Credits count</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={6}
                      value={subForm.credit}
                      onChange={e => setSubForm(prev => ({ ...prev, credit: Number(e.target.value) }))}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Faculty Instructor</label>
                  <select
                    required
                    value={subForm.facultyId}
                    onChange={e => setSubForm(prev => ({ ...prev, facultyId: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">-- Select Faculty --</option>
                    {facultyList.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3 py-2 border-y border-slate-850">
                  <input
                    type="checkbox"
                    id="isPractical"
                    checked={subForm.isPractical}
                    onChange={e => setSubForm(prev => ({ ...prev, isPractical: e.target.checked }))}
                    className="accent-cyan-500"
                  />
                  <label htmlFor="isPractical" className="text-xs text-slate-300 select-none">This is a Practical Lab Session</label>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-cyan-500/20 shadow-md"
                >
                  <Plus size={14} />
                  <span>Map Syllabus Subject</span>
                </button>
              </form>
            </div>
          </>
        )}

        {/* TAB 2: TIMETABLES */}
        {activeSubTab === 'timetable' && (
          <>
            <div className="lg:col-span-2 space-y-4">
              {/* Division Selection Tabs */}
              <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Select Division Stream</span>
                <div className="flex flex-wrap gap-2">
                  {divisions.map(d => {
                    const count = allTimetableSlots.filter(s => s.divisionId === d.id).length;
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => {
                          setFilterDivisionId(d.id);
                          setFilterBatch('All');
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold font-mono tracking-wider transition-all duration-200 flex items-center gap-2 ${
                          filterDivisionId === d.id
                            ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/10 font-bold font-sans'
                            : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-850'
                        }`}
                      >
                        <BookOpen size={13} />
                        <span>{d.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                          filterDivisionId === d.id ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-slate-900 text-slate-500'
                        }`}>{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Search & Filters */}
              <div className="glass-panel p-4 rounded-2xl border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none text-xs font-mono">🔍</span>
                  <input
                    type="text"
                    placeholder="Search Subject / Faculty..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                
                <div>
                  <select
                    value={filterSessionType}
                    onChange={e => setFilterSessionType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="All">All Session Types</option>
                    <option value="Theory">Theory Only</option>
                    <option value="Lab">Lab Only</option>
                    <option value="Exam">Exam Only</option>
                    <option value="Multidisciplinary Minor">Minor Only</option>
                  </select>
                </div>

                <div>
                  <select
                    value={filterBatch}
                    onChange={e => setFilterBatch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="All">All Batches</option>
                    <option value="Theory">Theory Only (Batch: All)</option>
                    {filterDivisionId && batches.filter(b => b.divisionId === filterDivisionId).map(b => (
                      <option key={b.id} value={b.name}>{b.name} Only</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Weekly Day-Wise List */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                <h2 className="text-base font-bold text-slate-200 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <Clock size={18} className="text-cyan-400" />
                    <span>Weekly Lecture Schedules</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {divisions.find(d => d.id === filterDivisionId)?.name || 'Select a division'}
                  </span>
                </h2>

                <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                  {allTimetableSlots.filter(s => s.divisionId === filterDivisionId).length > 0 ? (
                    ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(dayName => {
                      const daySlots = allTimetableSlots.filter(s => {
                        if (s.divisionId !== filterDivisionId) return false;
                        if (s.day !== dayName) return false;
                        
                        const sub = allSubjects.find(subj => subj.id === s.subjectId);
                        const fac = facultyList.find(f => f.id === s.facultyId);
                        
                        // Search query
                        if (searchQuery) {
                          const query = searchQuery.toLowerCase();
                          const matchesSubject = sub?.name.toLowerCase().includes(query) || sub?.code.toLowerCase().includes(query);
                          const matchesFaculty = fac?.name.toLowerCase().includes(query);
                          if (!matchesSubject && !matchesFaculty) return false;
                        }

                        // Session Type filter
                        if (filterSessionType !== 'All') {
                          const sType = s.sessionType || (sub?.isPractical ? 'Lab' : 'Theory');
                          if (sType !== filterSessionType) return false;
                        }

                        // Batch filter
                        if (filterBatch !== 'All') {
                          if (filterBatch === 'Theory') {
                            if (s.batchId !== null) return false;
                          } else {
                            const bat = batches.find(b => b.id === s.batchId);
                            if (!bat || bat.name !== filterBatch) return false;
                          }
                        }

                        return true;
                      });

                      if (daySlots.length === 0) return null;

                      // Sort day slots by start time
                      daySlots.sort((a, b) => a.startTime.localeCompare(b.startTime));

                      return (
                        <div key={dayName} className="space-y-3">
                          <span className="text-xs font-mono font-bold uppercase text-cyan-500 tracking-wider block border-b border-slate-850 pb-1.5">{dayName} Slots</span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {daySlots.map(slot => {
                              const sub = allSubjects.find(s => s.id === slot.subjectId);
                              const div = divisions.find(d => d.id === slot.divisionId);
                              const bat = batches.find(b => b.id === slot.batchId);
                              const fac = facultyList.find(f => f.id === slot.facultyId);
                              const sType = slot.sessionType || (sub?.isPractical ? 'Lab' : 'Theory');

                              return (
                                <div key={slot.id} className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 hover:border-cyan-500/30 transition-all flex justify-between gap-3 shadow-md hover:shadow-cyan-500/5">
                                  <div className="min-w-0 space-y-2">
                                    <div className="flex flex-wrap gap-1.5 items-center">
                                      <span className="text-[10px] font-mono font-semibold text-cyan-400 bg-cyan-500/5 px-2 py-0.5 rounded border border-cyan-500/10">
                                        {slot.startTime} - {slot.endTime}
                                      </span>
                                      <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${
                                        sType === 'Lab' ? 'bg-indigo-500/5 border-indigo-500/20 text-indigo-400' :
                                        sType === 'Exam' ? 'bg-rose-500/5 border-rose-500/20 text-rose-400' :
                                        sType === 'Multidisciplinary Minor' ? 'bg-amber-500/5 border-amber-500/20 text-amber-400' :
                                        'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                                      }`}>
                                        {sType}
                                      </span>
                                    </div>
                                    
                                    <div>
                                      <h4 className="text-sm font-bold text-slate-100 truncate">{sub?.name || "Unassigned Subject"}</h4>
                                      <p className="text-xs text-slate-300 font-medium mt-0.5">Faculty: {fac?.name || "No faculty assigned"}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-400 font-mono">
                                      <div>Batch: <span className="text-slate-300 font-sans font-semibold">{bat ? bat.name : 'All'}</span></div>
                                      <div>Room: <span className="text-slate-300 font-sans font-semibold">{slot.room}</span></div>
                                      <div className="col-span-2">Division: <span className="text-slate-300 font-sans font-semibold">{div?.name || 'All'}</span></div>
                                    </div>
                                  </div>

                                  <div className="flex flex-col justify-between items-end shrink-0 gap-2 border-l border-slate-800/80 pl-3">
                                    <button 
                                      type="button"
                                      onClick={() => {
                                        setEditingSlot(slot);
                                        setEditForm({
                                          day: slot.day,
                                          subjectId: slot.subjectId,
                                          startTime: slot.startTime,
                                          endTime: slot.endTime,
                                          room: slot.room,
                                          facultyId: slot.facultyId,
                                          divisionId: slot.divisionId,
                                          batchId: slot.batchId || '',
                                          sessionType: sType
                                        });
                                      }}
                                      className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/5 rounded-lg transition"
                                      title="Edit Lecture"
                                    >
                                      <Edit2 size={13} />
                                    </button>
                                    <button 
                                      type="button"
                                      onClick={() => handleDeleteSlot(slot.id)}
                                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 rounded-lg transition"
                                      title="Delete Lecture"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 text-slate-500 font-mono text-xs">No timetable slots configured yet for this division.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800 h-fit space-y-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Schedule Lectures</h3>
              <form onSubmit={handleCreateSlot} className="space-y-4">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Target Division Stream</label>
                  <select
                    required
                    value={slotForm.divisionId}
                    onChange={e => setSlotForm(prev => ({ ...prev, divisionId: e.target.value, batchId: '' }))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">-- Select Division --</option>
                    {divisions.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                {slotForm.divisionId && batches.filter(b => b.divisionId === slotForm.divisionId).length > 0 && (
                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">Target Practical Batch (Optional)</label>
                    <select
                      value={slotForm.batchId}
                      onChange={e => setSlotForm(prev => ({ ...prev, batchId: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">-- Theory Class (Entire Division) --</option>
                      {batches.filter(b => b.divisionId === slotForm.divisionId).map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">Weekly Day</label>
                    <select
                      value={slotForm.day}
                      onChange={e => setSlotForm(prev => ({ ...prev, day: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    >
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">Session Type</label>
                    <select
                      value={slotForm.sessionType}
                      onChange={e => setSlotForm(prev => ({ ...prev, sessionType: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="Theory">Theory</option>
                      <option value="Lab">Lab</option>
                      <option value="Exam">Exam</option>
                      <option value="Multidisciplinary Minor">Multidisciplinary Minor</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Syllabus Subject</label>
                  <select
                    required
                    value={slotForm.subjectId}
                    onChange={e => setSlotForm(prev => ({ ...prev, subjectId: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">-- Select Subject --</option>
                    {allSubjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">Start Time (HH:MM)</label>
                    <input
                      type="text"
                      required
                      placeholder="09:00"
                      value={slotForm.startTime}
                      onChange={e => setSlotForm(prev => ({ ...prev, startTime: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">End Time (HH:MM)</label>
                    <input
                      type="text"
                      required
                      placeholder="10:00"
                      value={slotForm.endTime}
                      onChange={e => setSlotForm(prev => ({ ...prev, endTime: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Assigned Faculty Member</label>
                  <select
                    required
                    value={slotForm.facultyId}
                    onChange={e => setSlotForm(prev => ({ ...prev, facultyId: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">-- Select Faculty --</option>
                    {facultyList.map(f => (
                      <option key={f.id} value={f.id}>{f.name} ({f.email})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Classroom Room Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LH-301 or Lab 2"
                    value={slotForm.room}
                    onChange={e => setSlotForm(prev => ({ ...prev, room: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-cyan-500/20 shadow-md"
                >
                  <Plus size={14} />
                  <span>Schedule Lecture Slot</span>
                </button>
              </form>
            </div>
          </>
        )}

        {/* TAB 3: AAP PDF AI UPLOADER */}
        {activeSubTab === 'pdf' && (
          <div className="lg:col-span-3 space-y-6">
            <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center space-y-4 max-w-2xl mx-auto">
              <UploadCloud size={48} className="text-cyan-500 mx-auto" />
              <div>
                <h3 className="text-lg font-bold text-slate-100">AI Administration Plan (AAP) PDF Extraction</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
                  Upload an Academic Administration Plan (AAP), curriculum syllabus, or schedule outline. 
                  The built-in Gemini AI engine will parse semester terms, mapped subjects, assessment exam dates, and holidays to register them instantly.
                </p>
              </div>

              <div className="relative inline-block mt-4">
                <input
                  type="file"
                  id="aap-pdf-input"
                  accept="application/pdf"
                  onChange={handlePdfUpload}
                  disabled={pdfLoading}
                  className="hidden"
                />
                <label
                  htmlFor="aap-pdf-input"
                  className={`px-6 py-3 bg-cyan-500 text-slate-950 rounded-xl font-bold font-mono text-xs cursor-pointer shadow-cyan-500/20 shadow-md transition flex items-center gap-2 hover:bg-cyan-600 ${
                    pdfLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {pdfLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Extracting Syllabus via Gemini...</span>
                    </>
                  ) : (
                    <>
                      <FileText size={16} />
                      <span>Upload Syllabus PDF</span>
                    </>
                  )}
                </label>
              </div>

              {pdfError && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl font-mono text-left max-w-lg mx-auto flex items-start gap-2">
                  <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold">Extraction Warning</h4>
                    <p className="mt-1 leading-normal">{pdfError}</p>
                  </div>
                </div>
              )}
            </div>

            {/* REVIEW STAGING CONTAINER */}
            {extractedData && (
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-850 pb-4 gap-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-200">Staged Curriculum & AAP Data</h3>
                    <p className="text-xs text-slate-400 mt-1">Review the AI-extracted academic components below before pushing them to live databases.</p>
                  </div>
                  <button
                    onClick={handleImportStaged}
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold font-mono text-xs rounded-xl transition flex items-center gap-1.5 shadow-emerald-500/20 shadow-md"
                  >
                    <CheckCircle size={14} />
                    <span>Approve & Bulk Import Staged Assets</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Staged Subjects */}
                  <div className="space-y-3 bg-slate-900/25 p-4 rounded-xl border border-slate-850">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-500 border-b border-slate-800 pb-2">Extracted Subjects ({extractedData.subjects?.length || 0})</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                      {extractedData.subjects?.map((sub, i) => (
                        <div key={i} className="p-2.5 bg-slate-950/40 rounded-lg border border-slate-850">
                          <span className="text-[10px] font-mono text-cyan-400 font-bold">{sub.code || "CS000"}</span>
                          <h5 className="text-xs font-bold text-slate-200 mt-1 truncate">{sub.name}</h5>
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">Credits: {sub.credit || 3}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Staged Exams */}
                  <div className="space-y-3 bg-slate-900/25 p-4 rounded-xl border border-slate-850">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-500 border-b border-slate-800 pb-2">Extracted Exam Schedules ({extractedData.exams?.length || 0})</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                      {extractedData.exams?.map((ex, i) => (
                        <div key={i} className="p-2.5 bg-slate-950/40 rounded-lg border border-slate-850">
                          <span className="text-[9px] uppercase font-mono text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/15">{ex.type}</span>
                          <h5 className="text-xs font-bold text-slate-200 mt-1 truncate">{ex.subjectName}</h5>
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">Date: {ex.date} at {ex.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Staged Events */}
                  <div className="space-y-3 bg-slate-900/25 p-4 rounded-xl border border-slate-850">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-500 border-b border-slate-800 pb-2">Extracted Calendar Events ({extractedData.events?.length || 0})</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                      {extractedData.events?.map((ev, i) => (
                        <div key={i} className="p-2.5 bg-slate-950/40 rounded-lg border border-slate-850">
                          <span className="text-[9px] uppercase font-mono text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/15">{ev.type}</span>
                          <h5 className="text-xs font-bold text-slate-200 mt-1 truncate">{ev.title}</h5>
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">Date: {ev.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
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

      {editingSlot && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-200">Edit Lecture Schedule</h3>
              <button 
                onClick={() => setEditingSlot(null)}
                className="text-slate-400 hover:text-slate-200 text-xs font-mono px-2 py-1 rounded hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateSlot} className="space-y-4 text-left">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Target Division Stream</label>
                <select
                  required
                  value={editForm.divisionId}
                  onChange={e => setEditForm(prev => ({ ...prev, divisionId: e.target.value, batchId: '' }))}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  {divisions.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              {editForm.divisionId && batches.filter(b => b.divisionId === editForm.divisionId).length > 0 && (
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Target Practical Batch (Optional)</label>
                  <select
                    value={editForm.batchId}
                    onChange={e => setEditForm(prev => ({ ...prev, batchId: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">-- Theory Class (Entire Division) --</option>
                    {batches.filter(b => b.divisionId === editForm.divisionId).map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Weekly Day</label>
                  <select
                    value={editForm.day}
                    onChange={e => setEditForm(prev => ({ ...prev, day: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Session Type</label>
                  <select
                    value={editForm.sessionType}
                    onChange={e => setEditForm(prev => ({ ...prev, sessionType: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Theory">Theory</option>
                    <option value="Lab">Lab</option>
                    <option value="Exam">Exam</option>
                    <option value="Multidisciplinary Minor">Multidisciplinary Minor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Syllabus Subject</label>
                <select
                  required
                  value={editForm.subjectId}
                  onChange={e => setEditForm(prev => ({ ...prev, subjectId: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  {allSubjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Start Time (HH:MM)</label>
                  <input
                    type="text"
                    required
                    placeholder="09:00"
                    value={editForm.startTime}
                    onChange={e => setEditForm(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">End Time (HH:MM)</label>
                  <input
                    type="text"
                    required
                    placeholder="10:00"
                    value={editForm.endTime}
                    onChange={e => setEditForm(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Assigned Faculty Member</label>
                <select
                  required
                  value={editForm.facultyId}
                  onChange={e => setEditForm(prev => ({ ...prev, facultyId: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  {facultyList.map(f => (
                    <option key={f.id} value={f.id}>{f.name} ({f.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Classroom Room Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LH-301 or Lab 2"
                  value={editForm.room}
                  onChange={e => setEditForm(prev => ({ ...prev, room: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSlot(null)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 rounded-xl text-xs font-bold transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
