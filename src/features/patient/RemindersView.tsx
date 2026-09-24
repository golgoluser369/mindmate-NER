import React, { useState } from 'react';
import { LanguageCode } from '../../models/types';
import { getStrings } from '../../locales';
import { offlineService } from '../../services/offlineService';
import { voiceService } from '../../services/voiceService';
import { getLocalizedReminder } from '../../services/localizationHelper';
import { Bell, CheckCircle2, Clock, Volume2, Droplets, Pill, Calendar, Footprints } from 'lucide-react';

interface RemindersViewProps {
  language: LanguageCode;
}

export const RemindersView: React.FC<RemindersViewProps> = ({ language }) => {
  const strings = getStrings(language);
  const [reminders, setReminders] = useState(offlineService.getReminders());
  const isOffline = offlineService.isOffline();

  const handleUpdateStatus = (id: string, status: 'completed' | 'snoozed') => {
    offlineService.updateReminderStatus(id, status);
    setReminders(offlineService.getReminders());
  };

  const handleListenReminder = (title: string, detail: string) => {
    voiceService.speakText(`${title}. ${detail}`, language);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'medicine': return <Pill size={24} style={{ color: 'var(--color-navy)' }} />;
      case 'hydration': return <Droplets size={24} style={{ color: '#2B6CB0' }} />;
      case 'daily_activity': return <Footprints size={24} style={{ color: 'var(--color-teal)' }} />;
      case 'appointment': return <Calendar size={24} style={{ color: 'var(--color-warning)' }} />;
      default: return <Bell size={24} />;
    }
  };

  const pendingHydration = reminders.find(r => r.category === 'hydration' && r.status === 'pending');
  const locPending = pendingHydration ? getLocalizedReminder(pendingHydration, language) : null;

  return (
    <div style={{ maxWidth: 'var(--max-patient-width)', margin: '0 auto', padding: '16px 16px 40px' }}>
      {/* Header */}
      <div style={{
        background: 'var(--color-bg-surface)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-card)',
        marginBottom: '20px'
      }}>
        <h1 style={{ fontSize: 'var(--text-elderly-title)', color: 'var(--color-navy)', marginBottom: '6px' }}>
          {strings.remindersTitle}
        </h1>
        <p style={{ fontSize: 'var(--text-elderly-caption)', color: 'var(--color-text-secondary)' }}>
          {strings.remindersAssistanceSub || 'Assistance for medicines, hydration, and daily activities.'}
        </p>
      </div>

      {/* ACTIVE HYDRATION ALERT PROMPT (Elderly friendly) */}
      {pendingHydration && (
        <div style={{
          background: 'var(--color-bg-surface)',
          border: '2px solid #2B6CB0',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          boxShadow: 'var(--shadow-md)',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: '#EBF8FF',
            color: '#2B6CB0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px'
          }}>
            <Droplets size={34} />
          </div>

          <h2 style={{ fontSize: 'var(--text-elderly-instruction)', color: 'var(--color-navy)', marginBottom: '8px' }}>
            {strings.hydrationAlert}
          </h2>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '20px'
          }}>
            <button
              onClick={() => handleListenReminder(locPending ? locPending.title : pendingHydration.title, locPending ? locPending.detail : pendingHydration.detail)}
              className="btn btn-outline"
              style={{ minHeight: '44px', padding: '6px 14px', fontSize: '15px' }}
            >
              <Volume2 size={18} />
              <span>{strings.voiceListen}</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button
              onClick={() => handleUpdateStatus(pendingHydration.id, 'completed')}
              className="btn btn-primary btn-large-elderly"
              style={{ background: 'var(--color-success)' }}
            >
              <CheckCircle2 size={22} />
              <span>{strings.done}</span>
            </button>

            <button
              onClick={() => handleUpdateStatus(pendingHydration.id, 'snoozed')}
              className="btn btn-subtle btn-large-elderly"
            >
              <Clock size={20} />
              <span>{strings.remindLater}</span>
            </button>
          </div>
        </div>
      )}

      {/* Reminders List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {reminders.map(rem => {
          const isCompleted = rem.status === 'completed';
          const locRem = getLocalizedReminder(rem, language);
          return (
            <div
              key={rem.id}
              className="patient-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '18px 20px',
                borderLeft: isCompleted ? '5px solid var(--color-success)' : '5px solid var(--color-warning)',
                opacity: isCompleted ? 0.78 : 1
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-bg-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {getCategoryIcon(rem.category)}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                      {rem.timeStr}
                    </span>
                    {isCompleted && (
                      <span style={{
                        fontSize: '12px',
                        background: 'var(--color-success-soft)',
                        color: 'var(--color-success)',
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 700
                      }}>
                        {strings.completedStatus}
                      </span>
                    )}
                  </div>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: 'var(--color-navy)',
                    textDecoration: isCompleted ? 'line-through' : 'none'
                  }}>
                    {locRem.title}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    {locRem.detail}
                  </div>
                </div>
              </div>

              <div>
                {!isCompleted ? (
                  <button
                    onClick={() => handleUpdateStatus(rem.id, 'completed')}
                    className="btn btn-primary"
                    style={{ minHeight: '44px', padding: '8px 16px', fontSize: '15px' }}
                  >
                    {strings.done}
                  </button>
                ) : (
                  <div style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={24} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
