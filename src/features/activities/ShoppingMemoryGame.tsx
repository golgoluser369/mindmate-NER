import React, { useState, useEffect, useRef } from 'react';
import { LanguageCode, GameSession, AdaptiveDecision } from '../../models/types';
import { getStrings } from '../../locales';
import { offlineService } from '../../services/offlineService';
import { evaluateAndAdaptSession } from '../../services/adaptiveEngine';
import { SessionResultModal } from './SessionResultModal';
import { voiceService } from '../../services/voiceService';
import { ShoppingBag, ArrowLeft, Volume2, CheckCircle2, Clock } from 'lucide-react';

interface ShoppingMemoryGameProps {
  language: LanguageCode;
  onFinish: () => void;
  onBack: () => void;
}

interface ShoppingItem {
  id: string;
  name: string;
  emoji: string;
}

export const ShoppingMemoryGame: React.FC<ShoppingMemoryGameProps> = ({
  language,
  onFinish,
  onBack
}) => {
  const strings = getStrings(language);
  const patient = offlineService.getPatient();
  const patientFirstName = patient?.name ? patient.name.split(' ')[0] : 'your';
  const currentLevel = patient.currentLevel || 2;

  const [gameState, setGameState] = useState<'instruction' | 'memorize' | 'recall' | 'completed'>('instruction');
  const [memorizeList, setMemorizeList] = useState<ShoppingItem[]>([]);
  const [optionsList, setOptionsList] = useState<ShoppingItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number>(10);

  const [finishedSession, setFinishedSession] = useState<GameSession | null>(null);
  const [adaptiveDecision, setAdaptiveDecision] = useState<AdaptiveDecision | null>(null);

  const recallStartTimeRef = useRef<number>(0);

  const pool: ShoppingItem[] = [
    { id: 'tea', name: 'Assam Tea', emoji: '🍵' },
    { id: 'rice', name: 'Johar Rice', emoji: '🍚' },
    { id: 'milk', name: 'Fresh Milk', emoji: '🥛' },
    { id: 'soap', name: 'Bathing Soap', emoji: '🧼' },
    { id: 'fruit', name: 'Seasonal Fruit', emoji: '🍎' },
    { id: 'oil', name: 'Mustard Oil', emoji: '🫙' },
    { id: 'bread', name: 'Warm Bread', emoji: '🍞' },
    { id: 'salt', name: 'Cooking Salt', emoji: '🧂' },
    { id: 'shoes', name: 'Walking Shoes', emoji: '👟' },
    { id: 'medicine', name: 'Medicine Tablets', emoji: '💊' },
    { id: 'umbrella', name: 'Rain Umbrella', emoji: '☂️' }
  ];

  const startMemorization = () => {
    const listCount = currentLevel === 1 ? 3 : currentLevel === 2 ? 4 : 5;
    const targetPool = pool.slice(0, 7);
    const shuffled = [...targetPool].sort(() => Math.random() - 0.5);
    const targetItems = shuffled.slice(0, listCount);
    setMemorizeList(targetItems);

    // Setup options with distractors
    const distractors = pool.slice(7).concat(shuffled.slice(listCount)).slice(0, 4);
    const choices = [...targetItems, ...distractors].sort(() => Math.random() - 0.5);
    setOptionsList(choices);
    setSelectedItems([]);

    setCountdown(currentLevel === 1 ? 12 : currentLevel === 2 ? 10 : 8);
    setGameState('memorize');
  };

  useEffect(() => {
    let timer: any;
    if (gameState === 'memorize' && countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    } else if (gameState === 'memorize' && countdown === 0) {
      proceedToRecall();
    }
    return () => clearTimeout(timer);
  }, [gameState, countdown]);

  const proceedToRecall = () => {
    setGameState('recall');
    recallStartTimeRef.current = Date.now();
  };

  const handleToggleSelect = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    } else {
      if (selectedItems.length < memorizeList.length) {
        setSelectedItems([...selectedItems, itemId]);
      }
    }
  };

  const handleSubmit = () => {
    const responseTime = Date.now() - recallStartTimeRef.current;
    const correctIds = memorizeList.map(item => item.id);
    let correctCount = 0;
    selectedItems.forEach(id => {
      if (correctIds.includes(id)) correctCount++;
    });

    const accuracy = Math.round((correctCount / memorizeList.length) * 100);
    const errors = (selectedItems.length - correctCount) + (memorizeList.length - correctCount);

    const { session, decision } = evaluateAndAdaptSession({
      patientId: patient.id,
      activityId: 'shopping_memory',
      activityTitle: 'Shopping Memory',
      accuracy,
      responseTimeMs: responseTime,
      completionRate: 100,
      attempts: 1,
      errors,
      difficultyLevel: currentLevel,
      isPersonalized: false
    });

    setFinishedSession(session);
    setAdaptiveDecision(decision);
    setGameState('completed');
  };

  const handleVoiceListen = () => {
    const itemNames = memorizeList.map(i => i.name).join(', ');
    voiceService.speak(`Remember ${patientFirstName}'s shopping list: ${itemNames}.`, language);
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
          Level {currentLevel} • Shopping Memory
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
            <ShoppingBag size={44} />
          </div>

          <h2 style={{ fontSize: 'var(--text-elderly-hero)', color: 'var(--color-navy)', marginBottom: '12px' }}>
            Shopping List Memory
          </h2>
          <p style={{
            fontSize: 'var(--text-elderly-instruction)',
            color: 'var(--color-text-secondary)',
            marginBottom: '28px',
            lineHeight: 1.5
          }}>
            Review {patientFirstName}'s morning market list. Memorize the items, then choose which ones were on the list.
          </p>

          <button
            onClick={startMemorization}
            className="patient-btn patient-btn-primary"
            style={{ minWidth: '220px', margin: '0 auto' }}
          >
            Show Shopping List
          </button>
        </div>
      )}

      {/* Memorize Stage */}
      {gameState === 'memorize' && (
        <div className="patient-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', fontWeight: 700 }}>
                MEMORIZE THIS LIST
              </div>
              <h3 style={{ fontSize: 'var(--text-elderly-title)', color: 'var(--color-navy)' }}>
                What {patientFirstName} needs from the market:
              </h3>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '18px',
              fontWeight: 800,
              color: 'var(--color-teal)',
              background: 'var(--color-teal-soft)',
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)'
            }}>
              <Clock size={20} />
              <span>{countdown}s</span>
            </div>
          </div>

          {/* List display */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '16px',
            marginBottom: '28px'
          }}>
            {memorizeList.map((item, idx) => (
              <div
                key={item.id}
                style={{
                  background: 'var(--color-bg-patient)',
                  border: '2px solid var(--color-teal)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px 12px',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '42px', marginBottom: '8px' }}>{item.emoji}</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-navy)' }}>
                  {item.name}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={handleVoiceListen}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                background: 'var(--color-navy)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Volume2 size={20} />
              <span>Listen</span>
            </button>

            <button
              onClick={proceedToRecall}
              className="patient-btn patient-btn-secondary"
            >
              I Am Ready to Choose
            </button>
          </div>
        </div>
      )}

      {/* Recall Stage */}
      {gameState === 'recall' && (
        <div className="patient-card" style={{ padding: '28px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: 'var(--text-elderly-title)', color: 'var(--color-navy)', marginBottom: '6px' }}>
              Which items were on {patientFirstName}'s list?
            </h3>
            <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)' }}>
              Select {memorizeList.length} items that you remember ({selectedItems.length} of {memorizeList.length} selected).
            </p>
          </div>

          {/* Options Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '16px',
            marginBottom: '28px'
          }}>
            {optionsList.map(item => {
              const isSelected = selectedItems.includes(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => handleToggleSelect(item.id)}
                  style={{
                    padding: '16px 12px',
                    borderRadius: 'var(--radius-lg)',
                    border: `2px solid ${isSelected ? 'var(--color-teal)' : 'var(--color-border)'}`,
                    background: isSelected ? 'var(--color-teal-soft)' : 'var(--color-bg-surface)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '38px' }}>{item.emoji}</span>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-navy)' }}>
                    {item.name}
                  </span>
                  {isSelected && (
                    <span style={{
                      fontSize: '12px',
                      color: 'var(--color-teal)',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <CheckCircle2 size={14} /> Selected
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleSubmit}
            disabled={selectedItems.length === 0}
            className="patient-btn patient-btn-primary"
            style={{ width: '100%' }}
          >
            Confirm Selected Items
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
