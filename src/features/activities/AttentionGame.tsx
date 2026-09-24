import React, { useState, useEffect, useRef } from 'react';
import { LanguageCode, GameSession, AdaptiveDecision } from '../../models/types';
import { getStrings } from '../../locales';
import { offlineService } from '../../services/offlineService';
import { evaluateSessionAdaptively } from '../../services/adaptiveEngine';
import { voiceService } from '../../services/voiceService';
import { SessionResultModal } from './SessionResultModal';
import { Volume2, ArrowLeft } from 'lucide-react';

interface SymbolItem {
  id: string;
  isTarget: boolean;
  color: string;
  shape: 'circle' | 'square' | 'triangle' | 'diamond';
  label: string;
}

const SYMBOL_SEQUENCE: SymbolItem[] = [
  { id: '1', isTarget: false, color: '#C53030', shape: 'square', label: 'Red Square' },
  { id: '2', isTarget: true, color: '#2B6CB0', shape: 'circle', label: 'Blue Circle' },
  { id: '3', isTarget: false, color: '#2F855A', shape: 'triangle', label: 'Green Triangle' },
  { id: '4', isTarget: false, color: '#D69E2E', shape: 'diamond', label: 'Yellow Diamond' },
  { id: '5', isTarget: true, color: '#2B6CB0', shape: 'circle', label: 'Blue Circle' },
  { id: '6', isTarget: false, color: '#805AD5', shape: 'square', label: 'Purple Square' },
  { id: '7', isTarget: true, color: '#2B6CB0', shape: 'circle', label: 'Blue Circle' },
  { id: '8', isTarget: false, color: '#DD6B20', shape: 'triangle', label: 'Orange Triangle' }
];

interface AttentionGameProps {
  language: LanguageCode;
  onFinish: () => void;
  onBack: () => void;
}

