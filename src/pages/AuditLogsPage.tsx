import React, { useState, useEffect } from 'react';
import { StaffSidebar } from '../components/layout/StaffSidebar';
import { api } from '../services/api';
import { AuditLog } from '../types';
import {
  ScrollText,
  Search,
  Filter,
  Shield,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  Split,
  CopyCheck,
} from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.getAuditLogs(100);
        setLogs(res.logs || []);
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filtered = logs.filter((log) => {
    const matchesSearch =
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.actorName.toLowerCase().includes(search.toLowerCase()) ||
      log.entityId.toLowerCase().includes(search.toLowerCase()) ||
      (log.reason && log.reason.toLowerCase().includes(search.toLowerCase()));

    const matchesAction = actionFilter === 'all' || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  const getActionBadge = (action: AuditLog['action']) => {
    switch (action) {
      case 'SUBMIT_REPORT':
        return <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono text-[10px]">SUBMIT_REPORT</span>;
      case 'APPROVE_DUPLICATE_GROUPING':
        return <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-mono text-[10px] font-semibold">APPROVE_GROUPING</span>;
      case 'UNGROUP_REPORT':
        return <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded font-mono text-[10px] font-semibold">UNGROUP_REPORT</span>;
      case 'REJECT_DUPLICATE':
        return <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-[10px]">REJECT_DUPLICATE</span>;
      case 'CHANGE_STATUS':
        return <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono text-[10px]">CHANGE_STATUS</span>;
      case 'ASSIGN_ISSUE':
        return <span className="bg-teal-50 text-teal-800 px-2 py-0.5 rounded font-mono text-[10px]">ASSIGN_ISSUE</span>;
      case 'RESOLVE_ISSUE':
        return <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono text-[10px] font-bold">RESOLVE_ISSUE</span>;
      case 'FLAG_RECURRING':
        return <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono text-[10px]">FLAG_RECURRING</span>;
      default:
        return <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono text-[10px]">{action}</span>;
    }
  };

  return (
    <div className="flex bg-[#F8FAFC]">
      <StaffSidebar />

      <main className="flex-1 p-6 max-w-7xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ScrollText className="w-6 h-6 text-blue-600" /> Municipal Audit Trail
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable log of all system actions: citizen submissions, duplicate merge approvals, reversible un-groupings, status updates, and resolutions.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search audit trail by actor, entity ID, or keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              >
                <option value="all">All Audit Actions</option>
                <option value="SUBMIT_REPORT">SUBMIT_REPORT</option>
                <option value="APPROVE_DUPLICATE_GROUPING">APPROVE_DUPLICATE_GROUPING</option>
                <option value="UNGROUP_REPORT">UNGROUP_REPORT (Reversible Split)</option>
                <option value="REJECT_DUPLICATE">REJECT_DUPLICATE</option>
                <option value="CHANGE_STATUS">CHANGE_STATUS</option>
                <option value="ASSIGN_ISSUE">ASSIGN_ISSUE</option>
                <option value="RESOLVE_ISSUE">RESOLVE_ISSUE</option>
                <option value="FLAG_RECURRING">FLAG_RECURRING</option>
                <option value="SEED_DEMO_DATA">SEED_DEMO_DATA</option>
              </select>
            </div>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading audit records...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">No matching audit logs found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Actor & Role</th>
                    <th className="px-4 py-3">Action Type</th>
                    <th className="px-4 py-3">Target Entity</th>
                    <th className="px-4 py-3">Action Details & Notes</th>
                    <th className="px-4 py-3">Justification Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filtered.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{log.actorName}</div>
                        <div className="text-[10px] text-slate-400 uppercase font-mono">{log.actorRole}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{getActionBadge(log.action)}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-blue-700 whitespace-nowrap">
                        {log.entityType}:{log.entityId}
                      </td>
                      <td className="px-4 py-3 text-slate-800 max-w-sm">{log.details}</td>
                      <td className="px-4 py-3 text-slate-500 italic max-w-xs truncate">
                        {log.reason || '—'}
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
