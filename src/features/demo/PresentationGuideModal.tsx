import React, { useState } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Play, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  BookOpen
} from 'lucide-react';

interface PresentationGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToStep: (stepId: string) => void;
}

export const PresentationGuideModal: React.FC<PresentationGuideModalProps> = ({
  isOpen,
  onClose,
  onJumpToStep
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);

  if (!isOpen) return null;

  const demoSteps = [
    {
      time: '0:00',
      title: 'Introduction & Problem Context',
      targetView: 'differentiation',
      talkingPoints: [
        'SIH26003: Cognitive Gaming & Memory Assistance for Elderly Dementia Patients in NER.',
        'Primary positioning: Mind Mate is not a diagnosis tool; it is an offline-first adaptive cognitive journey.',
        'Core principle: The game is not the product; the adaptive cognitive care loop is the product.'
      ]
    },
    {
      time: '0:15',
      title: 'Meet Meera Sharma (Elderly Patient App)',
      targetView: 'patient',
      talkingPoints: [
        'Show calm, elderly-friendly UI: Large 48px+ touch targets, clean light palette, high contrast.',
        'Zero complex menus. Shows today\'s 3 recommended activities matching her support profile.',
        'Notice active status: Offline ready, voice assistance ready, 2 reminders.'
      ]
    },
    {
      time: '0:30',
      title: 'Cognitive Engagement: Memory Match',
      targetView: 'patient_memory_match',
      talkingPoints: [
        'Launch Memory Match: Gentle memorization of familiar household objects (tea cups, orchid, woven basket).',
        'Demonstrate accessible audio with the "Listen" button.',
        'Elderly patient plays without time stress or anxiety.'
      ]
    },
    {
      time: '1:05',
      title: 'Measurable Performance & Explainable Adaptation',
      targetView: 'caregiver_adaptive',
      talkingPoints: [
        'Show completion screen: Accuracy 92%, fast response speed, 100% completion.',
        'Demonstrate mathematical adaptation decision: Score 0.89 triggers Level 2 → Level 3 adjustment.',
        'Show clinical disclaimer: Not a diagnosis, strictly activity personalization.'
      ]
    },
    {
      time: '1:35',
      title: 'Personal Routine Memory',
      targetView: 'patient_routine',
      talkingPoints: [
        'Switch to Daily Routine: "After morning tea, what usually comes next?"',
        'Directly grounded in caregiver-configured memories (Tea → Blood Pressure Medicine → Walk).',
        'Non-stereotypical, familiar regional routine.'
      ]
    },
    {
      time: '1:55',
      title: 'Offline-First Resilience & Village Sync',
      targetView: 'patient_offline',
      talkingPoints: [
        'Simulate broadband disconnect: Offline banner activates immediately.',
        'Patient continues activities uninterrupted. Data saves locally in IndexedDB queue.',
        'Simulate reconnect: Automatic synchronization triggers and pushes sessions to caregiver portal.'
      ]
    },
    {
      time: '2:30',
      title: 'Caregiver Portal & Trend Insights',
      targetView: 'caregiver',
      talkingPoints: [
        'Caregiver Ananya reviews interactive 14-day SVG trend chart (Accuracy, Response time, Consistency).',
        'Examines "WHY DID MIND MATE ADJUST THIS ACTIVITY?" formula breakdown.',
        'Ethical alert: Attention Recommended (no fear-mongering disease worsening claims).'
      ]
    },
    {
      time: '3:00',
      title: 'Final Vision & Conclusion',
      targetView: 'story',
      talkingPoints: [
        'Mind Mate closes the loop between elderly user, daily routines, and family caregiver.',
        'Scalable centralized registry supporting all 21 activities across 6 demonstration pathways.',
        'Dignified, accessible, culturally respectful healthcare AI for the North Eastern Region.'
      ]
    }
  ];

  const currentStep = demoSteps[currentStepIdx];

  const handleNext = () => {
    if (currentStepIdx + 1 < demoSteps.length) {
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);
      onJumpToStep(demoSteps[nextIdx].targetView);
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      const prevIdx = currentStepIdx - 1;
      setCurrentStepIdx(prevIdx);
      onJumpToStep(demoSteps[prevIdx].targetView);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      width: '420px',
      maxWidth: 'calc(100vw - 48px)',
      background: '#0A192F',
      color: '#FFFFFF',
      borderRadius: 'var(--radius-lg)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      border: '2px solid #2B6CB0',
      zIndex: 9999,
      overflow: 'hidden'
    }}>
      {/* Top Strip */}
      <div style={{
        background: '#1A365D',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #2B6CB0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={18} style={{ color: '#4FD1C5' }} />
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#E2E8F0', letterSpacing: '0.5px' }}>
            3-MINUTE DEMO GUIDE • STEP {currentStepIdx + 1}/{demoSteps.length}
          </span>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#A0AEC0',
            cursor: 'pointer',
            padding: '2px'
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{
            fontSize: '12px',
            fontWeight: 800,
            background: '#2B6CB0',
            color: '#FFFFFF',
            padding: '2px 8px',
            borderRadius: '4px'
          }}>
            TIMESTAMP: {currentStep.time}
          </span>
        </div>

        <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#FFFFFF', marginBottom: '12px' }}>
          {currentStep.title}
        </h3>

        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 14px',
          marginBottom: '16px'
        }}>
          <div style={{ fontSize: '11px', color: '#A0AEC0', fontWeight: 700, marginBottom: '6px' }}>
            KEY TALKING POINTS FOR JUDGES:
          </div>
          <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '13px', color: '#E2E8F0', lineHeight: 1.5 }}>
            {currentStep.talkingPoints.map((pt, i) => (
              <li key={i} style={{ marginBottom: '4px' }}>{pt}</li>
            ))}
          </ul>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <button
            onClick={handlePrev}
            disabled={currentStepIdx === 0}
            className="btn"
            style={{
              padding: '6px 12px',
              fontSize: '13px',
              background: 'transparent',
              color: currentStepIdx === 0 ? '#4A5568' : '#CBD5E0',
              border: '1px solid #4A5568'
            }}
          >
            <ChevronLeft size={16} />
            <span>Prev</span>
          </button>

          <button
            onClick={() => onJumpToStep(currentStep.targetView)}
            className="btn"
            style={{
              padding: '6px 14px',
              fontSize: '13px',
              background: '#2B6CB0',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 700
            }}
          >
            <span>Jump to View</span>
          </button>

          <button
            onClick={handleNext}
            disabled={currentStepIdx === demoSteps.length - 1}
            className="btn"
            style={{
              padding: '6px 14px',
              fontSize: '13px',
              background: '#319795',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 700
            }}
          >
            <span>Next ({demoSteps[Math.min(demoSteps.length - 1, currentStepIdx + 1)].time})</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
