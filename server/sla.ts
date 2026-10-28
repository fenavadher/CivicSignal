import { IssueCategory, IssueSeverity, SlaRule } from '../src/types.js';

export const DEFAULT_SLA_RULES: SlaRule[] = [
  // Potholes
  { id: 'sla-1', category: 'pothole_roads', severity: 'critical', responseTargetHours: 2, resolutionTargetHours: 12 },
  { id: 'sla-2', category: 'pothole_roads', severity: 'high', responseTargetHours: 4, resolutionTargetHours: 24 },
  { id: 'sla-3', category: 'pothole_roads', severity: 'medium', responseTargetHours: 12, resolutionTargetHours: 72 },
  { id: 'sla-4', category: 'pothole_roads', severity: 'low', responseTargetHours: 24, resolutionTargetHours: 168 },

  // Water Infrastructure
  { id: 'sla-5', category: 'water_infrastructure', severity: 'critical', responseTargetHours: 1, resolutionTargetHours: 8 },
  { id: 'sla-6', category: 'water_infrastructure', severity: 'high', responseTargetHours: 3, resolutionTargetHours: 16 },
  { id: 'sla-7', category: 'water_infrastructure', severity: 'medium', responseTargetHours: 8, resolutionTargetHours: 48 },
  { id: 'sla-8', category: 'water_infrastructure', severity: 'low', responseTargetHours: 24, resolutionTargetHours: 96 },

  // Drainage
  { id: 'sla-9', category: 'drainage_problems', severity: 'critical', responseTargetHours: 2, resolutionTargetHours: 12 },
  { id: 'sla-10', category: 'drainage_problems', severity: 'high', responseTargetHours: 6, resolutionTargetHours: 24 },
  { id: 'sla-11', category: 'drainage_problems', severity: 'medium', responseTargetHours: 16, resolutionTargetHours: 72 },
  { id: 'sla-12', category: 'drainage_problems', severity: 'low', responseTargetHours: 36, resolutionTargetHours: 168 },

  // Streetlights
  { id: 'sla-13', category: 'broken_streetlights', severity: 'critical', responseTargetHours: 4, resolutionTargetHours: 16 },
  { id: 'sla-14', category: 'broken_streetlights', severity: 'high', responseTargetHours: 8, resolutionTargetHours: 36 },
  { id: 'sla-15', category: 'broken_streetlights', severity: 'medium', responseTargetHours: 24, resolutionTargetHours: 72 },
  { id: 'sla-16', category: 'broken_streetlights', severity: 'low', responseTargetHours: 48, resolutionTargetHours: 144 },

  // Garbage
  { id: 'sla-17', category: 'garbage_accumulation', severity: 'critical', responseTargetHours: 3, resolutionTargetHours: 12 },
  { id: 'sla-18', category: 'garbage_accumulation', severity: 'high', responseTargetHours: 6, resolutionTargetHours: 24 },
  { id: 'sla-19', category: 'garbage_accumulation', severity: 'medium', responseTargetHours: 12, resolutionTargetHours: 48 },
  { id: 'sla-20', category: 'garbage_accumulation', severity: 'low', responseTargetHours: 24, resolutionTargetHours: 96 },

  // Sidewalks & Other
  { id: 'sla-21', category: 'damaged_sidewalks', severity: 'critical', responseTargetHours: 4, resolutionTargetHours: 24 },
  { id: 'sla-22', category: 'damaged_sidewalks', severity: 'high', responseTargetHours: 12, resolutionTargetHours: 48 },
  { id: 'sla-23', category: 'damaged_sidewalks', severity: 'medium', responseTargetHours: 24, resolutionTargetHours: 96 },
  { id: 'sla-24', category: 'damaged_sidewalks', severity: 'low', responseTargetHours: 48, resolutionTargetHours: 240 },

  { id: 'sla-25', category: 'other', severity: 'critical', responseTargetHours: 4, resolutionTargetHours: 24 },
  { id: 'sla-26', category: 'other', severity: 'high', responseTargetHours: 12, resolutionTargetHours: 48 },
  { id: 'sla-27', category: 'other', severity: 'medium', responseTargetHours: 24, resolutionTargetHours: 96 },
  { id: 'sla-28', category: 'other', severity: 'low', responseTargetHours: 48, resolutionTargetHours: 168 },
];

export function calculateDeadlines(
  category: IssueCategory,
  severity: IssueSeverity,
  createdDateIso: string,
  rules: SlaRule[] = DEFAULT_SLA_RULES
): { responseDeadline: string; resolutionDeadline: string } {
  const rule =
    rules.find((r) => r.category === category && r.severity === severity) ||
    rules.find((r) => r.severity === severity) ||
    { responseTargetHours: 24, resolutionTargetHours: 72 };

  const createdTime = new Date(createdDateIso).getTime();
  const responseTime = new Date(createdTime + rule.responseTargetHours * 60 * 60 * 1000).toISOString();
  const resolutionTime = new Date(createdTime + rule.resolutionTargetHours * 60 * 60 * 1000).toISOString();

  return {
    responseDeadline: responseTime,
    resolutionDeadline: resolutionTime,
  };
}

export function evaluateSlaStatus(
  status: string,
  responseDeadline: string,
  resolutionDeadline: string
): { isOverdueResponse: boolean; isOverdueResolution: boolean } {
  const now = Date.now();
  const respTime = new Date(responseDeadline).getTime();
  const resTime = new Date(resolutionDeadline).getTime();

  // If status is still 'submitted' and response deadline passed
  const isOverdueResponse = status === 'submitted' && now > respTime;
  // If not resolved and resolution deadline passed
  const isOverdueResolution = status !== 'resolved' && now > resTime;

  return { isOverdueResponse, isOverdueResolution };
}
