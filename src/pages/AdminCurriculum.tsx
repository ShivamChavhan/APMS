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
    day: 'Monday', subjectId: '', startTime: '09:00', endTime: '10:00', room: 'LH-101', facultyId: '', divisionId: '', batchId: ''
  });

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

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotForm.subjectId || !slotForm.divisionId) return;
    await addTimetableSlot({
      day: slotForm.day,
      subjectId: slotForm.subjectId,
      startTime: slotForm.startTime,
      endTime: slotForm.endTime,
      room: slotForm.room,
      facultyId: slotForm.facultyId || facultyList[0]?.id || "",
      divisionId: slotForm.divisionId,
      batchId: slotForm.batchId || null
    });
    showNotif("Timetable slot scheduled!");
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
    <div className="space-y-6 select-none pb-12">
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
            <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
                <Clock size={18} className="text-cyan-400" />
                <span>Weekly Lecture Schedules</span>
              </h2>

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {allTimetableSlots.length > 0 ? (
                  ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(dayName => {
                    const daySlots = allTimetableSlots.filter(s => s.day === dayName);
                    if (daySlots.length === 0) return null;
                    return (
                      <div key={dayName} className="space-y-2">
                        <span className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider block border-b border-slate-850 pb-1">{dayName} Slots</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {daySlots.map(slot => {
                            const sub = allSubjects.find(s => s.id === slot.subjectId);
                            const div = divisions.find(d => d.id === slot.divisionId);
                            const bat = batches.find(b => b.id === slot.batchId);
                            return (
                              <div key={slot.id} className="p-3 bg-slate-900/40 rounded-xl border border-slate-850 flex justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/5 px-1.5 py-0.5 rounded border border-cyan-500/10">
                                      {slot.startTime} - {slot.endTime}
                                    </span>
                                  </div>
                                  <h4 className="text-xs font-bold text-slate-200 truncate mt-1.5">{sub?.name || "Unassigned Subject"}</h4>
                                  <p className="text-[10px] text-slate-400 mt-1">Room {slot.room} • {div?.name || "All Streams"}{bat ? ` • ${bat.name}` : ""}</p>
                                </div>
                                <button 
                                  onClick={() => handleDeleteSlot(slot.id)}
                                  className="text-slate-500 hover:text-rose-400 hover:bg-rose-500/5 p-1 rounded-lg self-center"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-slate-500 font-mono text-xs">No timetable slots configured yet. Create a slot on the sidebar.</div>
                )}
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">Schedule Lectures</h3>
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

    </div>
  );
}
