import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAPMS } from '../context/APMSContext';
import { Mail, Lock, LogIn } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginForm {
  email: string;
  password?: string;
}

export default function Login() {
  const { login, error: contextError } = useAPMS();
  const navigate = useNavigate();
  const [localError, setLocalError] = useState<string | null>(null);
  
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = async (data: LoginForm) => {
    setLocalError(null);
    const success = await login(data.email, data.password || "");
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Portal Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-cyan-500 flex items-center justify-center font-display font-bold text-slate-950 text-3xl shadow-lg shadow-cyan-500/20 mb-4">
            A
          </div>
          <h2 className="font-display font-bold text-3xl text-slate-100 tracking-tight glow-text">APMS Academic Portal</h2>
          <p className="text-sm text-slate-400 mt-2">Attendance & Performance Management System</p>
        </div>

        {/* Form panel */}
        <div className="glass-panel p-8 rounded-2xl shadow-xl border border-slate-800">
          {(localError || contextError) && (
            <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-mono">
              {localError || contextError}
            </div>
          )}

          <form id="login-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Email Address Input */}
            <div>
              <label htmlFor="email-input" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Mail size={16} />
                </span>
                <input
                  id="email-input"
                  type="email"
                  required
                  placeholder="name@university.edu"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border ${errors.email ? 'border-rose-500' : 'border-slate-800 focus:border-cyan-500'} rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none transition-all duration-200`}
                  {...register('email', { required: 'Email is required' })}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Access PIN / Password</label>
                <Link to="/forgot" className="text-xs text-cyan-500 hover:underline">Forgot?</Link>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-800 focus:border-cyan-500 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none transition"
                  {...register('password')}
                />
              </div>
            </div>

            {/* Submit Action button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider transition duration-200 shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn size={16} />
              <span>{isSubmitting ? 'Verifying Identity...' : 'Sign In Portal'}</span>
            </button>
          </form>

          {/* Registration navigation */}
          <div className="text-center mt-6 border-t border-slate-800/80 pt-4">
            <span className="text-slate-400 text-xs">New student or admin? </span>
            <Link to="/register" className="text-cyan-500 text-xs font-semibold hover:underline">Register Account</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
