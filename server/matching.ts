import { CitizenReport, RecommendedAction } from '../src/types.js';

/**
 * Calculates Haversine distance in meters between two geographical coordinates
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Radius of Earth in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Tokenizes text and cleans stopwords for similarity comparison
 */
function tokenize(text: string): Set<string> {
  const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const words = clean.split(/\s+/).filter((w) => w.length > 2);
  const stopwords = new Set([
    'the', 'and', 'for', 'that', 'this', 'with', 'from', 'have', 'there',
    'near', 'been', 'about', 'just', 'some', 'very', 'here', 'when', 'what',
    'issue', 'problem', 'reported', 'please', 'street', 'road'
  ]);
  return new Set(words.filter((w) => !stopwords.has(w)));
}

/**
 * Calculates Jaccard token similarity (0 to 1)
 */
export function calculateTextSimilarity(text1: string, text2: string): number {
  const tokens1 = tokenize(text1);
  const tokens2 = tokenize(text2);

  if (tokens1.size === 0 && tokens2.size === 0) return 1.0;
  if (tokens1.size === 0 || tokens2.size === 0) return 0.0;

  const intersection = new Set([...tokens1].filter((x) => tokens2.has(x)));
  const union = new Set([...tokens1, ...tokens2]);

  return Number((intersection.size / union.size).toFixed(3));
}

export interface MatchEvaluation {
  distanceMeters: number;
  textSimilarity: number;
  categoryCompatibility: boolean;
  compositeScore: number; // 0 - 100
  recommendedAction: RecommendedAction;
  explanation: string;
}

/**
 * Evaluates whether two reports are likely duplicates
 */
export function evaluateDuplicateCandidate(
  reportA: CitizenReport,
  reportB: CitizenReport,
  distanceThreshold = 150,
  similarityThreshold = 0.35
): MatchEvaluation {
  const distance = calculateDistanceMeters(
    reportA.location.lat,
    reportA.location.lng,
    reportB.location.lat,
    reportB.location.lng
  );

  const textA = `${reportA.title} ${reportA.description}`;
  const textB = `${reportB.title} ${reportB.description}`;
  const textSim = calculateTextSimilarity(textA, textB);

  const categoryMatch = reportA.category === reportB.category;

  // Distance score: 100 if 0m, drops down to 0 at 300m
  let distanceScore = 0;
  if (distance <= 25) {
    distanceScore = 100;
  } else if (distance <= 100) {
    distanceScore = Math.max(0, 100 - (distance - 25) * 0.8);
  } else if (distance <= 250) {
    distanceScore = Math.max(0, 40 - (distance - 100) * 0.25);
  }

  // Text score (0 - 100)
  const textScore = Math.min(100, Math.round(textSim * 100));

  // Category penalty or bonus
  const categoryMultiplier = categoryMatch ? 1.0 : 0.3;

  // Composite calculation: 50% distance, 35% text similarity, 15% category
  let rawScore = (distanceScore * 0.5 + textScore * 0.35 + (categoryMatch ? 100 : 0) * 0.15);
  rawScore = Math.round(rawScore * categoryMultiplier);
  const compositeScore = Math.min(100, Math.max(0, rawScore));

  let recommendedAction: RecommendedAction = 'unlikely_match';
  const explanationParts: string[] = [];

  if (distance <= 30) {
    explanationParts.push(`Identical geographic proximity (${distance}m apart)`);
  } else if (distance <= distanceThreshold) {
    explanationParts.push(`Close geographic radius (${distance}m apart)`);
  } else {
    explanationParts.push(`Geographically separated by ${distance}m`);
  }

  if (textSim >= 0.5) {
    explanationParts.push(`high description text similarity (${Math.round(textSim * 100)}%)`);
  } else if (textSim >= similarityThreshold) {
    explanationParts.push(`moderate shared keywords (${Math.round(textSim * 100)}%)`);
  } else {
    explanationParts.push(`distinct terminology (${Math.round(textSim * 100)}% token overlap)`);
  }

  if (categoryMatch) {
    explanationParts.push('identical category');
  } else {
    explanationParts.push(`different categories (${reportA.category} vs ${reportB.category})`);
  }

  if (distance <= 60 && (textSim >= 0.35 || compositeScore >= 70) && categoryMatch) {
    recommendedAction = 'likely_duplicate';
  } else if (distance <= distanceThreshold && (textSim >= 0.2 || compositeScore >= 40)) {
    recommendedAction = 'human_review';
  } else {
    recommendedAction = 'unlikely_match';
  }

  return {
    distanceMeters: distance,
    textSimilarity: textSim,
    categoryCompatibility: categoryMatch,
    compositeScore,
    recommendedAction,
    explanation: explanationParts.join(', ') + '.',
  };
}
