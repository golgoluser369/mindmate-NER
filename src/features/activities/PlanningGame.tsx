import React, { useState, useRef } from 'react';
import { LanguageCode, GameSession, AdaptiveDecision } from '../../models/types';
import { getStrings } from '../../locales';
import { offlineService } from '../../services/offlineService';
import { evaluateAndAdaptSession } from '../../services/adaptiveEngine';
import { SessionResultModal } from './SessionResultModal';
import { voiceService } from '../../services/voiceService';
import { Calendar, ArrowLeft, Volume2, CheckCircle2, ListOrdered, ArrowRight } from 'lucide-react';

interface PlanningGameProps {
  language: LanguageCode;
  onFinish: () => void;
  onBack: () => void;
}

export const PlanningGame: React.FC<PlanningGameProps> = ({
  language,
  onFinish,
  onBack
}) => {
  const strings = getStrings(language);
  const patient = offlineService.getPatient();
  const patientFirstName = patient?.name ? patient.name.split(' ')[0] : 'The patient';
  const currentLevel = patient.currentLevel || 2;

  const [gameState, setGameState] = useState<'instruction' | 'planning' | 'completed'>('instruction');
  const [selectedFirstStep, setSelectedFirstStep] = useState<string | null>(null);

  const [finishedSession, setFinishedSession] = useState<GameSession | null>(null);
  const [adaptiveDecision, setAdaptiveDecision] = useState<AdaptiveDecision | null>(null);

  const startTimeRef = useRef<number>(0);

  const scenarioTitle = "Routine Health Center Visit";
  const scenarioPrompt = `${patientFirstName} needs to visit the community health center tomorrow morning for a blood pressure checkup. What should be done FIRST?`;
  
  const options = [
    { text: "Check appointment slip and confirm time", isCorrect: true, emoji: "📋" },
    { text: "Lie down and sleep for the night", isCorrect: false, emoji: "🛏️" },
    { text: "Go shopping in the evening market", isCorrect: false, emoji: "🛍️" },
    { text: "Wash and dry garden clothes", isCorrect: false, emoji: "🧺" }
  ];

  const handleStart = () => {
    setGameState('planning');
    startTimeRef.current = Date.now();
  };

  const handleSelect = (option: typeof options[0]) => {
    setSelectedFirstStep(option.text);
    const responseTime = Date.now() - startTimeRef.current;

    const { session, decision } = evaluateAndAdaptSession({
      patientId: patient.id,
      activityId: 'planning',
      activityTitle: 'Everyday Planning',
      accuracy: option.isCorrect ? 100 : 35,
      responseTimeMs: responseTime,
      completionRate: 100,
      attempts: 1,
      errors: option.isCorrect ? 0 : 1,
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
    voiceService.speak(scenarioPrompt, language);
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
          Level {currentLevel} • Everyday Planning
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
            <Calendar size={44} />
          </div>

          <h2 style={{ fontSize: 'var(--text-elderly-hero)', color: 'var(--color-navy)', marginBottom: '12px' }}>
            Everyday Planning
          </h2>
          <p style={{
            fontSize: 'var(--text-elderly-instruction)',
            color: 'var(--color-text-secondary)',
            marginBottom: '28px',
            lineHeight: 1.5
          }}>
            Plan an important everyday task. Read the situation and select the best first step.
          </p>

          <button
            onClick={handleStart}
            className="patient-btn patient-btn-primary"
            style={{ minWidth: '220px', margin: '0 auto' }}
          >
            Start Planning Task
          </button>
        </div>
      )}

      {/* Planning Stage */}
      {gameState === 'planning' && (
        <div className="patient-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', fontWeight: 700 }}>
                SCENARIO: {scenarioTitle}
              </div>
              <h3 style={{ fontSize: 'var(--text-elderly-title)', color: 'var(--color-navy)', lineHeight: 1.4 }}>
                {scenarioPrompt}
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
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              <Volume2 size={20} />
              <span>Listen</span>
            </button>
          </div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelect(opt)}
                className="patient-btn patient-btn-secondary"
                style={{
                  justifyContent: 'flex-start',
                  gap: '16px',
                  padding: '20px 24px',
                  fontSize: '19px',
                  background: selectedFirstStep === opt.text ? 'var(--color-teal-soft)' : 'var(--color-bg-surface)',
                  borderColor: selectedFirstStep === opt.text ? 'var(--color-teal)' : 'var(--color-border)'
                }}
              >
                <span style={{ fontSize: '28px' }}>{opt.emoji}</span>
                <span style={{ textAlign: 'left', fontWeight: 700, color: 'var(--color-navy)' }}>{opt.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Completion Modal */}
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
