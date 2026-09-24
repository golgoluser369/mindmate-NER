import React, { useState, useEffect, useRef } from 'react';
import { LanguageCode, GameSession, AdaptiveDecision } from '../../models/types';
import { getStrings } from '../../locales';
import { offlineService } from '../../services/offlineService';
import { evaluateSessionAdaptively } from '../../services/adaptiveEngine';
import { voiceService } from '../../services/voiceService';
import { SessionResultModal } from './SessionResultModal';
import { RealLifeImage } from '../../services/realLifeAssets';
import { Volume2, Check, ArrowLeft } from 'lucide-react';

interface MemoryItem {
  id: string;
  emoji: string;
  labels: Partial<Record<LanguageCode, string>> & { en: string };
}

const MASTER_ITEM_POOL: MemoryItem[] = [
  {
    id: 'key',
    emoji: '🗝️',
    labels: {
      en: 'Brass Key',
      as: 'পিতলৰ চাবি',
      bn: 'পিতলের চাবি',
      ne: 'पित्तलको चाबी',
      mni: 'পিত্তলগী য়াহংশাং',
      hi: 'पीतल की चाबी',
      brx: 'सिथारि चाबि'
    }
  },
  {
    id: 'cup',
    emoji: '☕',
    labels: {
      en: 'Tea Cup',
      as: 'চাহৰ কাপ',
      bn: 'চায়ের কাপ',
      ne: 'चिया कप',
      mni: 'চা কুপ',
      hi: 'चाय का कप',
      brx: 'साहा कप'
    }
  },
  {
    id: 'flower',
    emoji: '🌸',
    labels: {
      en: 'Kopou Orchid',
      as: 'কপৌ ফুল',
      bn: 'কপৌ অর্কিড',
      ne: 'अर्किड फूल',
      mni: 'কপৌ লৈ',
      hi: 'ऑर्किड फूल',
      brx: 'अरकिड बिबार'
    }
  },
  {
    id: 'bell',
    emoji: '🔔',
    labels: {
      en: 'Puja Bell',
      as: 'পূজাৰ ঘণ্টা',
      bn: 'পূজার ঘণ্টা',
      ne: 'पूजा घण्टी',
      mni: 'পুজা ঘণ্টা',
      hi: 'पूजा की घंटी',
      brx: 'पुजा घन्टा'
    }
  },
  {
    id: 'book',
    emoji: '📖',
    labels: {
      en: 'Prayer Book',
      as: 'নামপুথি',
      bn: 'নামপুথি / প্রার্থনা বই',
      ne: 'प्रार्थना पुस्तक',
      mni: 'লাইরিক',
      hi: 'प्रार्थना पुस्तक',
      brx: 'बिजाब'
    }
  },
  {
    id: 'gamusa',
    emoji: '🧣',
    labels: {
      en: 'Woven Gamusa',
      as: 'ফুলাম গামোচা',
      bn: 'গামোছা',
      ne: 'खादा / गामुछा',
      mni: 'খুদেই',
      hi: 'सूती गमछा',
      brx: 'गामसा'
    }
  }
];

