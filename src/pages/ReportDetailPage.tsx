import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { CitizenReport, ManagedIssue, CATEGORY_LABELS } from '../types';
import { StatusBadge, SeverityBadge } from '../components/common/StatusBadge';
import { PriorityMeter } from '../components/common/PriorityMeter';
import { CivicMap } from '../components/map/CivicMap';
import { downloadIncidentReportPdf } from '../utils/pdfGenerator';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  Shield,
  Layers,
  FileText,
  AlertCircle,
  ExternalLink,
  FileDown,
  Loader2,
} from 'lucide-react';

export const ReportDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { showNotification } = useAuth();
  const [report, setReport] = useState<CitizenReport | null>(null);
  const [linkedIssue, setLinkedIssue] = useState<ManagedIssue | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      try {
        const res = await api.getReportById(id);
        setReport(res.report);
        setLinkedIssue(res.linkedIssue);
      } catch (err) {
        console.error('Error fetching report detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleDownloadReport = () => {
    if (!report) return;
    try {
      setDownloading(true);
      downloadIncidentReportPdf(report, linkedIssue);
      showNotification('Official incident report PDF downloaded successfully.', 'success');
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      showNotification('Could not generate PDF report.', 'error');
    } finally {
      setTimeout(() => setDownloading(false), 500);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-xs text-slate-500">
        Loading report details...
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-xs text-slate-500 space-y-3">
        <AlertCircle className="w-8 h-8 mx-auto text-red-500" />
        <h2 className="text-base font-bold text-slate-800">Report Not Found</h2>
        <p>The report you are looking for does not exist or has been removed.</p>
        <Link to="/my-reports" className="text-blue-600 font-semibold hover:underline">
          Return to My Reports
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Navigation */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          to="/my-reports"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Reports
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadReport}
            disabled={downloading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            title="Download PDF version of this incident report"
          >
            {downloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            Download Report
          </button>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400">ID:</span>
            <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {report.id}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                {CATEGORY_LABELS[report.category]}
              </span>
              <div className="flex items-center gap-2">
                <SeverityBadge severity={report.severity} />
                <StatusBadge status={report.status} />
              </div>
            </div>

            <h1 className="text-xl font-bold text-slate-900">{report.title}</h1>

            <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50/50 p-4 rounded-lg border border-slate-200/60">
              {report.description}
            </div>

            {/* Photo */}
            {report.photoUrl && (
              <div className="pt-2">
                <div className="text-xs font-semibold text-slate-700 mb-2">Attached Photograph</div>
                <div className="rounded-xl overflow-hidden border border-slate-200 max-h-80 bg-slate-100">
                  <img
                    src={report.photoUrl}
                    alt={report.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Location details & Map preview */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-600" /> Geographic Location
              </h2>
              <span className="font-mono text-xs text-slate-400">
                {report.location.lat.toFixed(5)}, {report.location.lng.toFixed(5)}
              </span>
            </div>

            <div className="text-xs text-slate-700">
              <span className="font-semibold">Address:</span> {report.location.address}
              {report.location.landmark && (
                <div className="text-slate-500 mt-0.5">
                  <span className="font-semibold">Landmark:</span> {report.location.landmark}
                </div>
              )}
            </div>

            <CivicMap
              center={[report.location.lat, report.location.lng]}
              zoom={16}
              reports={[report]}
              height="240px"
            />
          </div>
        </div>

        {/* Sidebar Info (Right col) */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 pb-2 border-b border-slate-100">
              Submission Metadata
            </h3>

            <div className="space-y-2.5 text-slate-600">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <User className="w-3.5 h-3.5" /> Submitter
                </span>
                <span className="font-medium text-slate-900">{report.submitterName}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Calendar className="w-3.5 h-3.5" /> Submitted Date
                </span>
                <span className="font-medium text-slate-900">
                  {new Date(report.createdAt).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Data Guarantee</span>
                <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                  Immutable Record
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleDownloadReport}
                disabled={downloading}
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-semibold rounded-lg transition-colors text-xs cursor-pointer disabled:opacity-50"
              >
                {downloading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileDown className="w-3.5 h-3.5 text-blue-600" />
                )}
                Download Report (PDF)
              </button>
            </div>
          </div>

          {/* Linked Managed Issue Card */}
          {linkedIssue ? (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3 text-xs">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Layers className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900">Associated Managed Issue</h3>
              </div>

              <p className="text-slate-500 leading-relaxed text-[11px]">
                Staff confirmed your report belongs to an active municipal work order alongside other citizen reports.
              </p>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="font-bold text-slate-900">{linkedIssue.title}</div>
                <div className="flex items-center justify-between text-[11px] text-slate-600">
                  <span>Department:</span>
                  <span className="font-medium">{linkedIssue.department || 'Public Works'}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-600">
                  <span>Linked Citizen Reports:</span>
                  <span className="font-bold text-blue-600">{linkedIssue.originalReportIds.length} reports</span>
                </div>
              </div>

              <PriorityMeter
                score={linkedIssue.priorityScore}
                level={linkedIssue.priorityLevel}
                breakdown={linkedIssue.scoreBreakdown}
              />

              <Link
                to={`/staff/issues/${linkedIssue.id}`}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg transition-colors text-xs"
              >
                Inspect Managed Issue <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs text-xs space-y-2">
              <h3 className="font-bold text-slate-900">Work Order Status</h3>
              <p className="text-slate-500 leading-relaxed text-[11px]">
                Currently logged as a standalone citizen complaint. When municipal staff verify the problem or merge related duplicates, a managed work order will be linked here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
