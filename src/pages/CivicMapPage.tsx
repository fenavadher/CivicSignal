import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { CivicMap } from '../components/map/CivicMap';
import { CitizenReport, ManagedIssue, CATEGORY_LABELS, IssueCategory } from '../types';
import { StatusBadge, SeverityBadge } from '../components/common/StatusBadge';
import {
  MapPin,
  Filter,
  Layers,
  Search,
  ExternalLink,
  RotateCcw,
  AlertCircle,
  Eye,
} from 'lucide-react';

export const CivicMapPage: React.FC = () => {
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [managedIssues, setManagedIssues] = useState<ManagedIssue[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightRecurring, setHighlightRecurring] = useState(true);

  // Selected item in side list / map
  const [activeItem, setActiveItem] = useState<CitizenReport | ManagedIssue | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [repRes, issRes] = await Promise.all([
          api.getReports(),
          api.getManagedIssues(),
        ]);
        setReports(repRes.reports || []);
        setManagedIssues(issRes.issues || []);
      } catch (err) {
        console.error('Failed to load map data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter managed issues
  const filteredIssues = managedIssues.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesStat = selectedStatus === 'all' || item.status === selectedStatus;
    const matchesSev = selectedSeverity === 'all' || item.severity === selectedSeverity;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesStat && matchesSev && matchesSearch;
  });

  // Filter standalone reports
  const filteredReports = reports.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesStat = selectedStatus === 'all' || item.status === selectedStatus;
    const matchesSev = selectedSeverity === 'all' || item.severity === selectedSeverity;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesStat && matchesSev && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-600" /> Interactive Civic Map
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time geospatial visualization of active infrastructure complaints, work orders, and recurring problem zones.
          </p>
        </div>
        <Link
          to="/report"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          Submit New Report
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by title, street, or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
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
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="verified">Verified</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={highlightRecurring}
                onChange={(e) => setHighlightRecurring(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="font-medium">Highlight Recurring Hotspots</span>
            </label>
          </div>
        </div>
      </div>

      {/* Map + Sidebar Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaflet Map (2 cols) */}
        <div className="lg:col-span-2">
          <CivicMap
            reports={filteredReports}
            managedIssues={filteredIssues}
            highlightRecurring={highlightRecurring}
            height="580px"
            onMarkerClick={(item) => setActiveItem(item)}
          />
        </div>

        {/* Synchronized Side List (1 col) */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col h-[580px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Geocoded Incidents</h3>
              <p className="text-[11px] text-slate-500">
                {filteredIssues.length} Managed Issues • {filteredReports.length} Reports
              </p>
            </div>
            {activeItem && (
              <button
                onClick={() => setActiveItem(null)}
                className="text-[11px] text-blue-600 hover:underline"
              >
                Clear Selection
              </button>
            )}
          </div>

          {/* Active Item Inspector Card */}
          {activeItem && (
            <div className="my-3 p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-blue-900">Selected Incident</span>
                <StatusBadge status={activeItem.status} size="sm" />
              </div>
              <div className="font-bold text-slate-900">{activeItem.title}</div>
              <div className="text-slate-600">📍 {activeItem.location.address}</div>
              <div className="text-[11px] text-slate-500 font-mono">
                Lat: {activeItem.location.lat.toFixed(5)}, Lng: {activeItem.location.lng.toFixed(5)}
              </div>
              <div className="pt-1">
                {'priorityScore' in activeItem ? (
                  <Link
                    to={`/staff/issues/${activeItem.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline"
                  >
                    View Managed Work Order <ExternalLink className="w-3 h-3" />
                  </Link>
                ) : (
                  <Link
                    to={`/reports/${activeItem.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline"
                  >
                    View Original Report <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* List items */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 mt-2">
            {filteredIssues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => setActiveItem(issue)}
                className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                  activeItem?.id === issue.id
                    ? 'border-blue-500 bg-blue-50/50 shadow-xs'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-mono text-[10px] text-blue-700 font-semibold">
                    {issue.id}
                  </span>
                  <StatusBadge status={issue.status} size="sm" />
                </div>
                <div className="font-bold text-slate-900 truncate mb-1">{issue.title}</div>
                <div className="text-slate-500 text-[11px] truncate mb-1">
                  📍 {issue.location.address}
                </div>
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60">
                  <span className="text-slate-500">Priority: <strong className="text-slate-800">{issue.priorityScore}/100</strong></span>
                  <span className="text-blue-600 font-medium">{issue.originalReportIds.length} linked report{issue.originalReportIds.length > 1 ? 's' : ''}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
