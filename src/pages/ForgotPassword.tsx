import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-6">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-cyan-500 flex items-center justify-center font-display font-bold text-slate-950 text-2xl shadow-lg shadow-cyan-500/20 mb-3">
            A
          </div>
          <h2 className="font-display font-bold text-2xl text-slate-100 tracking-tight glow-text">Reset Access Key</h2>
          <p className="text-sm text-slate-400 mt-1.5">Recover your student dashboard credentials</p>
        </div>

        <div className="glass-panel p-8 rounded-2xl shadow-xl border border-slate-800">
          {!submitted ? (
            <form id="forgot-form" onSubmit={handleSubmit} className="space-y-5">
              <p className="text-xs text-slate-400 leading-relaxed">
                Enter your registered academic email address. We will simulate sending a secured recovery PIN and authentication reset link.
              </p>
              
              <div>
                <label htmlFor="forgot-email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Registered Email</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Mail size={16} />
                  </span>
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    placeholder="e.g. shivam@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-800 focus:border-cyan-500 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none transition-all duration-200"
                  />
                </div>
              </div>

              <button
                id="forgot-submit-btn"
                type="submit"
                className="w-full py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-xl text-sm transition duration-200 shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send size={16} />
                <span>Request Recovery PIN</span>
              </button>
            </form>
          ) : (
            <div className="text-center py-4 space-y-4">
              <div className="inline-flex w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 mx-auto">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="font-semibold text-slate-100 text-lg">Reset Link Dispatched</h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                We've simulated sending a recovery link and PIN to <span className="text-cyan-400 font-mono font-semibold">{email}</span>. Please check your system notification simulation logs.
              </p>
              <button 
                onClick={() => setSubmitted(false)}
                className="text-xs text-cyan-500 hover:text-cyan-400 hover:underline"
              >
                Change email address
              </button>
            </div>
          )}

          <div className="text-center mt-6 border-t border-slate-800/80 pt-4">
            <Link to="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 text-xs transition duration-150">
              <ArrowLeft size={14} />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