const DISTRACTOR_POOL: MemoryItem[] = [
  {
    id: 'glasses',
    emoji: '👓',
    labels: {
      en: 'Spectacles',
      as: 'চশমা',
      bn: 'চশমা',
      ne: 'चश्मा',
      mni: 'সমিল',
      hi: 'चश्मा',
      brx: 'चस्मा'
    }
  },
  {
    id: 'comb',
    emoji: '🪮',
    labels: {
      en: 'Wooden Comb',
      as: 'কাঠৰ ফণি',
      bn: 'কাঠের চিরুনি',
      ne: 'काठको काँयो',
      mni: 'সমজেৎ',
      hi: 'लकड़ी की कंघी',
      brx: 'खोनथा'
    }
  },
  {
    id: 'clock',
    emoji: '⏰',
    labels: {
      en: 'Table Clock',
      as: 'ঘড়ী',
      bn: 'ঘড়ি',
      ne: 'घडी',
      mni: 'পুং',
      hi: 'घड़ी',
      brx: 'घडि'
    }
  },
  {
    id: 'lantern',
    emoji: '🏮',
    labels: {
      en: 'Oil Lamp / Lantern',
      as: 'মাটিৰ চাকি',
      bn: 'মাটির প্রদীপ',
      ne: 'माटोको दियो',
      mni: 'থাউমৈ',
      hi: 'दीपक / लालटेन',
      brx: 'लांखार'
    }
  },
  {
    id: 'jug',
    emoji: '🏺',
    labels: {
      en: 'Clay Water Jug',
      as: 'মাটিৰ কলহ',
      bn: 'মাটির কলসি',
      ne: 'पानीको जग',
      mni: 'ঈশিং পুম',
      hi: 'मिट्टी की सुराही',
      brx: 'दै जग'
    }
  },
  {
    id: 'pocket_watch',
    emoji: '⏱️',
    labels: {
      en: 'Silver Pocket Watch',
      as: 'ৰূপালী পকেট ঘড়ী',
      bn: 'রুপার পকেট ঘড়ি',
      ne: 'चाँदीको पकेट घडी',
      mni: 'পোকেট পুং',
      hi: 'चांदी की पॉकेट घड़ी',
      brx: 'पकेट घडि'
    }
  }
];

interface MemoryRecallGameProps {
  language: LanguageCode;
  activityId?: 'object_memory' | 'memory_recall';
  onFinish: () => void;
  onBack: () => void;
}

const READY_LABELS: Partial<Record<LanguageCode, string>> & { en: string } = {
  en: 'I am Ready Now',
  as: 'মই এতিয়া প্ৰস্তুত',
  bn: 'আমি এখন প্রস্তুত',
  ne: 'म अहिले तयार छु',
  mni: 'ঐ হৌজিক শেম্লে',
  hi: 'मैं अब तैयार हूँ',
  brx: 'आं दा थियारि'
};

