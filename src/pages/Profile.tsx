import { useState } from 'react';
import { useAPMS } from '../context/APMSContext';
import { 
  User, Settings, Database, RefreshCw, CheckCircle, 
  Trash2, Mail, Hash, ShieldAlert, Award
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'motion/react';
import { INITIAL_DATA } from '../initialData';

interface ProfileFormInput {
  name: string;
  email: string;
  department: string;
  semester: string;
  rollNumber: string;
}

const DEPARTMENTS = [
  "Computer Science & Engineering",
  "Information Technology",
  "Electronics & Communication",
  "Electrical & Electronics",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering"
];

const SEMESTERS = [
  "Semester 1", "Semester 2", "Semester 3", "Semester 4",
  "Semester 5", "Semester 6", "Semester 7", "Semester 8"
];

export default function Profile() {
  const { data, updateProfile, logout } = useAPMS();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [resetConfirm, setResetConfirm] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormInput>({
    defaultValues: {
      name: data.profile.name,
      email: data.profile.email,
      department: data.profile.department,
      semester: data.profile.semester,
      rollNumber: data.profile.rollNumber
    }
  });

  const onSubmit = (formData: ProfileFormInput) => {
    updateProfile(formData);
    setSuccessMsg("Academic profile updated successfully in the system database!");
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleFullDatabaseReset = () => {
    localStorage.removeItem('apms_data');
    setSuccessMsg("System restored to original CS demo starter logs!");
    setResetConfirm(false);
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header section */}
      <div>
        <span className="text-xs font-mono text-cyan-500 uppercase tracking-widest">Portal Settings</span>
        <h1 className="font-display font-bold text-3xl text-slate-100 mt-1">Profile & Preferences</h1>
        <p className="text-sm text-slate-400 mt-1">Manage roll identifications, modify semesters, check safety keys, and reset active databases</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile forms card */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <User size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Academic Credentials</h3>
              <p className="text-xs text-slate-400">Edit core student identifiers utilized across academic grade sheets</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Full Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Full Student Name</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-slate-100 text-sm focus:outline-none transition"
                  {...register('name', { required: true })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Registered Email</label>
                <input
                  type="email"
                  required
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-slate-100 text-sm focus:outline-none transition"
                  {...register('email', { required: true })}
                />
              </div>
            </div>

            {/* Roll Number & Department & Semester */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Roll / Registration Number</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-slate-100 text-sm focus:outline-none transition uppercase"
                  {...register('rollNumber', { required: true })}
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Department</label>
                <select
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-slate-100 text-sm focus:outline-none transition"
                  {...register('department', { required: true })}
                >
                  {DEPARTMENTS.map(d => (
                    <option key={d} value={d} className="bg-slate-950">{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Active Semester</label>
                <select
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-slate-100 text-sm focus:outline-none transition"
                  {...register('semester', { required: true })}
                >
                  {SEMESTERS.map(s => (
                    <option key={s} value={s} className="bg-slate-950">{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notification logs */}
            {successMsg && (
              <div className="p-3.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-xs text-cyan-400 flex items-start gap-2.5">
                <CheckCircle size={14} className="shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="pt-4 border-t border-slate-800/80 flex justify-end">
              <button
                id="save-profile-btn"
                type="submit"
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-xl text-sm transition shadow-md shadow-cyan-500/10 cursor-pointer"
              >
                Save Academic Profile
              </button>
            </div>
          </form>
        </div>

        {/* Preferences and Database recovery */}
        <div className="space-y-6">
          
          {/* UI Preferences (Force Dark Mode styling details) */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Portal Visuals</h3>
            <div className="space-y-2">
              <span className="text-xs text-slate-400 leading-normal block">This platform operates on a premium, high-contrast dark Cosmic Slate theme optimized for student eye-safety during late-night exam preparations.</span>
              <div className="p-3 bg-slate-900 border border-slate-800/80 rounded-xl flex items-center justify-between">
                <span className="text-xs text-slate-300 font-semibold">Active Aesthetic:</span>
                <span className="text-xs font-mono font-bold text-cyan-400">Cosmic Slate Dark</span>
              </div>
            </div>
          </div>

          {/* Database Actions */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <Database size={14} />
              <span>Database Operations</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Wipe out all custom logs, course updates, timetables, and assessments, restoring the database to default Computer Science modules.
            </p>

            {resetConfirm ? (
              <div className="space-y-3 p-3 bg-rose-500/5 border border-rose-500/20 rounded-xl">
                <span className="text-[11px] text-rose-400 font-semibold block">Are you absolutely sure? This cannot be undone!</span>
                <div className="flex gap-2">
                  <button
                    id="confirm-db-reset-btn"
                    onClick={handleFullDatabaseReset}
                    className="flex-1 py-1.5 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs rounded-lg transition"
                  >
                    Yes, Reset DB
                  </button>
                  <button
                    onClick={() => setResetConfirm(false)}
                    className="flex-1 py-1.5 bg-slate-900 text-slate-400 text-xs rounded-lg border border-slate-850 hover:text-slate-200 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                id="db-reset-trigger-btn"
                onClick={() => setResetConfirm(true)}
                className="w-full py-2.5 border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 font-semibold rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 size={14} />
                <span>Restore Starter Database</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
