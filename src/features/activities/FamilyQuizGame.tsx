import React, { useState, useRef } from 'react';
import { LanguageCode, GameSession, AdaptiveDecision } from '../../models/types';
import { getStrings } from '../../locales';
import { offlineService } from '../../services/offlineService';
import { evaluateAndAdaptSession } from '../../services/adaptiveEngine';
import { SessionResultModal } from './SessionResultModal';
import { voiceService } from '../../services/voiceService';
import { Heart, ArrowLeft, Volume2, CheckCircle2, ChevronRight } from 'lucide-react';

interface FamilyQuizGameProps {
  language: LanguageCode;
  onFinish: () => void;
  onBack: () => void;
}

export const FamilyQuizGame: React.FC<FamilyQuizGameProps> = ({
  language,
  onFinish,
  onBack
}) => {
  const strings = getStrings(language);
  const patient = offlineService.getPatient();
  const currentLevel = patient.currentLevel || 2;
  const memories = offlineService.getPersonalMemories();

  const [gameState, setGameState] = useState<'instruction' | 'playing' | 'completed'>('instruction');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const [finishedSession, setFinishedSession] = useState<GameSession | null>(null);
  const [adaptiveDecision, setAdaptiveDecision] = useState<AdaptiveDecision | null>(null);

  const startTimeRef = useRef<number>(0);

  const patientFirstName = patient?.name ? patient.name.split(' ')[0] : 'you';
  const question = `Who usually visits ${patientFirstName} on Sunday mornings?`;
  const correctAnswer = "Ananya (Daughter)";
  const options = [
    "Ananya (Daughter)",
    "Ravi (Neighbor)",
    "Priya (Cousin)",
    "Arun (Postman)"
  ];

  const handleStart = () => {
    setGameState('playing');
    startTimeRef.current = Date.now();
  };

  const handleSelect = (choice: string) => {
    setSelectedOption(choice);
    const responseTime = Date.now() - startTimeRef.current;
    const isCorrect = choice === correctAnswer;

    const { session, decision } = evaluateAndAdaptSession({
      patientId: patient.id,
      activityId: 'family_quiz',
      activityTitle: 'Family Memory Quiz',
      accuracy: isCorrect ? 100 : 40,
      responseTimeMs: responseTime,
      completionRate: 100,
      attempts: 1,
      errors: isCorrect ? 0 : 1,
      difficultyLevel: currentLevel,
      isPersonalized: true
    });

    setTimeout(() => {
      setFinishedSession(session);
      setAdaptiveDecision(decision);
      setGameState('completed');
    }, 600);
  };

  const handleVoiceListen = () => {
    voiceService.speak(question, language);
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
          Personalized • Family Memory Quiz
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
            <Heart size={44} />
          </div>

          <h2 style={{ fontSize: 'var(--text-elderly-hero)', color: 'var(--color-navy)', marginBottom: '12px' }}>
            Family Memory Quiz
          </h2>
          <p style={{
            fontSize: 'var(--text-elderly-instruction)',
            color: 'var(--color-text-secondary)',
            marginBottom: '28px',
            lineHeight: 1.5
          }}>
            Gentle questions about familiar family visits and weekly routines entered by your caregiver.
          </p>

          <button
            onClick={handleStart}
            className="patient-btn patient-btn-primary"
            style={{ minWidth: '220px', margin: '0 auto' }}
          >
            Start Family Quiz
          </button>
        </div>
      )}

      {/* Playing */}
      {gameState === 'playing' && (
        <div className="patient-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              fontWeight: 700,
              color: 'var(--color-teal)',
              background: 'var(--color-teal-soft)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)'
            }}>
              <Heart size={16} /> Personal Memory System
            </span>

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

          <h3 style={{
            fontSize: 'var(--text-elderly-title)',
            color: 'var(--color-navy)',
            marginBottom: '28px',
            lineHeight: 1.4
          }}>
            {question}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelect(opt)}
                className="patient-btn patient-btn-secondary"
                style={{
                  justifyContent: 'space-between',
                  padding: '20px 24px',
                  fontSize: '20px',
                  background: selectedOption === opt ? 'var(--color-teal-soft)' : 'var(--color-bg-surface)',
                  borderColor: selectedOption === opt ? 'var(--color-teal)' : 'var(--color-border)'
                }}
              >
                <span>{opt}</span>
                <ChevronRight size={22} style={{ color: 'var(--color-teal)' }} />
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
