import React, { useState } from 'react';
import { ScoreBreakdown } from '../../types';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface PriorityMeterProps {
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  breakdown?: ScoreBreakdown;
  compact?: boolean;
}

export const PriorityMeter: React.FC<PriorityMeterProps> = ({
  score,
  level,
  breakdown,
  compact = false,
}) => {
  const [showExplanation, setShowExplanation] = useState(false);

  const getScoreColor = () => {
    if (score >= 80) return 'text-red-600 bg-red-500';
    if (score >= 60) return 'text-amber-600 bg-amber-500';
    if (score >= 40) return 'text-blue-600 bg-blue-500';
    return 'text-slate-600 bg-slate-400';
  };

  const getBadgeColor = () => {
    if (score >= 80) return 'bg-red-50 text-red-700 border-red-200';
    if (score >= 60) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (score >= 40) return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5">
        <span
          className={`px-2 py-0.5 rounded text-xs font-semibold border ${getBadgeColor()}`}
        >
          {score}/100 • {level.toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 text-sm">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800">Priority Score</span>
          <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getBadgeColor()}`}>
            {level.toUpperCase()}
          </span>
        </div>
        <div className="text-lg font-bold text-slate-900">
          {score} <span className="text-xs font-normal text-slate-500">/ 100</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getScoreColor().split(' ')[1]}`}
          style={{ width: `${Math.min(100, Math.max(5, score))}%` }}
        />
      </div>

      {breakdown && (
        <div className="pt-2 border-t border-slate-100">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="flex items-center justify-between w-full text-xs text-slate-600 hover:text-slate-900 transition-colors"
          >
            <span className="flex items-center gap-1 font-medium">
              <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
              Explainable Scoring Breakdown
            </span>
            {showExplanation ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showExplanation && (
            <div className="mt-2.5 space-y-1.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-md border border-slate-200">
              <div className="flex justify-between">
                <span>Base Severity Factor:</span>
                <span className="font-medium text-slate-800">{breakdown.baseSeverity} pts</span>
              </div>
              <div className="flex justify-between">
                <span>Open Aging Time Factor:</span>
                <span className="font-medium text-slate-800">{breakdown.timeOpenFactor} pts</span>
              </div>
              <div className="flex justify-between">
                <span>Related Citizen Reports:</span>
                <span className="font-medium text-slate-800">{breakdown.relatedReportsFactor} pts</span>
              </div>
              <div className="flex justify-between">
                <span>Location Sensitivity:</span>
                <span className="font-medium text-slate-800">{breakdown.locationFactor} pts</span>
              </div>
              {breakdown.recurringFactor > 0 && (
                <div className="flex justify-between text-amber-700 font-medium">
                  <span>Recurring Failure Penalty:</span>
                  <span>+{breakdown.recurringFactor} pts</span>
                </div>
              )}
              {breakdown.slaOverdueFactor > 0 && (
                <div className="flex justify-between text-red-600 font-medium">
                  <span>SLA Overdue Penalty:</span>
                  <span>+{breakdown.slaOverdueFactor} pts</span>
                </div>
              )}
              <div className="pt-1.5 border-t border-slate-200 text-slate-700 italic">
                {breakdown.explanation}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
