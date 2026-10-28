import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { ReportIssuePage } from './pages/ReportIssuePage';
import { MyReportsPage } from './pages/MyReportsPage';
import { ReportDetailPage } from './pages/ReportDetailPage';
import { CivicMapPage } from './pages/CivicMapPage';
import { StaffDashboard } from './pages/StaffDashboard';
import { ManagedIssuesPage } from './pages/ManagedIssuesPage';
import { ManagedIssueDetailPage } from './pages/ManagedIssueDetailPage';
import { DuplicateReviewPage } from './pages/DuplicateReviewPage';
import { RecurringIssuesPage } from './pages/RecurringIssuesPage';
import { SlaTrackingPage } from './pages/SlaTrackingPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { SettingsPage } from './pages/SettingsPage';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const NotificationToast: React.FC = () => {
  const { notification, clearNotification } = useAuth();
  if (!notification) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-white border border-slate-200 rounded-xl shadow-lg p-3 flex items-start gap-3 transition-all animate-in slide-in-from-bottom-2">
      {notification.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
      {notification.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />}
      {notification.type === 'info' && <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />}
      <div className="flex-1 text-xs text-slate-700">{notification.message}</div>
      <button onClick={clearNotification} className="text-slate-400 hover:text-slate-600 p-0.5">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#1E293B]">
          <Navbar />
          <div className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/map" element={<CivicMapPage />} />

              {/* Citizen Routes */}
              <Route path="/dashboard" element={<CitizenDashboard />} />
              <Route path="/report" element={<ReportIssuePage />} />
              <Route path="/my-reports" element={<MyReportsPage />} />
              <Route path="/reports/:id" element={<ReportDetailPage />} />

              {/* Municipal Staff Routes */}
              <Route path="/staff" element={<StaffDashboard />} />
              <Route path="/staff/issues" element={<ManagedIssuesPage />} />
              <Route path="/staff/issues/:id" element={<ManagedIssueDetailPage />} />
              <Route path="/staff/duplicates" element={<DuplicateReviewPage />} />
              <Route path="/staff/recurring" element={<RecurringIssuesPage />} />
              <Route path="/staff/sla" element={<SlaTrackingPage />} />
              <Route path="/staff/analytics" element={<AnalyticsPage />} />
              <Route path="/staff/audit" element={<AuditLogsPage />} />
              <Route path="/staff/settings" element={<SettingsPage />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <Footer />
          <NotificationToast />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
