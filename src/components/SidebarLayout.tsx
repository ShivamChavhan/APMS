import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAPMS } from '../context/APMSContext';
import { 
  LayoutDashboard, CalendarCheck, GraduationCap, Calendar, 
  FileCheck, Clock, CalendarDays, BarChart3, User, LogOut, Menu, X, Upload,
  Users, Layers, BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const STUDENT_MENU_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/attendance', label: 'Attendance', icon: CalendarCheck },
  { path: '/marks', label: 'Marks & Grades', icon: GraduationCap },
  { path: '/results', label: 'SGPA & CGPA', icon: BarChart3 },
  { path: '/timetable', label: 'Timetable', icon: Clock },
  { path: '/assignments', label: 'Assignments', icon: FileCheck },
  { path: '/exams', label: 'Exams Countdown', icon: CalendarDays },
  { path: '/calendar', label: 'Academic Calendar', icon: Calendar },
  { path: '/profile', label: 'Profile & Settings', icon: User },
];

const ADMIN_MENU_ITEMS = [
  { path: '/', label: 'Admin Stats', icon: LayoutDashboard },
  { path: '/admin-academic', label: 'Academic Setup', icon: Layers },
  { path: '/admin-curriculum', label: 'Curriculum & PDF', icon: BookOpen },
  { path: '/admin-schedules', label: 'Schedules & Exams', icon: Calendar },
  { path: '/profile', label: 'Profile & Settings', icon: User },
];

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const { auth, logout, data } = useAPMS();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = auth.role === 'admin' ? ADMIN_MENU_ITEMS : STUDENT_MENU_ITEMS;
  const currentName = auth.role === 'admin' ? (auth.username || "Admin") : (data.profile.name || auth.username || "Student");
  const currentSub = auth.role === 'admin' ? "System Owner" : (data.profile.rollNumber || "Student");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Header Banner */}
      <header className="md:hidden glass-panel flex items-center justify-between px-4 py-3 sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-850">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center font-display font-bold text-slate-950 text-lg shadow-cyan-500/30 shadow-md">
            A
          </div>
          <span className="font-display font-semibold tracking-wide text-cyan-400">APMS Portal</span>
        </div>
        <button 
          id="mobile-menu-toggle"
          onClick={() => setMobileOpen(prev => !prev)}
          className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-900 rounded-lg transition"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Desktop Sidebar Panel */}
      <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-slate-900 border-r border-slate-800 shrink-0 select-none">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center font-display font-bold text-slate-950 text-xl shadow-cyan-500/30 shadow-lg">
            A
          </div>
          <div>
            <h1 className="font-display font-bold text-slate-100 tracking-tight leading-none">APMS</h1>
            <span className="text-xs text-cyan-500 font-mono">{auth.role === 'admin' ? "Admin Hub" : "Academic Hub"}</span>
          </div>
        </div>

        {/* User Card */}
        <div className="px-4 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-cyan-500 flex items-center justify-center font-semibold text-cyan-400">
              {currentName.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <h3 className="text-sm font-semibold truncate leading-none text-slate-200">{currentName}</h3>
              <span className="text-xs font-mono text-slate-500 block truncate mt-1">{currentSub}</span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                id={`sidebar-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition duration-200 group relative ${
                  isActive 
                    ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-500 font-semibold' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-400'} />
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-md shadow-cyan-500/50" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout Section */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/20">
          <button
            id="sidebar-logout-btn"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg text-sm font-medium transition duration-200"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer (AnimatePresence) */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-64 bg-slate-900 border-r border-slate-800 z-50 md:hidden flex flex-col h-full"
            >
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center font-display font-bold text-slate-950 text-md">
                    A
                  </div>
                  <span className="font-display font-semibold text-slate-200">APMS Menu</span>
                </div>
                <button 
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition duration-150 ${
                        isActive 
                          ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-500 font-semibold' 
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-slate-800 bg-slate-950/20">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg text-sm font-medium transition duration-200"
                >
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950 overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto w-full flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
