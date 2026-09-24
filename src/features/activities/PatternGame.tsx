import React, { useState, useRef } from 'react';
import { LanguageCode, GameSession, AdaptiveDecision } from '../../models/types';
import { getStrings } from '../../locales';
import { offlineService } from '../../services/offlineService';
import { evaluateSessionAdaptively } from '../../services/adaptiveEngine';
import { voiceService } from '../../services/voiceService';
import { SessionResultModal } from './SessionResultModal';
import { Volume2, ArrowLeft } from 'lucide-react';

interface PatternItem {
  id: string;
  symbol: string;
  name: string;
}

interface PatternGameProps {
  language: LanguageCode;
  onFinish: () => void;
  onBack: () => void;
}

export const PatternGame: React.FC<PatternGameProps> = ({
  language,
  onFinish,
  onBack
}) => {
  const strings = getStrings(language);
  const patient = offlineService.getPatient();
  const currentLevel = patient.currentLevel || 2;

  const startTimeRef = useRef<number>(Date.now());
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [phase, setPhase] = useState<'play' | 'result'>('play');
  const [lastSession, setLastSession] = useState<GameSession | null>(null);
  const [lastDecision, setLastDecision] = useState<AdaptiveDecision | null>(null);

  // Configure pattern based on level
  // Level 1: ▲ ● ▲ ● ? (Answer: ▲)
  // Level 2: ▲ ● ■ ▲ ● ? (Answer: ■)
  // Level 3: ▲ ■ ● ▲ ■ ? (Answer: ●)
  const patternConfig = currentLevel === 1 
    ? {
        sequence: ['▲', '●', '▲', '●'],
        correct: '▲',
        options: ['▲', '●', '■']
      }
    : currentLevel === 2
    ? {
        sequence: ['▲', '●', '■', '▲', '●'],
        correct: '■',
        options: ['■', '▲', '●']
      }
    : {
        sequence: ['▲', '■', '●', '▲', '■'],
        correct: '●',
        options: ['●', '▲', '◆']
      };

  const handleVoiceListen = () => {
    voiceService.speakText(strings.patternInstruction, language);
  };

  const handleSelect = (option: string) => {
    setSelectedOption(option);
    const responseTimeMs = Date.now() - startTimeRef.current;
    const isCorrect = option === patternConfig.correct;
    const accuracy = isCorrect ? 100 : 0;

    let speedRating: 'Fast' | 'Good' | 'Moderate' | 'Deliberate' = 'Good';
    if (responseTimeMs < 2500) speedRating = 'Fast';
    else if (responseTimeMs > 6000) speedRating = 'Deliberate';

    const recentSessions = offlineService.getSessions();
    const evaluation = evaluateSessionAdaptively({
      accuracy,
      responseTimeMs,
      completionRate: 100,
      attempts: 1,
      errors: isCorrect ? 0 : 1,
      recentSessions,
      currentLevel
    }, 'pattern_recognition');

    const session: GameSession = {
      id: 'sess-' + Date.now(),
      patientId: patient.id,
      activityId: 'pattern_recognition',
      activityTitle: strings.patternGame,
      timestamp: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      difficultyLevel: currentLevel,
      accuracy,
      responseTimeMs,
      responseSpeedRating: speedRating,
      completionRate: 100,
      consistencyScore: evaluation.metrics.consistency,
      attempts: 1,
      errors: isCorrect ? 0 : 1,
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
    setPhase('result');
  };

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
          Level {currentLevel}
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

      {phase === 'play' && (
        <div style={{
          background: 'var(--color-bg-surface)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px 24px',
          boxShadow: 'var(--shadow-card)',
          border: '1px solid var(--color-border)',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: 'var(--text-elderly-title)', color: 'var(--color-navy)', marginBottom: '12px' }}>
            {strings.patternGame}
          </h2>
          <p style={{ fontSize: 'var(--text-elderly-instruction)', color: 'var(--color-text-secondary)', marginBottom: '32px' }}>
            {strings.patternInstruction}
          </p>

          {/* Pattern Visual Display */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            background: 'var(--color-bg-patient)',
            padding: '24px 16px',
            borderRadius: 'var(--radius-md)',
            border: '2px solid var(--color-border)',
            marginBottom: '36px',
            flexWrap: 'wrap'
          }}>
            {patternConfig.sequence.map((sym, idx) => (
              <div
                key={idx}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-navy)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {sym}
              </div>
            ))}

            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-md)',
              border: '2.5px dashed var(--color-teal)',
              background: 'var(--color-teal-soft)',
              color: 'var(--color-teal-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: 800
            }}>
              ?
            </div>
          </div>

          {/* Options Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))',
            gap: '12px'
          }}>
            {patternConfig.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(opt)}
                className="patient-card patient-card-interactive"
                style={{
                  minHeight: '84px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '36px',
                  color: 'var(--color-navy)',
                  border: '2px solid var(--color-border)'
                }}
                aria-label={`Option ${opt}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === 'result' && lastSession && (
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
