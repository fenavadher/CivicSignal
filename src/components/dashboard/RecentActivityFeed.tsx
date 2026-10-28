import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { CitizenReport, CATEGORY_LABELS, IssueCategory } from '../../types';
import { StatusBadge, SeverityBadge } from '../common/StatusBadge';
import { downloadIncidentReportPdf } from '../../utils/pdfGenerator';
import { useAuth } from '../../context/AuthContext';
import {
  Activity,
  MapPin,
  Clock,
  RefreshCw,
  Search,
  Filter,
  FileDown,
  ExternalLink,
  Layers,
  Sparkles,
  Radio,
  Eye,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';

interface RecentActivityFeedProps {
  currentUserId?: string;
}

export function formatTimeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 45) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

const LOCAL_AREAS = [
  { id: 'all', label: 'All Local Areas (Metro)' },
  { id: 'downtown', label: 'Downtown District', keywords: ['downtown', 'main st', '4th', 'pine'] },
  { id: 'central', label: 'Central Commercial', keywords: ['commercial', '5th ave', 'broadway', 'center'] },
  { id: 'harbor', label: 'West End & Waterfront', keywords: ['harbor', 'pier', 'waterfront', 'west', 'ocean'] },
  { id: 'north', label: 'Northside & Hills', keywords: ['north', 'hill', 'highland', 'parkway'] },
  { id: 'industrial', label: 'South Industrial & River', keywords: ['industrial', 'river', 'valley', 'warehouse'] },
];

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({ currentUserId }) => {
  const { user, showNotification } = useAuth();
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Filters
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Fetch all community reports
  const fetchCommunityActivity = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    try {
      const res = await api.getReports();
      setReports(res.reports || []);
      setLastRefreshed(new Date());
      if (isManualRefresh) {
        showNotification('Recent community activity feed refreshed.', 'info');
      }
    } catch (err) {
      console.error('Failed to load recent community activity:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchCommunityActivity();
  }, [fetchCommunityActivity]);

  // Real-time polling
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchCommunityActivity(false);
    }, 12000); // 12-second real-time heartbeat
    return () => clearInterval(interval);
  }, [autoRefresh, fetchCommunityActivity]);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      // Area match
      if (selectedArea === 'my_area') {
        const userLoc = (user?.address || user?.department || '').toLowerCase();
        const repLoc = `${report.location.address} ${report.location.landmark || ''}`.toLowerCase();
        // check partial overlap
        const words = userLoc.split(/[\s,]+/).filter((w) => w.length > 3);
        const matchesUserArea = words.some((w) => repLoc.includes(w));
        if (!matchesUserArea) return false;
      } else if (selectedArea !== 'all') {
        const areaConfig = LOCAL_AREAS.find((a) => a.id === selectedArea);
        if (areaConfig?.keywords) {
          const locStr = `${report.location.address} ${report.location.landmark || ''}`.toLowerCase();
          const matches = areaConfig.keywords.some((k) => locStr.includes(k));
          if (!matches) return false;
        }
      }

      // Category match
      if (selectedCategory !== 'all' && report.category !== selectedCategory) {
        return false;
      }

      // Status match
      if (selectedStatus === 'open') {
        if (report.status === 'resolved') return false;
      } else if (selectedStatus === 'resolved') {
        if (report.status !== 'resolved') return false;
      } else if (selectedStatus !== 'all' && report.status !== selectedStatus) {
        return false;
      }

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = report.title.toLowerCase().includes(q);
        const inDesc = report.description.toLowerCase().includes(q);
        const inAddr = report.location.address.toLowerCase().includes(q);
        const inSubmitter = (report.submitterName || '').toLowerCase().includes(q);
        if (!inTitle && !inDesc && !inAddr && !inSubmitter) return false;
      }

      return true;
    });
  }, [reports, selectedArea, selectedCategory, selectedStatus, searchQuery, user]);

  const handleDownloadPdf = (report: CitizenReport) => {
    try {
      setDownloadingId(report.id);
      downloadIncidentReportPdf(report);
      showNotification(`Report PDF for ${report.id} downloaded.`, 'success');
    } catch (e) {
      showNotification('Could not generate PDF.', 'error');
    } finally {
      setTimeout(() => setDownloadingId(null), 500);
    }
  };

  // Recent 24h count
  const newReportsCount = useMemo(() => {
    const oneDayAgo = Date.now() - 24 * 3600 * 1000;
    return reports.filter((r) => new Date(r.createdAt).getTime() > oneDayAgo).length;
  }, [reports]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
      {/* Feed Header */}
      <div className="p-5 border-b border-slate-100 bg-linear-to-r from-slate-50/80 to-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Activity className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-slate-900 text-sm">Recent Activity Feed</h2>
                {autoRefresh && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    Live Feed
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Real-time incident reports submitted by citizens in your local municipality
              </p>
            </div>
          </div>

          {/* Real-time controls */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
                autoRefresh
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
              title="Toggle automatic real-time updates"
            >
              <Radio className={`w-3 h-3 ${autoRefresh ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
              Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
            </button>

            <button
              type="button"
              onClick={() => fetchCommunityActivity(true)}
              disabled={refreshing}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
              title="Refresh activity feed now"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Local Area & Filter Bar */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-3 border-t border-slate-200/60">
          {/* Area Selector */}
          <div className="sm:col-span-4">
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-blue-600" />
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                {LOCAL_AREAS.map((area) => (
                  <option key={area.id} value={area.id}>
                    📍 {area.label}
                  </option>
                ))}
                {user?.address && (
                  <option value="my_area">
                    🏠 Near My Registered Address ({user.address.slice(0, 20)}...)
                  </option>
                )}
              </select>
            </div>
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="all">All Issue Categories</option>
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="open">Active / Unresolved</option>
              <option value="resolved">Resolved Repairs</option>
              <option value="submitted">New Submissions</option>
              <option value="in_progress">Crews In Progress</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="sm:col-span-3 relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search local feed..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Live Metrics Ribbon */}
        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 mt-2.5 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <span>
              Showing <strong className="text-slate-800">{filteredReports.length}</strong> community reports
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-blue-700 font-medium">
              ⚡ {newReportsCount} logged past 24h
            </span>
          </div>
          <div className="text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Updated {formatTimeAgo(lastRefreshed.toISOString())}
          </div>
        </div>
      </div>

      {/* Feed Content Stream */}
      <div className="divide-y divide-slate-100 max-h-[580px] overflow-y-auto">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500 space-y-2">
            <RefreshCw className="w-5 h-5 mx-auto text-blue-500 animate-spin" />
            <p>Connecting to local community incident feed...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 space-y-2">
            <Activity className="w-6 h-6 mx-auto text-slate-300" />
            <p className="font-medium text-slate-700">No community reports found</p>
            <p className="text-slate-400 max-w-sm mx-auto">
              There are no reports matching the selected neighborhood or filter criteria. Check back soon or be the first to report an issue.
            </p>
            {(selectedArea !== 'all' || selectedCategory !== 'all' || selectedStatus !== 'all' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedArea('all');
                  setSelectedCategory('all');
                  setSelectedStatus('all');
                  setSearchQuery('');
                }}
                className="mt-2 text-blue-600 hover:underline font-semibold"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          filteredReports.map((report) => {
            const isRecent = Date.now() - new Date(report.createdAt).getTime() < 3 * 3600 * 1000;
            const isUserReport = currentUserId && report.submitterId === currentUserId;

            return (
              <div
                key={report.id}
                className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-4 group"
              >
                {/* Left/Main Column: Badges, Title, Location, Desc */}
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Category pill */}
                    <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                      {CATEGORY_LABELS[report.category] || report.category}
                    </span>

                    <SeverityBadge severity={report.severity} size="sm" />
                    <StatusBadge status={report.status} size="sm" />

                    {isRecent && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded animate-pulse">
                        NEW
                      </span>
                    )}

                    {isUserReport && (
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 rounded">
                        YOUR REPORT
                      </span>
                    )}

                    {report.managedIssueId && (
                      <span className="text-[10px] font-medium text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded flex items-center gap-1">
                        <Layers className="w-2.5 h-2.5 text-blue-600" /> Work Order Linked
                      </span>
                    )}
                  </div>

                  {/* Title & Link */}
                  <Link
                    to={`/reports/${report.id}`}
                    className="block text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors"
                  >
                    {report.title}
                  </Link>

                  {/* Description preview */}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {report.description}
                  </p>

                  {/* Meta: Location, Submitter, Timestamp */}
                  <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1 text-slate-700 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      {report.location.address}
                      {report.location.landmark && (
                        <span className="text-slate-400 font-normal">({report.location.landmark})</span>
                      )}
                    </span>

                    <span className="text-slate-400">•</span>

                    <span className="text-slate-600">
                      By <strong className="text-slate-700">{report.submitterName || 'Community Member'}</strong>
                    </span>

                    <span className="text-slate-400">•</span>

                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {formatTimeAgo(report.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Right Column: Photo preview & Action buttons */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2.5 shrink-0">
                  {report.photoUrl && (
                    <div className="w-16 h-14 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                      <img
                        src={report.photoUrl}
                        alt="Issue photo"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadPdf(report)}
                      disabled={downloadingId === report.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                      title="Download PDF report summary"
                    >
                      <FileDown className="w-3.5 h-3.5 text-blue-600" />
                      PDF
                    </button>

                    <Link
                      to={`/reports/${report.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer link to Map */}
      <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500 text-[11px]">
          Want to see all community issues on an interactive map?
        </span>
        <Link
          to="/map"
          className="font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 text-[11px]"
        >
          Open Civic Map <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};
