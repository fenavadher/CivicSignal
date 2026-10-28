import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { CitizenReport, NotificationPreferences } from '../types';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Building,
  Bell,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ChevronRight,
  ShieldCheck,
  Save,
  RefreshCw,
  ExternalLink,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';

const WARDS = [
  'Ward 1 - North District',
  'Ward 2 - Westside Harbor',
  'Ward 3 - Central Riverfront',
  'Ward 4 - Downtown Civic District',
  'Ward 5 - Eastside Industrial',
  'Ward 6 - South Hills',
  'Ward 7 - University Heights',
];

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, showNotification } = useAuth();

  const [activeTab, setActiveTab] = useState<'activity' | 'contact' | 'notifications'>('activity');

  // Reports activity state
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Contact form state
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [department, setDepartment] = useState(user?.department || 'Ward 4 - Downtown Civic District');
  const [savingContact, setSavingContact] = useState(false);

  // Notification preferences state
  const [prefs, setPrefs] = useState<NotificationPreferences>({
    emailStatusUpdates: true,
    emailDuplicateGrouping: true,
    emailWeeklyDigest: false,
    smsEmergencyAlerts: true,
  });
  const [savingPrefs, setSavingPrefs] = useState(false);

  // Sync state when user prop updates
  useEffect(() => {
    if (user) {
      setFullName(user.name || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setDepartment(user.department || 'Ward 4 - Downtown Civic District');
      if (user.notificationPreferences) {
        setPrefs(user.notificationPreferences);
      }
    }
  }, [user]);

  // Fetch citizen's reports
  useEffect(() => {
    const loadReports = async () => {
      if (!user) return;
      try {
        setLoadingReports(true);
        const res = await api.getReports({ submitterId: user.id });
        setReports(res.reports || []);
      } catch (err) {
        console.error('Error fetching citizen reports for profile:', err);
      } finally {
        setLoadingReports(false);
      }
    };

    loadReports();
  }, [user]);

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showNotification('Full name cannot be blank', 'error');
      return;
    }

    try {
      setSavingContact(true);
      await updateProfile({
        name: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        department: department.trim(),
      });
    } catch (err) {
      showNotification('Failed to update contact information', 'error');
    } finally {
      setSavingContact(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setSavingPrefs(true);
      await updateProfile({
        notificationPreferences: prefs,
      });
    } catch (err) {
      showNotification('Failed to update notification preferences', 'error');
    } finally {
      setSavingPrefs(false);
    }
  };

  // Activity stats calculation
  const totalReports = reports.length;
  const underReviewCount = reports.filter((r) => r.status === 'under_review' || r.status === 'submitted').length;
  const inProgressCount = reports.filter((r) => r.status === 'in_progress').length;
  const resolvedCount = reports.filter((r) => r.status === 'resolved').length;

  const filteredReports = reports.filter((r) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'submitted') return r.status === 'submitted';
    if (statusFilter === 'under_review') return r.status === 'under_review';
    if (statusFilter === 'in_progress') return r.status === 'in_progress';
    if (statusFilter === 'resolved') return r.status === 'resolved';
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700">Submitted</span>;
      case 'under_review':
        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200">Under Review</span>;
      case 'in_progress':
        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200">In Progress</span>;
      case 'resolved':
        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Resolved</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'critical':
        return <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-rose-100 text-rose-800 uppercase">Critical</span>;
      case 'high':
        return <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-100 text-amber-800 uppercase">High</span>;
      case 'medium':
        return <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-blue-100 text-blue-800 uppercase">Medium</span>;
      default:
        return <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-slate-100 text-slate-700 uppercase">Low</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-xs border-2 border-white ring-2 ring-blue-100">
              {user?.name
                ? user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)
                : 'CS'}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-slate-900">{user?.name || 'Citizen User'}</h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  {user?.role === 'admin' ? 'Administrator' : user?.role === 'staff' ? 'Municipal Staff' : 'Verified Resident'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-1.5 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {user?.email}
                </span>
                {user?.department && (
                  <span className="flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    {user.department}
                  </span>
                )}
                {user?.createdAt && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Joined {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/report"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Report Issue</span>
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors"
            >
              <span>Dashboard</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-t border-slate-200 mt-6 pt-4">
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'activity'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Activity History</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700 font-bold">
              {totalReports}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('contact')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'contact'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Contact Information</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'notifications'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notification Preferences</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Activity History */}
      {activeTab === 'activity' && (
        <div className="space-y-6">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-medium text-slate-500 mb-1 flex items-center justify-between">
                <span>Total Reported</span>
                <FileText className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{totalReports}</div>
              <div className="text-[11px] text-slate-500 mt-1">Submitted civic tickets</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-medium text-slate-500 mb-1 flex items-center justify-between">
                <span>In Review</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-amber-600">{underReviewCount}</div>
              <div className="text-[11px] text-slate-500 mt-1">Assessing with engineers</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-medium text-slate-500 mb-1 flex items-center justify-between">
                <span>In Progress</span>
                <AlertTriangle className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-blue-600">{inProgressCount}</div>
              <div className="text-[11px] text-slate-500 mt-1">Dispatched work crews</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-medium text-slate-500 mb-1 flex items-center justify-between">
                <span>Resolved</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold text-emerald-600">{resolvedCount}</div>
              <div className="text-[11px] text-slate-500 mt-1">Repairs completed</div>
            </div>
          </div>

          {/* Activity Timeline & List */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Submitted Reports & Resolution History</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Track the lifecycle of every problem you reported to the municipal authorities
                </p>
              </div>

              {/* Status filter pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'submitted', label: 'Submitted' },
                  { id: 'under_review', label: 'In Review' },
                  { id: 'in_progress', label: 'In Progress' },
                  { id: 'resolved', label: 'Resolved' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                      statusFilter === tab.id
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {loadingReports ? (
              <div className="p-12 text-center">
                <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500">Loading your civic activity history...</p>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-slate-800">No reports found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  {statusFilter === 'all'
                    ? "You haven't submitted any civic issue reports yet. Notice a pothole, broken streetlight, or trash accumulation?"
                    : `No reports currently with status: ${statusFilter}.`}
                </p>
                <Link
                  to="/report"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg shadow-2xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Report an Issue</span>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      {report.photoUrl ? (
                        <img
                          src={report.photoUrl}
                          alt={report.title}
                          className="w-14 h-14 rounded-lg object-cover border border-slate-200 shrink-0 mt-0.5"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400 mt-0.5">
                          <FileText className="w-6 h-6" />
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono font-medium text-slate-400">#{report.id.slice(0, 8)}</span>
                          <span className="text-xs font-semibold text-slate-900 hover:text-blue-600">
                            {report.title}
                          </span>
                          <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {report.category.replace('_', ' ')}
                          </span>
                          {getSeverityBadge(report.severity)}
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-1 max-w-2xl">{report.description}</p>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {report.location.address || `${report.location.lat.toFixed(4)}, ${report.location.lng.toFixed(4)}`}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {new Date(report.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                          {report.managedIssueId && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-teal-700 font-medium">
                                <Layers className="w-3 h-3 text-teal-600" />
                                Grouped into Docket #{report.managedIssueId.slice(0, 8)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      {getStatusBadge(report.status)}
                      <Link
                        to={`/reports/${report.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <span>View Details</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Contact Information */}
      {activeTab === 'contact' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSaveContact} className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Personal & Contact Details</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your contact information allows municipal field engineers and dispatchers to communicate with you regarding your reported civic issues.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Email (Read-only / verified) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 bg-slate-50 text-slate-500 rounded-lg cursor-not-allowed"
                    />
                  </div>
                  <span className="text-[10px] text-emerald-600 font-medium mt-1 inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verified Account Email
                  </span>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +1 (555) 234-5678"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Used for urgent SMS hazard alerts & crew verifications</span>
                </div>

                {/* Ward / Neighborhood */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ward / Municipal District
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                    >
                      {WARDS.map((w) => (
                        <option key={w} value={w}>
                          {w}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Residential Street Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Residential Street Address
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 442 Maplewood Avenue, Apt 3B"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Enables rapid localized verification of nearby neighborhood civic notices
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={savingContact}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingContact ? 'Saving Changes...' : 'Save Contact Details'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Account Overview Sidebar Card */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Account Credentials</h3>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="text-slate-400 text-[11px]">System User ID</div>
                  <div className="font-mono font-medium text-slate-700 mt-0.5">{user?.id}</div>
                </div>

                <div>
                  <div className="text-slate-400 text-[11px]">Assigned Role</div>
                  <div className="font-medium text-slate-800 capitalize mt-0.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    {user?.role} (Municipal Resident)
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 text-[11px]">Registered Date</div>
                  <div className="text-slate-700 mt-0.5">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 text-[11px]">Verification Status</div>
                  <div className="text-emerald-700 font-medium mt-0.5 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Resident Identity Authenticated
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50/70 rounded-lg border border-blue-100 text-xs text-blue-800 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  CivicSignal complies with municipal open-record policies. Your submissions help staff cluster duplicates, prevent recurring infrastructure failures, and dispatch repairs.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Notification Preferences */}
      {activeTab === 'notifications' && (
        <div className="max-w-3xl space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Notification & Alert Preferences</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Control which communications you receive regarding the civic tickets you have submitted and infrastructure updates in your ward.
              </p>
            </div>

            <div className="space-y-4 divide-y divide-slate-100">
              {/* Option 1: Status Transitions */}
              <div className="pt-4 first:pt-0 flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-slate-800 flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                    <span>Report Status Update Emails</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Receive an automated email notification when municipal staff review your submission, assign a repair crew, or mark the issue as resolved.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={prefs.emailStatusUpdates}
                    onChange={(e) => setPrefs({ ...prefs, emailStatusUpdates: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Option 2: Duplicate Clustering */}
              <div className="pt-4 flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-slate-800 flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-teal-600" />
                    <span>Duplicate & Merge Notifications</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Get alerted if multiple neighbors report the same incident and municipal engineers merge them into a single consolidated active docket.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={prefs.emailDuplicateGrouping}
                    onChange={(e) => setPrefs({ ...prefs, emailDuplicateGrouping: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Option 3: Weekly Digest */}
              <div className="pt-4 flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-slate-800 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>Weekly Ward Infrastructure Digest</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Receive a weekly summary email detailing resolved potholes, resurfaced sidewalks, streetlight fixes, and upcoming works in your district ({department || 'Ward 4'}).
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={prefs.emailWeeklyDigest}
                    onChange={(e) => setPrefs({ ...prefs, emailWeeklyDigest: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Option 4: Urgent Hazard SMS */}
              <div className="pt-4 flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-slate-800 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-rose-600" />
                    <span>Emergency SMS Hazard Alerts</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Receive emergency SMS alerts for critical hazards in your immediate ward (e.g., water main breaks, electrical hazards, gas leaks, road washouts).
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={prefs.smsEmergencyAlerts}
                    onChange={(e) => setPrefs({ ...prefs, smsEmergencyAlerts: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={handleSavePreferences}
                disabled={savingPrefs}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                <span>{savingPrefs ? 'Updating Preferences...' : 'Save Preferences'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
