import React, { useState, useRef } from 'react';
import { LanguageCode, GameSession, AdaptiveDecision } from '../../models/types';
import { getStrings } from '../../locales';
import { offlineService } from '../../services/offlineService';
import { evaluateAndAdaptSession } from '../../services/adaptiveEngine';
import { SessionResultModal } from './SessionResultModal';
import { voiceService } from '../../services/voiceService';
import { BookOpen, ArrowLeft, Volume2, CheckCircle2, ChevronRight } from 'lucide-react';

interface StoryRecallGameProps {
  language: LanguageCode;
  onFinish: () => void;
  onBack: () => void;
}

interface QuestionItem {
  prompt: string;
  options: string[];
  correctIndex: number;
}

export const StoryRecallGame: React.FC<StoryRecallGameProps> = ({
  language,
  onFinish,
  onBack
}) => {
  const strings = getStrings(language);
  const patient = offlineService.getPatient();
  const patientFirstName = patient?.name ? patient.name.split(' ')[0] : 'The patient';
  const currentLevel = patient.currentLevel || 2;

  const [gameState, setGameState] = useState<'reading' | 'questions' | 'completed'>('reading');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [score, setScore] = useState<number>(0);

  const [finishedSession, setFinishedSession] = useState<GameSession | null>(null);
  const [adaptiveDecision, setAdaptiveDecision] = useState<AdaptiveDecision | null>(null);

  const startTimeRef = useRef<number>(0);

  const story = `${patientFirstName} visited the quiet morning market near the riverbank.
She bought fresh green tea leaves and sweet seasonal oranges.
After meeting her neighbor for a gentle greeting, she returned home before lunch.`;

  const questions: QuestionItem[] = [
    {
      prompt: `Where did ${patientFirstName} visit in the morning?`,
      options: ["The quiet morning market", "The railway station", "The book library"],
      correctIndex: 0
    },
    {
      prompt: `What items did ${patientFirstName} buy?`,
      options: ["Tea leaves and seasonal oranges", "Shoes and umbrella", "Rice and salt"],
      correctIndex: 0
    },
    {
      prompt: `When did ${patientFirstName} return home?`,
      options: ["Before lunch", "Late in the evening", "At night"],
      correctIndex: 0
    }
  ];

  const handleStartQuestions = () => {
    setGameState('questions');
    startTimeRef.current = Date.now();
    setCurrentQuestionIdx(0);
    setScore(0);
  };

  const handleAnswer = (selectedIndex: number) => {
    const isCorrect = selectedIndex === questions[currentQuestionIdx].correctIndex;
    const newScore = isCorrect ? score + 1 : score;
    setScore(newScore);

    if (currentQuestionIdx + 1 < questions.length) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      // Completed all questions
      const responseTime = Date.now() - startTimeRef.current;
      const accuracy = Math.round((newScore / questions.length) * 100);
      const errors = questions.length - newScore;

      const { session, decision } = evaluateAndAdaptSession({
        patientId: patient.id,
        activityId: 'story_recall',
        activityTitle: 'Story Recall',
        accuracy,
        responseTimeMs: responseTime,
        completionRate: 100,
        attempts: questions.length,
        errors,
        difficultyLevel: currentLevel,
        isPersonalized: false
      });

      setFinishedSession(session);
      setAdaptiveDecision(decision);
      setGameState('completed');
    }
  };

  const handleVoiceListenStory = () => {
    voiceService.speak(story, language);
  };

  const handleVoiceListenQuestion = () => {
    voiceService.speak(questions[currentQuestionIdx].prompt, language);
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
          Level {currentLevel} • Story Recall
        </div>
      </div>

      {/* Reading Stage */}
      {gameState === 'reading' && (
        <div className="patient-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-navy-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-navy)'
              }}>
                <BookOpen size={28} />
              </div>
              <h2 style={{ fontSize: 'var(--text-elderly-title)', color: 'var(--color-navy)' }}>
                Morning Story
              </h2>
            </div>

            <button
              onClick={handleVoiceListenStory}
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
              <span>Read Aloud</span>
            </button>
          </div>

          <div style={{
            background: 'var(--color-bg-patient)',
            border: '1.5px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px',
            fontSize: '22px',
            lineHeight: 1.8,
            color: 'var(--color-navy)',
            whiteSpace: 'pre-line',
            marginBottom: '32px'
          }}>
            {story}
          </div>

          <button
            onClick={handleStartQuestions}
            className="patient-btn patient-btn-primary"
            style={{ width: '100%' }}
          >
            I Finished Reading (Continue to Questions)
          </button>
        </div>
      )}

      {/* Questions Stage */}
      {gameState === 'questions' && (
        <div className="patient-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-teal)' }}>
              QUESTION {currentQuestionIdx + 1} OF {questions.length}
            </span>

            <button
              onClick={handleVoiceListenQuestion}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                background: 'var(--color-bg-patient)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                color: 'var(--color-navy)'
              }}
            >
              <Volume2 size={18} />
              <span>Listen Question</span>
            </button>
          </div>

          <h3 style={{
            fontSize: 'var(--text-elderly-title)',
            color: 'var(--color-navy)',
            marginBottom: '24px',
            lineHeight: 1.4
          }}>
            {questions[currentQuestionIdx].prompt}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {questions[currentQuestionIdx].options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                className="patient-btn patient-btn-secondary"
                style={{
                  justifyContent: 'space-between',
                  padding: '18px 24px',
                  fontSize: '19px'
                }}
              >
                <span>{opt}</span>
                <ChevronRight size={22} style={{ color: 'var(--color-teal)' }} />
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
