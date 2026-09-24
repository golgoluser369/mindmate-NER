import React from 'react';
import { LanguageCode } from '../../models/types';
import { getStrings } from '../../locales';
import { offlineService } from '../../services/offlineService';
import { Play, Volume2, Wifi, WifiOff, Globe } from 'lucide-react';
import { voiceService } from '../../services/voiceService';

interface PatientWelcomeViewProps {
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onBeginSession: () => void;
  onOpenSettings?: () => void;
}

export const PatientWelcomeView: React.FC<PatientWelcomeViewProps> = ({
  language,
  onLanguageChange,
  onBeginSession
}) => {
  const strings = getStrings(language);
  const patient = offlineService.getPatient();
  const patientFirstName = patient?.name ? patient.name.split(' ')[0] : '';
  const isOffline = offlineService.isOffline();

  const handleTestVoice = () => {
    voiceService.speak(
      `${strings.goodMorning}${patientFirstName ? `, ${patientFirstName}` : ''}. ${strings.welcomeSub}`,
      language
    );
  };

  return (
    <div style={{
      maxWidth: '680px',
      margin: '20px auto 40px',
      padding: '24px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
      {/* Welcome Card */}
      <div style={{
        background: 'var(--color-bg-surface)',
        borderRadius: 'var(--radius-lg)',
        padding: '36px 28px',
        border: '1.5px solid var(--color-border)',
        boxShadow: 'var(--shadow-card)',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-flex',
          padding: '8px 16px',
          background: 'var(--color-navy-soft)',
          color: 'var(--color-navy)',
          borderRadius: 'var(--radius-full)',
          fontSize: '14px',
          fontWeight: 800,
          letterSpacing: '0.5px',
          marginBottom: '16px'
        }}>
          {strings.appName}
        </div>

        <h1 style={{
          fontSize: 'var(--text-elderly-hero)',
          fontWeight: 800,
          color: 'var(--color-navy)',
          marginBottom: '10px',
          lineHeight: 1.25
        }}>
          {strings.goodMorning}{patientFirstName ? `, ${patientFirstName}` : ''}
        </h1>

        <p style={{
          fontSize: 'var(--text-elderly-instruction)',
          color: 'var(--color-text-secondary)',
          lineHeight: 1.5,
          maxWidth: '520px',
          margin: '0 auto 28px'
        }}>
          {strings.welcomeSub}
        </p>

        {/* Primary Call to Action */}
        <button
          onClick={onBeginSession}
          className="btn btn-primary btn-large-elderly"
          style={{
            width: '100%',
            maxWidth: '440px',
            margin: '0 auto 24px',
            fontSize: 'var(--text-elderly-button)',
            fontWeight: 800,
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <Play size={26} />
          <span>{strings.beginSession}</span>
        </button>

        {/* Language Selection Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          paddingTop: '16px',
          borderTop: '1px solid var(--color-border-subtle)',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontSize: '15px', color: 'var(--color-text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Globe size={18} />
            <span>Language:</span>
          </span>

          <button
            onClick={() => onLanguageChange('en')}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '15px',
              fontWeight: 700,
              background: language === 'en' ? 'var(--color-navy)' : 'var(--color-bg-subtle)',
              color: language === 'en' ? '#FFFFFF' : 'var(--color-text-primary)',
              border: '1px solid var(--color-border)'
            }}
          >
            English
          </button>

          <button
            onClick={() => onLanguageChange('hi')}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '15px',
              fontWeight: 700,
              background: language === 'hi' ? 'var(--color-navy)' : 'var(--color-bg-subtle)',
              color: language === 'hi' ? '#FFFFFF' : 'var(--color-text-primary)',
              border: '1px solid var(--color-border)'
            }}
          >
            हिन्दी
          </button>

          <button
            onClick={() => onLanguageChange('regional')}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '15px',
              fontWeight: 700,
              background: language === 'regional' ? 'var(--color-navy)' : 'var(--color-bg-subtle)',
              color: language === 'regional' ? '#FFFFFF' : 'var(--color-text-primary)',
              border: '1px solid var(--color-border)'
            }}
          >
            অসমীয়া (NER)
          </button>
        </div>
      </div>

      {/* Feature Pills Banner (Section 10) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '14px'
      }}>
        {/* Voice Assistance Pill */}
        <div
          onClick={handleTestVoice}
          style={{
            background: 'var(--color-bg-surface)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 18px',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer'
          }}
          title="Click to test voice synthesis"
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'var(--color-teal-soft)',
            color: 'var(--color-teal)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Volume2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-navy)' }}>
              {strings.voiceAvailable}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
              Tap to hear audio instructions
            </div>
          </div>
        </div>

        {/* Offline Ready Pill */}
        <div style={{
          background: 'var(--color-bg-surface)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 18px',
          border: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: isOffline ? 'var(--color-warning-soft)' : 'var(--color-success-soft)',
            color: isOffline ? 'var(--color-warning)' : 'var(--color-success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {isOffline ? <WifiOff size={22} /> : <Wifi size={22} />}
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-navy)' }}>
              {isOffline ? 'Offline Mode Active' : strings.offlineBadge}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
              {isOffline ? 'Sessions save to local device' : 'All activities work without internet'}
            </div>
          </div>
        </div>
      </div>

      {/* Non-diagnostic reassurance footer */}
      <div style={{
        textAlign: 'center',
        padding: '12px',
        fontSize: '13px',
        color: 'var(--color-text-muted)',
        lineHeight: 1.4
      }}>
        Mind Mate is an everyday cognitive-support and memory companion. It does not diagnose or replace professional medical care.
      </div>
    </div>
  );
};
