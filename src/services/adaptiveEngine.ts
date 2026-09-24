import { GameSession, ActivityMetricScore, AdaptiveDecision, ActivityType } from '../models/types';
import { offlineService } from './offlineService';
import { extractMLFeatures, predictClientSideML } from './mlPersonalizationService';

export interface PerformanceInput {
  accuracy: number; // 0 to 100
  responseTimeMs: number;
  completionRate: number; // 0 to 100
  attempts: number;
  errors: number;
  recentSessions: GameSession[];
  currentLevel: number;
}

export interface AdaptiveEvaluationResult {
  score: number; // 0 to 1
  metrics: ActivityMetricScore;
  decision: 'increase' | 'maintain' | 'decrease';
  previousLevel: number;
  newLevel: number;
  reason: string;
  clinicalDisclaimer: string;
}

/**
 * Normalizes response time to a 0.0 - 1.0 score.
 * Lower response times (steady, prompt) yield higher scores.
 */
export function normalizeResponseSpeed(responseTimeMs: number, activityId?: ActivityType): number {
  // Reaction games (attention) have target ms around 600-1500ms
  // Recall games have target ms around 2000-5000ms
  const isVigilance = activityId === 'attention';
  const fastThreshold = isVigilance ? 700 : 2500;
  const slowThreshold = isVigilance ? 2200 : 7000;

  if (responseTimeMs <= fastThreshold) return 1.0;
  if (responseTimeMs >= slowThreshold) return 0.2;

  const ratio = (slowThreshold - responseTimeMs) / (slowThreshold - fastThreshold);
  return Math.max(0.2, Math.min(1.0, ratio));
}

/**
 * Computes consistency score based on recent errors and attempts.
 */
export function computeConsistency(attempts: number, errors: number, recentSessions: GameSession[]): number {
  const currentRatio = attempts > 0 ? (attempts - errors) / attempts : 0.8;
  if (recentSessions.length === 0) return Math.max(0.1, Math.min(1.0, currentRatio));

  const recentAccuracies = recentSessions.slice(0, 3).map(s => s.accuracy / 100);
  const avg = recentAccuracies.reduce((a, b) => a + b, 0) / recentAccuracies.length;
  // Variance
  const variance = recentAccuracies.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / recentAccuracies.length;
  const stability = Math.max(0.2, 1.0 - Math.sqrt(variance) * 2);

  return Number(((currentRatio * 0.5) + (stability * 0.5)).toFixed(2));
}

/**
 * Computes recent trend: compares current accuracy to past baseline.
 */
export function computeRecentTrend(currentAccuracy: number, recentSessions: GameSession[]): number {
  if (recentSessions.length === 0) return 0.75;
  const recentAccuracies = recentSessions.slice(0, 3).map(s => s.accuracy);
  const baseline = recentAccuracies.reduce((a, b) => a + b, 0) / recentAccuracies.length;
  const delta = currentAccuracy - baseline;

  // Normalized: delta > +10% -> 1.0, delta == 0 -> 0.7, delta < -15% -> 0.3
  if (delta >= 10) return 1.0;
  if (delta >= 0) return 0.7 + (delta / 10) * 0.3;
  if (delta >= -15) return 0.7 + (delta / 15) * 0.4;
  return 0.3;
}

/**
 * Core Mind Mate Adaptive Scoring Formula
 * Performance Score = 0.40 * Accuracy + 0.25 * ResponseSpeed + 0.15 * Consistency + 0.10 * Completion + 0.10 * RecentTrend
 */
