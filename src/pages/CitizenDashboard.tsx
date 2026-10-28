import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { CitizenReport, CATEGORY_LABELS } from '../types';
import { StatusBadge, SeverityBadge } from '../components/common/StatusBadge';
import { RecentActivityFeed } from '../components/dashboard/RecentActivityFeed';
import { downloadIncidentReportPdf } from '../utils/pdfGenerator';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowRight,
  MapPin,
  User as UserIcon,
  Activity,
  FileDown,
  Layers,
  Wrench,
  Sparkles,
} from 'lucide-react';

export const CitizenDashboard: React.FC = () => {
  const { user, showNotification } = useAuth();
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'community_feed' | 'my_reports'>('community_feed');

  useEffect(() => {
    const fetchUserReports = async () => {
      if (!user) return;
      try {
        const res = await api.getReports({ submitterId: user.id });
        setReports(res.reports || []);
      } catch (err) {
        console.error('Failed to load user reports:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserReports();
  }, [user]);

  const totalReports = reports.length;
  const underReview = reports.filter((r) => r.status === 'submitted' || r.status === 'under_review').length;
  const inProgress = reports.filter((r) => r.status === 'verified' || r.status === 'assigned' || r.status === 'in_progress').length;
  const resolved = reports.filter((r) => r.status === 'resolved').length;

  const handleDownloadMyReportPdf = (rep: CitizenReport) => {
    try {
      downloadIncidentReportPdf(rep);
      showNotification(`Report PDF for ${rep.id} downloaded.`, 'success');
    } catch (e) {
      showNotification('Could not generate PDF report.', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Citizen Dashboard</h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
              Live Community Node
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Welcome back, <strong className="text-slate-800">{user?.name}</strong>. Monitor real-time community activity, track your submitted civic reports, and follow municipal repair progress.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            to="/profile"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 transition-colors"
          >
            <UserIcon className="w-4 h-4 text-slate-500" /> My Profile
          </Link>
          <Link
            to="/report"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" /> Report New Issue
          </Link>
          <Link
            to="/map"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 transition-colors"
          >
            <MapPin className="w-4 h-4 text-slate-500" /> Civic Map
          </Link>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">My Total Reports</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{loading ? '...' : totalReports}</div>
          <div className="text-[11px] text-slate-400 mt-1">Your registered complaints</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Under Review</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-700">{loading ? '...' : underReview}</div>
          <div className="text-[11px] text-slate-400 mt-1">Awaiting staff verification</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">In Progress</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-700">{loading ? '...' : inProgress}</div>
          <div className="text-[11px] text-slate-400 mt-1">Crews assigned / working</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Resolved Reports</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">{loading ? '...' : resolved}</div>
          <div className="text-[11px] text-slate-400 mt-1">Repairs completed</div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left / Primary Column (8 cols): Recent Activity Feed */}
        <div className="lg:col-span-8 space-y-6">
          <RecentActivityFeed currentUserId={user?.id} />
        </div>

        {/* Right / Secondary Column (4 cols): My Submissions & Neighborhood Tools */}
        <div className="lg:col-span-4 space-y-6">
          {/* My Submissions Quick Widget */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">My Reports</h3>
                <p className="text-[11px] text-slate-500">Your submitted complaints</p>
              </div>
              <Link
                to="/my-reports"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                View all ({totalReports}) <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="p-6 text-center text-xs text-slate-500">Loading your reports...</div>
            ) : reports.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 space-y-2">
                <FileText className="w-6 h-6 mx-auto text-slate-300" />
                <p>You haven't submitted any reports yet.</p>
                <Link
                  to="/report"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium text-xs shadow-xs"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Report Issue
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {reports.slice(0, 5).map((rep) => (
                  <div key={rep.id} className="p-3.5 hover:bg-slate-50 transition-colors space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-900 text-xs truncate max-w-[180px]">
                        {rep.title}
                      </span>
                      <StatusBadge status={rep.status} size="sm" />
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span className="truncate max-w-[170px]">📍 {rep.location.address}</span>
                      <span>{new Date(rep.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleDownloadMyReportPdf(rep)}
                        className="text-[11px] font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                        title="Download PDF"
                      >
                        <FileDown className="w-3 h-3 text-blue-600" /> PDF
                      </button>
                      <Link
                        to={`/reports/${rep.id}`}
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
                      >
                        Details <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Issue Reporting Launcher */}
          <div className="bg-linear-to-br from-blue-50/70 to-indigo-50/50 border border-blue-200 rounded-xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <Wrench className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-bold text-slate-900 text-xs">Fast Civic Reporting</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Found damaged infrastructure in your neighborhood? Submitting a report takes under 60 seconds and notifies local crews.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                to="/report"
                className="px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-center text-[11px] font-medium text-slate-700 shadow-2xs transition-colors"
              >
                🕳️ Pothole / Road
              </Link>
              <Link
                to="/report"
                className="px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-center text-[11px] font-medium text-slate-700 shadow-2xs transition-colors"
              >
                💡 Streetlight
              </Link>
              <Link
                to="/report"
                className="px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-center text-[11px] font-medium text-slate-700 shadow-2xs transition-colors"
              >
                💧 Water / Leak
              </Link>
              <Link
                to="/report"
                className="px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-center text-[11px] font-medium text-slate-700 shadow-2xs transition-colors"
              >
                🗑️ Waste / Dump
              </Link>
            </div>
            <Link
              to="/report"
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Open Standard Report Form
            </Link>
          </div>

          {/* Local Area Infrastructure Integrity Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Neighborhood Impact</h3>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Audited & Open
              </span>
            </div>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              CivicSignal automatically clusters duplicate complaints at the same intersection to dispatch repair crews faster while keeping every citizen report permanently preserved.
            </p>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between">
                <span>Duplicate Clustering</span>
                <strong className="text-blue-600">Active</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Municipal SLA Tracking</span>
                <strong className="text-emerald-600">Enforced</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Immutable Records</span>
                <strong className="text-slate-800">100% Retained</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
