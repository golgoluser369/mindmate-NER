import React, { useState, useEffect, useRef } from 'react';
import { LanguageCode, GameSession, AdaptiveDecision } from '../../models/types';
import { getStrings } from '../../locales';
import { offlineService } from '../../services/offlineService';
import { evaluateAndAdaptSession } from '../../services/adaptiveEngine';
import { SessionResultModal } from './SessionResultModal';
import { MousePointer, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface TapTargetGameProps {
  language: LanguageCode;
  onFinish: () => void;
  onBack: () => void;
}

export const TapTargetGame: React.FC<TapTargetGameProps> = ({
  language,
  onFinish,
  onBack
}) => {
  const strings = getStrings(language);
  const patient = offlineService.getPatient();
  const currentLevel = patient.currentLevel || 2;

  const [gameState, setGameState] = useState<'instruction' | 'playing' | 'completed'>('instruction');
  const [activeCell, setActiveCell] = useState<number>(0);
  const [hits, setHits] = useState<number>(0);
  const [targetTapsRequired] = useState<number>(currentLevel === 1 ? 5 : currentLevel === 2 ? 7 : 10);

  const [finishedSession, setFinishedSession] = useState<GameSession | null>(null);
  const [adaptiveDecision, setAdaptiveDecision] = useState<AdaptiveDecision | null>(null);

  const startTimeRef = useRef<number>(0);
  const lastTargetTimeRef = useRef<number>(0);
  const latenciesRef = useRef<number[]>([]);

  const totalCells = currentLevel === 1 ? 4 : currentLevel === 2 ? 6 : 9;

  const handleStart = () => {
    setGameState('playing');
    setHits(0);
    latenciesRef.current = [];
    startTimeRef.current = Date.now();
    lastTargetTimeRef.current = Date.now();
    repositionTarget();
  };

  const repositionTarget = () => {
    const nextCell = Math.floor(Math.random() * totalCells);
    setActiveCell(nextCell);
    lastTargetTimeRef.current = Date.now();
  };

  const handleCellTap = (cellIdx: number) => {
    if (gameState !== 'playing') return;

    if (cellIdx === activeCell) {
      const latency = Date.now() - lastTargetTimeRef.current;
      latenciesRef.current.push(latency);
      const newHits = hits + 1;
      setHits(newHits);

      if (newHits >= targetTapsRequired) {
        finishGame(latenciesRef.current);
      } else {
        repositionTarget();
      }
    }
  };

  const finishGame = (latencies: number[]) => {
    const totalTime = Date.now() - startTimeRef.current;
    const avgLatency = latencies.length > 0 
      ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) 
      : 2500;

    const { session, decision } = evaluateAndAdaptSession({
      patientId: patient.id,
      activityId: 'tap_target',
      activityTitle: 'Tap Target Interaction',
      accuracy: 95,
      responseTimeMs: avgLatency,
      completionRate: 100,
      attempts: targetTapsRequired,
      errors: 0,
      difficultyLevel: currentLevel,
      isPersonalized: false
    });

    setFinishedSession(session);
    setAdaptiveDecision(decision);
    setGameState('completed');
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
          Level {currentLevel} • Target Interaction
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
            <MousePointer size={44} />
          </div>

          <h2 style={{ fontSize: 'var(--text-elderly-hero)', color: 'var(--color-navy)', marginBottom: '12px' }}>
            Tap the Target
          </h2>
          <p style={{
            fontSize: 'var(--text-elderly-instruction)',
            color: 'var(--color-text-secondary)',
            marginBottom: '28px',
            lineHeight: 1.5
          }}>
            When you see the green circle appear in a box, tap it promptly. It helps practice motor speed and coordination.
          </p>

          <button
            onClick={handleStart}
            className="patient-btn patient-btn-primary"
            style={{ minWidth: '220px', margin: '0 auto' }}
          >
            Start Activity
          </button>
        </div>
      )}

      {/* Playing */}
      {gameState === 'playing' && (
        <div className="patient-card" style={{ padding: '32px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: 'var(--text-elderly-title)', color: 'var(--color-navy)' }}>
              Tap the highlighted circle
            </h3>
            <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-teal)' }}>
              Target {hits + 1} of {targetTapsRequired}
            </span>
          </div>

          {/* Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: totalCells === 4 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
            gap: '20px',
            maxWidth: '460px',
            margin: '0 auto'
          }}>
            {Array.from({ length: totalCells }).map((_, idx) => {
              const isTarget = idx === activeCell;
              return (
                <button
                  key={idx}
                  onClick={() => handleCellTap(idx)}
                  style={{
                    height: '110px',
                    borderRadius: 'var(--radius-lg)',
                    background: isTarget ? 'var(--color-teal-soft)' : 'var(--color-bg-patient)',
                    border: `3px solid ${isTarget ? 'var(--color-teal)' : 'var(--color-border)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.1s ease'
                  }}
                >
                  {isTarget ? (
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--color-teal)',
                      boxShadow: '0 0 0 6px var(--color-teal-soft)'
                    }} />
                  ) : (
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--color-border)'
                    }} />
                  )}
                </button>
              );
            })}
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
