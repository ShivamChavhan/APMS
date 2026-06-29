import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { APMSProvider, useAPMS } from './context/APMSContext';
import SidebarLayout from './components/SidebarLayout';

// Pages import
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import Marks from './pages/Marks';
import Results from './pages/Results';
import Timetable from './pages/Timetable';
import Assignments from './pages/Assignments';
import Exams from './pages/Exams';
import AcademicCalendar from './pages/AcademicCalendar';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

// Admin pages import
import AdminAcademic from './pages/AdminAcademic';
import AdminCurriculum from './pages/AdminCurriculum';
import AdminSchedules from './pages/AdminSchedules';

// Guard to protect student portal pages
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { auth } = useAPMS();
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <SidebarLayout>{children}</SidebarLayout>;
}

export default function App() {
  return (
    <APMSProvider>
      <HashRouter>
        <Routes>
          {/* Public guest authentication routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot" element={<ForgotPassword />} />

          {/* Protected portals */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
          <Route path="/marks" element={<ProtectedRoute><Marks /></ProtectedRoute>} />
          <Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
          <Route path="/timetable" element={<ProtectedRoute><Timetable /></ProtectedRoute>} />
          <Route path="/assignments" element={<ProtectedRoute><Assignments /></ProtectedRoute>} />
          <Route path="/exams" element={<ProtectedRoute><Exams /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><AcademicCalendar /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          
          {/* Admin dedicated routes */}
          <Route path="/admin-academic" element={<ProtectedRoute><AdminAcademic /></ProtectedRoute>} />
          <Route path="/admin-curriculum" element={<ProtectedRoute><AdminCurriculum /></ProtectedRoute>} />
          <Route path="/admin-schedules" element={<ProtectedRoute><AdminSchedules /></ProtectedRoute>} />

          {/* Fallback wildcard redirection */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </APMSProvider>
  );
}
