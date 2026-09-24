import React, { useState, useRef } from 'react';
import { LanguageCode, GameSession, AdaptiveDecision } from '../../models/types';
import { getStrings } from '../../locales';
import { offlineService } from '../../services/offlineService';
import { evaluateAndAdaptSession } from '../../services/adaptiveEngine';
import { SessionResultModal } from './SessionResultModal';
import { voiceService } from '../../services/voiceService';
import { RealLifeImage } from '../../services/realLifeAssets';
import { Mic, ArrowLeft, Volume2, CheckCircle2, AlertCircle } from 'lucide-react';

interface PictureNamingGameProps {
  language: LanguageCode;
  onFinish: () => void;
  onBack: () => void;
}

export const PictureNamingGame: React.FC<PictureNamingGameProps> = ({
  language,
  onFinish,
  onBack
}) => {
  const strings = getStrings(language);
  const patient = offlineService.getPatient();
  const currentLevel = patient.currentLevel || 2;

  const [gameState, setGameState] = useState<'instruction' | 'naming' | 'completed'>('instruction');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  const [finishedSession, setFinishedSession] = useState<GameSession | null>(null);
  const [adaptiveDecision, setAdaptiveDecision] = useState<AdaptiveDecision | null>(null);

  const startTimeRef = useRef<number>(0);

  const item = {
    name: 'TEA CUP',
    emoji: '☕',
    description: 'Ceramic blue tea cup used for morning chai'
  };

  const options = ['TEA CUP', 'WATER JUG', 'BOOK', 'SPECTACLES'];

  const handleStart = () => {
    setGameState('naming');
    startTimeRef.current = Date.now();
  };

  const handleSelectAnswer = (answer: string, usedVoice: boolean = false) => {
    const responseTime = Date.now() - startTimeRef.current;
    const isCorrect = answer.toUpperCase().includes('CUP') || answer.toUpperCase().includes('TEA');

    const { session, decision } = evaluateAndAdaptSession({
      patientId: patient.id,
      activityId: 'picture_naming',
      activityTitle: 'Picture Naming',
      accuracy: isCorrect ? 100 : 40,
      responseTimeMs: responseTime,
      completionRate: 100,
      attempts: 1,
      errors: isCorrect ? 0 : 1,
      difficultyLevel: currentLevel,
      isPersonalized: true
    });

    setFinishedSession(session);
    setAdaptiveDecision(decision);
    setGameState('completed');
  };

  const handleVoiceSpeakAnswer = () => {
    if (!voiceService.isSpeechRecognitionSupported()) {
      setVoiceNotice("Voice input isn't available on this browser. You can select your answer below.");
      setTimeout(() => setVoiceNotice(null), 4000);
      return;
    }

    setIsListening(true);
    setVoiceNotice("Listening... Say the name of the object.");

    voiceService.startListening(
      language,
      (transcript) => {
        setIsListening(false);
        setVoiceNotice(`Heard: "${transcript}"`);
        handleSelectAnswer(transcript, true);
      },
      (err) => {
        setIsListening(false);
        setVoiceNotice("Could not hear clearly. Please tap your answer below.");
      }
    );
  };

  const handleVoiceListenPrompt = () => {
    voiceService.speak("What is this object shown on your screen?", language);
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
          Level {currentLevel} • Picture Naming
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
            <Mic size={44} />
          </div>

          <h2 style={{ fontSize: 'var(--text-elderly-hero)', color: 'var(--color-navy)', marginBottom: '12px' }}>
            Picture Naming
          </h2>
          <p style={{
            fontSize: 'var(--text-elderly-instruction)',
            color: 'var(--color-text-secondary)',
            marginBottom: '28px',
            lineHeight: 1.5
          }}>
            Look at the picture. You can speak your answer using the microphone, or tap the matching word below.
          </p>

          <button
            onClick={handleStart}
            className="patient-btn patient-btn-primary"
            style={{ minWidth: '220px', margin: '0 auto' }}
          >
            Start Naming
          </button>
        </div>
      )}

      {/* Naming Stage */}
      {gameState === 'naming' && (
        <div className="patient-card" style={{ padding: '32px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: 'var(--text-elderly-title)', color: 'var(--color-navy)' }}>
              What is this?
            </h3>

            <button
              onClick={handleVoiceListenPrompt}
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

          {/* Picture Box */}
          <div style={{
            background: 'var(--color-bg-patient)',
            border: '2px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '36px',
            marginBottom: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
              <RealLifeImage
                assetKey="cup"
                size={140}
                rounded={true}
                style={{
                  boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                  border: '3px solid var(--color-border)'
                }}
                alt="Real life ceramic tea cup"
              />
            </div>
            <span style={{ fontSize: '15px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              {item.description}
            </span>
          </div>

          {/* Voice status notice */}
          {voiceNotice && (
            <div style={{
              background: 'var(--color-navy-soft)',
              color: 'var(--color-navy)',
              border: '1px solid var(--color-border)',
              padding: '10px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '15px',
              fontWeight: 600,
              marginBottom: '20px'
            }}>
              {voiceNotice}
            </div>
          )}

          {/* Voice Input Button */}
          <button
            onClick={handleVoiceSpeakAnswer}
            disabled={isListening}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              width: '100%',
              maxWidth: '360px',
              padding: '16px 24px',
              background: isListening ? 'var(--color-warning)' : 'var(--color-teal)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: '19px',
              fontWeight: 700,
              cursor: 'pointer',
              marginBottom: '24px'
            }}
          >
            <Mic size={24} />
            <span>{isListening ? 'Listening...' : '🎙 Speak Answer'}</span>
          </button>

          <div style={{
            fontSize: '15px',
            color: 'var(--color-text-muted)',
            fontWeight: 700,
            marginBottom: '14px',
            letterSpacing: '0.5px'
          }}>
            OR SELECT YOUR ANSWER
          </div>

          {/* Options Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '14px'
          }}>
            {options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelectAnswer(opt, false)}
                className="patient-btn patient-btn-secondary"
                style={{
                  padding: '18px 12px',
                  fontSize: '18px',
                  fontWeight: 800,
                  justifyContent: 'center'
                }}
              >
                {opt}
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
