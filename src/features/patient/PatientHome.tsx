import React from 'react';
import { LanguageCode, ActivityType } from '../../models/types';
import { getStrings } from '../../locales';
import { offlineService } from '../../services/offlineService';
import { recommendNextActivity } from '../../services/adaptiveEngine';
import { 
  Brain, 
  Target, 
  Shapes, 
  HeartHandshake, 
  Bell, 
  Play, 
  CheckCircle2, 
  Wifi, 
  WifiOff,
  ChevronRight,
  Clock,
  Bot,
  Mic
} from 'lucide-react';

interface PatientHomeProps {
  language: LanguageCode;
  onStartActivity: (type: ActivityType) => void;
  onOpenReminders: () => void;
  onOpenCompanion?: () => void;
}

export const PatientHome: React.FC<PatientHomeProps> = ({
  language,
  onStartActivity,
  onOpenReminders,
  onOpenCompanion
}) => {
  const strings = getStrings(language);
  const patient = offlineService.getPatient();
  const patientFirstName = patient?.name ? patient.name.split(' ')[0] : '';
  const reminders = offlineService.getReminders();
  const sessions = offlineService.getSessions();
  const isOffline = offlineService.isOffline();

  const pendingRemindersCount = reminders.filter(r => r.status === 'pending').length;
  const recommendation = recommendNextActivity(sessions);

  // Map activity details
  const getActivityDetails = (type: ActivityType) => {
    switch (type) {
      case 'memory_recall':
        return {
          title: strings.memoryRecall,
          duration: `3 ${strings.minutes}`,
          category: strings.workingMemory || 'Working Memory',
          icon: <Brain size={28} strokeWidth={1.75} />
        };
      case 'attention':
        return {
          title: strings.attentionGame,
          duration: `3 ${strings.minutes}`,
          category: strings.focusVigilance || 'Focus & Vigilance',
          icon: <Target size={28} strokeWidth={1.75} />
        };
      case 'routine_recall':
        return {
          title: strings.routineRecall,
          duration: `2 ${strings.minutes}`,
          category: strings.dailyRoutineCategory || 'Daily Routine',
          icon: <HeartHandshake size={28} strokeWidth={1.75} />
        };
      case 'pattern_recognition':
      default:
        return {
          title: strings.patternGame,
          duration: `3 ${strings.minutes}`,
          category: strings.patternLogic || 'Pattern Logic',
          icon: <Shapes size={28} strokeWidth={1.75} />
        };
    }
  };

  const primaryActivity = getActivityDetails(recommendation.recommendedType);

  const alternateActivities: ActivityType[] = [
    'memory_recall',
    'attention',
    'routine_recall',
    'pattern_recognition'
  ].filter(t => t !== recommendation.recommendedType) as ActivityType[];

  return (
    <div style={{ maxWidth: 'var(--max-patient-width)', margin: '0 auto', padding: '16px 16px 48px' }}>
      {/* 1. Header Greeting & Connectivity Status */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '20px',
        padding: '8px 4px'
      }}>
        <div>
          <h1 style={{
            fontSize: 'var(--text-elderly-hero)',
            color: 'var(--color-navy)',
            fontWeight: 800,
            lineHeight: 'var(--leading-tight)'
          }}>
            {strings.goodMorning}{patientFirstName ? `, ${patientFirstName}` : ''}
          </h1>
          <p style={{
            fontSize: 'var(--text-elderly-caption)',
            color: 'var(--color-text-secondary)',
            marginTop: '4px'
          }}>
            {strings.welcomeSub}
          </p>
        </div>

        {/* Calm connectivity indicator */}
        <div 
          className={`status-pill ${isOffline ? 'status-offline' : 'status-online'}`}
          style={{ flexShrink: 0, marginTop: '4px' }}
        >
          {isOffline ? <WifiOff size={16} strokeWidth={1.75} /> : <Wifi size={16} strokeWidth={1.75} />}
          <span>{isOffline ? strings.offlineBadge : strings.connected}</span>
        </div>
      </div>

      {/* 2. Primary Action Hero Card: Today's Recommended Activity */}
      <div style={{
        background: 'var(--color-bg-surface)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        border: '1.5px solid var(--color-teal)',
        boxShadow: 'var(--shadow-card)',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <span style={{
            fontSize: '13px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: 'var(--color-teal)'
          }}>
            {strings.todaysActivity || "Today's Activity"}
          </span>
          <span style={{
            fontSize: '14px',
            fontWeight: 700,
            background: 'var(--color-teal-soft)',
            color: 'var(--color-teal-dark)',
            padding: '3px 10px',
            borderRadius: 'var(--radius-sm)'
          }}>
            {strings.level || 'Level'} {patient.currentLevel}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-navy-soft)',
            color: 'var(--color-navy)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {primaryActivity.icon}
          </div>
          <div>
            <h2 style={{
              fontSize: 'var(--text-elderly-title)',
              fontWeight: 800,
              color: 'var(--color-navy)',
              lineHeight: 'var(--leading-tight)'
            }}>
              {primaryActivity.title}
            </h2>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '15px',
              color: 'var(--color-text-secondary)',
              marginTop: '4px'
            }}>
              <span>{primaryActivity.duration}</span>
              <span>•</span>
              <span>{primaryActivity.category}</span>
            </div>
          </div>
        </div>

        {/* Explainable adaptive pacing notice (quiet and credible) */}
        <div style={{
          padding: '10px 14px',
          background: 'var(--color-bg-patient)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--color-border-subtle)',
          fontSize: '14px',
          color: 'var(--color-text-secondary)',
          marginBottom: '20px',
          lineHeight: 'var(--leading-normal)'
        }}>
          {strings.adaptiveNotice}
        </div>

        {/* Primary Action Button */}
        <button
          onClick={() => onStartActivity(recommendation.recommendedType)}
          className="btn btn-primary btn-large-elderly"
          style={{ width: '100%', cursor: 'pointer' }}
        >
          <Play size={22} strokeWidth={2} />
          <span>{strings.beginSession}</span>
        </button>
      </div>

      {/* 2b. Conversational Companion "Saathi" Voice Card */}
      {onOpenCompanion && (
        <div 
          onClick={onOpenCompanion}
          className="patient-card patient-card-interactive"
          style={{
            background: 'linear-gradient(135deg, var(--color-bg-surface) 0%, var(--color-navy-soft) 100%)',
            border: '1.5px solid var(--color-teal)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px 24px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-card)',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-teal) 0%, var(--color-navy) 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: 'var(--shadow-sm)'
            }}>
              <Bot size={28} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-navy)' }}>
                  {strings.companionHeroAction || 'Talk with Saathi (সাৰথি)'}
                </span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--color-teal-soft)',
                  color: 'var(--color-teal-dark)'
                }}>
                  Voice Assistant
                </span>
              </div>
              <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                {strings.companionHeroPrompt || 'Speak or ask anything about your day, medicines, and family'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={(e) => { e.stopPropagation(); onOpenCompanion(); }}
              className="btn btn-primary"
              style={{
                borderRadius: 'var(--radius-full)',
                padding: '10px 18px',
                fontSize: '14px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Mic size={18} />
              <span>Speak</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Daily Reminders (Restrained & Functional) */}
      <div
        onClick={onOpenReminders}
        className="patient-card patient-card-interactive"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          marginBottom: '28px',
          background: 'var(--color-bg-surface)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-md)',
            background: pendingRemindersCount > 0 ? 'var(--color-warning-soft)' : 'var(--color-success-soft)',
            color: pendingRemindersCount > 0 ? 'var(--color-warning)' : 'var(--color-success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {pendingRemindersCount > 0 ? (
              <Bell size={22} strokeWidth={1.75} />
            ) : (
              <CheckCircle2 size={22} strokeWidth={1.75} />
            )}
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-navy)' }}>
              {strings.remindersTitle}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              {pendingRemindersCount > 0 
                ? `${pendingRemindersCount} ${strings.remainingToday}` 
                : (strings.allCaughtUp || 'All caught up for today')}
            </div>
          </div>
        </div>

        <button
          className="btn btn-subtle"
          style={{ padding: '8px 16px', fontSize: '14px', borderRadius: 'var(--radius-sm)' }}
        >
          <span>{strings.view || 'View'}</span>
          <ChevronRight size={16} strokeWidth={1.75} />
        </button>
      </div>

      {/* 4. Alternative Activities (Clean, unboxed list) */}
      <div>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 700,
          color: 'var(--color-navy)',
          marginBottom: '12px',
          paddingLeft: '4px'
        }}>
          {strings.otherActivities || 'Other Cognitive Activities'}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {alternateActivities.map(actType => {
            const details = getActivityDetails(actType);
            return (
              <div
                key={actType}
                onClick={() => onStartActivity(actType)}
                className="patient-list-item"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--color-bg-subtle)',
                    color: 'var(--color-navy)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {React.cloneElement(details.icon, { size: 20 })}
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-navy)' }}>
                      {details.title}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                      {details.duration} • {details.category}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-navy)' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>{strings.start || 'Start'}</span>
                  <ChevronRight size={18} strokeWidth={1.75} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
