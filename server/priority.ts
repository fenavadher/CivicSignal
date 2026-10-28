import { IssueSeverity, ScoreBreakdown, ScoringWeights } from '../src/types.js';

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  severityWeight: 35,
  timeOpenWeight: 20,
  relatedReportsWeight: 20,
  locationWeight: 10,
  recurringWeight: 15,
};

const SEVERITY_BASE_SCORES: Record<IssueSeverity, number> = {
  low: 20,
  medium: 50,
  high: 80,
  critical: 100,
};

export function calculatePriorityScore(
  severity: IssueSeverity,
  createdAtIso: string,
  relatedReportsCount: number,
  isRecurring: boolean,
  isOverdue: boolean,
  locationAddress: string,
  weights: ScoringWeights = DEFAULT_SCORING_WEIGHTS
): { score: number; level: 'low' | 'medium' | 'high' | 'critical'; breakdown: ScoreBreakdown } {
  // 1. Base severity factor (0 - 100)
  const severityScore = SEVERITY_BASE_SCORES[severity] || 50;

  // 2. Time open factor: hours since creation (caps at 96 hours = 4 days)
  const createdDate = new Date(createdAtIso).getTime();
  const now = Date.now();
  const hoursOpen = Math.max(0, (now - createdDate) / (1000 * 60 * 60));
  const timeOpenScore = Math.min(100, Math.round((hoursOpen / 96) * 100));

  // 3. Related reports factor: 1 report = 20, 2 = 50, 3 = 75, 4+ = 100
  let reportsScore = 20;
  if (relatedReportsCount === 2) reportsScore = 55;
  else if (relatedReportsCount === 3) reportsScore = 80;
  else if (relatedReportsCount >= 4) reportsScore = 100;

  // 4. Location sensitivity factor: Detect high-traffic or vulnerable civic areas
  const lowerAddress = (locationAddress || '').toLowerCase();
  let locationScore = 30; // standard residential/civic
  if (
    lowerAddress.includes('school') ||
    lowerAddress.includes('hospital') ||
    lowerAddress.includes('transit') ||
    lowerAddress.includes('station') ||
    lowerAddress.includes('boulevard') ||
    lowerAddress.includes('main st') ||
    lowerAddress.includes('arterial')
  ) {
    locationScore = 85;
  } else if (
    lowerAddress.includes('avenue') ||
    lowerAddress.includes('central') ||
    lowerAddress.includes('market')
  ) {
    locationScore = 60;
  }

  // 5. Recurring failure factor: repeat failure at same location within 90 days
  const recurringScore = isRecurring ? 100 : 0;

  // 6. Overdue penalty: bonus boost if SLA resolution deadline has passed
  const overduePenalty = isOverdue ? 15 : 0;

  // Weighted calculation normalized to 100
  const totalWeight =
    weights.severityWeight +
    weights.timeOpenWeight +
    weights.relatedReportsWeight +
    weights.locationWeight +
    weights.recurringWeight;

  const rawWeightedScore =
    (severityScore * weights.severityWeight +
      timeOpenScore * weights.timeOpenWeight +
      reportsScore * weights.relatedReportsWeight +
      locationScore * weights.locationWeight +
      recurringScore * weights.recurringWeight) /
      totalWeight +
    overduePenalty;

  const finalScore = Math.min(100, Math.max(0, Math.round(rawWeightedScore)));

  let level: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (finalScore >= 80) level = 'critical';
  else if (finalScore >= 60) level = 'high';
  else if (finalScore >= 40) level = 'medium';
  else level = 'low';

  const explanationParts = [
    `${severity.toUpperCase()} severity baseline (+${Math.round((severityScore * weights.severityWeight) / totalWeight)} pts)`,
    `${Math.round(hoursOpen)}h aging time (+${Math.round((timeOpenScore * weights.timeOpenWeight) / totalWeight)} pts)`,
    `${relatedReportsCount} linked citizen report${relatedReportsCount > 1 ? 's' : ''} (+${Math.round((reportsScore * weights.relatedReportsWeight) / totalWeight)} pts)`,
  ];
  if (isRecurring) {
    explanationParts.push(`Recurring infrastructure failure detected (+${Math.round((recurringScore * weights.recurringWeight) / totalWeight)} pts)`);
  }
  if (isOverdue) {
    explanationParts.push('SLA Resolution overdue penalty (+15 pts)');
  }

  return {
    score: finalScore,
    level,
    breakdown: {
      baseSeverity: severityScore,
      timeOpenFactor: timeOpenScore,
      relatedReportsFactor: reportsScore,
      locationFactor: locationScore,
      recurringFactor: recurringScore,
      slaOverdueFactor: overduePenalty,
      explanation: explanationParts.join(', '),
    },
  };
}
