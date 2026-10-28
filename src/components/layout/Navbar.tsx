import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Shield,
  MapPin,
  PlusCircle,
  FileDown,
  RotateCcw,
  User,
  LogOut,
  LogIn,
  LayoutDashboard,
  Layers,
  ChevronDown,
  Menu,
  X,
  FileText,
} from 'lucide-react';
import { DownloadReportModal } from '../common/DownloadReportModal';
import { api } from '../../services/api';

export const Navbar: React.FC = () => {
  const { user, logout, switchRole, showNotification } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [resettingSeed, setResettingSeed] = useState(false);

  const isStaffOrAdmin = user?.role === 'staff' || user?.role === 'admin';

  const handleResetDemo = async () => {
    try {
      setResettingSeed(true);
      await api.resetDemoData();
      showNotification('Demonstration dataset reset to initial state!', 'success');
      window.location.reload();
    } catch (err) {
      showNotification('Failed to reset demo data', 'error');
    } finally {
      setResettingSeed(false);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                    CivicSignal
                    <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded border border-blue-200">
                      MUNICIPAL
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">Issue Prioritization Platform</div>
                </div>
              </Link>

              {/* Desktop Nav Links */}
              <nav className="hidden md:flex items-center gap-1">
                <Link
                  to="/"
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isActive('/') ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/map"
                  className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    isActive('/map') ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" /> Explore Map
                </Link>

                {user && !isStaffOrAdmin && (
                  <>
                    <Link
                      to="/dashboard"
                      className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                        isActive('/dashboard') ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" /> My Dashboard
                    </Link>
                    <Link
                      to="/my-reports"
                      className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                        isActive('/my-reports') ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" /> My Reports
                    </Link>
                    <Link
                      to="/profile"
                      className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                        isActive('/profile') ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" /> Profile
                    </Link>
                  </>
                )}

                {isStaffOrAdmin && (
                  <>
                    <Link
                      to="/staff"
                      className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                        isActive('/staff') ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" /> Staff Console
                    </Link>
                    <Link
                      to="/staff/issues"
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        isActive('/staff/issues') ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      Managed Issues
                    </Link>
                    <Link
                      to="/staff/duplicates"
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        isActive('/staff/duplicates') ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      Duplicate Queue
                    </Link>
                  </>
                )}
              </nav>
            </div>

            {/* Right Action Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Quick Role Switcher */}
              <div className="relative">
                <button
                  onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-colors border border-slate-200"
                  title="Switch between Citizen, Municipal Staff, and Admin roles"
                >
                  <span className="text-[10px] uppercase font-bold text-slate-500">Role:</span>
                  <span className={`px-1.5 py-0.2 rounded text-[11px] font-semibold ${
                    user?.role === 'admin'
                      ? 'bg-purple-100 text-purple-700'
                      : user?.role === 'staff'
                      ? 'bg-teal-100 text-teal-800'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {user?.role ? user.role.toUpperCase() : 'GUEST'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {roleMenuOpen && (
                  <div className="absolute right-0 mt-1 w-52 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50 text-xs">
                    <div className="px-3 py-1 font-semibold text-slate-500 text-[10px] uppercase">
                      Switch Role Context
                    </div>
                    <button
                      onClick={() => {
                        switchRole('citizen');
                        setRoleMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between"
                    >
                      <span className="font-medium text-slate-800">Citizen (Resident)</span>
                      <span className="text-[10px] text-slate-400">Sarah Jenkins</span>
                    </button>
                    <button
                      onClick={() => {
                        switchRole('staff');
                        setRoleMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between"
                    >
                      <span className="font-medium text-teal-700">Municipal Staff</span>
                      <span className="text-[10px] text-slate-400">Marcus Vance</span>
                    </button>
                    <button
                      onClick={() => {
                        switchRole('admin');
                        setRoleMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between"
                    >
                      <span className="font-medium text-purple-700">City Administrator</span>
                      <span className="text-[10px] text-slate-400">Elena Rostova</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Reset Demo Seed Data */}
              <button
                onClick={handleResetDemo}
                disabled={resettingSeed}
                className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors border border-transparent hover:border-slate-200"
                title="Reset demo data with 5 duplicate potholes, recurring failure, and overdue issue"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${resettingSeed ? 'animate-spin text-blue-600' : ''}`} />
                <span>Reset Demo</span>
              </button>

              {/* Download Report Button (generates PDF) */}
              <button
                onClick={() => setReportModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 shadow-2xs transition-colors"
                title="Download official municipal PDF report"
              >
                <FileDown className="w-3.5 h-3.5 text-blue-600" />
                <span>Download Report</span>
              </button>

              {/* Report Issue Action Button */}
              <Link
                to="/report"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Report an Issue</span>
                <span className="sm:hidden">Report</span>
              </Link>

              {/* Auth state / Logout */}
              {user ? (
                <div className="flex items-center gap-1 sm:gap-2">
                  <Link
                    to="/profile"
                    className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                    title="View & Edit Citizen Profile"
                  >
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                      {user.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                    <span className="hidden sm:inline max-w-[85px] truncate font-semibold">
                      {user.name.split(' ')[0]}
                    </span>
                  </Link>
                  <button
                    onClick={logout}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-blue-600 px-2 py-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login</span>
                </Link>
              )}

              {/* Mobile menu hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1.5 text-slate-600 hover:text-slate-900 rounded-md"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 text-xs">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md font-medium text-slate-700 hover:bg-slate-50"
            >
              Home
            </Link>
            <Link
              to="/map"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md font-medium text-slate-700 hover:bg-slate-50"
            >
              Explore Map
            </Link>
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md font-medium text-slate-700 hover:bg-slate-50"
            >
              Citizen Dashboard
            </Link>
            <Link
              to="/my-reports"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md font-medium text-slate-700 hover:bg-slate-50"
            >
              My Reports
            </Link>
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md font-semibold text-blue-700 hover:bg-blue-50 flex items-center gap-2"
            >
              <User className="w-4 h-4 text-blue-600" />
              My Profile & Notifications
            </Link>
            <Link
              to="/staff"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md font-medium text-slate-700 hover:bg-slate-50"
            >
              Municipal Staff Console
            </Link>
            <button
              onClick={() => {
                setReportModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-md font-medium text-blue-700 hover:bg-slate-50 flex items-center gap-1.5 font-semibold"
            >
              <FileDown className="w-4 h-4 text-blue-600" />
              Download Report (PDF)
            </button>
          </div>
        )}
      </header>

      {/* Download Report Modal */}
      <DownloadReportModal isOpen={reportModalOpen} onClose={() => setReportModalOpen(false)} />
    </>
  );
};
