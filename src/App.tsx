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

// Guard to protect portal pages
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: ('student' | 'admin')[] }) {
  const { auth } = useAPMS();
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(auth.role)) {
    return <Navigate to="/" replace />;
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
          <Route path="/attendance" element={<ProtectedRoute allowedRoles={['student']}><Attendance /></ProtectedRoute>} />
          <Route path="/marks" element={<ProtectedRoute allowedRoles={['student']}><Marks /></ProtectedRoute>} />
          <Route path="/results" element={<ProtectedRoute allowedRoles={['student']}><Results /></ProtectedRoute>} />
          <Route path="/timetable" element={<ProtectedRoute allowedRoles={['student']}><Timetable /></ProtectedRoute>} />
          <Route path="/assignments" element={<ProtectedRoute allowedRoles={['student']}><Assignments /></ProtectedRoute>} />
          <Route path="/exams" element={<ProtectedRoute allowedRoles={['student']}><Exams /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute allowedRoles={['student']}><AcademicCalendar /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          
          {/* Admin dedicated routes */}
          <Route path="/admin-academic" element={<ProtectedRoute allowedRoles={['admin']}><AdminAcademic /></ProtectedRoute>} />
          <Route path="/admin-curriculum" element={<ProtectedRoute allowedRoles={['admin']}><AdminCurriculum /></ProtectedRoute>} />
          <Route path="/admin-schedules" element={<ProtectedRoute allowedRoles={['admin']}><AdminSchedules /></ProtectedRoute>} />

          {/* Fallback wildcard redirection */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </APMSProvider>
  );
}
