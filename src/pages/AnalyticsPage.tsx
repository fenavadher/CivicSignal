import React, { useState, useEffect } from 'react';
import { StaffSidebar } from '../components/layout/StaffSidebar';
import { api } from '../services/api';
import { AnalyticsSummary } from '../types';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

const PALETTE = ['#2563EB', '#0D9488', '#D97706', '#4F46E5', '#DC2626', '#0284C7', '#64748B'];

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.getAnalytics();
        setAnalytics(res.analytics);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading || !analytics) {
    return (
      <div className="flex bg-[#F8FAFC]">
        <StaffSidebar />
        <main className="flex-1 p-8 text-center text-xs text-slate-500">Loading municipal analytics...</main>
      </div>
    );
  }

  return (
    <div className="flex bg-[#F8FAFC]">
      <StaffSidebar />

      <main className="flex-1 p-6 max-w-7xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" /> Municipal Analytics & Reporting
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Data-driven insights into complaint volumes, turnaround velocity, SLA compliance, and duplicate detection accuracy.
          </p>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <div className="text-xs font-semibold text-slate-500 mb-1">Average Resolution Time</div>
            <div className="text-2xl font-bold text-slate-900">
              {analytics.averageResolutionHours} <span className="text-sm font-normal text-slate-400">hours</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">From submission to repair verification</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <div className="text-xs font-semibold text-slate-500 mb-1">SLA Compliance Rate</div>
            <div className="text-2xl font-bold text-emerald-600">
              {analytics.slaCompliancePercentage}%
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Closed within deadline window</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <div className="text-xs font-semibold text-slate-500 mb-1">Overdue Work Orders</div>
            <div className="text-2xl font-bold text-rose-600">{analytics.overdueIssues}</div>
            <div className="text-[11px] text-rose-500 mt-1">Resolution SLA breached</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <div className="text-xs font-semibold text-slate-500 mb-1">Recurring Problem Zones</div>
            <div className="text-2xl font-bold text-amber-600">{analytics.recurringIssueCount}</div>
            <div className="text-[11px] text-amber-600 mt-1">Hotspots requiring structural overhaul</div>
          </div>
        </div>

        {/* Trend Chart (Past 7 Days) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">7-Day Civic Activity Trend</h2>
              <p className="text-[11px] text-slate-500">Citizen submissions vs verified resolutions</p>
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Daily Velocity
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.reportsTrend} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Line
                  type="monotone"
                  dataKey="reports"
                  name="New Reports"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  name="Resolved Orders"
                  stroke="#16A34A"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2 Column Charts: Category & Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Categories Chart */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-2">
            <h2 className="text-sm font-bold text-slate-900">Complaints by Infrastructure Category</h2>
            <p className="text-[11px] text-slate-500 pb-2 border-b border-slate-100">
              Breakdown across municipal public work sectors
            </p>
            <div className="h-60 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.categoryDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Bar dataKey="count" fill="#0F766E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Distribution Pie Chart */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-2 flex flex-col">
            <h2 className="text-sm font-bold text-slate-900">Current Work Order Statuses</h2>
            <p className="text-[11px] text-slate-500 pb-2 border-b border-slate-100">
              Active vs terminal workflow breakdown
            </p>
            <div className="h-48 w-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.statusDistribution}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {analytics.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] text-slate-600 pt-2 border-t border-slate-100">
              {analytics.statusDistribution.map((item, idx) => (
                <div key={item.status} className="flex items-center gap-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: PALETTE[idx % PALETTE.length] }}
                  />
                  <span>{item.status.replace(/_/g, ' ')}: {item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 17 Requirement: Duplicate Detection Model Evaluation Metrics */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                AI Duplicate Detection Model Performance Metrics
              </h2>
              <p className="text-[11px] text-slate-500">
                Ground-truth evaluation calculated strictly from confirmed staff review decisions.
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Evaluated reviews: {analytics.duplicateModelMetrics.totalEvaluated || 0}
            </span>
          </div>

          {analytics.duplicateModelMetrics.hasLabeledData ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-center">
                <div className="text-xl font-extrabold text-blue-600">
                  {analytics.duplicateModelMetrics.precision}%
                </div>
                <div className="text-xs font-semibold text-slate-800 mt-0.5">Precision</div>
                <div className="text-[10px] text-slate-500">Approved / Suggested Matches</div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-center">
                <div className="text-xl font-extrabold text-teal-700">
                  {analytics.duplicateModelMetrics.recall}%
                </div>
                <div className="text-xs font-semibold text-slate-800 mt-0.5">Recall</div>
                <div className="text-[10px] text-slate-500">True duplicates caught</div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-center">
                <div className="text-xl font-extrabold text-slate-700">
                  {analytics.duplicateModelMetrics.falseMergeRate}%
                </div>
                <div className="text-xs font-semibold text-slate-800 mt-0.5">False Merge Rate</div>
                <div className="text-[10px] text-slate-500">Rejected suggestions</div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-center">
                <div className="text-xl font-extrabold text-amber-600">
                  {analytics.duplicateModelMetrics.manualReviewRate}%
                </div>
                <div className="text-xs font-semibold text-slate-800 mt-0.5">Manual Review Rate</div>
                <div className="text-[10px] text-slate-500">Candidate flagged percentage</div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
              Not enough evaluation data. Staff must approve or reject at least 2 candidate pairs in the Duplicate Review Queue to compute precision and recall metrics.
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
