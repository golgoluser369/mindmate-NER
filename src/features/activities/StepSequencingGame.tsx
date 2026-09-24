import React, { useState, useRef } from 'react';
import { LanguageCode, GameSession, AdaptiveDecision } from '../../models/types';
import { getStrings } from '../../locales';
import { offlineService } from '../../services/offlineService';
import { evaluateAndAdaptSession } from '../../services/adaptiveEngine';
import { SessionResultModal } from './SessionResultModal';
import { voiceService } from '../../services/voiceService';
import { ListOrdered, ArrowLeft, Volume2, CheckCircle2, RotateCcw } from 'lucide-react';

interface StepSequencingGameProps {
  language: LanguageCode;
  onFinish: () => void;
  onBack: () => void;
}

interface StepItem {
  id: number;
  text: string;
  emoji: string;
}

export const StepSequencingGame: React.FC<StepSequencingGameProps> = ({
  language,
  onFinish,
  onBack
}) => {
  const strings = getStrings(language);
  const patient = offlineService.getPatient();
  const currentLevel = patient.currentLevel || 2;

  const [gameState, setGameState] = useState<'instruction' | 'playing' | 'completed'>('instruction');
  const [selectedSequence, setSelectedSequence] = useState<StepItem[]>([]);
  const [availableSteps, setAvailableSteps] = useState<StepItem[]>([]);

  const [finishedSession, setFinishedSession] = useState<GameSession | null>(null);
  const [adaptiveDecision, setAdaptiveDecision] = useState<AdaptiveDecision | null>(null);

  const startTimeRef = useRef<number>(0);

  const originalSteps: StepItem[] = [
    { id: 1, text: "Boil clean fresh water in kettle", emoji: "🫖" },
    { id: 2, text: "Add fragrant Assam tea leaves", emoji: "🍃" },
    { id: 3, text: "Add warm milk & gentle sweetener", emoji: "🥛" },
    { id: 4, text: "Strain and serve hot in ceramic cup", emoji: "☕" }
  ];

  const handleStart = () => {
    // Shuffle steps for patient to reassemble
    const shuffled = [...originalSteps].sort(() => Math.random() - 0.5);
    setAvailableSteps(shuffled);
    setSelectedSequence([]);
    setGameState('playing');
    startTimeRef.current = Date.now();
  };

  const handleSelectStep = (step: StepItem) => {
    setSelectedSequence([...selectedSequence, step]);
    setAvailableSteps(availableSteps.filter(s => s.id !== step.id));
  };

  const handleResetCurrent = () => {
    const shuffled = [...originalSteps].sort(() => Math.random() - 0.5);
    setAvailableSteps(shuffled);
    setSelectedSequence([]);
  };

  const handleSubmit = () => {
    const responseTime = Date.now() - startTimeRef.current;
    let correctCount = 0;
    selectedSequence.forEach((step, idx) => {
      if (step.id === idx + 1) correctCount++;
    });

    const accuracy = Math.round((correctCount / originalSteps.length) * 100);
    const errors = originalSteps.length - correctCount;

    const { session, decision } = evaluateAndAdaptSession({
      patientId: patient.id,
      activityId: 'step_sequencing',
      activityTitle: 'Procedural Sequencing',
      accuracy,
      responseTimeMs: responseTime,
      completionRate: 100,
      attempts: 1,
      errors,
      difficultyLevel: currentLevel,
      isPersonalized: true
    });

    setFinishedSession(session);
    setAdaptiveDecision(decision);
    setGameState('completed');
  };

  const handleVoiceListen = () => {
    voiceService.speak("Arrange the 4 steps of making fresh morning tea in the correct order.", language);
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
          Level {currentLevel} • Step Sequencing
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
            <ListOrdered size={44} />
          </div>

          <h2 style={{ fontSize: 'var(--text-elderly-hero)', color: 'var(--color-navy)', marginBottom: '12px' }}>
            Making Tea: Step Sequencing
          </h2>
          <p style={{
            fontSize: 'var(--text-elderly-instruction)',
            color: 'var(--color-text-secondary)',
            marginBottom: '28px',
            lineHeight: 1.5
          }}>
            Tap each step in the order it happens when making morning tea, starting with step 1.
          </p>

          <button
            onClick={handleStart}
            className="patient-btn patient-btn-primary"
            style={{ minWidth: '220px', margin: '0 auto' }}
          >
            Start Sequencing
          </button>
        </div>
      )}

      {/* Playing */}
      {gameState === 'playing' && (
        <div className="patient-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: 'var(--text-elderly-title)', color: 'var(--color-navy)' }}>
              Arrange the steps in order:
            </h3>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleVoiceListen}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  background: 'var(--color-navy)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Volume2 size={16} />
                <span>Listen</span>
              </button>

              <button
                onClick={handleResetCurrent}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  background: 'var(--color-bg-patient)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: 'var(--color-navy)'
                }}
              >
                <RotateCcw size={16} />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Chosen sequence so far */}
          <div style={{
            minHeight: '120px',
            border: '2px dashed var(--color-teal)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            marginBottom: '24px',
            background: 'var(--color-bg-patient)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {selectedSequence.length === 0 ? (
              <div style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '24px 0', fontSize: '16px' }}>
                Tap the steps below in the order they occur.
              </div>
            ) : (
              selectedSequence.map((step, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: '#FFFFFF',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-teal)'
                  }}
                >
                  <span style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--color-teal)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '14px'
                  }}>
                    {idx + 1}
                  </span>
                  <span style={{ fontSize: '24px' }}>{step.emoji}</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-navy)', fontSize: '17px' }}>{step.text}</span>
                </div>
              ))
            )}
          </div>

          {/* Remaining available steps */}
          <div style={{ fontSize: '15px', color: 'var(--color-text-muted)', fontWeight: 700, marginBottom: '12px' }}>
            AVAILABLE STEPS (TAP TO SELECT)
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
            {availableSteps.map((step) => (
              <button
                key={step.id}
                onClick={() => handleSelectStep(step)}
                className="patient-btn patient-btn-secondary"
                style={{
                  justifyContent: 'flex-start',
                  gap: '14px',
                  padding: '16px 20px',
                  fontSize: '17px'
                }}
              >
                <span style={{ fontSize: '24px' }}>{step.emoji}</span>
                <span style={{ fontWeight: 600 }}>{step.text}</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={availableSteps.length > 0}
            className="patient-btn patient-btn-primary"
            style={{ width: '100%' }}
          >
            Confirm Routine Sequence
          </button>
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
