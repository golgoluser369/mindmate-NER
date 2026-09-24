import React, { useState, useRef } from 'react';
import { LanguageCode, GameSession, AdaptiveDecision } from '../../models/types';
import { getStrings } from '../../locales';
import { offlineService } from '../../services/offlineService';
import { evaluateAndAdaptSession } from '../../services/adaptiveEngine';
import { SessionResultModal } from './SessionResultModal';
import { voiceService } from '../../services/voiceService';
import { Hash, ArrowLeft, Volume2, CheckCircle2 } from 'lucide-react';

interface NumberSequenceGameProps {
  language: LanguageCode;
  onFinish: () => void;
  onBack: () => void;
}

export const NumberSequenceGame: React.FC<NumberSequenceGameProps> = ({
  language,
  onFinish,
  onBack
}) => {
  const strings = getStrings(language);
  const patient = offlineService.getPatient();
  const currentLevel = patient.currentLevel || 2;

  const [gameState, setGameState] = useState<'instruction' | 'playing' | 'completed'>('instruction');
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const [finishedSession, setFinishedSession] = useState<GameSession | null>(null);
  const [adaptiveDecision, setAdaptiveDecision] = useState<AdaptiveDecision | null>(null);

  const startTimeRef = useRef<number>(0);

  // Sequences based on difficulty
  const sequenceData = currentLevel === 1 
    ? { numbers: [2, 4, 6], correct: 8, options: [7, 8, 9, 10], ruleText: '+2 each time' }
    : currentLevel === 2
    ? { numbers: [3, 6, 9], correct: 12, options: [10, 11, 12, 14], ruleText: '+3 each time' }
    : { numbers: [5, 10, 15], correct: 20, options: [18, 19, 20, 25], ruleText: '+5 each time' };

  const handleStart = () => {
    setGameState('playing');
    startTimeRef.current = Date.now();
  };

  const handleSelect = (num: number) => {
    setSelectedAnswer(num);
    const responseTime = Date.now() - startTimeRef.current;
    const isCorrect = num === sequenceData.correct;

    const { session, decision } = evaluateAndAdaptSession({
      patientId: patient.id,
      activityId: 'number_sequence',
      activityTitle: 'Number Sequence',
      accuracy: isCorrect ? 100 : 30,
      responseTimeMs: responseTime,
      completionRate: 100,
      attempts: 1,
      errors: isCorrect ? 0 : 1,
      difficultyLevel: currentLevel,
      isPersonalized: false
    });

    setTimeout(() => {
      setFinishedSession(session);
      setAdaptiveDecision(decision);
      setGameState('completed');
    }, 600);
  };

  const handleVoiceListen = () => {
    const seqStr = sequenceData.numbers.join(', ');
    voiceService.speak(`What number comes next in this sequence? ${seqStr}, then what?`, language);
  };

  return (
    <div style={{ maxWidth: 'var(--max-patient-width)', margin: '0 auto', padding: '16px 16px 40px' }}>
      {/* Top Header */}
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
          Level {currentLevel} • Number Sequence
        </div>
      </div>

      {/* Instruction Stage */}
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
            <Hash size={44} />
          </div>

          <h2 style={{ fontSize: 'var(--text-elderly-hero)', color: 'var(--color-navy)', marginBottom: '12px' }}>
            Number Sequence
          </h2>
          <p style={{
            fontSize: 'var(--text-elderly-instruction)',
            color: 'var(--color-text-secondary)',
            marginBottom: '28px',
            lineHeight: 1.5
          }}>
            Look at the numbers in line. Notice the pattern and choose which number comes next.
          </p>

          <button
            onClick={handleStart}
            className="patient-btn patient-btn-primary"
            style={{ minWidth: '220px', margin: '0 auto' }}
          >
            Start Sequence
          </button>
        </div>
      )}

      {/* Playing Stage */}
      {gameState === 'playing' && (
        <div className="patient-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
            <div>
              <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', fontWeight: 700 }}>
                SEQUENCE REASONING
              </div>
              <h3 style={{ fontSize: 'var(--text-elderly-title)', color: 'var(--color-navy)' }}>
                What number comes next?
              </h3>
            </div>

            <button
              onClick={handleVoiceListen}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: 'var(--color-navy)',
                color: '#FFFFFF',
                border: 'none',
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

          {/* Display Sequence Box */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            background: 'var(--color-bg-patient)',
            border: '2px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px 16px',
            marginBottom: '36px'
          }}>
            {sequenceData.numbers.map((num, i) => (
              <React.Fragment key={i}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-bg-surface)',
                  border: '2px solid var(--color-navy)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  fontWeight: 900,
                  color: 'var(--color-navy)'
                }}>
                  {num}
                </div>
                <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-teal)' }}>→</span>
              </React.Fragment>
            ))}

            {/* Target Box */}
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-teal-soft)',
              border: '2.5px dashed var(--color-teal)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: 900,
              color: 'var(--color-teal)'
            }}>
              ?
            </div>
          </div>

          {/* Options Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px'
          }}>
            {sequenceData.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelect(opt)}
                style={{
                  height: '74px',
                  borderRadius: 'var(--radius-md)',
                  background: selectedAnswer === opt ? 'var(--color-teal-soft)' : 'var(--color-bg-surface)',
                  border: `2px solid ${selectedAnswer === opt ? 'var(--color-teal)' : 'var(--color-border)'}`,
                  fontSize: '32px',
                  fontWeight: 800,
                  color: 'var(--color-navy)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {opt}
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
