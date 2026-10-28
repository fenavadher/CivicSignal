import React from 'react';
import { ReportStatus, IssueSeverity } from '../../types';
import { AlertCircle, Clock, CheckCircle2, RefreshCw, UserCheck, ShieldAlert } from 'lucide-react';

interface StatusBadgeProps {
  status: ReportStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  switch (status) {
    case 'submitted':
      return (
        <span className={`inline-flex items-center gap-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}>
          <Clock className="w-3 h-3" /> Submitted
        </span>
      );
    case 'under_review':
      return (
        <span className={`inline-flex items-center gap-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}>
          <AlertCircle className="w-3 h-3" /> Under Review
        </span>
      );
    case 'verified':
      return (
        <span className={`inline-flex items-center gap-1 rounded-md bg-teal-50 text-teal-700 border border-teal-200 ${sizeClasses}`}>
          <CheckCircle2 className="w-3 h-3" /> Verified
        </span>
      );
    case 'assigned':
      return (
        <span className={`inline-flex items-center gap-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 ${sizeClasses}`}>
          <UserCheck className="w-3 h-3" /> Assigned
        </span>
      );
    case 'in_progress':
      return (
        <span className={`inline-flex items-center gap-1 rounded-md bg-blue-100 text-blue-800 border border-blue-300 ${sizeClasses}`}>
          <RefreshCw className="w-3 h-3 animate-spin" /> In Progress
        </span>
      );
    case 'resolved':
      return (
        <span className={`inline-flex items-center gap-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
          <CheckCircle2 className="w-3 h-3" /> Resolved
        </span>
      );
    case 'reopened':
      return (
        <span className={`inline-flex items-center gap-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}>
          <ShieldAlert className="w-3 h-3" /> Reopened
        </span>
      );
    default:
      return <span className={`inline-flex items-center rounded-md bg-slate-100 text-slate-700 ${sizeClasses}`}>{status}</span>;
  }
};

interface SeverityBadgeProps {
  severity: IssueSeverity;
  size?: 'sm' | 'md';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-xs font-medium';

  switch (severity) {
    case 'critical':
      return (
        <span className={`inline-flex items-center rounded-md bg-red-100 text-red-700 border border-red-200 font-semibold ${sizeClasses}`}>
          Critical
        </span>
      );
    case 'high':
      return (
        <span className={`inline-flex items-center rounded-md bg-amber-100 text-amber-800 border border-amber-200 font-medium ${sizeClasses}`}>
          High
        </span>
      );
    case 'medium':
      return (
        <span className={`inline-flex items-center rounded-md bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}>
          Medium
        </span>
      );
    case 'low':
      return (
        <span className={`inline-flex items-center rounded-md bg-slate-100 text-slate-600 border border-slate-200 ${sizeClasses}`}>
          Low
        </span>
      );
    default:
      return <span className={`inline-flex items-center rounded-md bg-slate-100 text-slate-700 ${sizeClasses}`}>{severity}</span>;
  }
};

interface SlaBadgeProps {
  deadlineIso: string;
  isResolved?: boolean;
  type?: 'response' | 'resolution';
}

export const SlaBadge: React.FC<SlaBadgeProps> = ({ deadlineIso, isResolved = false, type = 'resolution' }) => {
  if (isResolved) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3" /> SLA Met
      </span>
    );
  }

  const now = Date.now();
  const deadline = new Date(deadlineIso).getTime();
  const diffHours = Math.round((deadline - now) / (3600 * 1000));

  if (diffHours < 0) {
    const overdueHours = Math.abs(diffHours);
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-rose-50 text-rose-700 border border-rose-200 font-medium">
        <AlertCircle className="w-3 h-3 text-rose-600" />
        Overdue by {overdueHours}h
      </span>
    );
  }

  if (diffHours <= 4) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-amber-50 text-amber-700 border border-amber-200 font-medium">
        <Clock className="w-3 h-3 text-amber-600" />
        Due in {diffHours}h
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600 border border-slate-200">
      <Clock className="w-3 h-3" />
      {diffHours}h remaining
    </span>
  );
};
