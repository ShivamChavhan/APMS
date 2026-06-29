import { useState } from 'react';
import { useAPMS } from '../context/APMSContext';
import { Subject } from '../types';
import { 
  GraduationCap, Edit2, Award, BookOpen, AlertTriangle, 
  ChevronRight, TrendingUp, CheckCircle, Percent
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface MarksFormInput {
  internalMarks: number;
  internalMax: number;
  practicalMarks: number;
  practicalMax: number;
  semesterMarks: number;
  semesterMax: number;
}

export default function Marks() {
  const { data, updateSubject } = useAPMS();
  const [selectedSub, setSelectedSub] = useState<Subject | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<MarksFormInput>();

  const openEditModal = (sub: Subject) => {
    setSelectedSub(sub);
    reset({
      internalMarks: sub.internalMarks,
      internalMax: sub.internalMax,
      practicalMarks: sub.practicalMarks,
      practicalMax: sub.practicalMax,
      semesterMarks: sub.semesterMarks,
      semesterMax: sub.semesterMax
    });
    setModalOpen(true);
  };

  const onSubmit = (formData: MarksFormInput) => {
    if (!selectedSub) return;
    
    // Automatically calculate standard grade based on total score percentage
    const totalScore = formData.internalMarks + formData.practicalMarks + formData.semesterMarks;
    const maxScore = formData.internalMax + formData.practicalMax + formData.semesterMax;
    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    
    let grade = 'F';
    if (percentage >= 90) grade = 'O'; // Outstanding
    else if (percentage >= 80) grade = 'A+';
    else if (percentage >= 70) grade = 'A';
    else if (percentage >= 60) grade = 'B+';
    else if (percentage >= 50) grade = 'B';
    else if (percentage >= 40) grade = 'C';
    
    updateSubject(selectedSub.id, {
      ...formData,
      grade
    });
    setModalOpen(false);
  };

  // Prepare Recharts bar chart data
  const chartData = data.subjects.map(s => {
    const scored = s.internalMarks + s.practicalMarks + s.semesterMarks;
    const max = s.internalMax + s.practicalMax + s.semesterMax;
    const percentage = max > 0 ? Math.round((scored / max) * 100) : 0;
    
    return {
      name: s.code,
      subjectName: s.name,
      Scored: scored,
      Maximum: max,
      Percentage: percentage
    };
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div>
        <span className="text-xs font-mono text-cyan-500 uppercase tracking-widest">Academic Records</span>
        <h1 className="font-display font-bold text-3xl text-slate-100 mt-1">Marks & Performance</h1>
        <p className="text-sm text-slate-400 mt-1">Manage internal exams, laboratory practicals, final semester scores, and course grade cards</p>
      </div>

      {/* Analytics chart and details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Enrolled course cards list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Subject-wise Score Cards</h3>
            <span className="text-xs text-slate-500 font-mono">Click card to edit logs</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.subjects.map((sub) => {
              const totalScored = sub.internalMarks + sub.practicalMarks + sub.semesterMarks;
              const totalMax = sub.internalMax + sub.practicalMax + sub.semesterMax;
              const percentage = totalMax > 0 ? Math.round((totalScored / totalMax) * 100) : 0;
              
              return (
                <div 
                  key={sub.id} 
                  onClick={() => openEditModal(sub)}
                  className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-cyan-500/40 cursor-pointer transition duration-200 group relative flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-mono text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded">{sub.code}</span>
                      {sub.grade && (
                        <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold font-mono rounded">
                          Grade: {sub.grade}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-200 mt-2 truncate group-hover:text-cyan-400 transition">{sub.name}</h4>
                  </div>

                  {/* Marks split values */}
                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                      <span className="text-slate-500">Internals:</span>
                      <span className="font-mono text-slate-300">{sub.internalMarks} / {sub.internalMax}</span>
                    </div>
                    {sub.practicalMax > 0 && (
                      <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                        <span className="text-slate-500">Practicals:</span>
                        <span className="font-mono text-slate-300">{sub.practicalMarks} / {sub.practicalMax}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-500">Semester Final:</span>
                      <span className="font-mono text-slate-300">{sub.semesterMarks} / {sub.semesterMax}</span>
                    </div>
                  </div>

                  {/* Aggregate card footer */}
                  <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-400">Total Scored:</span>
                    <span className="font-mono text-cyan-400">{totalScored} / {totalMax} ({percentage}%)</span>
                  </div>

                  <div className="absolute bottom-4 right-4 text-cyan-500 opacity-0 group-hover:opacity-100 transition duration-150">
                    <Edit2 size={12} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recharts Performance Visual Chart */}
        <div className="space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <TrendingUp size={18} className="text-cyan-400" />
                <span>Score comparison chart</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">Aggregated marks scored against maximum possible marks limits</p>
            </div>

            <div className="h-64 w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    labelClassName="text-slate-100 font-bold text-xs"
                    itemStyle={{ fontSize: '11px' }}
                  />
                  <Bar dataKey="Scored" fill="#06b6d4" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Maximum" fill="#1e293b" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Stats list */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Grade distribution guidance</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-300">Outstanding (O):</span>
                <span className="font-mono text-cyan-500 font-bold">&gt;= 90%</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-300">Excellent (A+):</span>
                <span className="font-mono text-slate-400">80% - 89%</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-300">Very Good (A):</span>
                <span className="font-mono text-slate-400">70% - 79%</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-300">Good (B+):</span>
                <span className="font-mono text-slate-400">60% - 69%</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-300">Pass:</span>
                <span className="font-mono text-slate-400">&gt;= 40%</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Edit Marks Modal */}
      <AnimatePresence>
        {modalOpen && selectedSub && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel w-full max-w-md p-6 rounded-2xl border border-slate-800"
            >
              <h3 className="text-lg font-bold text-slate-100 mb-2 font-display">Manage Course Marks</h3>
              <p className="text-xs text-slate-400 mb-4">Edit marks card values for <span className="text-cyan-400 font-bold">{selectedSub.name} ({selectedSub.code})</span></p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                
                {/* Internals Marks split */}
                <div className="grid grid-cols-2 gap-4 border-b border-slate-800/60 pb-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Internals Scored</label>
                    <input
                      type="number"
                      required
                      min={0}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none"
                      {...register('internalMarks', { required: true, valueAsNumber: true })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Max Internals</label>
                    <input
                      type="number"
                      required
                      min={1}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none"
                      {...register('internalMax', { required: true, valueAsNumber: true })}
                    />
                  </div>
                </div>

                {/* Practicals Marks split */}
                <div className="grid grid-cols-2 gap-4 border-b border-slate-800/60 pb-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Practicals Scored</label>
                    <input
                      type="number"
                      required
                      min={0}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none"
                      {...register('practicalMarks', { required: true, valueAsNumber: true })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Max Practicals</label>
                    <input
                      type="number"
                      required
                      min={0}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none"
                      {...register('practicalMax', { required: true, valueAsNumber: true })}
                    />
                  </div>
                </div>

                {/* Semester Finals split */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Semester Scored</label>
                    <input
                      type="number"
                      required
                      min={0}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none"
                      {...register('semesterMarks', { required: true, valueAsNumber: true })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Max Semester</label>
                    <input
                      type="number"
                      required
                      min={1}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none"
                      {...register('semesterMax', { required: true, valueAsNumber: true })}
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
                    Save Scores
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
