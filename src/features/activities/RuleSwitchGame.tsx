import React, { useState, useRef } from 'react';
import { LanguageCode, GameSession, AdaptiveDecision } from '../../models/types';
import { getStrings } from '../../locales';
import { offlineService } from '../../services/offlineService';
import { evaluateAndAdaptSession } from '../../services/adaptiveEngine';
import { SessionResultModal } from './SessionResultModal';
import { voiceService } from '../../services/voiceService';
import { Shuffle, ArrowLeft, Volume2, CheckCircle2, AlertCircle } from 'lucide-react';

interface RuleSwitchGameProps {
  language: LanguageCode;
  onFinish: () => void;
  onBack: () => void;
}

interface ShapeItem {
  id: string;
  shape: 'circle' | 'square' | 'triangle';
  color: 'teal' | 'navy' | 'amber';
  icon: string;
}

export const RuleSwitchGame: React.FC<RuleSwitchGameProps> = ({
  language,
  onFinish,
  onBack
}) => {
  const strings = getStrings(language);
  const patient = offlineService.getPatient();
  const currentLevel = patient.currentLevel || 2;

  const [gameState, setGameState] = useState<'instruction' | 'playing' | 'completed'>('instruction');
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [switchErrors, setSwitchErrors] = useState<number>(0);
  const [correctHits, setCorrectHits] = useState<number>(0);
  const [roundFeedback, setRoundFeedback] = useState<string | null>(null);

  const [finishedSession, setFinishedSession] = useState<GameSession | null>(null);
  const [adaptiveDecision, setAdaptiveDecision] = useState<AdaptiveDecision | null>(null);

  const startTimeRef = useRef<number>(0);

  // Round definitions
  const roundRules = [
    { round: 1, rule: 'Tap the CIRCLES only', targetShape: 'circle', targetColor: null },
    { round: 2, rule: 'NEW RULE: Tap the SQUARES only', targetShape: 'square', targetColor: null },
    { round: 3, rule: 'FINAL RULE: Tap the TEAL items only', targetShape: null, targetColor: 'teal' }
  ];

  const currentRule = roundRules[currentRound - 1];

  const roundItems: ShapeItem[] = [
    { id: '1', shape: 'circle', color: 'teal', icon: '🟢' },
    { id: '2', shape: 'square', color: 'navy', icon: '🟦' },
    { id: '3', shape: 'triangle', color: 'amber', icon: '🔺' },
    { id: '4', shape: 'circle', color: 'amber', icon: '🟡' },
    { id: '5', shape: 'square', color: 'teal', icon: '🟩' },
    { id: '6', shape: 'triangle', color: 'navy', icon: '🔷' }
  ];

  const handleStart = () => {
    setGameState('playing');
    startTimeRef.current = Date.now();
    setCurrentRound(1);
    setSwitchErrors(0);
    setCorrectHits(0);
  };

  const handleTapItem = (item: ShapeItem) => {
    let isCorrect = false;
    if (currentRule.targetShape && item.shape === currentRule.targetShape) {
      isCorrect = true;
    } else if (currentRule.targetColor && item.color === currentRule.targetColor) {
      isCorrect = true;
    }

    if (isCorrect) {
      setCorrectHits(c => c + 1);
      setRoundFeedback('Correct match!');
    } else {
      setSwitchErrors(e => e + 1);
      setRoundFeedback(`Rule switch error: Remember to follow "${currentRule.rule}"`);
    }

    setTimeout(() => {
      setRoundFeedback(null);
      if (currentRound < 3) {
        setCurrentRound(r => r + 1);
      } else {
        finishActivity();
      }
    }, 700);
  };

  const finishActivity = () => {
    const responseTime = Date.now() - startTimeRef.current;
    const totalAttempts = correctHits + switchErrors + 1;
    const accuracy = Math.max(30, Math.round((correctHits / Math.max(1, totalAttempts)) * 100));

    const { session, decision } = evaluateAndAdaptSession({
      patientId: patient.id,
      activityId: 'rule_switch',
      activityTitle: 'Rule Switch',
      accuracy,
      responseTimeMs: responseTime,
      completionRate: 100,
      attempts: totalAttempts,
      errors: switchErrors,
      difficultyLevel: currentLevel,
      isPersonalized: false
    });

    setFinishedSession(session);
    setAdaptiveDecision(decision);
    setGameState('completed');
  };

  const handleVoiceListen = () => {
    voiceService.speak(currentRule.rule, language);
  };

  return (
    <div style={{ maxWidth: 'var(--max-patient-width)', margin: '0 auto', padding: '16px 16px 40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '16px',
            fontWeight: 600,
            color: 'var(--color-navy)',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <div style={{
          fontSize: '15px',
          fontWeight: 700,
          color: 'var(--color-teal)',
          background: 'var(--color-teal-soft)',
          padding: '6px 14px',
          borderRadius: 'var(--radius-full)'
        }}>
          Level {currentLevel} • Cognitive Flexibility
        </div>
      </div>

      {/* Instruction */}
      {gameState === 'instruction' && (
        <div className="patient-card" style={{ textAlign: 'center', padding: '36px 24px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 20px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-navy-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-navy)'
          }}>
            <Shuffle size={44} />
          </div>

          <h2 style={{ fontSize: 'var(--text-elderly-hero)', color: 'var(--color-navy)', marginBottom: '12px' }}>
            Rule Switch
          </h2>
          <p style={{
            fontSize: 'var(--text-elderly-instruction)',
            color: 'var(--color-text-secondary)',
            marginBottom: '28px',
            lineHeight: 1.5
          }}>
            Pay close attention to the rule at the top. The rule changes between rounds.
          </p>

          <button
            onClick={handleStart}
            className="patient-btn patient-btn-primary"
            style={{ minWidth: '220px', margin: '0 auto' }}
          >
            Start Rule Switch
          </button>
        </div>
      )}

      {/* Playing Stage */}
      {gameState === 'playing' && (
        <div className="patient-card" style={{ padding: '32px' }}>
          {/* Rule banner */}
          <div style={{
            background: 'var(--color-navy)',
            color: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '20px 24px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '14px', color: 'var(--color-teal-light)', fontWeight: 700, letterSpacing: '0.5px' }}>
                ROUND {currentRound} OF 3 • ACTIVE RULE
              </div>
              <div style={{ fontSize: 'var(--text-elderly-instruction)', fontWeight: 900, marginTop: '4px' }}>
                {currentRule.rule}
              </div>
            </div>

            <button
              onClick={handleVoiceListen}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: 'var(--radius-md)',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Volume2 size={20} />
              <span>Listen</span>
            </button>
          </div>

          {/* Round Feedback */}
          {roundFeedback && (
            <div style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px',
              background: roundFeedback.includes('Correct') ? 'var(--color-success-soft)' : 'var(--color-warning-soft)',
              color: roundFeedback.includes('Correct') ? 'var(--color-success)' : 'var(--color-warning)',
              border: `1px solid ${roundFeedback.includes('Correct') ? 'var(--color-success-border)' : 'var(--color-warning-border)'}`,
              fontSize: '16px',
              fontWeight: 700
            }}>
              {roundFeedback}
            </div>
          )}

          {/* Grid of Choices */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px'
          }}>
            {roundItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleTapItem(item)}
                style={{
                  height: '110px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--color-bg-surface)',
                  border: '2px solid var(--color-border)',
                  fontSize: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-teal)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
              >
                {item.icon}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Result Modal */}
      {gameState === 'completed' && finishedSession && (
        <SessionResultModal
          session={finishedSession}
          decision={adaptiveDecision || undefined}
          language={language}
          onContinue={onFinish}
          onReturnHome={onFinish}
        />
      )}
    </div>
  );
};
