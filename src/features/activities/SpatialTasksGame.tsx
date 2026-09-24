import React, { useState, useRef } from 'react';
import { LanguageCode, GameSession, AdaptiveDecision } from '../../models/types';
import { getStrings } from '../../locales';
import { offlineService } from '../../services/offlineService';
import { evaluateAndAdaptSession } from '../../services/adaptiveEngine';
import { SessionResultModal } from './SessionResultModal';
import { voiceService } from '../../services/voiceService';
import { Maximize2, ArrowLeft, Volume2, CheckCircle2 } from 'lucide-react';

interface SpatialTasksGameProps {
  language: LanguageCode;
  onFinish: () => void;
  onBack: () => void;
}

export const SpatialTasksGame: React.FC<SpatialTasksGameProps> = ({
  language,
  onFinish,
  onBack
}) => {
  const strings = getStrings(language);
  const patient = offlineService.getPatient();
  const currentLevel = patient.currentLevel || 2;

  const [gameState, setGameState] = useState<'instruction' | 'playing' | 'completed'>('instruction');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const [finishedSession, setFinishedSession] = useState<GameSession | null>(null);
  const [adaptiveDecision, setAdaptiveDecision] = useState<AdaptiveDecision | null>(null);

  const startTimeRef = useRef<number>(0);

  const prompt = "Look at the spatial diagram below. Which object is ABOVE the central box?";
  const correctAnswer = "Garden Flower 🌸";
  const options = [
    { text: "Garden Flower 🌸", isCorrect: true },
    { text: "Brass Key 🗝️", isCorrect: false },
    { text: "Tea Cup ☕", isCorrect: false },
    { text: "Spectacles 👓", isCorrect: false }
  ];

  const handleStart = () => {
    setGameState('playing');
    startTimeRef.current = Date.now();
  };

  const handleSelect = (item: typeof options[0]) => {
    setSelectedOption(item.text);
    const responseTime = Date.now() - startTimeRef.current;

    const { session, decision } = evaluateAndAdaptSession({
      patientId: patient.id,
      activityId: 'spatial_tasks',
      activityTitle: 'Spatial Reasoning',
      accuracy: item.isCorrect ? 100 : 35,
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
          Level {currentLevel} • Spatial Reasoning
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
            <Maximize2 size={44} />
          </div>

          <h2 style={{ fontSize: 'var(--text-elderly-hero)', color: 'var(--color-navy)', marginBottom: '12px' }}>
            Spatial Reasoning
          </h2>
          <p style={{
            fontSize: 'var(--text-elderly-instruction)',
            color: 'var(--color-text-secondary)',
            marginBottom: '28px',
            lineHeight: 1.5
          }}>
            Observe the arrangement of familiar items. Identify the position of items relative to one another.
          </p>

          <button
            onClick={handleStart}
            className="patient-btn patient-btn-primary"
            style={{ minWidth: '220px', margin: '0 auto' }}
          >
            Start Spatial Task
          </button>
        </div>
      )}

      {/* Playing */}
      {gameState === 'playing' && (
        <div className="patient-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: 'var(--text-elderly-title)', color: 'var(--color-navy)', lineHeight: 1.4 }}>
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
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              <Volume2 size={20} />
              <span>Listen</span>
            </button>
          </div>

          {/* Spatial Grid Representation */}
          <div style={{
            width: '280px',
            height: '280px',
            margin: '0 auto 32px',
            background: 'var(--color-bg-patient)',
            border: '2px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridTemplateRows: 'repeat(3, 1fr)',
            alignItems: 'center',
            justifyItems: 'center',
            padding: '12px'
          }}>
            {/* Top row: flower above */}
            <div></div>
            <div style={{ fontSize: '38px' }}>🌸</div>
            <div></div>

            {/* Middle row: key left, box center, cup right */}
            <div style={{ fontSize: '38px' }}>🗝️</div>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-navy)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '14px'
            }}>
              BOX
            </div>
            <div style={{ fontSize: '38px' }}>☕</div>

            {/* Bottom row: spectacles below */}
            <div></div>
            <div style={{ fontSize: '38px' }}>👓</div>
            <div></div>
          </div>

          {/* Options */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
            {options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelect(opt)}
                className="patient-btn patient-btn-secondary"
                style={{
                  justifyContent: 'center',
                  padding: '18px 12px',
                  fontSize: '18px',
                  fontWeight: 700,
                  background: selectedOption === opt.text ? 'var(--color-teal-soft)' : 'var(--color-bg-surface)',
                  borderColor: selectedOption === opt.text ? 'var(--color-teal)' : 'var(--color-border)'
                }}
              >
                {opt.text}
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
