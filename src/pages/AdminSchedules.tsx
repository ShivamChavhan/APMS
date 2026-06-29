import React, { useState, useEffect } from 'react';
import { useAPMS } from '../context/APMSContext';
import { 
  Plus, CalendarDays, Trash2, Edit2, ShieldAlert, Award, 
  MapPin, Clock, CheckCircle, Gift, Compass, FileText
} from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminSchedules() {
  const { 
    semesters, allSubjects, allExams, allEvents,
    addExam, deleteExam, addEvent, deleteEvent, fetchAdminData
  } = useAPMS();

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Form states
  const [examForm, setExamForm] = useState({
    subjectId: '', date: '', time: '10:00', room: 'LH-101', type: 'endsem', semesterId: ''
  });

  const [eventForm, setEventForm] = useState({
    title: '', date: '', type: 'holiday', description: '', semesterId: ''
  });

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

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examForm.subjectId || !examForm.semesterId || !examForm.date) return;
    await addExam(examForm);
    showNotif("Exam schedule established successfully!");
    setExamForm({ subjectId: '', date: '', time: '10:00', room: 'LH-101', type: 'endsem', semesterId: '' });
  };

  const handleDeleteExam = async (id: string) => {
    triggerConfirm(
      "Cancel Exam Schedule?",
      "Are you sure you want to cancel and delete this exam schedule?",
      async () => {
        await deleteExam(id);
        showNotif("Exam schedule deleted.");
      }
    );
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title || !eventForm.semesterId || !eventForm.date) return;
    await addEvent(eventForm);
    showNotif(`Calendar event '${eventForm.title}' configured!`);
    setEventForm({ title: '', date: '', type: 'holiday', description: '', semesterId: '' });
  };

  const handleDeleteEvent = async (id: string) => {
    triggerConfirm(
      "Remove Calendar Event?",
      "Are you sure you want to remove this event from the academic calendar?",
      async () => {
        await deleteEvent(id);
        showNotif("Event deleted.");
      }
    );
  };

  return (
    <div className="space-y-6 select-none pb-12">
      {/* Page Header */}
      <div>
        <span className="text-xs font-mono text-cyan-500 uppercase tracking-widest">Deadlines & Terms</span>
        <h1 className="font-display font-bold text-3xl text-slate-100 tracking-tight mt-1">Exams & Holidays</h1>
        <p className="text-sm text-slate-400 mt-1">Configure mid-sem, end-sem academic calendars, schedule internal assessment milestones, and assign official student holiday leaves.</p>
      </div>

      {notif && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-mono flex items-center gap-2">
          <CheckCircle size={16} />
          <span>{notif}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* PANEL 1: EXAM SCHEDULER */}
        <div className="space-y-4">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
              <CalendarDays size={18} className="text-cyan-400" />
              <span>Configure Examination Schedules</span>
            </h2>

            <form onSubmit={handleCreateExam} className="space-y-3 bg-slate-900/20 p-4 rounded-xl border border-slate-850">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Semester Term</label>
                  <select
                    required
                    value={examForm.semesterId}
                    onChange={e => setExamForm(prev => ({ ...prev, semesterId: e.target.value, subjectId: '' }))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">-- Choose Term --</option>
                    {semesters.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Subject Course</label>
                  <select
                    required
                    value={examForm.subjectId}
                    onChange={e => setExamForm(prev => ({ ...prev, subjectId: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">-- Choose Subject --</option>
                    {allSubjects.filter(s => s.semesterId === examForm.semesterId).map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Exam Date</label>
                  <input
                    type="date"
                    required
                    value={examForm.date}
                    onChange={e => setExamForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Session Time</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10:00"
                    value={examForm.time}
                    onChange={e => setExamForm(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Hall Room</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Exam Hall C"
                    value={examForm.room}
                    onChange={e => setExamForm(prev => ({ ...prev, room: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Exam Category</label>
                  <select
                    value={examForm.type}
                    onChange={e => setExamForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="midterm">Midterm Evaluation</option>
                    <option value="endsem">End-Sem Term Examination</option>
                    <option value="practical">Practical/Lab Viva</option>
                    <option value="quiz">Internal Assessment Quiz</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold font-mono text-xs rounded-xl shadow-cyan-500/10 shadow-md transition"
              >
                Establish Examination Session
              </button>
            </form>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              <span className="text-[11px] font-mono uppercase text-slate-500 tracking-wider font-bold block">Scheduled Exams List</span>
              {allExams.length > 0 ? (
                allExams.map(ex => {
                  const sub = allSubjects.find(s => s.id === ex.subjectId);
                  const sem = semesters.find(s => s.id === ex.semesterId);
                  return (
                    <div key={ex.id} className="p-3 bg-slate-900/40 rounded-xl border border-slate-850 flex justify-between gap-3 items-center">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-mono font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/15 px-1.5 py-0.5 rounded">
                            {ex.type}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">{sem?.name || "Global Term"}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-200 mt-1">{sub?.name || "Exam Subject"}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Date: {new Date(ex.date).toLocaleDateString()} at {ex.time} • Room {ex.room}</p>
                      </div>
                      <button 
                        onClick={() => handleDeleteExam(ex.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-slate-500 font-mono text-xs">No exam sessions configured.</div>
              )}
            </div>
          </div>
        </div>

        {/* PANEL 2: HOLIDAYS & ACADEMIC CALENDAR EVENTS */}
        <div className="space-y-4">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
              <Compass size={18} className="text-cyan-400" />
              <span>Holidays & Term Dates</span>
            </h2>

            <form onSubmit={handleCreateEvent} className="space-y-3 bg-slate-900/20 p-4 rounded-xl border border-slate-850">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Target Semester</label>
                  <select
                    required
                    value={eventForm.semesterId}
                    onChange={e => setEventForm(prev => ({ ...prev, semesterId: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">-- Choose Semester --</option>
                    {semesters.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Event Date</label>
                  <input
                    type="date"
                    required
                    value={eventForm.date}
                    onChange={e => setEventForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">Event Category / Type</label>
                <select
                  value={eventForm.type}
                  onChange={e => setEventForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="holiday">Official Holiday (No lecture classes)</option>
                  <option value="exam">Examination Week Blockout</option>
                  <option value="practical">Lab Viva Assessment Period</option>
                  <option value="academic">Special Academic Event / Colloquium</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">Event Title Header</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Winter Recess Leave"
                  value={eventForm.title}
                  onChange={e => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">Detailed Description (Optional)</label>
                <textarea
                  placeholder="Provide any additional context or details..."
                  value={eventForm.description}
                  onChange={e => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 h-16 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold font-mono text-xs rounded-xl shadow-cyan-500/10 shadow-md transition"
              >
                Schedule Calendar Event
              </button>
            </form>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              <span className="text-[11px] font-mono uppercase text-slate-500 tracking-wider font-bold block">Calendar Events List</span>
              {allEvents.length > 0 ? (
                allEvents.map(ev => {
                  const sem = semesters.find(s => s.id === ev.semesterId);
                  return (
                    <div key={ev.id} className="p-3 bg-slate-900/40 rounded-xl border border-slate-850 flex justify-between gap-3 items-center">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                            ev.type === 'holiday' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/15' :
                            'bg-cyan-500/10 text-cyan-400 border border-cyan-500/15'
                          }`}>
                            {ev.type}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">{sem?.name || "Global Term"}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-200 mt-1">{ev.title}</h4>
                        {ev.description && <p className="text-[10px] text-slate-400 leading-normal mt-1">{ev.description}</p>}
                        <span className="text-[9px] text-slate-500 font-mono block mt-1">Date: {new Date(ev.date).toLocaleDateString()}</span>
                      </div>
                      <button 
                        onClick={() => handleDeleteEvent(ev.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-slate-500 font-mono text-xs">No calendar events configured.</div>
              )}
            </div>
          </div>
        </div>

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
