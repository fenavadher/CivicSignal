import React, { useState, useEffect } from 'react';
import { StaffSidebar } from '../components/layout/StaffSidebar';
import { api } from '../services/api';
import { DuplicateCandidate, CATEGORY_LABELS } from '../types';
import { StatusBadge, SeverityBadge } from '../components/common/StatusBadge';
import { CivicMap } from '../components/map/CivicMap';
import { useAuth } from '../context/AuthContext';
import {
  CopyCheck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  MapPin,
  Clock,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';

export const DuplicateReviewPage: React.FC = () => {
  const { user, showNotification } = useAuth();
  const [candidates, setCandidates] = useState<DuplicateCandidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<DuplicateCandidate | null>(null);
  const [loading, setLoading] = useState(true);

  // Review action modal / state
  const [reviewReason, setReviewReason] = useState('Confirmed identical road damage location and description');
  const [processing, setProcessing] = useState(false);

  const fetchCandidates = async () => {
    try {
      const res = await api.getDuplicates();
      setCandidates(res.duplicates || []);
      if (res.duplicates && res.duplicates.length > 0) {
        // Select first pending candidate
        const pending = res.duplicates.find((d) => d.status === 'pending');
        setSelectedCandidate(pending || res.duplicates[0]);
      }
    } catch (err) {
      console.error('Failed to load duplicate queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleReview = async (decision: 'approved' | 'rejected' | 'flagged_recurring') => {
    if (!selectedCandidate) return;
    setProcessing(true);
    try {
      await api.reviewDuplicate(selectedCandidate.id, {
        decision,
        reason: reviewReason,
      });

      showNotification(
        decision === 'approved'
          ? 'Duplicate grouping approved! Reports linked and priority recalculated.'
          : decision === 'rejected'
          ? 'Duplicate candidate rejected. Both reports kept distinct.'
          : 'Candidate flagged as recurring issue for specialist investigation.',
        'success'
      );

      await fetchCandidates();
    } catch (e: any) {
      showNotification(e.message || 'Failed to review candidate', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const pendingList = candidates.filter((c) => c.status === 'pending');
  const reviewedList = candidates.filter((c) => c.status !== 'pending');

  return (
    <div className="flex bg-[#F8FAFC]">
      <StaffSidebar />

      <main className="flex-1 p-6 max-w-7xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CopyCheck className="w-6 h-6 text-amber-600" /> Duplicate Review Queue
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Compare candidate reports side-by-side. Approving groups the reports into a shared work order without deleting either citizen record.
          </p>
        </div>

        {/* Candidate Selector Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
          {pendingList.map((cand) => (
            <button
              key={cand.id}
              onClick={() => setSelectedCandidate(cand)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                selectedCandidate?.id === cand.id
                  ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Pair #{cand.id.slice(-6)} • {cand.compositeScore}% Match
            </button>
          ))}
          {pendingList.length === 0 && (
            <div className="text-xs text-slate-400 italic py-1">
              No pending duplicates in queue.
            </div>
          )}
        </div>

        {selectedCandidate ? (
          <div className="space-y-6">
            {/* Matching Signals Banner */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Match Evaluation Score:
                    </span>
                    <span className="font-mono text-sm font-extrabold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                      {selectedCandidate.compositeScore}/100
                    </span>
                    <span className="text-xs text-slate-400">
                      ({selectedCandidate.recommendedAction.replace(/_/g, ' ').toUpperCase()})
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Candidate #{selectedCandidate.id} • Evaluated {new Date(selectedCandidate.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-center px-3 py-1 bg-slate-50 rounded border border-slate-200 text-xs">
                    <div className="font-bold text-slate-800">{selectedCandidate.distanceMeters}m</div>
                    <div className="text-[10px] text-slate-400">Distance</div>
                  </div>
                  <div className="text-center px-3 py-1 bg-slate-50 rounded border border-slate-200 text-xs">
                    <div className="font-bold text-slate-800">
                      {Math.round(selectedCandidate.textSimilarity * 100)}%
                    </div>
                    <div className="text-[10px] text-slate-400">Text Similarity</div>
                  </div>
                  <div className="text-center px-3 py-1 bg-slate-50 rounded border border-slate-200 text-xs">
                    <div className="font-bold text-emerald-700">
                      {selectedCandidate.categoryCompatibility ? 'Match' : 'Mismatch'}
                    </div>
                    <div className="text-[10px] text-slate-400">Category</div>
                  </div>
                </div>
              </div>

              {/* AI Semantic Reasoning Box */}
              <div className="mt-4 p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-blue-900">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Semantic & Engineering Similarity Explanation:
                </div>
                <p className="text-slate-700 leading-relaxed italic">
                  "{selectedCandidate.aiExplanation}"
                </p>
                <div className="text-[10px] text-slate-400 pt-1">
                  Confidence rating based on spatial proximity, lexical tokenization, and Gemini semantic analysis. Scores are not calibrated probabilities.
                </div>
              </div>
            </div>

            {/* Side-by-Side Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Primary Report */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-bold text-slate-900 text-xs uppercase tracking-wider text-blue-700">
                    Primary / Active Report
                  </span>
                  <span className="font-mono text-xs text-slate-500 font-semibold">
                    {selectedCandidate.primaryReportId}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <SeverityBadge severity={selectedCandidate.primaryReport?.severity || 'medium'} size="sm" />
                  <StatusBadge status={selectedCandidate.primaryReport?.status || 'submitted'} size="sm" />
                </div>

                <h3 className="font-bold text-slate-900 text-sm">
                  {selectedCandidate.primaryReport?.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {selectedCandidate.primaryReport?.description}
                </p>

                <div className="text-xs text-slate-600 space-y-1">
                  <div>📍 <strong>Location:</strong> {selectedCandidate.primaryReport?.location.address}</div>
                  <div>👤 <strong>Submitter:</strong> {selectedCandidate.primaryReport?.submitterName}</div>
                  <div>📅 <strong>Date:</strong> {new Date(selectedCandidate.primaryReport?.createdAt || '').toLocaleString()}</div>
                </div>

                {selectedCandidate.primaryReport?.photoUrl && (
                  <div className="rounded-lg overflow-hidden border border-slate-200 max-h-48">
                    <img
                      src={selectedCandidate.primaryReport.photoUrl}
                      alt="Primary report photo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Candidate Report */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-bold text-slate-900 text-xs uppercase tracking-wider text-amber-700">
                    Candidate Duplicate Report
                  </span>
                  <span className="font-mono text-xs text-slate-500 font-semibold">
                    {selectedCandidate.candidateReportId}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <SeverityBadge severity={selectedCandidate.candidateReport?.severity || 'medium'} size="sm" />
                  <StatusBadge status={selectedCandidate.candidateReport?.status || 'submitted'} size="sm" />
                </div>

                <h3 className="font-bold text-slate-900 text-sm">
                  {selectedCandidate.candidateReport?.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {selectedCandidate.candidateReport?.description}
                </p>

                <div className="text-xs text-slate-600 space-y-1">
                  <div>📍 <strong>Location:</strong> {selectedCandidate.candidateReport?.location.address}</div>
                  <div>👤 <strong>Submitter:</strong> {selectedCandidate.candidateReport?.submitterName}</div>
                  <div>📅 <strong>Date:</strong> {new Date(selectedCandidate.candidateReport?.createdAt || '').toLocaleString()}</div>
                </div>

                {selectedCandidate.candidateReport?.photoUrl && (
                  <div className="rounded-lg overflow-hidden border border-slate-200 max-h-48">
                    <img
                      src={selectedCandidate.candidateReport.photoUrl}
                      alt="Candidate report photo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Map Comparison Pinpoints */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-600" /> Geographic Proximity Comparison
                </h3>
                <span className="text-xs font-semibold text-slate-600">
                  Separated by {selectedCandidate.distanceMeters} meters
                </span>
              </div>
              {selectedCandidate.primaryReport && selectedCandidate.candidateReport && (
                <CivicMap
                  reports={[selectedCandidate.primaryReport, selectedCandidate.candidateReport]}
                  center={[
                    selectedCandidate.primaryReport.location.lat,
                    selectedCandidate.primaryReport.location.lng,
                  ]}
                  zoom={17}
                  height="260px"
                />
              )}
            </div>

            {/* Decision Controls (Reviewer Actions) */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
                Staff Review Decision
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Staff Review Reason / Notes (Audit Trail)
                </label>
                <input
                  type="text"
                  value={reviewReason}
                  onChange={(e) => setReviewReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={processing}
                  onClick={() => handleReview('approved')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve Duplicate Grouping
                </button>

                <button
                  type="button"
                  disabled={processing}
                  onClick={() => handleReview('rejected')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-lg border border-slate-200 transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4 text-rose-600" /> Reject Match (Keep Distinct)
                </button>

                <button
                  type="button"
                  disabled={processing}
                  onClick={() => handleReview('flagged_recurring')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-xs rounded-lg border border-amber-200 transition-colors disabled:opacity-50"
                >
                  <RotateCcw className="w-4 h-4 text-amber-600" /> Flag as Recurring Problem
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-slate-500 bg-white border border-slate-200 rounded-xl">
            Select a candidate pair from the queue above to inspect.
          </div>
        )}
      </main>
    </div>
  );
};
