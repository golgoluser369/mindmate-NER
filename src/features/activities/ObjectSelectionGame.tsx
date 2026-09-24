import React, { useState, useRef } from 'react';
import { LanguageCode, GameSession, AdaptiveDecision } from '../../models/types';
import { getStrings } from '../../locales';
import { offlineService } from '../../services/offlineService';
import { evaluateAndAdaptSession } from '../../services/adaptiveEngine';
import { SessionResultModal } from './SessionResultModal';
import { voiceService } from '../../services/voiceService';
import { CheckSquare, ArrowLeft, Volume2, CheckCircle2 } from 'lucide-react';

interface ObjectSelectionGameProps {
  language: LanguageCode;
  onFinish: () => void;
  onBack: () => void;
}

export const ObjectSelectionGame: React.FC<ObjectSelectionGameProps> = ({
  language,
  onFinish,
  onBack
}) => {
  const strings = getStrings(language);
  const patient = offlineService.getPatient();
  const currentLevel = patient.currentLevel || 2;

  const [gameState, setGameState] = useState<'instruction' | 'playing' | 'completed'>('instruction');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [finishedSession, setFinishedSession] = useState<GameSession | null>(null);
  const [adaptiveDecision, setAdaptiveDecision] = useState<AdaptiveDecision | null>(null);

  const startTimeRef = useRef<number>(0);

  const prompt = "Select the object used for drinking:";
  const options = [
    { id: 'cup', name: 'Ceramic Tea Cup', emoji: '☕', isCorrect: true },
    { id: 'spoon', name: 'Wooden Spoon', emoji: '🥄', isCorrect: false },
    { id: 'shoe', name: 'Walking Sandal', emoji: '🥿', isCorrect: false },
    { id: 'book', name: 'Reading Book', emoji: '📖', isCorrect: false }
  ];

  const handleStart = () => {
    setGameState('playing');
    startTimeRef.current = Date.now();
  };

  const handleSelect = (item: typeof options[0]) => {
    setSelectedId(item.id);
    const responseTime = Date.now() - startTimeRef.current;

    const { session, decision } = evaluateAndAdaptSession({
      patientId: patient.id,
      activityId: 'object_selection',
      activityTitle: 'Object Selection',
      accuracy: item.isCorrect ? 100 : 30,
      responseTimeMs: responseTime,
      completionRate: 100,
      attempts: 1,
      errors: item.isCorrect ? 0 : 1,
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
    voiceService.speak(prompt, language);
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
          Level {currentLevel} • Semantic Selection
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
            <CheckSquare size={44} />
          </div>

          <h2 style={{ fontSize: 'var(--text-elderly-hero)', color: 'var(--color-navy)', marginBottom: '12px' }}>
            Object Selection
          </h2>
          <p style={{
            fontSize: 'var(--text-elderly-instruction)',
            color: 'var(--color-text-secondary)',
            marginBottom: '28px',
            lineHeight: 1.5
          }}>
            Select the familiar object that matches the daily functional category.
          </p>

          <button
            onClick={handleStart}
            className="patient-btn patient-btn-primary"
            style={{ minWidth: '220px', margin: '0 auto' }}
          >
            Start Object Selection
          </button>
        </div>
      )}

      {/* Playing */}
      {gameState === 'playing' && (
        <div className="patient-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: 'var(--text-elderly-title)', color: 'var(--color-navy)' }}>
              {prompt}
            </h3>

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

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px'
          }}>
            {options.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item)}
                style={{
                  height: '140px',
                  borderRadius: 'var(--radius-lg)',
                  background: selectedId === item.id ? 'var(--color-teal-soft)' : 'var(--color-bg-surface)',
                  border: `2px solid ${selectedId === item.id ? 'var(--color-teal)' : 'var(--color-border)'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ fontSize: '50px' }}>{item.emoji}</span>
                <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-navy)' }}>
                  {item.name}
                </span>
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