export const MemoryRecallGame: React.FC<MemoryRecallGameProps> = ({
  language,
  activityId = 'object_memory',
  onFinish,
  onBack
}) => {
  const strings = getStrings(language);
  const patient = offlineService.getPatient();
  const currentLevel = patient.currentLevel || 2;

  // Level determines number of target items: Level 1 -> 3, Level 2 -> 4, Level 3 -> 5, Level 4 -> 6
  const targetCount = Math.min(6, Math.max(3, currentLevel + 2));

  const [phase, setPhase] = useState<'memorize' | 'hidden' | 'recall' | 'result'>('memorize');
  const [countdown, setCountdown] = useState(6);
  const [targetItems, setTargetItems] = useState<MemoryItem[]>([]);
  const [displayPool, setDisplayPool] = useState<MemoryItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Performance tracking
  const recallStartTimeRef = useRef<number>(0);
  const [lastSession, setLastSession] = useState<GameSession | null>(null);
  const [lastDecision, setLastDecision] = useState<AdaptiveDecision | null>(null);

  // Initialize targets and distractors
  useEffect(() => {
    const targets = MASTER_ITEM_POOL.slice(0, targetCount);
    setTargetItems(targets);

    // Shuffle targets + 4 distractors for recall
    const pool = [...targets, ...DISTRACTOR_POOL.slice(0, 4)].sort(() => 0.5 - Math.random());
    setDisplayPool(pool);
  }, [targetCount]);

  // Countdown for memorize phase
  useEffect(() => {
    if (phase !== 'memorize') return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setPhase('recall');
      recallStartTimeRef.current = Date.now();
    }
  }, [phase, countdown]);

  const handleSkipCountdown = () => {
    setPhase('recall');
    recallStartTimeRef.current = Date.now();
  };

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(item => item !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const getItemName = (item: MemoryItem) => {
    return item.labels[language] || item.labels.en || '';
  };

  const handleVoiceListen = () => {
    const names = targetItems.map(t => getItemName(t)).join(', ');
    const promptText = `${strings.rememberThese}: ${names}`;
    voiceService.speakText(promptText, language);
  };

  const handleSubmit = () => {
    const responseTimeMs = Date.now() - recallStartTimeRef.current;
    const targetIds = targetItems.map(t => t.id);
    
    let correctHits = 0;
    let falseHits = 0;

    selectedIds.forEach(id => {
      if (targetIds.includes(id)) {
        correctHits++;
      } else {
        falseHits++;
      }
    });

    const missed = targetIds.length - correctHits;
    const accuracy = Math.round(Math.max(0, (correctHits / targetIds.length) * 100 - (falseHits * 10)));
    
    // Rating
    let speedRating: 'Fast' | 'Good' | 'Moderate' | 'Deliberate' = 'Good';
    if (responseTimeMs < 3000) speedRating = 'Fast';
    else if (responseTimeMs > 7000) speedRating = 'Deliberate';
    else if (responseTimeMs > 5000) speedRating = 'Moderate';

    const recentSessions = offlineService.getSessions();
    const evaluation = evaluateSessionAdaptively({
      accuracy,
      responseTimeMs,
      completionRate: 100,
      attempts: 1,
      errors: falseHits + missed,
      recentSessions,
      currentLevel
    }, activityId);

    const actTitle = strings.memoryRecall || (activityId === 'object_memory' ? 'Object Memory' : 'Memory Recall');

    const session: GameSession = {
      id: 'sess-' + Date.now(),
      patientId: patient.id,
      activityId: activityId,
      activityTitle: actTitle,
      timestamp: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      difficultyLevel: currentLevel,
      accuracy,
      responseTimeMs,
      responseSpeedRating: speedRating,
      completionRate: 100,
      consistencyScore: evaluation.metrics.consistency,
      attempts: 1,
      errors: falseHits + missed,
      isPersonalized: false,
      syncStatus: offlineService.isOffline() ? 'pending' : 'synced'
    };

    const decision: AdaptiveDecision = {
      id: 'dec-' + Date.now(),
      sessionId: session.id,
      patientId: patient.id,
      timestamp: session.timestamp,
      previousLevel: evaluation.previousLevel,
      newLevel: evaluation.newLevel,
      performanceScore: evaluation.score,
      metrics: evaluation.metrics,
      decision: evaluation.decision,
      reason: evaluation.reason,
      clinicalDisclaimer: evaluation.clinicalDisclaimer
    };

    // Persist
    offlineService.saveSession(session);
    offlineService.saveDecision(decision);

    // Update patient current level
    if (decision.newLevel !== patient.currentLevel) {
      patient.currentLevel = decision.newLevel;
      offlineService.savePatient(patient);
    }

    setLastSession(session);
    setLastDecision(decision);
    setPhase('result');
  };

  return (
    <div style={{ maxWidth: 'var(--max-patient-width)', margin: '0 auto', padding: '16px' }}>
      {/* Top Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px'
      }}>
        <button
          onClick={onBack}
          className="btn btn-subtle"
          style={{ padding: '8px 14px', minHeight: '44px' }}
          aria-label="Back"
        >
          <ArrowLeft size={20} />
          <span>{strings.navHome}</span>
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '15px',
          color: 'var(--color-navy)',
          fontWeight: 700
        }}>
          <span style={{
            background: 'var(--color-navy-soft)',
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)'
          }}>
            Level {currentLevel}
          </span>
        </div>

        <button
          onClick={handleVoiceListen}
          className="btn btn-outline"
          style={{ padding: '8px 14px', minHeight: '44px', gap: '6px' }}
          title={strings.voiceListen}
        >
          <Volume2 size={20} />
          <span style={{ fontSize: '15px' }}>{strings.voiceListen}</span>
        </button>
      </div>

      {/* PHASE 1: MEMORIZE */}
      {phase === 'memorize' && (
        <div style={{
          background: 'var(--color-bg-surface)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px 24px',
          boxShadow: 'var(--shadow-card)',
          border: '1px solid var(--color-border)',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: 'var(--text-elderly-title)', color: 'var(--color-navy)', marginBottom: '8px' }}>
            {strings.rememberThese}
          </h2>
          <p style={{ fontSize: 'var(--text-elderly-caption)', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
            {strings.lookCarefully}
          </p>

          {/* Large Target Items Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
            gap: '14px',
            marginBottom: '32px'
          }}>
            {targetItems.map(item => (
              <div
                key={item.id}
                style={{
                  background: 'var(--color-bg-patient)',
                  border: '2px solid var(--color-teal-light)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <RealLifeImage
                  assetKey={item.id}
                  size={68}
                  rounded={true}
                  alt={getItemName(item)}
                  style={{
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    border: '1.5px solid rgba(0,0,0,0.06)'
                  }}
                />
                <div style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: 'var(--color-navy)',
                  textAlign: 'center'
                }}>
                  {getItemName(item)}
                </div>
              </div>
            ))}
          </div>

          {/* Countdown & Skip */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--color-navy-soft)',
              color: 'var(--color-navy)',
              fontSize: '24px',
              fontWeight: 800
            }}>
              {countdown}s
            </div>

            <button
              onClick={handleSkipCountdown}
              className="btn btn-primary btn-large-elderly"
              style={{ width: '100%', maxWidth: '340px' }}
            >
              {READY_LABELS[language] || 'I am Ready Now'}
            </button>
          </div>
        </div>
      )}

      {/* PHASE 2: RECALL */}
      {phase === 'recall' && (
        <div style={{
          background: 'var(--color-bg-surface)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px 24px',
          boxShadow: 'var(--shadow-card)',
          border: '1px solid var(--color-border)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: 'var(--text-elderly-title)', color: 'var(--color-navy)', marginBottom: '8px' }}>
              {strings.whichDidYouSee}
            </h2>
            <p style={{ fontSize: 'var(--text-elderly-caption)', color: 'var(--color-text-secondary)' }}>
              {strings.selectYourAnswers} ({selectedIds.length} / {targetItems.length} selected)
            </p>
          </div>

          {/* Display Pool Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '12px',
            marginBottom: '28px'
          }}>
            {displayPool.map(item => {
              const isSelected = selectedIds.includes(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => handleToggleSelect(item.id)}
                  style={{
                    background: isSelected ? 'var(--color-teal-soft)' : 'var(--color-bg-subtle)',
                    border: isSelected ? '2.5px solid var(--color-teal)' : '1.5px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    textAlign: 'left',
                    minHeight: '72px',
                    transition: 'all 0.15s ease',
                    position: 'relative'
                  }}
                  aria-pressed={isSelected}
                >
                  <RealLifeImage
                    assetKey={item.id}
                    size={46}
                    rounded={true}
                    alt={getItemName(item)}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: 700,
                      color: isSelected ? 'var(--color-teal-dark)' : 'var(--color-text-primary)'
                    }}>
                      {getItemName(item)}
                    </div>
                  </div>
                  {isSelected && (
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'var(--color-teal)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Check size={18} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleSubmit}
            disabled={selectedIds.length === 0}
            className="btn btn-primary btn-large-elderly"
            style={{
              width: '100%',
              opacity: selectedIds.length === 0 ? 0.6 : 1
            }}
          >
            {strings.submitAnswers}
          </button>
        </div>
      )}

      {/* PHASE 3: RESULT MODAL */}
      {phase === 'result' && lastSession && (
        <SessionResultModal
          session={lastSession}
          decision={lastDecision || undefined}
          language={language}
          onContinue={onFinish}
          onReturnHome={onBack}
        />
      )}
    </div>
  );
};
