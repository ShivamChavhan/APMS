import React, { useState, useEffect } from 'react';
import { useAPMS } from '../context/APMSContext';
import { Exam, ExamType } from '../types';
import { 
  Plus, Edit2, Trash2, Clock, CalendarDays, MapPin, 
  Sparkles, ShieldAlert, Award
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'motion/react';

interface ExamFormInput {
  subjectId: string;
  subjectName: string;
  date: string;
  time: string;
  room: string;
  type: ExamType;
}

interface ExamCountdownProps {
  exam: Exam;
  onEdit: () => void;
  onDelete: () => void;
  key?: string;
}

// Countdown Sub-Component for each individual exam card
function ExamCountdownCard({ exam, onEdit, onDelete }: ExamCountdownProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const examDate = new Date(`${exam.date}T${exam.time}`);
      const difference = examDate.getTime() - new Date().getTime();
      
      let days = 0;
      let hours = 0;
      let minutes = 0;

      if (difference > 0) {
        days = Math.floor(difference / (1000 * 60 * 60 * 24));
        hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        minutes = Math.floor((difference / 1000 / 60) % 60);
      }

      setTimeLeft({ days, hours, minutes });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000); // refresh every minute

    return () => clearInterval(interval);
  }, [exam]);

  const totalMinutesLeft = timeLeft.days * 1440 + timeLeft.hours * 60 + timeLeft.minutes;

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-slate-800 transition">
      <div>
        <div className="flex items-start justify-between gap-3">
          <span className={`px-2 py-0.5 text-[9px] font-mono font-semibold uppercase rounded-md ${
            exam.type === 'endsem' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
            exam.type === 'midterm' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
            'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
          }`}>
            {exam.type}
          </span>
          <div className="flex gap-1.5">
            <button onClick={onEdit} className="p-1 text-slate-500 hover:text-cyan-400 transition" title="Edit Exam">
              <Edit2 size={12} />
            </button>
            <button onClick={onDelete} className="p-1 text-slate-500 hover:text-rose-400 transition" title="Delete Exam">
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        <h3 className="text-base font-bold text-slate-200 mt-2 truncate">{exam.subjectName}</h3>
        
        <div className="mt-2 space-y-1.5 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="text-slate-500" />
            <span>{new Date(exam.date).toLocaleDateString()} at {exam.time}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={12} className="text-slate-500" />
            <span>Room {exam.room || "LH-101"}</span>
          </div>
        </div>
      </div>

      {/* Actual ticking countdown counter UI */}
      <div className="mt-5 border-t border-slate-800/60 pt-4">
        {totalMinutesLeft > 0 ? (
          <div className="grid grid-cols-3 gap-2 text-center select-none">
            <div className="bg-slate-900/60 border border-slate-850/80 p-2 rounded-xl">
              <strong className="block text-lg font-mono text-cyan-400 leading-none">{timeLeft.days}</strong>
              <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">Days</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-850/80 p-2 rounded-xl">
              <strong className="block text-lg font-mono text-cyan-400 leading-none">{timeLeft.hours}</strong>
              <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">Hours</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-850/80 p-2 rounded-xl">
              <strong className="block text-lg font-mono text-cyan-400 leading-none">{timeLeft.minutes}</strong>
              <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">Mins</span>
            </div>
          </div>
        ) : (
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-xl text-center flex items-center justify-center gap-1.5">
            <Award size={14} />
            <span>Exam Completed</span>
          </div>
        )}
      </div>

    </div>
  );
}

export default function Exams() {
  const { data, addExam, updateExam, deleteExam } = useAPMS();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ExamFormInput>();

  const openAddModal = () => {
    setEditingExam(null);
    reset({
      subjectId: data.subjects[0]?.id || '',
      subjectName: data.subjects[0]?.name || '',
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      room: '',
      type: 'endsem'
    });
    setModalOpen(true);
  };

  const openEditModal = (exam: Exam) => {
    setEditingExam(exam);
    reset({
      subjectId: exam.subjectId,
      subjectName: exam.subjectName,
      date: exam.date,
      time: exam.time,
      room: exam.room,
      type: exam.type
    });
    setModalOpen(true);
  };

  const onSubmit = (formData: ExamFormInput) => {
    // Attempt to lookup complete subject name if matching ID is found
    const matchSub = data.subjects.find(s => s.id === formData.subjectId);
    const payload = {
      ...formData,
      subjectName: matchSub ? matchSub.name : formData.subjectName
    };

    if (editingExam) {
      updateExam(editingExam.id, payload);
    } else {
      addExam(payload);
    }
    setModalOpen(false);
  };

  // Sort upcoming exams chronologically
  const upcomingExams = [...data.exams]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6 select-none pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-cyan-500 uppercase tracking-widest">Deadlines & countdowns</span>
          <h1 className="font-display font-bold text-3xl text-slate-100 mt-1">Exam Countdowns</h1>
          <p className="text-sm text-slate-400 mt-1 font-sans">Track midterms, end-sem evaluations, lab vivas, and assessment countdowns</p>
        </div>

        <button
          id="add-exam-btn"
          onClick={openAddModal}
          className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-xl text-sm transition duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-cyan-500/10"
        >
          <Plus size={16} />
          <span>Add Exam Date</span>
        </button>
      </div>

      {/* Countdown Grid list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {upcomingExams.length > 0 ? (
          upcomingExams.map((exam) => (
            <ExamCountdownCard
              key={exam.id}
              exam={exam}
              onEdit={() => openEditModal(exam)}
              onDelete={() => deleteExam(exam.id)}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12 glass-panel rounded-2xl border border-slate-800 text-slate-500 font-mono text-xs">
            No exams scheduled. Focus on standard lecture logs!
          </div>
        )}
      </div>

      {/* Add/Edit exam Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel w-full max-w-md p-6 rounded-2xl border border-slate-800"
            >
              <h3 className="text-lg font-bold text-slate-100 mb-4 font-display">
                {editingExam ? 'Edit Exam Details' : 'Add Exam Schedule'}
              </h3>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                
                {/* Select subject reference */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Subject / Course</label>
                  <select
                    className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none"
                    {...register('subjectId', { required: true })}
                  >
                    {data.subjects.map(s => (
                      <option key={s.id} value={s.id} className="bg-slate-950">{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>

                {/* Exam type and room */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Evaluation Type</label>
                    <select
                      className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none"
                      {...register('type', { required: true })}
                    >
                      <option value="endsem" className="bg-slate-950">End Semester (Theory)</option>
                      <option value="midterm" className="bg-slate-950">Mid Term (MSE)</option>
                      <option value="practical" className="bg-slate-950">Practical / Lab Viva</option>
                      <option value="quiz" className="bg-slate-950">Quiz / Class Test</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Exam Hall / Room</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Exam Hall B"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none"
                      {...register('room', { required: true })}
                    />
                  </div>
                </div>

                {/* Timing split */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Date</label>
                    <input
                      type="date"
                      required
                      className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none"
                      {...register('date', { required: true })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Starting Time</label>
                    <input
                      type="time"
                      required
                      className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none"
                      {...register('time', { required: true })}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 text-slate-400 hover:text-slate-200 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Save Exam Date
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
