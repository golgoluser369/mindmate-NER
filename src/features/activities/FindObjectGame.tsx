import React, { useState, useEffect, useRef } from 'react';
import { LanguageCode, GameSession, AdaptiveDecision } from '../../models/types';
import { getStrings } from '../../locales';
import { offlineService } from '../../services/offlineService';
import { evaluateAndAdaptSession } from '../../services/adaptiveEngine';
import { SessionResultModal } from './SessionResultModal';
import { voiceService } from '../../services/voiceService';
import { RealLifeImage } from '../../services/realLifeAssets';
import { Target, ArrowLeft, Volume2, CheckCircle2, XCircle } from 'lucide-react';

interface FindObjectGameProps {
  language: LanguageCode;
  onFinish: () => void;
  onBack: () => void;
}

interface ObjectItem {
  id: string;
  key: string;
  name: string;
  emoji: string;
  isTarget: boolean;
}

export const FindObjectGame: React.FC<FindObjectGameProps> = ({
  language,
  onFinish,
  onBack
}) => {
  const strings = getStrings(language);
  const patient = offlineService.getPatient();
  const currentLevel = patient.currentLevel || 2;

  const [gameState, setGameState] = useState<'instruction' | 'playing' | 'feedback' | 'completed'>('instruction');
  const [items, setItems] = useState<ObjectItem[]>([]);
  const [targetName, setTargetName] = useState<string>('Tea Cup');
  const [targetKey, setTargetKey] = useState<string>('cup');
  const [targetEmoji, setTargetEmoji] = useState<string>('☕');
  const [attempts, setAttempts] = useState<number>(0);
  const [misses, setMisses] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);

  const [finishedSession, setFinishedSession] = useState<GameSession | null>(null);
  const [adaptiveDecision, setAdaptiveDecision] = useState<AdaptiveDecision | null>(null);

  const startTimeRef = useRef<number>(0);

  // Distractors pool with real asset keys
  const pool = [
    { key: 'cup', name: 'Tea Cup', emoji: '☕' },
    { key: 'flower', name: 'Garden Flower', emoji: '🌸' },
    { key: 'key', name: 'Brass Key', emoji: '🗝️' },
    { key: 'book', name: 'Notebook', emoji: '📕' },
    { key: 'basket', name: 'Woven Basket', emoji: '🧺' },
    { key: 'jug', name: 'Water Jug', emoji: '🏺' },
    { key: 'spoon', name: 'Wooden Spoon', emoji: '🥄' },
    { key: 'glasses', name: 'Reading Spectacles', emoji: '👓' },
    { key: 'stick', name: 'Walking Stick', emoji: '🦯' },
    { key: 'bag', name: 'Cloth Bag', emoji: '👜' },
    { key: 'plate', name: 'Ceramic Plate', emoji: '🍽️' },
    { key: 'clock', name: 'Table Clock', emoji: '⏰' }
  ];

  const setupRound = () => {
    const itemCount = currentLevel === 1 ? 6 : currentLevel === 2 ? 8 : 12;
    const targetIdx = 0;
    const currentTarget = pool[targetIdx];
    setTargetName(currentTarget.name);
    setTargetKey(currentTarget.key);
    setTargetEmoji(currentTarget.emoji);

    const distractors = pool.slice(1, itemCount);
    const roundItems: ObjectItem[] = [
      { id: 'target', key: currentTarget.key, name: currentTarget.name, emoji: currentTarget.emoji, isTarget: true },
      ...distractors.map((d, i) => ({ id: `d-${i}`, key: d.key, name: d.name, emoji: d.emoji, isTarget: false }))
    ];

    // Shuffle
    roundItems.sort(() => Math.random() - 0.5);
    setItems(roundItems);
    setGameState('playing');
    startTimeRef.current = Date.now();
  };

  const handleStart = () => {
    setupRound();
  };

  const handleItemClick = (item: ObjectItem) => {
    if (gameState !== 'playing') return;

    setAttempts(prev => prev + 1);
    const responseTime = Date.now() - startTimeRef.current;

    if (item.isTarget) {
      setFeedback({ isCorrect: true, message: `Found the ${targetName}!` });
      setGameState('feedback');

      setTimeout(() => {
        completeGame(responseTime, misses);
      }, 1000);
    } else {
      setMisses(prev => prev + 1);
      setFeedback({ isCorrect: false, message: `That is the ${item.name}. Look for the ${targetName}.` });
    }
  };

  const completeGame = (responseTimeMs: number, errorsCount: number) => {
    const accuracy = Math.max(20, Math.round(100 - (errorsCount * 25)));
    const { session, decision } = evaluateAndAdaptSession({
      patientId: patient.id,
      activityId: 'find_object',
      activityTitle: 'Find Object',
      accuracy,
      responseTimeMs,
      completionRate: 100,
      attempts: attempts + 1,
      errors: errorsCount,
      difficultyLevel: currentLevel,
      isPersonalized: false
    });

    setFinishedSession(session);
    setAdaptiveDecision(decision);
    setGameState('completed');
  };

  const handleVoiceListen = () => {
    voiceService.speak(`Find the ${targetName} on your screen.`, language);
  };

  return (
    <div style={{ maxWidth: 'var(--max-patient-width)', margin: '0 auto', padding: '16px 16px 40px' }}>
      {/* Activity Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px'
      }}>
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
          Level {currentLevel} • Visual Search
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
            <Target size={44} />
          </div>

          <h2 style={{ fontSize: 'var(--text-elderly-hero)', color: 'var(--color-navy)', marginBottom: '12px' }}>
            Find Object
          </h2>
          <p style={{
            fontSize: 'var(--text-elderly-instruction)',
            color: 'var(--color-text-secondary)',
            marginBottom: '28px',
            lineHeight: 1.5
          }}>
            Look at the objects on your screen. Tap the item shown in the instruction. Take your time.
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

      {/* Playing & Feedback Stage */}
      {(gameState === 'playing' || gameState === 'feedback') && (
        <div className="patient-card" style={{ padding: '24px' }}>
          {/* Target Prompt Box */}
          <div style={{
            background: 'var(--color-bg-patient)',
            border: '2px solid var(--color-teal)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <RealLifeImage
                assetKey={targetKey}
                size={58}
                rounded={true}
                alt={targetName}
                style={{
                  border: '2px solid var(--color-teal)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              />
              <div>
                <div style={{ fontSize: '15px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  YOUR GOAL
                </div>
                <div style={{ fontSize: 'var(--text-elderly-instruction)', color: 'var(--color-navy)', fontWeight: 800 }}>
                  Find the {targetName}
                </div>
              </div>
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

          {/* Feedback banner */}
          {feedback && (
            <div style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px',
              background: feedback.isCorrect ? 'var(--color-success-soft)' : 'var(--color-warning-soft)',
              color: feedback.isCorrect ? 'var(--color-success)' : 'var(--color-warning)',
              border: `1px solid ${feedback.isCorrect ? 'var(--color-success-border)' : 'var(--color-warning-border)'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '17px',
              fontWeight: 700
            }}>
              {feedback.isCorrect ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Grid of Objects */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: currentLevel === 1 ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)',
            gap: '16px'
          }}>
            {items.map(item => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                disabled={gameState === 'feedback'}
                style={{
                  height: '124px',
                  background: 'var(--color-bg-surface)',
                  border: '2px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  padding: '8px'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-teal)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
              >
                <RealLifeImage
                  assetKey={item.key}
                  size={54}
                  rounded={true}
                  alt={item.name}
                />
                <span style={{ fontSize: '13px', color: 'var(--color-navy)', fontWeight: 700 }}>
                  {item.name}
                </span>
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
