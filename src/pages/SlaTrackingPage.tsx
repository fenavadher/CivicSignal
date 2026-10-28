import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { StaffSidebar } from '../components/layout/StaffSidebar';
import { api } from '../services/api';
import { ManagedIssue, CATEGORY_LABELS } from '../types';
import { StatusBadge, SeverityBadge, SlaBadge } from '../components/common/StatusBadge';
import { Clock, AlertCircle, CheckCircle2, ShieldAlert, ArrowRight, ExternalLink } from 'lucide-react';

export const SlaTrackingPage: React.FC = () => {
  const [issues, setIssues] = useState<ManagedIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'overdue' | 'active' | 'resolved'>('all');

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await api.getManagedIssues();
        setIssues(res.issues || []);
      } catch (e) {
        console.error('Failed to load SLA tracking:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, []);

  const overdueCount = issues.filter((i) => i.isOverdueResolution).length;
  const activeCount = issues.filter((i) => i.status !== 'resolved').length;
  const compliantCount = issues.filter((i) => {
    if (i.status !== 'resolved' || !i.resolutionDetails) return false;
    const resolvedTime = new Date(i.resolutionDetails.resolvedAt).getTime();
    const deadlineTime = new Date(i.resolutionDeadline).getTime();
    return resolvedTime <= deadlineTime;
  }).length;

  const filtered = issues.filter((iss) => {
    if (filter === 'overdue') return iss.isOverdueResolution;
    if (filter === 'active') return iss.status !== 'resolved';
    if (filter === 'resolved') return iss.status === 'resolved';
    return true;
  });

  return (
    <div className="flex bg-[#F8FAFC]">
      <StaffSidebar />

      <main className="flex-1 p-6 max-w-7xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" /> SLA & Overdue Deadline Tracking
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time tracking of response and resolution target deadlines across municipal divisions.
          </p>
        </div>

        {/* Top Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Breached Overdue</span>
              <AlertCircle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-3xl font-extrabold text-rose-700">{loading ? '...' : overdueCount}</div>
            <div className="text-[11px] text-rose-600 font-medium mt-1">Immediate escalation required</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Active In SLA Window</span>
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-3xl font-extrabold text-blue-600">
              {loading ? '...' : activeCount - overdueCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Within standard target window</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Resolved Compliant</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-600">
              {loading ? '...' : compliantCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Repairs finished within deadline</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Work Orders ({issues.length})
          </button>
          <button
            onClick={() => setFilter('overdue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'overdue'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
            }`}
          >
            Overdue Breach Only ({overdueCount})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'active'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Active In Progress ({activeCount})
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'resolved'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Resolved
          </button>
        </div>

        {/* SLA Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Work Order ID</th>
                  <th className="px-4 py-3">Title & Category</th>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Response Target</th>
                  <th className="px-4 py-3">Resolution Target</th>
                  <th className="px-4 py-3">SLA Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((iss) => (
                  <tr
                    key={iss.id}
                    className={`transition-colors ${
                      iss.isOverdueResolution
                        ? 'bg-rose-50/40 hover:bg-rose-50/70'
                        : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-[11px] font-bold text-blue-700">
                      {iss.id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900 max-w-xs truncate">{iss.title}</div>
                      <div className="text-[11px] text-slate-500">{CATEGORY_LABELS[iss.category]}</div>
                    </td>
                    <td className="px-4 py-3">
                      <SeverityBadge severity={iss.severity} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={iss.status} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-[11px]">
                      {new Date(iss.responseDeadline).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-[11px]">
                      {new Date(iss.resolutionDeadline).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <SlaBadge
                        deadlineIso={iss.resolutionDeadline}
                        isResolved={iss.status === 'resolved'}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/staff/issues/${iss.id}`}
                        className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1"
                      >
                        Inspect <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};
