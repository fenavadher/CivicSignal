import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { CitizenReport, CATEGORY_LABELS } from '../types';
import { StatusBadge, SeverityBadge } from '../components/common/StatusBadge';
import { PlusCircle, Clock, CheckCircle2, AlertCircle, FileText, ArrowRight, MapPin } from 'lucide-react';

export const CitizenDashboard: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Citizen Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Welcome back, <strong className="text-slate-800">{user?.name}</strong>. Track your submitted civic reports and municipal repair progress.
          </p>
        </div>
        <div className="flex items-center gap-3">
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
            <span className="text-xs font-medium">Total Submitted</span>
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

      {/* Submissions Section */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900 text-sm">Recent Submissions</h2>
            <p className="text-xs text-slate-500">All submissions remain permanently preserved and accessible</p>
          </div>
          <Link
            to="/my-reports"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            View all ({totalReports}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {reports.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-500 space-y-3">
            <p>You have not submitted any civic reports yet.</p>
            <Link
              to="/report"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-md font-medium text-xs shadow-xs"
            >
              <PlusCircle className="w-4 h-4" /> Report your first problem
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Report ID</th>
                  <th className="px-4 py-3">Issue Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-4 py-3">Submission Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {reports.slice(0, 8).map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500 font-medium">{rep.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 max-w-xs truncate">{rep.title}</td>
                    <td className="px-4 py-3 text-slate-600">{CATEGORY_LABELS[rep.category]}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-[200px] truncate">{rep.location.address}</td>
                    <td className="px-4 py-3">
                      <SeverityBadge severity={rep.severity} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(rep.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={rep.status} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/reports/${rep.id}`}
                        className="text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
