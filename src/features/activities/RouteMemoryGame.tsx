import React, { useState, useRef } from 'react';
import { LanguageCode, GameSession, AdaptiveDecision } from '../../models/types';
import { getStrings } from '../../locales';
import { offlineService } from '../../services/offlineService';
import { evaluateAndAdaptSession } from '../../services/adaptiveEngine';
import { SessionResultModal } from './SessionResultModal';
import { voiceService } from '../../services/voiceService';
import { Compass, ArrowLeft, Volume2, ArrowRight, MapPin, CheckCircle2 } from 'lucide-react';

interface RouteMemoryGameProps {
  language: LanguageCode;
  onFinish: () => void;
  onBack: () => void;
}

export const RouteMemoryGame: React.FC<RouteMemoryGameProps> = ({
  language,
  onFinish,
  onBack
}) => {
  const strings = getStrings(language);
  const patient = offlineService.getPatient();
  const patientFirstName = patient?.name ? patient.name.split(' ')[0] : 'your';
  const currentLevel = patient.currentLevel || 2;

  const [gameState, setGameState] = useState<'instruction' | 'observe' | 'question' | 'completed'>('instruction');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const [finishedSession, setFinishedSession] = useState<GameSession | null>(null);
  const [adaptiveDecision, setAdaptiveDecision] = useState<AdaptiveDecision | null>(null);

  const startTimeRef = useRef<number>(0);

  const routeSteps = [
    { title: 'Home', icon: '🏡', detail: 'Morning departure' },
    { title: 'Local Market', icon: '🥬', detail: 'Vegetables & tea' },
    { title: 'Pharmacy', icon: '💊', detail: 'Refill routine' },
    { title: 'Home', icon: '🏡', detail: 'Safe return' }
  ];

  const question = `Where did ${patientFirstName} go immediately after the Local Market?`;
  const correctAnswer = "Pharmacy";
  const options = ["Pharmacy", "Post Office", "Hospital", "Family Home"];

  const handleStartObserve = () => {
    setGameState('observe');
  };

  const handleProceedToQuestion = () => {
    setGameState('question');
    startTimeRef.current = Date.now();
  };

  const handleSelectOption = (option: string) => {
    setSelectedOption(option);
    const responseTime = Date.now() - startTimeRef.current;
    const isCorrect = option === correctAnswer;

    const { session, decision } = evaluateAndAdaptSession({
      patientId: patient.id,
      activityId: 'route_memory',
      activityTitle: 'Route Memory',
      accuracy: isCorrect ? 100 : 40,
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
    }, 500);
  };

  const handleVoiceListen = () => {
    voiceService.speak("Remember this route: Home, to Local Market, to Pharmacy, then back Home.", language);
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
          Level {currentLevel} • Route Memory
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
            <Compass size={44} />
          </div>

          <h2 style={{ fontSize: 'var(--text-elderly-hero)', color: 'var(--color-navy)', marginBottom: '12px' }}>
            Route Memory
          </h2>
          <p style={{
            fontSize: 'var(--text-elderly-instruction)',
            color: 'var(--color-text-secondary)',
            marginBottom: '28px',
            lineHeight: 1.5
          }}>
            Observe {patientFirstName}'s morning route through the neighborhood. Remember the sequence of stops.
          </p>

          <button
            onClick={handleStartObserve}
            className="patient-btn patient-btn-primary"
            style={{ minWidth: '220px', margin: '0 auto' }}
          >
            Show Neighborhood Route
          </button>
        </div>
      )}

      {/* Observe Route */}
      {gameState === 'observe' && (
        <div className="patient-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', fontWeight: 700 }}>
                ROUTE SCHEMATIC (DEMO NEIGHBORHOOD)
              </div>
              <h3 style={{ fontSize: 'var(--text-elderly-title)', color: 'var(--color-navy)' }}>
                Follow {patientFirstName}'s Journey
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

          {/* Route path steps */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            marginBottom: '32px'
          }}>
            {routeSteps.map((step, idx) => (
              <React.Fragment key={idx}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  background: 'var(--color-bg-patient)',
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)'
                }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--color-navy)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: 800
                  }}>
                    {idx + 1}
                  </div>

                  <span style={{ fontSize: '32px' }}>{step.icon}</span>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-navy)' }}>
                      {step.title}
                    </div>
                    <div style={{ fontSize: '15px', color: 'var(--color-text-secondary)' }}>
                      {step.detail}
                    </div>
                  </div>
                </div>

                {idx < routeSteps.length - 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--color-teal)' }}>
                    <ArrowRight size={24} style={{ transform: 'rotate(90deg)' }} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          <button
            onClick={handleProceedToQuestion}
            className="patient-btn patient-btn-primary"
            style={{ width: '100%' }}
          >
            I Remember the Route
          </button>
        </div>
      )}

      {/* Question */}
      {gameState === 'question' && (
        <div className="patient-card" style={{ padding: '28px' }}>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', fontWeight: 700, marginBottom: '6px' }}>
              RECALL QUESTION
            </div>
            <h3 style={{ fontSize: 'var(--text-elderly-title)', color: 'var(--color-navy)', lineHeight: 1.4 }}>
              {question}
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectOption(opt)}
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
                <MapPin size={22} style={{ color: 'var(--color-teal)' }} />
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
