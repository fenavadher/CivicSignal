export type UserRole = 'citizen' | 'staff' | 'admin';

export interface NotificationPreferences {
  emailStatusUpdates: boolean;
  emailDuplicateGrouping: boolean;
  emailWeeklyDigest: boolean;
  smsEmergencyAlerts: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  department?: string; // or ward/neighborhood for citizens
  address?: string;
  avatarUrl?: string;
  notificationPreferences?: NotificationPreferences;
  createdAt: string;
}

export type IssueCategory =
  | 'pothole_roads'
  | 'garbage_accumulation'
  | 'broken_streetlights'
  | 'damaged_sidewalks'
  | 'drainage_problems'
  | 'water_infrastructure'
  | 'other';

export const CATEGORY_LABELS: Record<IssueCategory, string> = {
  pothole_roads: 'Potholes & Damaged Roads',
  garbage_accumulation: 'Garbage & Waste',
  broken_streetlights: 'Broken Streetlights',
  damaged_sidewalks: 'Damaged Sidewalks',
  drainage_problems: 'Drainage Problems',
  water_infrastructure: 'Water Infrastructure',
  other: 'Other Civic Problems',
};

export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';

export type ReportStatus =
  | 'submitted'
  | 'under_review'
  | 'verified'
  | 'assigned'
  | 'in_progress'
  | 'resolved'
  | 'reopened';

export interface GeoLocation {
  lat: number;
  lng: number;
  address: string;
  landmark?: string;
}

export interface CitizenReport {
  id: string;
  submitterId: string;
  submitterName: string;
  submitterEmail: string;
  title: string;
  category: IssueCategory;
  description: string;
  severity: IssueSeverity;
  location: GeoLocation;
  photoUrl?: string;
  status: ReportStatus;
  managedIssueId?: string;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScoreBreakdown {
  baseSeverity: number;
  timeOpenFactor: number;
  relatedReportsFactor: number;
  locationFactor: number;
  recurringFactor: number;
  slaOverdueFactor: number;
  explanation: string;
}

export interface ResolutionDetails {
  resolutionNotes: string;
  resolutionPhotoUrl?: string;
  resolvedAt: string;
  resolvedBy: string;
  resolvedByName: string;
  actualDurationHours: number;
}

export interface ManagedIssue {
  id: string;
  title: string;
  category: IssueCategory;
  description: string;
  location: GeoLocation;
  severity: IssueSeverity;
  priorityScore: number; // 0 - 100
  priorityLevel: 'low' | 'medium' | 'high' | 'critical';
  scoreBreakdown: ScoreBreakdown;
  originalReportIds: string[];
  primaryReportId: string;
  assignedTo?: string;
  assignedToName?: string;
  department?: string;
  status: ReportStatus;
  responseDeadline: string;
  resolutionDeadline: string;
  isOverdueResponse: boolean;
  isOverdueResolution: boolean;
  resolutionDetails?: ResolutionDetails;
  internalNotes?: {
    id: string;
    authorName: string;
    authorRole: string;
    text: string;
    timestamp: string;
  }[];
  isRecurring: boolean;
  recurrenceCount: number;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CandidateMatchStatus = 'pending' | 'approved' | 'rejected' | 'flagged_recurring';
export type RecommendedAction = 'likely_duplicate' | 'human_review' | 'unlikely_match';

export interface DuplicateCandidate {
  id: string;
  primaryReportId: string;
  candidateReportId: string;
  primaryReport?: CitizenReport;
  candidateReport?: CitizenReport;
  distanceMeters: number;
  textSimilarity: number; // 0 - 1
  categoryCompatibility: boolean;
  compositeScore: number; // 0 - 100
  isAiAssisted: boolean;
  aiExplanation?: string;
  recommendedAction: RecommendedAction;
  status: CandidateMatchStatus;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewReason?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface RecurringIssue {
  id: string;
  currentReportId: string;
  currentReport?: CitizenReport;
  previousIssueId: string;
  previousIssue?: ManagedIssue;
  distanceMeters: number;
  previousResolvedAt: string;
  daysSinceResolved: number;
  recurrenceCount: number;
  status: 'detected' | 'investigating' | 'confirmed_recurring' | 'unrelated';
  notes?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action:
    | 'SUBMIT_REPORT'
    | 'APPROVE_DUPLICATE_GROUPING'
    | 'REJECT_DUPLICATE'
    | 'UNGROUP_REPORT'
    | 'CHANGE_STATUS'
    | 'ASSIGN_ISSUE'
    | 'UPDATE_PRIORITY'
    | 'RESOLVE_ISSUE'
    | 'REOPEN_ISSUE'
    | 'FLAG_RECURRING'
    | 'UPDATE_SETTINGS'
    | 'SEED_DEMO_DATA';
  entityType: 'report' | 'managed_issue' | 'duplicate_candidate' | 'settings' | 'system';
  entityId: string;
  details: string;
  reason?: string;
}

export interface SlaRule {
  id: string;
  category: IssueCategory;
  severity: IssueSeverity;
  responseTargetHours: number;
  resolutionTargetHours: number;
}

export interface ScoringWeights {
  severityWeight: number; // e.g. 35
  timeOpenWeight: number; // e.g. 20
  relatedReportsWeight: number; // e.g. 20
  locationWeight: number; // e.g. 10
  recurringWeight: number; // e.g. 15
}

export interface ApplicationSettings {
  scoringWeights: ScoringWeights;
  duplicateDistanceThresholdMeters: number;
  duplicateSimilarityThreshold: number;
  recurringDistanceThresholdMeters: number;
  recurringTimeWindowDays: number;
  enableGeminiSemanticCheck: boolean;
}

export interface AnalyticsSummary {
  totalReports: number;
  openIssues: number;
  resolvedIssues: number;
  inProgressIssues: number;
  overdueIssues: number;
  pendingDuplicateReviews: number;
  recurringIssueCount: number;
  averageResolutionHours: number;
  slaCompliancePercentage: number;
  categoryDistribution: { category: IssueCategory; label: string; count: number }[];
  statusDistribution: { status: ReportStatus; count: number }[];
  reportsTrend: { date: string; reports: number; resolved: number }[];
  duplicateModelMetrics: {
    hasLabeledData: boolean;
    precision?: number;
    recall?: number;
    falseMergeRate?: number;
    manualReviewRate?: number;
    totalEvaluated?: number;
  };
}
