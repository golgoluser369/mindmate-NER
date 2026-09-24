import React, { useState, useRef } from 'react';
import { LanguageCode, GameSession, AdaptiveDecision } from '../../models/types';
import { getStrings } from '../../locales';
import { offlineService } from '../../services/offlineService';
import { evaluateSessionAdaptively } from '../../services/adaptiveEngine';
import { voiceService } from '../../services/voiceService';
import { SessionResultModal } from './SessionResultModal';
import { getLocalizedMemoryItem } from '../../services/localizationHelper';
import { RealLifeImage } from '../../services/realLifeAssets';
import { Volume2, ArrowLeft, HeartHandshake } from 'lucide-react';

interface RoutineOption {
  id: string;
  assetKey: string;
  labels: Record<string, string>;
  icon: string;
  isCorrect: boolean;
}

const ROUTINE_OPTIONS: RoutineOption[] = [
  {
    id: 'meds',
    assetKey: 'medicine',
    icon: '💊',
    isCorrect: true,
    labels: {
      en: 'Take morning medicine',
      as: 'ৰাতিপুৱাৰ ঔষধ সেৱন কৰা',
      bn: 'সকালের ঔষধ খাওয়া',
      ne: 'बिहानको औषधि खानुहोस्',
      mni: 'অয়ুক্কী হিদাক চাবা',
      hi: 'सुबह की दवाई लेना',
      brx: 'फुंनि मुलि लोब'
    }
  },
  {
    id: 'walk',
    assetKey: 'garden_walk',
    icon: '🌿',
    isCorrect: false,
    labels: {
      en: 'Go for a courtyard walk',
      as: 'চোতালৰ বাগিচাত খোজ কঢ়া',
      bn: 'উঠোনের বাগানে হাঁটা',
      ne: 'बगैँचामा टहल्न जानुहोस्',
      mni: 'সুম্বাংদা চৎপা',
      hi: 'बगीचे में टहलने जाना',
      brx: 'बारियाव थाबायनाय'
    }
  },
  {
    id: 'lunch',
    assetKey: 'plate',
    icon: '🥣',
    isCorrect: false,
    labels: {
      en: 'Have lunch with family',
      as: 'পৰিয়ালৰ সৈতে দুপৰীয়াৰ আহাৰ গ্ৰহণ',
      bn: 'পরিবারের সাথে দুপুরের খাবার খাওয়া',
      ne: 'परिवारसँग दिउँसोको खाना खानुहोस्',
      mni: 'ইমুংগী মীওইশিংগা নুংথিলগী চাক চাবা',
      hi: 'दोपहर का भोजन करना',
      brx: 'नखरजों लोगोसे सान्झुफुनि जामुं जानाय'
    }
  },
  {
    id: 'sleep',
    assetKey: 'breathing',
    icon: '🛏️',
    isCorrect: false,
    labels: {
      en: 'Afternoon rest or sleep',
      as: 'দুপৰীয়া জিৰণি বা টোপনি',
      bn: 'দুপুরে বিশ্রাম বা ঘুম',
      ne: 'दिउँसोको आराम वा निद्रा',
      mni: 'নুংথিলদা পোথারবা',
      hi: 'दोपहर का आराम या नींद',
      brx: 'सान्झुफुनि बिखाय लानाय'
    }
  }
];

interface RoutineRecallGameProps {
  language: LanguageCode;
  onFinish: () => void;
  onBack: () => void;
}

