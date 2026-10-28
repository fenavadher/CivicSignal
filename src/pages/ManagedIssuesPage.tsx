import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { StaffSidebar } from '../components/layout/StaffSidebar';
import { api } from '../services/api';
import { ManagedIssue, CATEGORY_LABELS } from '../types';
import { StatusBadge, SeverityBadge, SlaBadge } from '../components/common/StatusBadge';
import { PriorityMeter } from '../components/common/PriorityMeter';
import { Layers, Search, Filter, PlusCircle, ArrowUpDown, ExternalLink } from 'lucide-react';

export const ManagedIssuesPage: React.FC = () => {
  const [issues, setIssues] = useState<ManagedIssue[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [onlyOverdue, setOnlyOverdue] = useState(false);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await api.getManagedIssues();
        setIssues(res.issues || []);
      } catch (err) {
        console.error('Failed to load managed issues:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, []);

  const filtered = issues.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.location.address.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase());

    const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStat = statusFilter === 'all' || item.status === statusFilter;
    const matchesPri = priorityFilter === 'all' || item.priorityLevel === priorityFilter;
    const matchesOverdue = !onlyOverdue || item.isOverdueResolution;

    return matchesSearch && matchesCat && matchesStat && matchesPri && matchesOverdue;
  });

  return (
    <div className="flex bg-[#F8FAFC]">
      <StaffSidebar />

      <main className="flex-1 p-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">All Managed Work Orders</h1>
            <p className="text-xs text-slate-500 mt-1">
              Active civic infrastructure issues grouped and maintained by municipal dispatch.
            </p>
          </div>
          <div className="text-xs text-slate-500">
            Total active records: <strong className="text-slate-800">{issues.length}</strong>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="relative lg:col-span-2">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search issues by title, street address, or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              >
                <option value="all">All Categories</option>
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="verified">Verified</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="reopened">Reopened</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyOverdue}
                  onChange={(e) => setOnlyOverdue(e.target.checked)}
                  className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                />
                <span className="font-semibold text-rose-700">Only Overdue SLA</span>
              </label>
            </div>
          </div>
        </div>

        {/* Table of Managed Issues */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading work orders...</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-500">
              No managed issues match the selected filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Work Order ID</th>
                    <th className="px-4 py-3">Title & Category</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Linked Reports</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Resolution SLA</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filtered.map((iss) => (
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
                      <td className="px-4 py-3 text-slate-600">{iss.department || 'Operations'}</td>
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
                          Manage →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