export function calculatePerformanceScore(input: PerformanceInput, activityId?: ActivityType): { score: number; metrics: ActivityMetricScore } {
  const accNorm = Math.max(0, Math.min(1.0, input.accuracy / 100));
  const speedNorm = normalizeResponseSpeed(input.responseTimeMs, activityId);
  const compNorm = Math.max(0, Math.min(1.0, input.completionRate / 100));
  const constNorm = computeConsistency(input.attempts, input.errors, input.recentSessions);
  const trendNorm = computeRecentTrend(input.accuracy, input.recentSessions);

  const weightedScore = 
    (0.40 * accNorm) +
    (0.25 * speedNorm) +
    (0.15 * constNorm) +
    (0.10 * compNorm) +
    (0.10 * trendNorm);

  const finalScore = Number(Math.max(0, Math.min(1.0, weightedScore)).toFixed(2));

  return {
    score: finalScore,
    metrics: {
      accuracy: input.accuracy,
      responseSpeedNorm: Number(speedNorm.toFixed(2)),
      consistency: Number(constNorm.toFixed(2)),
      completion: Number(compNorm.toFixed(2)),
      recentTrend: Number(trendNorm.toFixed(2))
    }
  };
}

/**
 * Determines Difficulty Level Shift based on performance score:
 * > 0.80 -> Increase Level
 * 0.55 - 0.80 -> Maintain Level
 * < 0.55 -> Decrease Level
 */
export function determineDifficulty(score: number, currentLevel: number): { decision: 'increase' | 'maintain' | 'decrease'; newLevel: number } {
  const minLevel = 1;
  const maxLevel = 4;

  if (score > 0.80) {
    const next = Math.min(maxLevel, currentLevel + 1);
    return {
      decision: next > currentLevel ? 'increase' : 'maintain',
      newLevel: next
    };
  } else if (score < 0.55) {
    const prev = Math.max(minLevel, currentLevel - 1);
    return {
      decision: prev < currentLevel ? 'decrease' : 'maintain',
      newLevel: prev
    };
  } else {
    return {
      decision: 'maintain',
      newLevel: currentLevel
    };
  }
}

/**
 * Generates transparent, human-readable explanations of system decisions for patients & caregivers.
 */
export function generateAdaptiveExplanation(
  decision: 'increase' | 'maintain' | 'decrease',
  metrics: ActivityMetricScore,
  previousLevel: number,
  newLevel: number
): string {
  if (decision === 'increase') {
    return `Sustained accuracy (${metrics.accuracy}%) and steady response pace exceeded the 0.80 adaptation threshold. Level increased from ${previousLevel} to ${newLevel} to provide stimulating, positive cognitive engagement.`;
  } else if (decision === 'decrease') {
    return `Recent session showed lower recall accuracy (${metrics.accuracy}%) and increased response latency below the 0.55 threshold. Difficulty gently reduced from ${previousLevel} to ${newLevel} to lower cognitive strain and encourage confidence.`;
  } else {
    return `Performance was stable (${metrics.accuracy}% accuracy, balanced response speed). Current difficulty Level ${newLevel} maintained to reinforce comfort and consistency.`;
  }
}

/**
 * Full adaptive evaluation cycle
 */
export function evaluateSessionAdaptively(input: PerformanceInput, activityId?: ActivityType): AdaptiveEvaluationResult {
  const { score, metrics } = calculatePerformanceScore(input, activityId);
  const { decision, newLevel } = determineDifficulty(score, input.currentLevel);
  const reason = generateAdaptiveExplanation(decision, metrics, input.currentLevel, newLevel);

  return {
    score,
    metrics,
    decision,
    previousLevel: input.currentLevel,
    newLevel,
    reason,
    clinicalDisclaimer: 'This is an activity-personalization decision, not a clinical diagnosis.'
  };
}

/**
 * Recommends the next cognitive activity based on the patient's recent profile.
 */
