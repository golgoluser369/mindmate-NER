import React from 'react';
import { 
  Heart, 
  SlidersHorizontal, 
  Brain, 
  Clock, 
  Calendar, 
  WifiOff, 
  RefreshCw, 
  LineChart, 
  ShieldCheck, 
  ArrowRight,
  ArrowDown
} from 'lucide-react';

export const ProductStoryView: React.FC = () => {
  const journeySteps = [
    {
      step: '01',
      actor: 'ELDERLY PATIENT',
      title: 'Meera Sharma (72)',
      desc: 'Opens Mind Mate on a simple tablet in Tezpur, Assam. No complex logins or diagnostic questions.',
      icon: Heart,
      color: '#2B6CB0'
    },
    {
      step: '02',
      actor: 'ACCESSIBILITY',
      title: 'Elderly-First Welcome',
      desc: 'Warm greeting, large readable fonts (22px+), and gentle voice fallback in Assamese, Hindi, or English.',
      icon: Clock,
      color: '#319795'
    },
    {
      step: '03',
      actor: 'COGNITIVE ACTIVITY',
      title: 'Working Memory Recall',
      desc: 'Remember familiar culturally grounded items: Kopou orchid, brass key, tea cup, woven gamusa.',
      icon: Brain,
      color: '#4A5568'
    },
    {
      step: '04',
      actor: 'OBSERVE & MEASURE',
      title: 'Real-Time Performance Engine',
      desc: 'Calculates Accuracy (92%), Response Speed (2.4s), and Consistency without medical scoring claims.',
      icon: LineChart,
      color: '#805AD5'
    },
    {
      step: '05',
      actor: 'ADAPTATION',
      title: 'Explainable Difficulty Adjustment',
      desc: 'Score 0.89 exceeds adaptation threshold (>0.80). Platform transparently adapts from Level 2 to Level 3.',
      icon: SlidersHorizontal,
      color: '#D69E2E'
    },
    {
      step: '06',
      actor: 'PERSONALIZATION',
      title: 'Personal Routine Recall',
      desc: 'Engages with real caregiver-configured memories: Meera\'s morning tea, blood pressure medicine, and courtyard walk.',
      icon: Heart,
      color: '#DD6B20'
    },
    {
      step: '07',
      actor: 'ASSISTANCE',
      title: 'Daily Reminders & Care',
      desc: 'Reminder rings for Midday Hydration. Meera taps "Done". Caregiver is updated on adherence.',
      icon: Clock,
      color: '#319795'
    },
    {
      step: '08',
      actor: 'RESILIENCE',
      title: 'Offline-First Local Storage',
      desc: 'When village broadband disconnects, session saves immediately to IndexedDB/local persistence.',
      icon: WifiOff,
      color: '#E53E3E'
    },
    {
      step: '09',
      actor: 'CONTINUITY',
      title: 'Automatic Sync Queue',
      desc: 'Network restores. Sync queue pushes sessions and reminder events safely to caregiver cloud portal.',
      icon: RefreshCw,
      color: '#2B6CB0'
    },
    {
      step: '10',
      actor: 'CAREGIVER',
      title: 'Ananya\'s Caregiver Insight',
      desc: 'Ananya reviews 14-day activity trends, adaptation rationales, and provides loving reassurance.',
      icon: ShieldCheck,
      color: '#38A169'
    }
  ];

  return (
    <div style={{ maxWidth: 'var(--max-dashboard-width)', margin: '0 auto', padding: '32px 20px 80px' }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span style={{
          fontSize: '13px',
          fontWeight: 800,
          color: 'var(--color-teal)',
          background: 'var(--color-teal-soft)',
          padding: '4px 12px',
          borderRadius: 'var(--radius-full)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          SIH26003 Product Experience Story
        </span>
        <h1 style={{ fontSize: '32px', fontWeight: 900, color: 'var(--color-navy)', marginTop: '8px', marginBottom: '12px' }}>
          The Complete Mind Mate Cognitive Care Loop
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--color-text-secondary)', maxWidth: '720px', margin: '0 auto', lineHeight: 1.6 }}>
          "The game is not the product. The adaptive cognitive-support journey connecting the person, their daily routines, and their caregiver is the product."
        </p>
      </div>

      {/* Story Timeline Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
        marginBottom: '40px'
      }}>
        {journeySteps.map((item, idx) => {
          const IconComp = item.icon;
          return (
            <div
              key={idx}
              className="patient-card"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderLeft: `5px solid ${item.color}`
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 800,
                    color: item.color,
                    letterSpacing: '0.5px'
                  }}>
                    STEP {item.step} • {item.actor}
                  </span>

                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-bg-patient)',
                    color: item.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <IconComp size={20} />
                  </div>
                </div>

                <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-navy)', marginBottom: '8px' }}>
                  {item.title}
                </h3>

                <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Quote Box */}
      <div style={{
        background: 'var(--color-navy)',
        color: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        padding: '32px',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '12px', color: '#FFFFFF' }}>
          SIH26003 Closing Vision
        </h2>
        <p style={{ fontSize: '17px', color: 'var(--color-text-light)', maxWidth: '780px', margin: '0 auto', lineHeight: 1.6 }}>
          Mind Mate does not replace clinical neurology. It establishes an accessible, offline-first, adaptive cognitive care continuum that supports dignity, everyday independence, and caregiver peace of mind across North Eastern communities.
        </p>
      </div>
    </div>
  );
};
