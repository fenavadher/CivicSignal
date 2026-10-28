import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { StaffSidebar } from '../components/layout/StaffSidebar';
import { api } from '../services/api';
import { ManagedIssue, DuplicateCandidate, CitizenReport, CATEGORY_LABELS } from '../types';
import { StatusBadge, SeverityBadge, SlaBadge } from '../components/common/StatusBadge';
import { PriorityMeter } from '../components/common/PriorityMeter';
import {
  Layers,
  CopyCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileText,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const CHART_COLORS = ['#2563EB', '#0D9488', '#D97706', '#4F46E5', '#DC2626', '#64748B'];

export const StaffDashboard: React.FC = () => {
  const [issues, setIssues] = useState<ManagedIssue[]>([]);
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [duplicates, setDuplicates] = useState<DuplicateCandidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStaffData = async () => {
      try {
        const [issRes, repRes, dupRes] = await Promise.all([
          api.getManagedIssues(),
          api.getReports(),
          api.getDuplicates('pending'),
        ]);
        setIssues(issRes.issues || []);
        setReports(repRes.reports || []);
        setDuplicates(dupRes.duplicates || []);
      } catch (err) {
        console.error('Failed to load staff dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStaffData();
  }, []);

  const totalReportsCount = reports.length;
  const openIssuesCount = issues.filter((i) => i.status !== 'resolved').length;
  const pendingDuplicatesCount = duplicates.length;
  const highPriorityCount = issues.filter((i) => i.priorityLevel === 'high' || i.priorityLevel === 'critical').length;
  const overdueIssuesCount = issues.filter((i) => i.isOverdueResolution).length;
  const resolvedIssuesCount = issues.filter((i) => i.status === 'resolved').length;

  // Category breakdown data for chart
  const categoryCountMap: Record<string, number> = {};
  for (const iss of issues) {
    categoryCountMap[iss.category] = (categoryCountMap[iss.category] || 0) + 1;
  }
  const categoryChartData = Object.entries(categoryCountMap).map(([k, v]) => ({
    name: k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    count: v,
  }));

  // Status breakdown data for chart
  const statusCountMap: Record<string, number> = {
    'In Progress': issues.filter((i) => i.status === 'in_progress').length,
    'Verified': issues.filter((i) => i.status === 'verified').length,
    'Assigned': issues.filter((i) => i.status === 'assigned').length,
    'Resolved': resolvedIssuesCount,
  };
  const statusChartData = Object.entries(statusCountMap).map(([k, v]) => ({
    name: k,
    value: v,
  }));

  return (
    <div className="flex bg-[#F8FAFC]">
      <StaffSidebar />

      <main className="flex-1 p-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Municipal Operations Command</h1>
            <p className="text-xs text-slate-500 mt-1">
              Dispatch triage, AI duplicate candidate evaluation, and SLA compliance monitoring.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/staff/duplicates"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
            >
              <CopyCheck className="w-4 h-4 text-amber-600" />
              Review Duplicates ({pendingDuplicatesCount})
            </Link>
            <Link
              to="/staff/issues"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
            >
              <Layers className="w-4 h-4" /> All Issues
            </Link>
          </div>
        </div>

        {/* 6 Key Operational Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Total Reports
            </div>
            <div className="text-2xl font-bold text-slate-900">{loading ? '...' : totalReportsCount}</div>
            <div className="text-[10px] text-slate-400 mt-1">All citizen submissions</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Open Work Orders
            </div>
            <div className="text-2xl font-bold text-blue-600">{loading ? '...' : openIssuesCount}</div>
            <div className="text-[10px] text-slate-400 mt-1">Active municipal orders</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Duplicate Queue
            </div>
            <div className="text-2xl font-bold text-amber-600">
              {loading ? '...' : pendingDuplicatesCount}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Pending review</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              High Priority
            </div>
            <div className="text-2xl font-bold text-red-600">
              {loading ? '...' : highPriorityCount}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Score ≥ 60 / 100</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Overdue SLA
            </div>
            <div className="text-2xl font-bold text-rose-700">
              {loading ? '...' : overdueIssuesCount}
            </div>
            <div className="text-[10px] text-rose-500 font-medium mt-1">Target breached</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Resolved Issues
            </div>
            <div className="text-2xl font-bold text-emerald-600">
              {loading ? '...' : resolvedIssuesCount}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Fully closed</div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <h2 className="text-sm font-bold text-slate-900 mb-1">Managed Work Orders by Category</h2>
            <p className="text-[11px] text-slate-500 mb-4">Distribution across municipal divisions</p>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col">
            <h2 className="text-sm font-bold text-slate-900 mb-1">Open vs Resolved Status</h2>
            <p className="text-[11px] text-slate-500 mb-3">Operational completion ratio</p>
            <div className="h-44 w-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={65}
                    paddingAngle={3}
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-2 border-t border-slate-100">
              {statusChartData.map((item, idx) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                  />
                  <span>{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Priority-Ranked Issue Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden mb-6">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Priority-Ranked Active Work Orders</h2>
              <p className="text-xs text-slate-500">
                Sorted by explainable 0–100 priority score factoring severity, aging time, linked report clusters, and repeat failures.
              </p>
            </div>
            <Link
              to="/staff/issues"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Manage all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Priority Score</th>
                  <th className="px-4 py-3">Work Order ID</th>
                  <th className="px-4 py-3">Title & Category</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Linked Reports</th>
                  <th className="px-4 py-3">Assigned Dept</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">SLA Deadline</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {issues.slice(0, 7).map((iss) => (
                  <tr key={iss.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <PriorityMeter
                        score={iss.priorityScore}
                        level={iss.priorityLevel}
                        compact={true}
                      />
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] font-semibold text-blue-700">
                      {iss.id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900 max-w-xs truncate">{iss.title}</div>
                      <div className="text-[11px] text-slate-500">{CATEGORY_LABELS[iss.category]}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-[180px] truncate">
                      {iss.location.address}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[11px]">
                        {iss.originalReportIds.length} report{iss.originalReportIds.length > 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {iss.department || 'Operations'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={iss.status} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <SlaBadge deadlineIso={iss.resolutionDeadline} isResolved={iss.status === 'resolved'} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/staff/issues/${iss.id}`}
                        className="text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Duplicate Review Queue Preview */}
        {pendingDuplicatesCount > 0 && (
          <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CopyCheck className="w-5 h-5 text-amber-600" />
                <div>
                  <h3 className="font-bold text-amber-900 text-sm">
                    {pendingDuplicatesCount} Candidate Duplicate Pair{pendingDuplicatesCount > 1 ? 's' : ''} Awaiting Staff Approval
                  </h3>
                  <p className="text-xs text-amber-700">
                    Geographically proximate reports flagged by spatial and semantic similarity checks.
                  </p>
                </div>
              </div>
              <Link
                to="/staff/duplicates"
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-xs font-semibold shadow-xs"
              >
                Open Review Queue →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              {duplicates.slice(0, 2).map((dup) => (
                <div key={dup.id} className="bg-white p-3 rounded-lg border border-amber-200 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800">
                      {dup.primaryReport?.title || 'Active Complaint'}
                    </span>
                    <span className="bg-amber-100 text-amber-800 font-mono text-[10px] px-1.5 py-0.5 rounded font-bold">
                      {dup.compositeScore}% Match
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mb-1">
                    Distance: <strong>{dup.distanceMeters}m</strong> • Category: {dup.primaryReport?.category}
                  </div>
                  <p className="text-[11px] text-slate-600 italic">
                    "{dup.aiExplanation}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
