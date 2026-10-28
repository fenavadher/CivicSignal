import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { StaffSidebar } from '../components/layout/StaffSidebar';
import { api } from '../services/api';
import { ManagedIssue, CitizenReport, CATEGORY_LABELS, ReportStatus } from '../types';
import { StatusBadge, SeverityBadge, SlaBadge } from '../components/common/StatusBadge';
import { PriorityMeter } from '../components/common/PriorityMeter';
import { CivicMap } from '../components/map/CivicMap';
import { useAuth } from '../context/AuthContext';
import { downloadWorkOrderPdf } from '../utils/pdfGenerator';
import {
  ArrowLeft,
  MapPin,
  Clock,
  User,
  Building2,
  Sparkles,
  Split,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Loader2,
  ExternalLink,
  FileDown,
} from 'lucide-react';

export const ManagedIssueDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, showNotification } = useAuth();

  const [issue, setIssue] = useState<ManagedIssue | null>(null);
  const [linkedReports, setLinkedReports] = useState<CitizenReport[]>([]);
  const [loading, setLoading] = useState(true);

  // Status and assignment update state
  const [statusVal, setStatusVal] = useState<ReportStatus>('in_progress');
  const [departmentVal, setDepartmentVal] = useState('');
  const [assignedToName, setAssignedToName] = useState('');
  const [updating, setUpdating] = useState(false);

  // New Note
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  // Ungroup modal
  const [ungroupReportId, setUngroupReportId] = useState<string | null>(null);
  const [ungroupReason, setUngroupReason] = useState('Report describes distinct physical location/problem');
  const [ungrouping, setUngrouping] = useState(false);

  // Resolution modal
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolutionPhoto, setResolutionPhoto] = useState('');
  const [actualHours, setActualHours] = useState(24);
  const [resolving, setResolving] = useState(false);

  // AI Dispatch Analysis
  const [aiAnalysis, setAiAnalysis] = useState<any | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const fetchDetail = async () => {
    if (!id) return;
    try {
      const res = await api.getManagedIssueById(id);
      setIssue(res.issue);
      setLinkedReports(res.linkedReports || []);
      setStatusVal(res.issue.status);
      setDepartmentVal(res.issue.department || 'Public Works');
      setAssignedToName(res.issue.assignedToName || 'Marcus Vance');
    } catch (err) {
      console.error('Failed to load issue detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleFetchAi = async () => {
    if (!issue) return;
    setLoadingAi(true);
    try {
      const res = await api.analyzeIssueWithAi({
        title: issue.title,
        category: issue.category,
        description: issue.description,
        severity: issue.severity,
        address: issue.location.address,
      });
      setAiAnalysis(res.analysis);
      showNotification('Gemini dispatch intelligence generated.', 'success');
    } catch (e) {
      showNotification('Could not generate AI intelligence.', 'error');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleUpdateStatusAndAssignment = async () => {
    if (!issue) return;
    setUpdating(true);
    try {
      const res = await api.updateManagedIssue(
        issue.id,
        {
          status: statusVal,
          department: departmentVal,
          assignedToName: assignedToName,
        },
        `Status updated to ${statusVal.toUpperCase()} by ${user?.name}`
      );
      setIssue(res.issue);
      showNotification('Work order updated successfully!', 'success');
    } catch (e: any) {
      showNotification(e.message || 'Failed to update', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issue || !noteText.trim()) return;
    setAddingNote(true);
    try {
      const res = await api.addInternalNote(issue.id, noteText.trim());
      setIssue(res.issue);
      setNoteText('');
      showNotification('Internal note added to work order.', 'success');
    } catch (e: any) {
      showNotification(e.message || 'Failed to add note', 'error');
    } finally {
      setAddingNote(false);
    }
  };

  const handleUngroup = async () => {
    if (!issue || !ungroupReportId) return;
    setUngrouping(true);
    try {
      await api.ungroupReport(issue.id, ungroupReportId, ungroupReason);
      showNotification(`Report ${ungroupReportId} ungrouped and restored to standalone under-review status.`, 'success');
      setUngroupReportId(null);
      await fetchDetail();
    } catch (e: any) {
      showNotification(e.message || 'Failed to ungroup report', 'error');
    } finally {
      setUngrouping(false);
    }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issue) return;
    setResolving(true);
    try {
      const res = await api.resolveManagedIssue(issue.id, {
        resolutionNotes: resolutionNotes || 'Repairs completed and site verified by municipal crew.',
        resolutionPhotoUrl: resolutionPhoto || undefined,
        actualDurationHours: Number(actualHours) || 24,
      });
      setIssue(res.issue);
      setResolveModalOpen(false);
      showNotification('Issue marked as RESOLVED with documented resolution details!', 'success');
    } catch (e: any) {
      showNotification(e.message || 'Failed to resolve issue', 'error');
    } finally {
      setResolving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex bg-[#F8FAFC]">
        <StaffSidebar />
        <main className="flex-1 p-8 text-center text-xs text-slate-500">Loading work order...</main>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="flex bg-[#F8FAFC]">
        <StaffSidebar />
        <main className="flex-1 p-8 text-center text-xs text-slate-500 space-y-2">
          <p>Work order not found.</p>
          <Link to="/staff/issues" className="text-blue-600 font-semibold">
            Return to Issues
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="flex bg-[#F8FAFC]">
      <StaffSidebar />

      <main className="flex-1 p-6 max-w-7xl space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/staff/issues"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to All Work Orders
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Order ID:</span>
            <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {issue.id}
            </span>
          </div>
        </div>

        {/* Issue Hero Header */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                {CATEGORY_LABELS[issue.category]}
              </span>
              <SeverityBadge severity={issue.severity} />
              <StatusBadge status={issue.status} />
              {issue.isRecurring && (
                <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                  ⚠️ Recurring Hotspot
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => downloadWorkOrderPdf(issue, linkedReports)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 flex items-center gap-1.5 transition-colors"
                title="Download official Work Order Dispatch PDF"
              >
                <FileDown className="w-4 h-4 text-teal-700" /> Download PDF Docket
              </button>
              <SlaBadge deadlineIso={issue.resolutionDeadline} isResolved={issue.status === 'resolved'} />
              {issue.status !== 'resolved' && (
                <button
                  onClick={() => setResolveModalOpen(true)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" /> Record Resolution
                </button>
              )}
            </div>
          </div>

          <h1 className="text-2xl font-bold text-slate-900">{issue.title}</h1>
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-200/60">
            {issue.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{issue.location.address}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
              <span>Dept: <strong>{issue.department || 'Operations'}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <User className="w-4 h-4 text-slate-500 shrink-0" />
              <span>Assigned: <strong>{issue.assignedToName || 'Unassigned'}</strong></span>
            </div>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 cols): Reports Cluster & Location */}
          <div className="lg:col-span-2 space-y-6">
            {/* Linked Original Reports Cluster (Reversible Grouping) */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="font-bold text-slate-900 text-sm">
                    Linked Citizen Reports ({linkedReports.length})
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Grouped reports share this work order. Each original citizen submission is permanently preserved and can be ungrouped if needed.
                  </p>
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {linkedReports.length} Reports Combined
                </span>
              </div>

              <div className="space-y-3">
                {linkedReports.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2 hover:bg-white transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-500 font-bold">{rep.id}</span>
                        <span className="font-bold text-slate-900">{rep.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400">
                          {new Date(rep.createdAt).toLocaleDateString()}
                        </span>
                        {/* REVERSIBLE UNGROUP BUTTON */}
                        {linkedReports.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setUngroupReportId(rep.id)}
                            className="inline-flex items-center gap-1 text-[11px] text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded border border-rose-200 font-medium transition-colors"
                            title="Safely remove this report from the group back to standalone status"
                          >
                            <Split className="w-3 h-3" /> Ungroup
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-slate-600 leading-relaxed text-[11px]">{rep.description}</p>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/50">
                      <span>Submitted by: <strong>{rep.submitterName}</strong> ({rep.submitterEmail})</span>
                      <span>📍 {rep.location.address}</span>
                    </div>

                    {rep.photoUrl && (
                      <div className="mt-1">
                        <img
                          src={rep.photoUrl}
                          alt="Citizen upload"
                          className="h-24 w-36 object-cover rounded-md border border-slate-200"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Incident Location Map */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-600" /> Geographic Incident Pinpoint
                </h3>
                <span className="text-xs font-mono text-slate-500">
                  {issue.location.lat.toFixed(5)}, {issue.location.lng.toFixed(5)}
                </span>
              </div>
              <CivicMap
                center={[issue.location.lat, issue.location.lng]}
                zoom={16}
                managedIssues={[issue]}
                height="280px"
              />
            </div>

            {/* Internal Staff Notes */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-slate-500" /> Internal Municipal Notes ({issue.internalNotes?.length || 0})
              </h3>

              <div className="space-y-2.5 max-h-60 overflow-y-auto">
                {(!issue.internalNotes || issue.internalNotes.length === 0) ? (
                  <p className="text-xs text-slate-400 italic">No internal dispatch notes yet.</p>
                ) : (
                  issue.internalNotes.map((note) => (
                    <div key={note.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-800">
                          {note.authorName} ({note.authorRole.toUpperCase()})
                        </span>
                        <span>{new Date(note.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-700">{note.text}</p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddNote} className="flex gap-2 pt-2 border-t border-slate-100">
                <input
                  type="text"
                  required
                  placeholder="Add internal crew instructions or field note..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={addingNote}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {addingNote ? 'Adding...' : 'Post Note'}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Controls, Priority & AI Assistance */}
          <div className="space-y-6">
            {/* Explainable Priority Score Card */}
            <PriorityMeter
              score={issue.priorityScore}
              level={issue.priorityLevel}
              breakdown={issue.scoreBreakdown}
            />

            {/* Workflow & Status Updating */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4 text-xs">
              <h3 className="font-bold text-slate-900 pb-2 border-b border-slate-100">
                Dispatch Status & Assignment
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Workflow Status</label>
                <select
                  value={statusVal}
                  onChange={(e) => setStatusVal(e.target.value as ReportStatus)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                >
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="verified">Verified</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="reopened">Reopened</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Department</label>
                <input
                  type="text"
                  value={departmentVal}
                  onChange={(e) => setDepartmentVal(e.target.value)}
                  placeholder="e.g. Public Works - Roadway Maintenance"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Staff Lead</label>
                <input
                  type="text"
                  value={assignedToName}
                  onChange={(e) => setAssignedToName(e.target.value)}
                  placeholder="e.g. Marcus Vance"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <button
                type="button"
                onClick={handleUpdateStatusAndAssignment}
                disabled={updating}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
              >
                {updating ? 'Saving Changes...' : 'Update Work Order State'}
              </button>
            </div>

            {/* Resolution Documentation if resolved */}
            {issue.resolutionDetails && (
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-5 shadow-2xs space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-emerald-900 pb-2 border-b border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Resolution Documentation
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Completed:</span>{' '}
                  <span className="font-semibold text-slate-800">
                    {new Date(issue.resolutionDetails.resolvedAt).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Inspector / Crew Lead:</span>{' '}
                  <span className="font-semibold text-slate-800">
                    {issue.resolutionDetails.resolvedByName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Turnaround Duration:</span>{' '}
                  <span className="font-semibold text-slate-800">
                    {issue.resolutionDetails.actualDurationHours} hours
                  </span>
                </div>
                <div className="p-2.5 bg-white rounded border border-emerald-200 mt-2 text-slate-700 italic">
                  "{issue.resolutionDetails.resolutionNotes}"
                </div>
              </div>
            )}

            {/* Gemini AI Dispatch Assistant */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Gemini Dispatch Intelligence
                </div>
                <button
                  type="button"
                  onClick={handleFetchAi}
                  disabled={loadingAi}
                  className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1"
                >
                  {loadingAi ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Run Analysis'}
                </button>
              </div>

              {aiAnalysis ? (
                <div className="space-y-2.5">
                  <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 font-medium">
                    {aiAnalysis.hazardSummary}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-700">Recommended Action:</div>
                    <div className="text-slate-600 mt-0.5">{aiAnalysis.recommendedRepairAction}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-700">Identified Safety Risks:</div>
                    <ul className="list-disc list-inside text-slate-600 mt-0.5">
                      {aiAnalysis.safetyRisks?.map((r: string, i: number) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-700">Recommended Equipment:</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {aiAnalysis.equipmentNeeded?.map((eq: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-100 rounded text-[10px] text-slate-700 border border-slate-200">
                          {eq}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 leading-relaxed text-[11px]">
                  Click "Run Analysis" to get server-side Gemini semantic dispatch advice, safety risk evaluation, and repair equipment checklists.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Ungroup Modal */}
        {ungroupReportId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200 p-5 space-y-4 text-xs">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                <Split className="w-4 h-4" /> Reversible Ungrouping Confirmation
              </div>
              <p className="text-slate-600 leading-relaxed">
                You are removing report <strong>{ungroupReportId}</strong> from this work order.
                The original citizen report will remain completely preserved in the database and be restored to standalone "Under Review" status.
              </p>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Ungrouping (Required for Audit Log)
                </label>
                <textarea
                  rows={2}
                  value={ungroupReason}
                  onChange={(e) => setUngroupReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setUngroupReportId(null)}
                  className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUngroup}
                  disabled={ungrouping}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md font-semibold"
                >
                  {ungrouping ? 'Ungrouping...' : 'Confirm Ungroup'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Record Resolution Modal */}
        {resolveModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <form onSubmit={handleResolve} className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200 p-5 space-y-4 text-xs">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm pb-2 border-b border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Record Official Resolution
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Resolution Notes & Technical Summary <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Detail repairs completed (e.g., asphalt cold patch compacted to grade, luminaire replaced, valve isolated)..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Turnaround Duration (Hours)
                </label>
                <input
                  type="number"
                  value={actualHours}
                  onChange={(e) => setActualHours(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Proof-of-Repair Photograph URL (Optional)
                </label>
                <input
                  type="url"
                  value={resolutionPhoto}
                  onChange={(e) => setResolutionPhoto(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResolveModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resolving}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-semibold"
                >
                  {resolving ? 'Recording...' : 'Mark Resolved'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};
