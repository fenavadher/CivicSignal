import { GoogleGenAI } from '@google/genai';
import { CitizenReport } from '../src/types.js';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (aiClient) return aiClient;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    return aiClient;
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
    return null;
  }
}

export interface SemanticDuplicateResult {
  isDuplicateLikely: boolean;
  confidenceScore: number; // 0 - 100
  reasoning: string;
  keySharedFeatures: string[];
  distinguishingFeatures: string[];
  recommendedAction: 'likely_duplicate' | 'human_review' | 'unlikely_match';
  isAiGenerated: boolean;
}

export async function analyzeReportsSemanticDuplicate(
  reportA: CitizenReport,
  reportB: CitizenReport,
  distanceMeters: number
): Promise<SemanticDuplicateResult> {
  const client = getAiClient();

  if (!client) {
    // Honest baseline when Gemini API key is not configured
    const categoryMatch = reportA.category === reportB.category;
    const isClose = distanceMeters <= 50;
    const isModerate = distanceMeters <= 120;

    return {
      isDuplicateLikely: isClose && categoryMatch,
      confidenceScore: isClose && categoryMatch ? 82 : isModerate && categoryMatch ? 60 : 25,
      reasoning: `Baseline deterministic analysis: Reports are ${distanceMeters}m apart with ${categoryMatch ? 'identical' : 'different'} civic categories. (Configure GEMINI_API_KEY for deep semantic reasoning).`,
      keySharedFeatures: [categoryMatch ? `Category: ${reportA.category}` : 'Geographic area'],
      distinguishingFeatures: [
        `Distance: ${distanceMeters}m`,
        `Report titles: "${reportA.title}" vs "${reportB.title}"`,
      ],
      recommendedAction: isClose && categoryMatch ? 'likely_duplicate' : isModerate ? 'human_review' : 'unlikely_match',
      isAiGenerated: false,
    };
  }

  try {
    const prompt = `You are a municipal civil engineer and civic complaint analyst for CivicSignal.
Analyze these two citizen reports submitted in the same city to determine if they describe the exact same physical incident / problem or two distinct issues.

Report 1:
- Title: "${reportA.title}"
- Category: "${reportA.category}"
- Description: "${reportA.description}"
- Location: "${reportA.location.address}"
- Severity reported: "${reportA.severity}"

Report 2:
- Title: "${reportB.title}"
- Category: "${reportB.category}"
- Description: "${reportB.description}"
- Location: "${reportB.location.address}"
- Severity reported: "${reportB.severity}"

Geographic distance between them: ${distanceMeters} meters.

Evaluate semantic compatibility, physical infrastructure context, landmarks, and whether citizens are describing the same hazard using different words.
Provide output as strict JSON with this shape:
{
  "isDuplicateLikely": boolean,
  "confidenceScore": number (0-100),
  "reasoning": string (concise explanation of engineering context),
  "keySharedFeatures": string[],
  "distinguishingFeatures": string[],
  "recommendedAction": "likely_duplicate" | "human_review" | "unlikely_match"
}`;

    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text?.trim() || '';
    const parsed = JSON.parse(text);

    return {
      isDuplicateLikely: Boolean(parsed.isDuplicateLikely),
      confidenceScore: Math.min(100, Math.max(0, Number(parsed.confidenceScore) || 50)),
      reasoning: parsed.reasoning || 'Semantic similarity evaluation complete.',
      keySharedFeatures: Array.isArray(parsed.keySharedFeatures) ? parsed.keySharedFeatures : [],
      distinguishingFeatures: Array.isArray(parsed.distinguishingFeatures) ? parsed.distinguishingFeatures : [],
      recommendedAction:
        ['likely_duplicate', 'human_review', 'unlikely_match'].includes(parsed.recommendedAction)
          ? parsed.recommendedAction
          : 'human_review',
      isAiGenerated: true,
    };
  } catch (err) {
    console.warn('Gemini semantic analysis fallback:', err);
    return {
      isDuplicateLikely: distanceMeters <= 50 && reportA.category === reportB.category,
      confidenceScore: 50,
      reasoning: `Deterministic fallback: Reports are ${distanceMeters}m apart. Gemini service unavailable or processing error.`,
      keySharedFeatures: ['Geographic proximity'],
      distinguishingFeatures: ['Pending manual review'],
      recommendedAction: 'human_review',
      isAiGenerated: false,
    };
  }
}

export interface IssueAiAnalysis {
  hazardSummary: string;
  recommendedDepartment: string;
  recommendedRepairAction: string;
  safetyRisks: string[];
  equipmentNeeded: string[];
}

export async function generateIssueIntelligence(
  title: string,
  category: string,
  description: string,
  severity: string,
  address: string
): Promise<IssueAiAnalysis> {
  const client = getAiClient();

  const fallback: IssueAiAnalysis = {
    hazardSummary: `${severity.toUpperCase()} priority ${category.replace(/_/g, ' ')} reported near ${address}.`,
    recommendedDepartment:
      category === 'pothole_roads' || category === 'damaged_sidewalks'
        ? 'Public Works - Roadway Maintenance'
        : category === 'broken_streetlights'
        ? 'Public Utilities - Electrical & Lighting'
        : category === 'garbage_accumulation'
        ? 'Department of Sanitation'
        : category === 'drainage_problems' || category === 'water_infrastructure'
        ? 'Water & Sewer Authority'
        : 'General Municipal Operations',
    recommendedRepairAction: 'Dispatch field inspection team to verify damage and secure perimeter.',
    safetyRisks: ['Vehicle damage', 'Pedestrian trip hazard', 'Traffic bottleneck during peak hours'],
    equipmentNeeded: ['Safety cones', 'Field inspection tablet', 'Standard repair kit'],
  };

  if (!client) return fallback;

  try {
    const prompt = `You are a municipal dispatch supervisor for CivicSignal.
Analyze this civic issue report and provide actionable dispatch intelligence:
- Title: ${title}
- Category: ${category}
- Description: ${description}
- Severity: ${severity}
- Address: ${address}

Output JSON:
{
  "hazardSummary": string,
  "recommendedDepartment": string,
  "recommendedRepairAction": string,
  "safetyRisks": string[],
  "equipmentNeeded": string[]
}`;

    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return {
      hazardSummary: parsed.hazardSummary || fallback.hazardSummary,
      recommendedDepartment: parsed.recommendedDepartment || fallback.recommendedDepartment,
      recommendedRepairAction: parsed.recommendedRepairAction || fallback.recommendedRepairAction,
      safetyRisks: parsed.safetyRisks || fallback.safetyRisks,
      equipmentNeeded: parsed.equipmentNeeded || fallback.equipmentNeeded,
    };
  } catch (e) {
    return fallback;
  }
}
