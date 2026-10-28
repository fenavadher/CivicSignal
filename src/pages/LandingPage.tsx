import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  MapPin,
  PlusCircle,
  CheckCircle2,
  Clock,
  Layers,
  Search,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Droplets,
  Construction,
  Trash2,
  FileDown,
} from 'lucide-react';
import { CivicMap } from '../components/map/CivicMap';
import { api } from '../services/api';
import { CitizenReport, ManagedIssue, CATEGORY_LABELS, IssueCategory } from '../types';
import { StatusBadge, SeverityBadge } from '../components/common/StatusBadge';
import { DownloadReportModal } from '../components/common/DownloadReportModal';

const CATEGORY_ITEMS: { key: IssueCategory; label: string; icon: any; desc: string }[] = [
  { key: 'pothole_roads', label: 'Potholes & Roads', icon: Construction, desc: 'Pavement craters, cracks, sunken asphalt, or crumbling shoulders.' },
  { key: 'garbage_accumulation', label: 'Garbage & Waste', icon: Trash2, desc: 'Overflowing dumpsters, illegal dumping, missed pickups.' },
  { key: 'broken_streetlights', label: 'Broken Streetlights', icon: Lightbulb, desc: 'Dark luminaires, flickering bulbs, damaged light poles.' },
  { key: 'damaged_sidewalks', label: 'Damaged Sidewalks', icon: AlertTriangle, desc: 'Tripping hazards, broken slabs, root heave, blocked access.' },
  { key: 'drainage_problems', label: 'Drainage Problems', icon: Droplets, desc: 'Street pooling, clogged storm drains, rainwater backups.' },
  { key: 'water_infrastructure', label: 'Water Infrastructure', icon: Droplets, desc: 'Burst water mains, fire hydrant leaks, low pressure.' },
];

export const LandingPage: React.FC = () => {
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [managedIssues, setManagedIssues] = useState<ManagedIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [repRes, issRes] = await Promise.all([
          api.getReports(),
          api.getManagedIssues(),
        ]);
        setReports(repRes.reports || []);
        setManagedIssues(issRes.issues || []);
      } catch (e) {
        console.error('Failed to load landing page data:', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const totalReportsCount = reports.length;
  const activeIssuesCount = managedIssues.filter((i) => i.status !== 'resolved').length;
  const resolvedIssuesCount = managedIssues.filter((i) => i.status === 'resolved').length;
  const resolutionRate = managedIssues.length > 0 ? Math.round((resolvedIssuesCount / managedIssues.length) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-4">
              <Shield className="w-3.5 h-3.5" />
              Municipal Transparency & AI Duplicate Prioritization
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Report Issues. <br className="hidden sm:inline" />
              <span className="text-blue-600">Improve Your City.</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              Report civic problems, discover existing issues, and help your community get the repairs it needs. Powered by intelligent duplicate grouping and transparent SLA tracking.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/report"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                Report an Issue
              </Link>
              <Link
                to="/map"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold rounded-lg border border-slate-200 transition-colors"
              >
                <MapPin className="w-4 h-4 text-slate-600" />
                Explore Civic Map
              </Link>
              <button
                onClick={() => setReportModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors font-semibold"
              >
                <FileDown className="w-4 h-4 text-blue-600" />
                Download Report (PDF)
              </button>
            </div>
          </div>

          {/* Live Application Stats from Actual Database */}
          <div className="mt-12 pt-8 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#F8FAFC] border border-slate-200 p-4 rounded-xl">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {loading ? '...' : totalReportsCount}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1">Total Citizen Submissions</div>
            </div>
            <div className="bg-[#F8FAFC] border border-slate-200 p-4 rounded-xl">
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-600">
                {loading ? '...' : activeIssuesCount}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1">Active Managed Work Orders</div>
            </div>
            <div className="bg-[#F8FAFC] border border-slate-200 p-4 rounded-xl">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                {loading ? '...' : `${resolutionRate}%`}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1">Resolved SLA Compliance</div>
            </div>
            <div className="bg-[#F8FAFC] border border-slate-200 p-4 rounded-xl">
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">
                {loading ? '...' : managedIssues.filter((i) => i.isRecurring).length + 1}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1">Recurring Hotspots Tracked</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Process Explanation */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl font-bold text-slate-900">How CivicSignal Works</h2>
          <p className="text-sm text-slate-500 mt-2">
            A transparent 3-step pipeline connecting citizens directly with municipal civil dispatchers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-base mb-4 border border-blue-100">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Report</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pin the exact problem location on the interactive map, select the civic category, attach a photo, and describe the hazard in seconds.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-base mb-4 border border-teal-100">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Review & Duplicate Deduplication</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Automated spatial and Gemini semantic models identify related reports for the same incident, boosting issue priority while preserving all original citizen records.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-base mb-4 border border-emerald-100">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Resolve & Verify</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Municipal teams dispatch repair crews according to strict SLA deadlines, upload proof-of-work documentation, and notify affected citizens.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-12 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Infrastructure Categories</h2>
              <p className="text-xs text-slate-500 mt-1">Select a category to report or explore related civic issues</p>
            </div>
            <Link
              to="/report"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Start New Report <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORY_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.key}
                  to={`/map?category=${item.key}`}
                  className="p-4 rounded-xl border border-slate-200 bg-[#F8FAFC] hover:bg-white hover:border-blue-300 hover:shadow-xs transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-white border border-slate-200 text-blue-600 group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {item.label}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Civic Map Preview */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Civic Incident Map Preview</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live geographic visualization of open municipal work orders and recurring problem hotspots
            </p>
          </div>
          <Link
            to="/map"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 rounded-lg text-xs font-medium transition-colors"
          >
            <MapPin className="w-3.5 h-3.5" /> Open Fullscreen Map
          </Link>
        </div>

        <CivicMap managedIssues={managedIssues} reports={reports} height="400px" />
      </section>

      {/* Recent Public Submissions Table */}
      <section className="py-12 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Recent Public Reports</h2>
              <p className="text-xs text-slate-500 mt-0.5">Latest community feedback and infrastructure repair requests</p>
            </div>
            <Link
              to="/map"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              View all on map →
            </Link>
          </div>

          {reports.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl bg-slate-50">
              No civic reports currently in database. Click "Report an Issue" to submit the first problem.
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Report ID</th>
                      <th className="px-4 py-3">Title & Category</th>
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3">Severity</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Submitted</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {reports.slice(0, 6).map((report) => (
                      <tr key={report.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{report.id}</td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900 max-w-xs truncate">{report.title}</div>
                          <div className="text-[11px] text-slate-500">{CATEGORY_LABELS[report.category]}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 max-w-[200px] truncate">
                          {report.location.address}
                        </td>
                        <td className="px-4 py-3">
                          <SeverityBadge severity={report.severity} size="sm" />
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={report.status} size="sm" />
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {new Date(report.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            to={`/reports/${report.id}`}
                            className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                          >
                            Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

      <DownloadReportModal isOpen={reportModalOpen} onClose={() => setReportModalOpen(false)} />
    </div>
  );
};
