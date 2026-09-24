import React, { useState } from 'react';
import { LanguageCode, NER_LANGUAGES } from '../../models/types';
import { offlineService } from '../../services/offlineService';
import { 
  X, 
  Settings, 
  Globe, 
  Volume2, 
  Type, 
  Bell, 
  Database, 
  UserCheck, 
  ShieldCheck, 
  RotateCcw,
  CheckCircle2,
  Download
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  textSize: 'normal' | 'large' | 'xlarge';
  onTextSizeChange: (size: 'normal' | 'large' | 'xlarge') => void;
  voiceEnabled: boolean;
  onVoiceToggle: (enabled: boolean) => void;
  onDataRefresh?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  language,
  onLanguageChange,
  textSize,
  onTextSizeChange,
  voiceEnabled,
  onVoiceToggle,
  onDataRefresh
}) => {
  const patient = offlineService.getPatient();
  const sessions = offlineService.getSessions();
  const reminders = offlineService.getReminders();
  const memories = offlineService.getMemories();
  const syncQueue = offlineService.getSyncQueue();

  const [activeSubTab, setActiveSubTab] = useState<'general' | 'storage' | 'caregiver' | 'privacy'>('general');
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExportData = () => {
    const backupData = {
      patient,
      sessions,
      reminders,
      memories,
      syncQueue,
      exportedAt: new Date().toISOString(),
      platform: 'Mind Mate SIH26003'
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mind-mate-patient-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setDownloadNotice('Local patient backup exported safely.');
    setTimeout(() => setDownloadNotice(null), 4000);
  };

  const handleClearCache = () => {
    if (window.confirm('Reset all local storage to demo defaults?')) {
      offlineService.resetToDefaults();
      if (onDataRefresh) onDataRefresh();
      setDownloadNotice('Local demo storage restored to defaults.');
      setTimeout(() => setDownloadNotice(null), 4000);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(10, 28, 51, 0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      zIndex: 1000,
      backdropFilter: 'blur(3px)'
    }}>
      <div style={{
        background: 'var(--color-bg-surface)',
        borderRadius: 'var(--radius-lg)',
        maxWidth: '620px',
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-modal)',
        overflow: 'hidden',
        border: '1.5px solid var(--color-border)'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--color-bg-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Settings size={22} style={{ color: 'var(--color-navy)' }} />
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-navy)' }}>
              Mind Mate Settings & Preferences
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-bg-surface)',
          padding: '0 16px'
        }}>
          {[
            { id: 'general', label: 'Accessibility & Voice' },
            { id: 'storage', label: 'Offline Data' },
            { id: 'caregiver', label: 'Caregiver Link' },
            { id: 'privacy', label: 'Privacy & Safety' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              style={{
                padding: '12px 14px',
                fontSize: '13px',
                fontWeight: 700,
                color: activeSubTab === tab.id ? 'var(--color-navy)' : 'var(--color-text-muted)',
                borderBottom: activeSubTab === tab.id ? '3px solid var(--color-navy)' : '3px solid transparent',
                marginBottom: '-1px',
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* TAB 1: GENERAL & ACCESSIBILITY */}
          {activeSubTab === 'general' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Text Sizing (Section 41 & 55) */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '8px' }}>
                  <Type size={18} />
                  <span>Text Sizing for Elderly Comfort:</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '8px' }}>
                  {[
                    { id: 'normal', label: 'Standard', desc: 'Default (18px base)' },
                    { id: 'large', label: 'Large', desc: 'Senior (+2px)' },
                    { id: 'xlarge', label: 'Extra Large', desc: 'Maximum (+4px)' }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => onTextSizeChange(opt.id as any)}
                      style={{
                        padding: '12px 8px',
                        borderRadius: 'var(--radius-md)',
                        border: textSize === opt.id ? '2px solid var(--color-navy)' : '1px solid var(--color-border)',
                        background: textSize === opt.id ? 'var(--color-navy-soft)' : 'var(--color-bg-surface)',
                        color: textSize === opt.id ? 'var(--color-navy)' : 'var(--color-text-secondary)',
                        textAlign: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontWeight: 800, fontSize: '15px' }}>{opt.label}</div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Language Selection */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 700, color: 'var(--color-navy)' }}>
                    <Globe size={18} />
                    <span>Interface Language (NER Regional & National):</span>
                  </label>
                  <span style={{ fontSize: '12px', color: 'var(--color-teal)', fontWeight: 600 }}>
                    8 Sister States Covered
                  </span>
                </div>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', 
                  gap: '8px',
                  maxHeight: '220px',
                  overflowY: 'auto',
                  paddingRight: '4px'
                }}>
                  {NER_LANGUAGES.map(opt => {
                    const isSelected = language === opt.code || (language === 'regional' && opt.code === 'as');
                    return (
                      <button
                        key={opt.code}
                        onClick={() => onLanguageChange(opt.code)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-md)',
                          border: isSelected ? '2px solid var(--color-navy)' : '1px solid var(--color-border)',
                          background: isSelected ? 'var(--color-navy-soft)' : 'var(--color-bg-surface)',
                          color: isSelected ? 'var(--color-navy)' : 'var(--color-text-secondary)',
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 800, fontSize: '14px', color: isSelected ? 'var(--color-navy)' : 'inherit' }}>
                            {opt.nativeName}
                          </span>
                          {isSelected && <CheckCircle2 size={14} style={{ color: 'var(--color-navy)' }} />}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                          <span style={{ color: 'var(--color-text-muted)' }}>{opt.label}</span>
                          <span style={{ 
                            fontSize: '10px', 
                            padding: '1px 5px', 
                            borderRadius: '4px', 
                            background: isSelected ? '#E2E8F0' : 'var(--color-bg-subtle)',
                            color: 'var(--color-text-secondary)',
                            fontWeight: 600
                          }}>
                            {opt.state}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Voice Assistance */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-bg-subtle)',
                border: '1px solid var(--color-border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Volume2 size={22} style={{ color: 'var(--color-teal)' }} />
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-navy)' }}>
                      Voice Assistance
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                      Read activity instructions aloud at 0.88x elderly-adapted speed
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={voiceEnabled}
                  onChange={e => onVoiceToggle(e.target.checked)}
                  style={{ width: '20px', height: '20px', accentColor: 'var(--color-navy)', cursor: 'pointer' }}
                />
              </div>
            </div>
          )}

          {/* TAB 2: OFFLINE DATA & PERSISTENCE */}
          {activeSubTab === 'storage' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                Mind Mate stores all activities, personalized morning routines, reminder logs, and adaptive history locally on this device.
              </div>

              {/* Local Storage Stats Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '10px'
              }}>
                <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Active Patient Profile</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-navy)' }}>{patient.name} ({patient.age || 72}y)</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-teal)', fontWeight: 600 }}>Adaptive Level {patient.currentLevel}</div>
                </div>

                <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Saved Cognitive Sessions</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-navy)' }}>{sessions.length} Recorded</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-success)', fontWeight: 600 }}>100% locally preserved</div>
                </div>

                <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Personal Memories & Routines</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-navy)' }}>{memories.length} Grounded Items</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Tea, Walk, Blue Cup, Family</div>
                </div>

                <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Sync Queue Status</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: syncQueue.length > 0 ? 'var(--color-warning)' : 'var(--color-success)' }}>
                    {syncQueue.length} Pending Events
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Auto-syncs upon reconnect</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  onClick={handleExportData}
                  className="btn btn-outline"
                  style={{ flex: 1, padding: '10px', fontSize: '14px' }}
                >
                  <Download size={16} />
                  <span>Export JSON Backup</span>
                </button>

                <button
                  onClick={handleClearCache}
                  className="btn btn-subtle"
                  style={{ flex: 1, padding: '10px', fontSize: '14px' }}
                >
                  <RotateCcw size={16} />
                  <span>Restore Demo Defaults</span>
                </button>
              </div>

              {downloadNotice && (
                <div style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--color-success-soft)', color: 'var(--color-success)', fontSize: '13px', fontWeight: 600, textAlign: 'center' }}>
                  {downloadNotice}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CAREGIVER LINK */}
          {activeSubTab === 'caregiver' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{
                padding: '16px 20px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-bg-subtle)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'var(--color-navy-soft)',
                  color: 'var(--color-navy)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '20px'
                }}>
                  AS
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-navy)' }}>
                    {patient.caregiverName}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                    Primary Family Caregiver (Daughter)
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-teal)', fontWeight: 600 }}>
                    Connected via Mind Mate Caregiver Portal
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                The connected caregiver receives session performance logs, reminder completion confirmations, and transparent explanations for activity adjustments.
              </div>
            </div>
          )}

          {/* TAB 4: PRIVACY & SAFETY */}
          {activeSubTab === 'privacy' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-bg-patient)',
                border: '1px solid var(--color-border)',
                fontSize: '13px',
                lineHeight: 1.6,
                color: 'var(--color-text-secondary)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-navy)', fontWeight: 800, marginBottom: '8px' }}>
                  <ShieldCheck size={18} />
                  <span>Healthcare Safety & Privacy Charter</span>
                </div>
                <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li><strong>Non-Diagnostic Principle:</strong> Mind Mate is an everyday cognitive-activity platform and daily routine helper. It never diagnoses Alzheimer's, dementia, or any medical condition.</li>
                  <li><strong>No Biometric Surveillance:</strong> No facial recognition, voice biometric capture, or invasive surveillance is conducted.</li>
                  <li><strong>Offline Data Sovereignty:</strong> All session records and family memories remain safely stored on the patient's local device and only synchronize over secure channels when network is available.</li>
                  <li><strong>Explainable Adaptation:</strong> Difficulty changes are calculated by a deterministic formula based on accuracy, response speed, consistency, completion, and recent trend.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'flex-end',
          background: 'var(--color-bg-subtle)'
        }}>
          <button
            onClick={onClose}
            className="btn btn-primary"
            style={{ padding: '8px 24px', fontSize: '14px' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
