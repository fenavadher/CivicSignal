import React, { useState, useEffect } from 'react';
import { FileDown, FileText, CheckCircle2, Loader2, X, Shield, Layers } from 'lucide-react';
import { api } from '../../services/api';
import { CitizenReport, ManagedIssue, AnalyticsSummary, CATEGORY_LABELS } from '../../types';
import {
  downloadIncidentReportPdf,
  downloadWorkOrderPdf,
  downloadMunicipalExecutiveSummaryPdf,
} from '../../utils/pdfGenerator';

interface DownloadReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadReportModal: React.FC<DownloadReportModalProps> = ({ isOpen, onClose }) => {
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [issues, setIssues] = useState<ManagedIssue[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  const [selectedReportId, setSelectedReportId] = useState<string>('');
  const [selectedIssueId, setSelectedIssueId] = useState<string>('');
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      setLoadingData(true);
      try {
        const [repRes, issRes, anaRes] = await Promise.all([
          api.getReports(),
          api.getManagedIssues(),
          api.getAnalytics(),
        ]);
        setReports(repRes.reports || []);
        setIssues(issRes.issues || []);
        setAnalytics(anaRes.analytics || null);

        if (repRes.reports && repRes.reports.length > 0) {
          setSelectedReportId(repRes.reports[0].id);
        }
        if (issRes.issues && issRes.issues.length > 0) {
          setSelectedIssueId(issRes.issues[0].id);
        }
      } catch (e) {
        console.error('Error loading report modal data:', e);
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownloadExecutiveSummary = () => {
    if (!analytics) return;
    downloadMunicipalExecutiveSummaryPdf(analytics, issues, reports);
    setDownloadSuccessMessage('Official Municipal Executive Summary PDF generated and downloaded!');
  };

  const handleDownloadSelectedReport = () => {
    const rep = reports.find((r) => r.id === selectedReportId);
    if (!rep) return;
    const linked = rep.managedIssueId ? issues.find((i) => i.id === rep.managedIssueId) : null;
    downloadIncidentReportPdf(rep, linked);
    setDownloadSuccessMessage(`Incident Report PDF (${rep.id}) downloaded!`);
  };

  const handleDownloadSelectedIssue = () => {
    const iss = issues.find((i) => i.id === selectedIssueId);
    if (!iss) return;
    const linked = iss.originalReportIds
      .map((id) => reports.find((r) => r.id === id))
      .filter((r): r is CitizenReport => Boolean(r));
    downloadWorkOrderPdf(iss, linked);
    setDownloadSuccessMessage(`Municipal Work Order Docket PDF (${iss.id}) downloaded!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden text-xs">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <FileDown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Download Official Report PDF</h3>
              <p className="text-[11px] text-slate-500">Generate formatted municipal document records</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {downloadSuccessMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{downloadSuccessMessage}</span>
            </div>
          )}

          {/* Option 1: Executive Operations Summary PDF */}
          <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-900 text-xs flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-blue-600" /> Executive Operations Summary PDF
              </span>
              <button
                type="button"
                onClick={handleDownloadExecutiveSummary}
                disabled={loadingData || !analytics}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-xs transition-colors disabled:opacity-50"
              >
                <FileDown className="w-3.5 h-3.5" /> Download PDF
              </button>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Complete municipal summary containing active work order counts, SLA compliance percentages, category distributions, and top priority items.
            </p>
          </div>

          {/* Option 2: Individual Citizen Incident Report PDF */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2.5">
            <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-600" /> Individual Citizen Incident Report PDF
            </div>
            <p className="text-slate-500 text-[11px]">
              Select any citizen report to download its official immutable submission record and coordinates.
            </p>

            <div className="flex items-center gap-2">
              <select
                value={selectedReportId}
                onChange={(e) => setSelectedReportId(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-800"
              >
                {reports.map((rep) => (
                  <option key={rep.id} value={rep.id}>
                    [{rep.id}] {rep.title} ({CATEGORY_LABELS[rep.category]})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleDownloadSelectedReport}
                disabled={!selectedReportId}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-md text-xs transition-colors shrink-0 flex items-center gap-1"
              >
                <FileDown className="w-3.5 h-3.5" /> Get PDF
              </button>
            </div>
          </div>

          {/* Option 3: Municipal Work Order Dispatch PDF */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2.5">
            <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-teal-700" /> Municipal Work Order Dispatch Docket PDF
            </div>
            <p className="text-slate-500 text-[11px]">
              Formatted field repair work order with priority score breakdown, SLA target timers, and linked complaints.
            </p>

            <div className="flex items-center gap-2">
              <select
                value={selectedIssueId}
                onChange={(e) => setSelectedIssueId(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-800"
              >
                {issues.map((iss) => (
                  <option key={iss.id} value={iss.id}>
                    [{iss.id}] {iss.title} • Score: {iss.priorityScore}/100
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleDownloadSelectedIssue}
                disabled={!selectedIssueId}
                className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-md text-xs transition-colors shrink-0 flex items-center gap-1"
              >
                <FileDown className="w-3.5 h-3.5" /> Get PDF
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-medium rounded-lg text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
