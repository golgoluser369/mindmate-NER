import React, { useState, useRef } from 'react';
import { LanguageCode, GameSession, AdaptiveDecision } from '../../models/types';
import { getStrings } from '../../locales';
import { offlineService } from '../../services/offlineService';
import { evaluateAndAdaptSession } from '../../services/adaptiveEngine';
import { SessionResultModal } from './SessionResultModal';
import { RealLifeImage } from '../../services/realLifeAssets';
import { Images, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface PicturePairGameProps {
  language: LanguageCode;
  onFinish: () => void;
  onBack: () => void;
}

interface PairCard {
  cardId: number;
  pairId: string;
  emoji: string;
  name: string;
}

export const PicturePairGame: React.FC<PicturePairGameProps> = ({
  language,
  onFinish,
  onBack
}) => {
  const strings = getStrings(language);
  const patient = offlineService.getPatient();
  const currentLevel = patient.currentLevel || 2;

  const [gameState, setGameState] = useState<'instruction' | 'playing' | 'completed'>('instruction');
  const [cards, setCards] = useState<PairCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [attempts, setAttempts] = useState<number>(0);
  const [errors, setErrors] = useState<number>(0);

  const [finishedSession, setFinishedSession] = useState<GameSession | null>(null);
  const [adaptiveDecision, setAdaptiveDecision] = useState<AdaptiveDecision | null>(null);

  const startTimeRef = useRef<number>(0);

  const pool = [
    { pairId: 'cup', emoji: '☕', name: 'Tea Cup' },
    { pairId: 'flower', emoji: '🌸', name: 'Orchid Flower' },
    { pairId: 'basket', emoji: '🧺', name: 'Woven Basket' },
    { pairId: 'key', emoji: '🗝️', name: 'Brass Key' },
    { pairId: 'book', emoji: '📕', name: 'Notebook' },
    { pairId: 'jug', emoji: '🏺', name: 'Water Jug' }
  ];

  const handleStart = () => {
    const pairCount = currentLevel === 1 ? 2 : currentLevel === 2 ? 3 : 4;
    const selectedPairs = pool.slice(0, pairCount);

    const deck: PairCard[] = [];
    selectedPairs.forEach((item, idx) => {
      deck.push({ cardId: idx * 2, pairId: item.pairId, emoji: item.emoji, name: item.name });
      deck.push({ cardId: idx * 2 + 1, pairId: item.pairId, emoji: item.emoji, name: item.name });
    });

    // Shuffle deck
    deck.sort(() => Math.random() - 0.5);
    setCards(deck);
    setSelectedCards([]);
    setMatchedPairIds([]);
    setAttempts(0);
    setErrors(0);
    setGameState('playing');
    startTimeRef.current = Date.now();
  };

  const handleCardClick = (cardId: number) => {
    if (selectedCards.length === 2) return;
    if (selectedCards.includes(cardId)) return;

    const newSelected = [...selectedCards, cardId];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setAttempts(a => a + 1);
      const card1 = cards.find(c => c.cardId === newSelected[0])!;
      const card2 = cards.find(c => c.cardId === newSelected[1])!;

      if (card1.pairId === card2.pairId) {
        // Matched!
        const newMatched = [...matchedPairIds, card1.pairId];
        setMatchedPairIds(newMatched);
        setSelectedCards([]);

        const requiredPairs = currentLevel === 1 ? 2 : currentLevel === 2 ? 3 : 4;
        if (newMatched.length === requiredPairs) {
          finishGame(errors);
        }
      } else {
        // Not matched
        setErrors(e => e + 1);
        setTimeout(() => {
          setSelectedCards([]);
        }, 900);
      }
    }
  };

  const finishGame = (totalErrors: number) => {
    const responseTime = Date.now() - startTimeRef.current;
    const accuracy = Math.max(30, Math.round(100 - (totalErrors * 15)));

    const { session, decision } = evaluateAndAdaptSession({
      patientId: patient.id,
      activityId: 'picture_pair',
      activityTitle: 'Picture Pair Matching',
      accuracy,
      responseTimeMs: responseTime,
      completionRate: 100,
      attempts: attempts + 1,
      errors: totalErrors,
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
          Level {currentLevel} • Picture Pairs
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
            <Images size={44} />
          </div>

          <h2 style={{ fontSize: 'var(--text-elderly-hero)', color: 'var(--color-navy)', marginBottom: '12px' }}>
            Picture Pair
          </h2>
          <p style={{
            fontSize: 'var(--text-elderly-instruction)',
            color: 'var(--color-text-secondary)',
            marginBottom: '28px',
            lineHeight: 1.5
          }}>
            Find the matching pairs of familiar objects. Tap two cards to see if they match.
          </p>

          <button
            onClick={handleStart}
            className="patient-btn patient-btn-primary"
            style={{ minWidth: '220px', margin: '0 auto' }}
          >
            Start Matching
          </button>
        </div>
      )}

      {/* Playing */}
      {gameState === 'playing' && (
        <div className="patient-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: 'var(--text-elderly-title)', color: 'var(--color-navy)' }}>
              Find the matching pairs
            </h3>
            <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-teal)' }}>
              Matched {matchedPairIds.length} pairs
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: cards.length <= 4 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
            gap: '16px'
          }}>
            {cards.map(card => {
              const isMatched = matchedPairIds.includes(card.pairId);
              const isSelected = selectedCards.includes(card.cardId);

              return (
                <button
                  key={card.cardId}
                  onClick={() => handleCardClick(card.cardId)}
                  disabled={isMatched}
                  style={{
                    height: '130px',
                    borderRadius: 'var(--radius-lg)',
                    background: isMatched 
                      ? 'var(--color-success-soft)' 
                      : isSelected 
                      ? 'var(--color-teal-soft)' 
                      : 'var(--color-bg-patient)',
                    border: `2.5px solid ${isMatched ? 'var(--color-success)' : isSelected ? 'var(--color-teal)' : 'var(--color-border)'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: isMatched ? 'default' : 'pointer',
                    transition: 'all 0.15s ease',
                    opacity: isMatched ? 0.8 : 1
                  }}
                >
                  <RealLifeImage
                    assetKey={card.pairId}
                    size={64}
                    rounded={true}
                    style={{
                      border: '2px solid rgba(0,0,0,0.06)',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                    }}
                    alt={card.name}
                  />
                  <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-navy)' }}>
                    {card.name}
                  </span>
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
