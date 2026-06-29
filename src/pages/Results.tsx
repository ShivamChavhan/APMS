import { useState } from 'react';
import { useAPMS } from '../context/APMSContext';
import { SemesterResult } from '../types';
import { 
  Plus, Edit2, Trash2, Award, BarChart3, TrendingUp, Calendar, 
  Sparkles, CheckCircle, Percent
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface ResultFormInput {
  semesterNo: number;
  sgpa: number;
  creditsEarned: number;
}

export default function Results() {
  const { data, addSemesterResult, updateSemesterResult, deleteSemesterResult, getCGPA } = useAPMS();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<SemesterResult | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ResultFormInput>();

  const openAddModal = () => {
    setEditingResult(null);
    reset({
      semesterNo: data.results.length + 1,
      sgpa: 8.5,
      creditsEarned: 22
    });
    setModalOpen(true);
  };

  const openEditModal = (res: SemesterResult) => {
    setEditingResult(res);
    reset({
      semesterNo: res.semesterNo,
      sgpa: res.sgpa,
      creditsEarned: res.creditsEarned
    });
    setModalOpen(true);
  };

  const onSubmit = (formData: ResultFormInput) => {
    const totalCredits = formData.creditsEarned;
    // Calculate simulated cumulative CGPA
    let calculatedCgpa = formData.sgpa;
    if (data.results.length > 0) {
      const pastEarned = data.results
        .filter(r => r.id !== editingResult?.id)
        .reduce((sum, r) => sum + (r.sgpa * r.creditsEarned), 0);
      const pastCredits = data.results
        .filter(r => r.id !== editingResult?.id)
        .reduce((sum, r) => sum + r.creditsEarned, 0);
      calculatedCgpa = (pastEarned + (formData.sgpa * formData.creditsEarned)) / (pastCredits + formData.creditsEarned);
    }

    const payload = {
      semesterNo: Number(formData.semesterNo),
      sgpa: Number(formData.sgpa),
      creditsEarned: Number(formData.creditsEarned),
      totalCredits: Number(formData.creditsEarned),
      cgpa: Number(calculatedCgpa.toFixed(2))
    };

    if (editingResult) {
      updateSemesterResult(editingResult.id, payload);
    } else {
      addSemesterResult(payload);
    }
    setModalOpen(false);
  };

  const currentCgpa = getCGPA();

  // Mapping data for Area chart progression
  const chartData = data.results.map(r => ({
    name: `Sem ${r.semesterNo}`,
    SGPA: r.sgpa,
    CGPA: r.cgpa
  }));

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-cyan-500 uppercase tracking-widest">Academic History</span>
          <h1 className="font-display font-bold text-3xl text-slate-100 mt-1">SGPA & CGPA Records</h1>
          <p className="text-sm text-slate-400 mt-1">View semester-wise SGPA logs, track cumulative progress, and manage credit logs</p>
        </div>

        <button
          id="add-result-btn"
          onClick={openAddModal}
          className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-xl text-sm transition duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-cyan-500/10"
        >
          <Plus size={16} />
          <span>Add Semester Log</span>
        </button>
      </div>

      {/* Primary analytical dashboard block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cumulative performance summary & Recharts area chart */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-100">SGPA vs CGPA Growth Trend</h3>
                <p className="text-xs text-slate-400 mt-0.5 font-sans">Visualisation of academic credit metrics over past semesters</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block font-mono">CUMULATIVE CGPA</span>
                <span className="text-2xl font-bold font-display text-cyan-400">{currentCgpa.toFixed(2)}</span>
              </div>
            </div>

            <div className="h-64 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSgpa" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorCgpa" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis domain={[5, 10]} stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                      labelClassName="text-slate-100 font-bold text-xs"
                      itemStyle={{ fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="SGPA" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorSgpa)" />
                    <Area type="monotone" dataKey="CGPA" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorCgpa)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs font-mono">
                  No past records found. Click "Add Semester Log" to start tracking.
                </div>
              )}
            </div>
          </div>

          {/* Enrolled course credits calculator summary */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Completed Semesters Database</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 font-mono">
                    <th className="py-2.5 px-4 font-semibold">Semester</th>
                    <th className="py-2.5 px-4 font-semibold">Earned Credits</th>
                    <th className="py-2.5 px-4 font-semibold">SGPA Scored</th>
                    <th className="py-2.5 px-4 font-semibold">Cumulative CGPA</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.results.map((res) => (
                    <tr key={res.id} className="border-b border-slate-800/50 hover:bg-slate-900/10 transition">
                      <td className="py-3 px-4 font-semibold text-slate-200">Semester {res.semesterNo}</td>
                      <td className="py-3 px-4 font-mono text-slate-300">{res.creditsEarned} Credits</td>
                      <td className="py-3 px-4 font-mono text-cyan-400 font-bold">{res.sgpa.toFixed(2)}</td>
                      <td className="py-3 px-4 font-mono text-slate-300">{res.cgpa.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => openEditModal(res)}
                            className="p-1 text-slate-400 hover:text-cyan-400 transition"
                            title="Edit Result Log"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => deleteSemesterResult(res.id)}
                            className="p-1 text-slate-400 hover:text-rose-400 transition"
                            title="Delete Result Log"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right side helper metrics & advice */}
        <div className="space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 p-1.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl w-fit">
              <Award size={16} />
              <span className="text-xs font-bold font-mono">CGPA Status</span>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-200">Credit Weighted Calculation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your CGPA is calculated using weighted credit sums: 
                <span className="block font-mono bg-slate-950 p-2 border border-slate-800/80 rounded mt-2 text-[10px] text-cyan-400">
                  CGPA = Σ (SGPA × Semester Credits) / Σ (Semester Credits)
                </span>
              </p>
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-400">Total Credits Earned:</span>
                <span className="font-mono text-slate-200">{data.results.reduce((sum, r) => sum + r.creditsEarned, 0)} Cr</span>
              </div>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Semester target estimator</h4>
            <p className="text-xs text-slate-400 leading-normal">
              Based on your previous CGPA of <strong className="text-slate-100 font-mono">{currentCgpa.toFixed(2)}</strong>, to achieve a target CGPA of <strong className="text-cyan-400 font-mono">9.00</strong> in the upcoming semesters, you need to maintain an average SGPA of:
            </p>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center">
              <span className="text-xs text-slate-500 font-mono block">Estimated SGPA Required</span>
              <strong className="text-lg font-mono text-cyan-400">{Math.min(10.0, Math.max(6.0, Number((9.0 * 1.2 - currentCgpa * 0.2).toFixed(2)))).toFixed(2)}</strong>
            </div>
          </div>
        </div>

      </div>

      {/* Add/Edit Result Modal */}
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
                {editingResult ? 'Edit Semester Log' : 'Add Semester Log'}
              </h3>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Semester Number</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={10}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none"
                    {...register('semesterNo', { required: true, valueAsNumber: true })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">SGPA Scored</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min={4.0}
                    max={10.0}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none"
                    {...register('sgpa', { required: true, valueAsNumber: true })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Credits Earned</label>
                  <input
                    type="number"
                    required
                    min={12}
                    max={30}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none"
                    {...register('creditsEarned', { required: true, valueAsNumber: true })}
                  />
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
                    Save Log
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