export const AttentionGame: React.FC<AttentionGameProps> = ({
  language,
  onFinish,
  onBack
}) => {
  const strings = getStrings(language);
  const patient = offlineService.getPatient();
  const currentLevel = patient.currentLevel || 2;

  // Pace varies with level: Level 1 -> 2200ms, Level 2 -> 1800ms, Level 3 -> 1400ms, Level 4 -> 1100ms
  const stepIntervalMs = Math.max(1100, 2400 - currentLevel * 350);

  const [gameState, setGameState] = useState<'intro' | 'running' | 'finished'>('intro');
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [feedback, setFeedback] = useState<{ text: string; color: string } | null>(null);

  // Performance tracking
  const [tappedIndices, setTappedIndices] = useState<number[]>([]);
  const reactionTimesRef = useRef<number[]>([]);
  const symbolStartTimeRef = useRef<number>(0);

  const [lastSession, setLastSession] = useState<GameSession | null>(null);
  const [lastDecision, setLastDecision] = useState<AdaptiveDecision | null>(null);

  const handleStart = () => {
    setGameState('running');
    setCurrentIndex(0);
    symbolStartTimeRef.current = Date.now();
  };

  const handleVoiceListen = () => {
    voiceService.speakText(`${strings.attentionInstruction} ${strings.targetLabel}`, language);
  };

  // Step through symbol sequence
  useEffect(() => {
    if (gameState !== 'running') return;

    if (currentIndex >= SYMBOL_SEQUENCE.length) {
      finishGame();
      return;
    }

    symbolStartTimeRef.current = Date.now();
    setFeedback(null);

    const timer = setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, stepIntervalMs);

    return () => clearTimeout(timer);
  }, [gameState, currentIndex, stepIntervalMs]);

  const handleTap = () => {
    if (gameState !== 'running' || currentIndex < 0 || currentIndex >= SYMBOL_SEQUENCE.length) return;
    if (tappedIndices.includes(currentIndex)) return; // Already tapped this frame

    const currentSymbol = SYMBOL_SEQUENCE[currentIndex];
    const reactionTime = Date.now() - symbolStartTimeRef.current;
    reactionTimesRef.current.push(reactionTime);

    setTappedIndices(prev => [...prev, currentIndex]);

    if (currentSymbol.isTarget) {
      setFeedback({ text: strings.tapCorrect, color: 'var(--color-success)' });
    } else {
      setFeedback({ text: strings.tapFalse, color: 'var(--color-alert)' });
    }
  };

  const finishGame = () => {
    setGameState('finished');

    const totalTargets = SYMBOL_SEQUENCE.filter(s => s.isTarget).length;
    let correctHits = 0;
    let falseTaps = 0;

    tappedIndices.forEach(idx => {
      if (SYMBOL_SEQUENCE[idx]?.isTarget) {
        correctHits++;
      } else {
        falseTaps++;
      }
    });

    const missedTargets = totalTargets - correctHits;
    const accuracy = Math.round(Math.max(0, (correctHits / totalTargets) * 100 - (falseTaps * 15)));
    
    const avgReactionTime = reactionTimesRef.current.length > 0
      ? Math.round(reactionTimesRef.current.reduce((a, b) => a + b, 0) / reactionTimesRef.current.length)
      : 1500;

    let speedRating: 'Fast' | 'Good' | 'Moderate' | 'Deliberate' = 'Good';
    if (avgReactionTime < 900) speedRating = 'Fast';
    else if (avgReactionTime > 1600) speedRating = 'Deliberate';
    else if (avgReactionTime > 1250) speedRating = 'Moderate';

    const recentSessions = offlineService.getSessions();
    const evaluation = evaluateSessionAdaptively({
      accuracy,
      responseTimeMs: avgReactionTime,
      completionRate: 100,
      attempts: SYMBOL_SEQUENCE.length,
      errors: falseTaps + missedTargets,
      recentSessions,
      currentLevel
    }, 'attention');

    const session: GameSession = {
      id: 'sess-' + Date.now(),
      patientId: patient.id,
      activityId: 'attention',
      activityTitle: strings.attentionGame,
      timestamp: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      difficultyLevel: currentLevel,
      accuracy,
      responseTimeMs: avgReactionTime,
      responseSpeedRating: speedRating,
      completionRate: 100,
      consistencyScore: evaluation.metrics.consistency,
      attempts: SYMBOL_SEQUENCE.length,
      errors: falseTaps + missedTargets,
      isPersonalized: false,
      syncStatus: offlineService.isOffline() ? 'pending' : 'synced'
    };

    const decision: AdaptiveDecision = {
      id: 'dec-' + Date.now(),
      sessionId: session.id,
      patientId: patient.id,
      timestamp: session.timestamp,
      previousLevel: evaluation.previousLevel,
      newLevel: evaluation.newLevel,
      performanceScore: evaluation.score,
      metrics: evaluation.metrics,
      decision: evaluation.decision,
      reason: evaluation.reason,
      clinicalDisclaimer: evaluation.clinicalDisclaimer
    };

    offlineService.saveSession(session);
    offlineService.saveDecision(decision);

    if (decision.newLevel !== patient.currentLevel) {
      patient.currentLevel = decision.newLevel;
      offlineService.savePatient(patient);
    }

    setLastSession(session);
    setLastDecision(decision);
  };

  const currentSymbol = currentIndex >= 0 && currentIndex < SYMBOL_SEQUENCE.length
    ? SYMBOL_SEQUENCE[currentIndex]
    : null;

  return (
    <div style={{ maxWidth: 'var(--max-patient-width)', margin: '0 auto', padding: '16px' }}>
      {/* Top Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px'
      }}>
        <button
          onClick={onBack}
          className="btn btn-subtle"
          style={{ padding: '8px 14px', minHeight: '44px' }}
        >
          <ArrowLeft size={20} />
          <span>{strings.navHome}</span>
        </button>

        <span style={{
          background: 'var(--color-navy-soft)',
          padding: '4px 12px',
          borderRadius: 'var(--radius-full)',
          fontWeight: 700,
          color: 'var(--color-navy)',
          fontSize: '15px'
        }}>
          Level {currentLevel} • {(stepIntervalMs / 1000).toFixed(1)}s Pace
        </span>

        <button
          onClick={handleVoiceListen}
          className="btn btn-outline"
          style={{ padding: '8px 14px', minHeight: '44px', gap: '6px' }}
        >
          <Volume2 size={20} />
          <span style={{ fontSize: '15px' }}>{strings.voiceListen}</span>
        </button>
      </div>

      {gameState === 'intro' && (
        <div style={{
          background: 'var(--color-bg-surface)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px 24px',
          boxShadow: 'var(--shadow-card)',
          border: '1px solid var(--color-border)',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: 'var(--text-elderly-title)', color: 'var(--color-navy)', marginBottom: '12px' }}>
            {strings.attentionGame}
          </h2>
          <p style={{ fontSize: 'var(--text-elderly-instruction)', color: 'var(--color-text-secondary)', marginBottom: '28px' }}>
            {strings.attentionInstruction}
          </p>

          {/* Target Symbol Preview */}
          <div style={{
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            background: 'var(--color-navy-soft)',
            padding: '24px 36px',
            borderRadius: 'var(--radius-md)',
            border: '2px solid var(--color-teal-light)',
            marginBottom: '32px'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#2B6CB0',
              boxShadow: '0 4px 12px rgba(43, 108, 176, 0.3)'
            }} />
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-navy)' }}>
              {strings.targetLabel}
            </div>
          </div>

          <button
            onClick={handleStart}
            className="btn btn-primary btn-large-elderly"
            style={{ width: '100%', maxWidth: '360px', margin: '0 auto' }}
          >
            {strings.beginSession}
          </button>
        </div>
      )}

      {gameState === 'running' && (
        <div style={{
          background: 'var(--color-bg-surface)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px 24px',
          boxShadow: 'var(--shadow-card)',
          border: '1px solid var(--color-border)',
          textAlign: 'center'
        }}>
          {/* Progress count */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            color: 'var(--color-text-muted)',
            fontSize: '16px',
            fontWeight: 600
          }}>
            <span>Step {currentIndex + 1} of {SYMBOL_SEQUENCE.length}</span>
            <span>Target: {strings.targetLabel}</span>
          </div>

          {/* Symbol Display Arena */}
          <div style={{
            minHeight: '220px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-bg-patient)',
            borderRadius: 'var(--radius-md)',
            border: '2px dashed var(--color-border)',
            marginBottom: '24px',
            position: 'relative'
          }}>
            {currentSymbol ? (
              <div style={{
                width: '110px',
                height: '110px',
                borderRadius: currentSymbol.shape === 'circle' ? '50%' : '12px',
                backgroundColor: currentSymbol.color,
                transform: currentSymbol.shape === 'diamond' ? 'rotate(45deg)' : 'none',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                transition: 'all 0.1s ease'
              }} />
            ) : (
              <span style={{ color: 'var(--color-text-muted)', fontSize: '18px' }}>Get ready...</span>
            )}

            {/* Instant tactile feedback pill */}
            {feedback && (
              <div style={{
                position: 'absolute',
                top: '16px',
                background: '#FFFFFF',
                color: feedback.color,
                padding: '6px 16px',
                borderRadius: 'var(--radius-full)',
                fontWeight: 700,
                fontSize: '16px',
                boxShadow: 'var(--shadow-sm)',
                border: `1.5px solid ${feedback.color}`
              }}>
                {feedback.text}
              </div>
            )}
          </div>

          {/* Large Tap Button */}
          <button
            onClick={handleTap}
            className="btn btn-secondary btn-large-elderly"
            style={{
              width: '100%',
              minHeight: '80px',
              fontSize: '24px',
              fontWeight: 800,
              letterSpacing: '1px'
            }}
          >
            {strings.tapButton}
          </button>
        </div>
      )}

      {gameState === 'finished' && lastSession && (
        <SessionResultModal
          session={lastSession}
          decision={lastDecision || undefined}
          language={language}
          onContinue={onFinish}
          onReturnHome={onBack}
        />
      )}
    </div>
  );
};