export const RoutineRecallGame: React.FC<RoutineRecallGameProps> = ({
  language,
  onFinish,
  onBack
}) => {
  const strings = getStrings(language);
  const patient = offlineService.getPatient();
  const currentLevel = patient.currentLevel || 2;

  const startTimeRef = useRef<number>(Date.now());
  const [phase, setPhase] = useState<'play' | 'result'>('play');
  const [lastSession, setLastSession] = useState<GameSession | null>(null);
  const [lastDecision, setLastDecision] = useState<AdaptiveDecision | null>(null);
  const routines = offlineService.getMemories().filter(m => m.category === 'routine');
  const step1 = routines.find(r => r.sequenceStep === 1) || routines[0];
  const locStep1 = step1 ? getLocalizedMemoryItem(step1, language) : null;

  const getOptionLabel = (opt: RoutineOption) => {
    return opt.labels[language] || opt.labels.as || opt.labels.en;
  };

  const handleVoiceListen = () => {
    const prompt = `${strings.routineTitle}. ${strings.routinePrompt}`;
    voiceService.speakText(prompt, language);
  };

  const handleSelect = (option: RoutineOption) => {
    const responseTimeMs = Date.now() - startTimeRef.current;
    const accuracy = option.isCorrect ? 100 : 0;

    let speedRating: 'Fast' | 'Good' | 'Moderate' | 'Deliberate' = 'Good';
    if (responseTimeMs < 3000) speedRating = 'Fast';
    else if (responseTimeMs > 7000) speedRating = 'Deliberate';

    const recentSessions = offlineService.getSessions();
    const evaluation = evaluateSessionAdaptively({
      accuracy,
      responseTimeMs,
      completionRate: 100,
      attempts: 1,
      errors: option.isCorrect ? 0 : 1,
      recentSessions,
      currentLevel
    }, 'routine_recall');

    const session: GameSession = {
      id: 'sess-' + Date.now(),
      patientId: patient.id,
      activityId: 'routine_recall',
      activityTitle: strings.routineRecall,
      timestamp: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      difficultyLevel: currentLevel,
      accuracy,
      responseTimeMs,
      responseSpeedRating: speedRating,
      completionRate: 100,
      consistencyScore: evaluation.metrics.consistency,
      attempts: 1,
      errors: option.isCorrect ? 0 : 1,
      isPersonalized: true,
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

    offlineService.saveSession(session);
    offlineService.saveDecision(decision);

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
        >
          <ArrowLeft size={20} />
          <span>{strings.navHome}</span>
        </button>

        {/* Personalized Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--color-teal-soft)',
          color: 'var(--color-teal-dark)',
          padding: '4px 10px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '13px',
          fontWeight: 700,
          border: '1px solid var(--color-border-subtle)'
        }}>
          <span>{strings.personalized || 'Personalized'}</span>
        </div>

        <button
          onClick={handleVoiceListen}
          className="btn btn-outline"
          style={{ padding: '8px 14px', minHeight: '44px', gap: '6px' }}
        >
          <Volume2 size={20} />
          <span style={{ fontSize: '15px' }}>{strings.voiceListen}</span>
        </button>
      </div>

      {phase === 'play' && (
        <div style={{
          background: 'var(--color-bg-surface)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px 24px',
          boxShadow: 'var(--shadow-card)',
          border: '1px solid var(--color-border)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--color-navy)',
              fontSize: '18px',
              fontWeight: 700,
              marginBottom: '8px'
            }}>
              <HeartHandshake size={24} style={{ color: 'var(--color-teal)' }} />
              <span>{strings.routineTitle}</span>
            </div>

            <div style={{
              background: 'var(--color-bg-patient)',
              border: '2px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '20px 16px',
              marginTop: '12px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                <RealLifeImage
                  assetKey={step1?.id || 'cup'}
                  category="routine"
                  title={step1?.name}
                  photoUrl={step1?.imageUrl}
                  size={76}
                  rounded={true}
                  alt={locStep1?.name || 'Step 1'}
                />
              </div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                {locStep1 ? `${locStep1.relationshipOrDetail}: ${locStep1.name}` : 'Step 1'}
              </div>
              <h2 style={{ fontSize: 'var(--text-elderly-instruction)', color: 'var(--color-navy)' }}>
                {strings.routinePrompt}
              </h2>
            </div>
          </div>

          {/* Large Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {ROUTINE_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt)}
                className="patient-card patient-card-interactive"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px 20px',
                  minHeight: '76px',
                  border: '2px solid var(--color-border)',
                  textAlign: 'left'
                }}
              >
                <div style={{ flexShrink: 0 }}>
                  <RealLifeImage
                    assetKey={opt.assetKey}
                    category="routine"
                    title={getOptionLabel(opt)}
                    size={48}
                    rounded={true}
                    alt={getOptionLabel(opt)}
                  />
                </div>
                <span style={{
                  fontSize: 'var(--text-elderly-button)',
                  fontWeight: 700,
                  color: 'var(--color-navy)'
                }}>
                  {getOptionLabel(opt)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

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
