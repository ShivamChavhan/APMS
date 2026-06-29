import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAPMS } from '../context/APMSContext';
import { Mail, User, School, Hash, ArrowRight, Lock, KeyRound } from 'lucide-react';
import { motion } from 'motion/react';

interface RegisterForm {
  name: string;
  email: string;
  role: 'student' | 'admin';
  password?: string;
  departmentId?: string;
  semesterId?: string;
  divisionId?: string;
  batchId?: string;
  rollNumber?: string;
}

export default function Register() {
  const { register: registerUser, departments, semesters, divisions, batches, fetchAdminData } = useAPMS();
  const navigate = useNavigate();
  const activeRole = 'student';

  useEffect(() => {
    fetchAdminData();
  }, []);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    defaultValues: {
      role: 'student'
    }
  });

  const selectedDept = watch('departmentId');
  const selectedSem = watch('semesterId');
  const selectedDiv = watch('divisionId');

  // Filter lists based on selections
  const filteredSemesters = semesters.filter(s => s.departmentId === selectedDept);
  const filteredDivisions = divisions.filter(d => d.semesterId === selectedSem);
  const filteredBatches = batches.filter(b => b.divisionId === selectedDiv);

  const onSubmit = async (data: RegisterForm) => {
    const success = await registerUser({
      ...data,
      role: activeRole,
      password: data.password || "password"
    });
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden select-none">
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-6">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-cyan-500 flex items-center justify-center font-display font-bold text-slate-950 text-2xl shadow-lg shadow-cyan-500/20 mb-3">
            A
          </div>
          <h2 className="font-display font-bold text-2xl text-slate-100 tracking-tight glow-text">Create APMS Student Account</h2>
          <p className="text-sm text-slate-400 mt-1.5">Register your attendance & performance profile</p>
        </div>

        <div className="glass-panel p-8 rounded-2xl shadow-xl border border-slate-800">
          <form id="register-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shivam Chavhan"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-800 focus:border-cyan-500 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none transition-all duration-200"
                    {...register('name', { required: 'Full Name is required' })}
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="name@university.edu"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-800 focus:border-cyan-500 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none transition-all duration-200"
                    {...register('email', { required: 'Email is required' })}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-800 focus:border-cyan-500 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none transition-all duration-200"
                    {...register('password', { required: 'Password is required' })}
                  />
                </div>
              </div>

              {/* Confirm Roll (If Student) */}
              {activeRole === 'student' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Roll Number / Student ID</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <Hash size={16} />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CSE-2023-042"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-800 focus:border-cyan-500 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none transition-all duration-200"
                      {...register('rollNumber', { required: 'Roll Number is required' })}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Student Specific Structural Selectors */}
            {activeRole === 'student' && (
              <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-850 space-y-3">
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase block tracking-wider">Academic Term Mapping</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Department select */}
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Branch / Dept</label>
                    <select
                      required
                      className="w-full bg-slate-950 border border-slate-850 focus:border-cyan-500 rounded-xl text-slate-100 text-xs py-2 px-3 focus:outline-none"
                      {...register('departmentId', { required: 'Department mapping is required' })}
                    >
                      <option value="">-- Choose Dept --</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Semester select */}
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Semester Term</label>
                    <select
                      required
                      className="w-full bg-slate-950 border border-slate-850 focus:border-cyan-500 rounded-xl text-slate-100 text-xs py-2 px-3 focus:outline-none"
                      {...register('semesterId', { required: 'Semester mapping is required' })}
                    >
                      <option value="">-- Choose Semester --</option>
                      {filteredSemesters.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Division select */}
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Division Track</label>
                    <select
                      required
                      className="w-full bg-slate-950 border border-slate-850 focus:border-cyan-500 rounded-xl text-slate-100 text-xs py-2 px-3 focus:outline-none"
                      {...register('divisionId', { required: 'Division is required' })}
                    >
                      <option value="">-- Choose Division --</option>
                      {filteredDivisions.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Batch select */}
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Practical Batch</label>
                    <select
                      required
                      className="w-full bg-slate-950 border border-slate-850 focus:border-cyan-500 rounded-xl text-slate-100 text-xs py-2 px-3 focus:outline-none"
                      {...register('batchId', { required: 'Batch is required' })}
                    >
                      <option value="">-- Choose Batch --</option>
                      {filteredBatches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            <button
              id="register-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wide transition duration-200 shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isSubmitting ? 'Registering...' : 'Provision APMS Space'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="text-center mt-6 border-t border-slate-800/80 pt-4">
            <span className="text-slate-400 text-xs">Already registered? </span>
            <Link to="/login" className="text-cyan-500 text-xs font-semibold hover:underline">Sign In Portal</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
