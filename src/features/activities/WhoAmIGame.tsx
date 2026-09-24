import React, { useState, useRef } from 'react';
import { LanguageCode, GameSession, AdaptiveDecision, PersonalMemoryItem } from '../../models/types';
import { getStrings } from '../../locales';
import { offlineService } from '../../services/offlineService';
import { evaluateAndAdaptSession } from '../../services/adaptiveEngine';
import { SessionResultModal } from './SessionResultModal';
import { voiceService } from '../../services/voiceService';
import { RealLifeImage } from '../../services/realLifeAssets';
import { Users, ArrowLeft, Volume2, Check, X, Heart } from 'lucide-react';

interface WhoAmIGameProps {
  language: LanguageCode;
  onFinish: () => void;
  onBack: () => void;
}

export const WhoAmIGame: React.FC<WhoAmIGameProps> = ({
  language,
  onFinish,
  onBack
}) => {
  const strings = getStrings(language);
  const patient = offlineService.getPatient();
  const currentLevel = patient.currentLevel || 2;
  const memories = offlineService.getPersonalMemories();

  const [gameState, setGameState] = useState<'instruction' | 'question' | 'completed'>('instruction');
  const [selectedResponse, setSelectedResponse] = useState<boolean | null>(null);

  const [finishedSession, setFinishedSession] = useState<GameSession | null>(null);
  const [adaptiveDecision, setAdaptiveDecision] = useState<AdaptiveDecision | null>(null);

  const startTimeRef = useRef<number>(0);

  // Get people memories or fallback
  const peopleMemories = memories.filter((m: PersonalMemoryItem) => m.category === 'person');
  const primaryPerson: PersonalMemoryItem = peopleMemories[0] || {
    id: 'mem-person-default',
    category: 'person',
    name: 'Ananya Sharma',
    relationshipOrDetail: 'Daughter (Visits every morning)',
    description: 'Brings morning tea, manages garden flowers and evening calls.',
    iconOrEmoji: '👩'
  };

  // Familiarity check: "Is this Ananya, your daughter?"
  const promptText = `Who is this person?`;
  const displayedName = primaryPerson.name;
  const displayedRelation = primaryPerson.relationshipOrDetail;
  const isStatementTrue = true; // For demo verification

  const handleStart = () => {
    setGameState('question');
    startTimeRef.current = Date.now();
  };

  const handleAnswer = (answerYes: boolean) => {
    setSelectedResponse(answerYes);
    const responseTime = Date.now() - startTimeRef.current;
    const isCorrect = answerYes === isStatementTrue;

    const { session, decision } = evaluateAndAdaptSession({
      patientId: patient.id,
      activityId: 'who_am_i',
      activityTitle: 'Who Am I?',
      accuracy: isCorrect ? 100 : 50,
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
    voiceService.speak(`${promptText}. Is this ${displayedName}, ${displayedRelation}?`, language);
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
          Personalized • Identity Familiarity
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
            <Users size={44} />
          </div>

          <h2 style={{ fontSize: 'var(--text-elderly-hero)', color: 'var(--color-navy)', marginBottom: '12px' }}>
            Who Am I?
          </h2>
          <p style={{
            fontSize: 'var(--text-elderly-instruction)',
            color: 'var(--color-text-secondary)',
            marginBottom: '28px',
            lineHeight: 1.5
          }}>
            Look at the family memory card. Confirm if you recognize this familiar person.
          </p>

          <button
            onClick={handleStart}
            className="patient-btn patient-btn-primary"
            style={{ minWidth: '220px', margin: '0 auto' }}
          >
            Start Identity Activity
          </button>
        </div>
      )}

      {/* Question */}
      {gameState === 'question' && (
        <div className="patient-card" style={{ padding: '32px', textAlign: 'center' }}>
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
              <Heart size={16} /> Caregiver Memory Item
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

          <h3 style={{ fontSize: 'var(--text-elderly-hero)', color: 'var(--color-navy)', marginBottom: '20px' }}>
            {promptText}
          </h3>

          {/* Person Profile Box */}
          <div style={{
            background: 'var(--color-bg-patient)',
            border: '2px solid var(--color-teal)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px',
            maxWidth: '420px',
            margin: '0 auto 32px'
          }}>
            <div style={{ margin: '0 auto 16px', display: 'flex', justifyContent: 'center' }}>
              <RealLifeImage
                assetKey={primaryPerson.id}
                category="person"
                title={primaryPerson.name}
                photoUrl={primaryPerson.imageUrl}
                size={120}
                rounded={true}
                style={{
                  borderRadius: '50%',
                  border: '4px solid var(--color-teal)',
                  boxShadow: 'var(--shadow-md)'
                }}
                alt={primaryPerson.name}
              />
            </div>

            <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--color-navy)', marginBottom: '6px' }}>
              {displayedName}
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-teal)', marginBottom: '10px' }}>
              {displayedRelation}
            </div>
            <div style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
              {primaryPerson.description}
            </div>
          </div>

          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-navy)', marginBottom: '18px' }}>
            {`Do you recognize ${displayedName}?`}
          </div>

          {/* Yes / No Choices */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', maxWidth: '420px', margin: '0 auto' }}>
            <button
              onClick={() => handleAnswer(true)}
              className="patient-btn patient-btn-primary"
              style={{
                background: 'var(--color-teal)',
                padding: '20px 24px',
                fontSize: '22px',
                justifyContent: 'center',
                gap: '10px'
              }}
            >
              <Check size={28} />
              <span>Yes</span>
            </button>

            <button
              onClick={() => handleAnswer(false)}
              className="patient-btn patient-btn-secondary"
              style={{
                padding: '20px 24px',
                fontSize: '22px',
                justifyContent: 'center',
                gap: '10px'
              }}
            >
              <X size={28} />
              <span>No</span>
            </button>
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
