import React, { useState, useEffect } from 'react';
import { StaffSidebar } from '../components/layout/StaffSidebar';
import { api } from '../services/api';
import { RecurringIssue, CATEGORY_LABELS } from '../types';
import { StatusBadge, SeverityBadge } from '../components/common/StatusBadge';
import { CivicMap } from '../components/map/CivicMap';
import {
  RotateCcw,
  AlertTriangle,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export const RecurringIssuesPage: React.FC = () => {
  const [recurringList, setRecurringList] = useState<RecurringIssue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecurring = async () => {
      try {
        const res = await api.getRecurringIssues();
        setRecurringList(res.recurring || []);
      } catch (err) {
        console.error('Failed to load recurring issues:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecurring();
  }, []);

  return (
    <div className="flex bg-[#F8FAFC]">
      <StaffSidebar />

      <main className="flex-1 p-6 max-w-7xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <RotateCcw className="w-6 h-6 text-red-600" /> Recurring Infrastructure Hotspots
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complaints submitted within 120 meters of previously resolved work orders. Identifies structural failures requiring full engineering reconstruction rather than temporary patch fixes.
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Scanning for recurring hotspots...</div>
        ) : recurringList.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 bg-white border border-slate-200 rounded-xl">
            No recurring hotspots detected within the configured time window.
          </div>
        ) : (
          <div className="space-y-6">
            {recurringList.map((rec) => (
              <div
                key={rec.id}
                className="bg-white border border-red-200 rounded-xl p-5 shadow-2xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-red-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                      Recurrence #{rec.recurrenceCount}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      Breakout within {rec.distanceMeters}m of previous repair
                    </span>
                  </div>
                  <div className="text-xs text-red-700 font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    Reappeared {rec.daysSinceResolved} days after previous resolution
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Previous Historical Work Order */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                      Historical Work Order (Previously Resolved)
                    </div>
                    <div className="font-bold text-slate-900 text-sm">
                      {rec.previousIssue?.title || 'Historical Repair'}
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      {rec.previousIssue?.resolutionDetails?.resolutionNotes ||
                        'Repairs applied with standard cold patch compaction.'}
                    </p>
                    <div className="pt-1 text-slate-500 text-[11px] space-y-0.5">
                      <div>
                        Resolved Date: <strong>{new Date(rec.previousResolvedAt).toLocaleDateString()}</strong>
                      </div>
                      <div>
                        Location: <strong>{rec.previousIssue?.location.address}</strong>
                      </div>
                    </div>
                  </div>

                  {/* New Incoming Citizen Report */}
                  <div className="p-4 bg-red-50/50 rounded-xl border border-red-200 space-y-2">
                    <div className="font-semibold text-red-700 uppercase tracking-wider text-[10px]">
                      New Incident Submission (Repeat Failure)
                    </div>
                    <div className="font-bold text-slate-900 text-sm">
                      {rec.currentReport?.title}
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      {rec.currentReport?.description}
                    </p>
                    <div className="pt-1 text-slate-500 text-[11px] space-y-0.5">
                      <div>
                        Submitted Date: <strong>{new Date(rec.currentReport?.createdAt || '').toLocaleDateString()}</strong>
                      </div>
                      <div>
                        Location: <strong>{rec.currentReport?.location.address}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analysis & Engineering Recommendation */}
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs space-y-1">
                  <div className="font-bold text-amber-900">
                    Engineering Recurrence Warning:
                  </div>
                  <p className="text-slate-700 leading-relaxed text-[11px]">
                    {rec.notes ||
                      'Standard temporary fixes failed within 45 days. Sub-base drainage or foundation inspection recommended before closing order.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