export function recommendNextActivity(recentSessions: GameSession[]): {
  recommendedType: ActivityType;
  title: string;
  durationMinutes: number;
  reason: string;
} {
  if (recentSessions.length === 0) {
    return {
      recommendedType: 'memory_recall',
      title: 'Memory Recall',
      durationMinutes: 3,
      reason: 'Standard baseline recall activity to begin the day.'
    };
  }

  const lastSession = recentSessions[0];

  // If last was memory recall, alternate to attention or routine recall
  if (lastSession.activityId === 'memory_recall') {
    return {
      recommendedType: 'routine_recall',
      title: 'Daily Routine Recall',
      durationMinutes: 2,
      reason: 'Reinforces familiar personal daily routines and grounding context.'
    };
  } else if (lastSession.activityId === 'routine_recall') {
    return {
      recommendedType: 'attention',
      title: 'Attention Focus',
      durationMinutes: 3,
      reason: 'Engages vigilance and visual discrimination.'
    };
  } else {
    return {
      recommendedType: 'memory_recall',
      title: 'Memory Recall',
      durationMinutes: 3,
      reason: 'Refreshes short-term object recall following focused visual tasks.'
    };
  }
}

export interface EvaluateAndAdaptSessionParams {
  patientId: string;
  activityId: ActivityType;
  activityTitle: string;
  accuracy: number;
  responseTimeMs: number;
  completionRate?: number;
  attempts?: number;
  errors?: number;
  difficultyLevel?: number;
  isPersonalized?: boolean;
}

export function evaluateAndAdaptSession(params: EvaluateAndAdaptSessionParams): {
  session: GameSession;
  decision: AdaptiveDecision;
} {
  const patient = offlineService.getPatient();
  const currentLevel = params.difficultyLevel || patient.currentLevel || 2;
  const recentSessions = offlineService.getSessions();
  const attempts = params.attempts ?? 1;
  const errors = params.errors ?? 0;
  const completionRate = params.completionRate ?? 100;

  const evaluation = evaluateSessionAdaptively({
    accuracy: params.accuracy,
    responseTimeMs: params.responseTimeMs,
    completionRate,
    attempts,
    errors,
    recentSessions,
    currentLevel
  }, params.activityId);

  let speedRating: 'Fast' | 'Good' | 'Moderate' | 'Deliberate' = 'Good';
  if (params.responseTimeMs < 2500) speedRating = 'Fast';
  else if (params.responseTimeMs > 6000) speedRating = 'Deliberate';
  else if (params.responseTimeMs > 4000) speedRating = 'Moderate';

  const session: GameSession = {
    id: 'sess-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    patientId: params.patientId,
    activityId: params.activityId,
    activityTitle: params.activityTitle,
    timestamp: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    difficultyLevel: currentLevel,
    accuracy: params.accuracy,
    responseTimeMs: params.responseTimeMs,
    responseSpeedRating: speedRating,
    completionRate,
    consistencyScore: evaluation.metrics.consistency,
    attempts,
    errors,
    isPersonalized: params.isPersonalized ?? false,
    syncStatus: offlineService.isOffline() ? 'pending' : 'synced'
  };

  const mlFeatures = extractMLFeatures({
    accuracy: params.accuracy,
    responseTimeMs: params.responseTimeMs,
    attempts,
    completionRate,
    currentLevel,
    activityId: params.activityId,
    recentSessions
  });
  const mlResult = predictClientSideML(mlFeatures);

  const decision: AdaptiveDecision = {
    id: 'dec-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    sessionId: session.id,
    patientId: params.patientId,
    timestamp: session.timestamp,
    previousLevel: evaluation.previousLevel,
    newLevel: evaluation.newLevel,
    performanceScore: evaluation.score,
    metrics: evaluation.metrics,
    decision: evaluation.decision,
    reason: evaluation.reason,
    clinicalDisclaimer: evaluation.clinicalDisclaimer,
    mlRecommendation: mlResult
  };

  offlineService.saveSession(session);
  offlineService.saveDecision(decision);

  if (evaluation.newLevel !== currentLevel) {
    patient.currentLevel = evaluation.newLevel;
    offlineService.savePatient(patient);
  }

  return { session, decision };
}

