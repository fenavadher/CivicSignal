import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { StaffSidebar } from '../components/layout/StaffSidebar';
import { api } from '../services/api';
import { User, CitizenReport } from '../types';
import {
  Users,
  Search,
  Mail,
  Phone,
  MapPin,
  Building,
  ShieldCheck,
  FileText,
  Clock,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react';

export const StaffUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'citizen' | 'staff' | 'admin'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, reportsRes] = await Promise.all([
          api.getUsers(),
          api.getReports(),
        ]);
        setUsers(usersRes.users || []);
        setReports(reportsRes.reports || []);
      } catch (err) {
        console.error('Failed to load users and reports directory:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute report count per user
  const getUserReportCount = (userId: string) => {
    return reports.filter((r) => r.submitterId === userId).length;
  };

  const filteredUsers = users.filter((u) => {
    const term = search.toLowerCase();
    const matchesSearch =
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.phone && u.phone.toLowerCase().includes(term)) ||
      (u.address && u.address.toLowerCase().includes(term)) ||
      (u.department && u.department.toLowerCase().includes(term));

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const citizenCount = users.filter((u) => u.role === 'citizen').length;
  const staffCount = users.filter((u) => u.role === 'staff').length;
  const adminCount = users.filter((u) => u.role === 'admin').length;

  const selectedUserReports = selectedUser
    ? reports.filter((r) => r.submitterId === selectedUser.id)
    : [];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <StaffSidebar />

      <main className="flex-1 p-6 max-w-7xl">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" /> Citizens & User Management
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Inspect all registered residents, municipal dispatchers, contact information, and their filed civic tickets.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/staff/audit"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors"
            >
              <span>View Audit Trail</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Top Summary Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-xs font-medium text-slate-500 mb-1 flex items-center justify-between">
              <span>Total Accounts</span>
              <Users className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{loading ? '...' : users.length}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Registered in CivicSignal</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-xs font-medium text-slate-500 mb-1 flex items-center justify-between">
              <span>Verified Citizens</span>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-emerald-700">{loading ? '...' : citizenCount}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Local residents & submitters</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-xs font-medium text-slate-500 mb-1 flex items-center justify-between">
              <span>Municipal Staff</span>
              <Building className="w-4 h-4 text-teal-500" />
            </div>
            <div className="text-2xl font-bold text-teal-700">{loading ? '...' : staffCount}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Engineers & dispatchers</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-xs font-medium text-slate-500 mb-1 flex items-center justify-between">
              <span>Total Reports Filed</span>
              <FileText className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-purple-700">{loading ? '...' : reports.length}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Across all city wards</div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, email, phone, address, or ward..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-center w-full sm:w-auto">
            <span className="text-xs font-medium text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Role:
            </span>
            {(['all', 'citizen', 'staff', 'admin'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors capitalize ${
                  roleFilter === r
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {r === 'all' ? 'All Roles' : r}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">User & Identity</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Contact Email & Phone</th>
                  <th className="px-4 py-3">Ward & Address</th>
                  <th className="px-4 py-3 text-center">Reports Filed</th>
                  <th className="px-4 py-3">Registered On</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                      No users found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const count = getUserReportCount(u.id);
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                              {u.name ? u.name[0].toUpperCase() : 'U'}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{u.name}</div>
                              <div className="font-mono text-[10px] text-slate-400">{u.id}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              u.role === 'admin'
                                ? 'bg-purple-100 text-purple-800'
                                : u.role === 'staff'
                                ? 'bg-teal-100 text-teal-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-slate-800 font-medium">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{u.email}</span>
                          </div>
                          {u.phone ? (
                            <div className="flex items-center gap-1 text-slate-500 text-[11px] mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{u.phone}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">No phone added</span>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-800">
                            {u.department || 'Ward 4 - Downtown'}
                          </div>
                          {u.address ? (
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate max-w-xs">{u.address}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">No street address</span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold ${
                              count > 0
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {count}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-slate-500 text-[11px]">
                          {u.createdAt
                            ? new Date(u.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'N/A'}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setSelectedUser(u)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded font-semibold text-xs transition-colors"
                          >
                            <span>Inspect</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Inspection Modal / Slideout */}
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-lg flex items-center justify-center">
                    {selectedUser.name ? selectedUser.name[0].toUpperCase() : 'U'}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">{selectedUser.name}</h2>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                      <span className="capitalize font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                        {selectedUser.role}
                      </span>
                      <span>•</span>
                      <span>ID: {selectedUser.id}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 overflow-y-auto space-y-5 text-xs">
                {/* Contact & Residential Details */}
                <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-400 font-medium text-[11px] block">Email Address</span>
                    <span className="font-semibold text-slate-800">{selectedUser.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium text-[11px] block">Phone Number</span>
                    <span className="font-semibold text-slate-800">
                      {selectedUser.phone || 'Not provided'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium text-[11px] block">Ward / District</span>
                    <span className="font-semibold text-slate-800">
                      {selectedUser.department || 'Ward 4 - Downtown'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium text-[11px] block">Residential Address</span>
                    <span className="font-semibold text-slate-800">
                      {selectedUser.address || 'Not provided'}
                    </span>
                  </div>
                </div>

                {/* Reports submitted by this user */}
                <div>
                  <h3 className="font-bold text-slate-900 text-xs mb-2 flex items-center justify-between">
                    <span>Submitted Civic Complaints ({selectedUserReports.length})</span>
                  </h3>

                  {selectedUserReports.length === 0 ? (
                    <p className="text-slate-400 italic py-4 text-center bg-slate-50 rounded-lg">
                      This user has not submitted any reports yet.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto divide-y divide-slate-100">
                      {selectedUserReports.map((rep) => (
                        <div key={rep.id} className="pt-2 first:pt-0 flex items-center justify-between gap-3">
                          <div>
                            <div className="font-semibold text-slate-900">{rep.title}</div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-slate-400">#{rep.id.slice(0, 8)}</span>
                              <span>•</span>
                              <span>{rep.category.replace('_', ' ')}</span>
                              <span>•</span>
                              <span>{rep.location.address}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                              {rep.status}
                            </span>
                            <Link
                              to={`/reports/${rep.id}`}
                              className="text-blue-600 hover:text-blue-800 font-semibold text-xs"
                            >
                              View →
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
