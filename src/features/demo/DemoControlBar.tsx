import React, { useState } from 'react';
import { offlineService } from '../../services/offlineService';
import { SUPPORT_PROFILES } from '../../services/activityRegistry';
import { SupportProfileId } from '../../models/types';
import { 
  Play, 
  RotateCcw, 
  Wifi, 
  WifiOff, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Layers, 
  HelpCircle, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp,
  BookOpen,
  ShieldCheck,
  Compass,
  HeartHandshake,
  Cpu 
} from 'lucide-react';
import { MLTelemetryModal } from '../caregiver/MLTelemetryModal';

interface DemoControlBarProps {
  onScenarioSelect: (scenario: string) => void;
  onViewChange: (view: 'patient' | 'caregiver' | 'architecture' | 'differentiation' | 'story' | 'validation') => void;
  currentView: string;
  onRefreshData: () => void;
  onOpenPresentationGuide?: () => void;
}

export const DemoControlBar: React.FC<DemoControlBarProps> = ({
  onScenarioSelect,
  onViewChange,
  currentView,
  onRefreshData,
  onOpenPresentationGuide
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(() => 
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncToast, setSyncToast] = useState<{ count: number; text: string } | null>(null);
  const [showMLModal, setShowMLModal] = useState<boolean>(false);

  const patient = offlineService.getPatient();
  const isOffline = offlineService.isOffline();
  const pendingSyncCount = offlineService.getSyncQueue().length;

  const handleToggleOffline = () => {
    offlineService.setOfflineSimulation(!isOffline);
    onRefreshData();
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    const result = await offlineService.synchronizePending();
    setTimeout(() => {
      setIsSyncing(false);
      setSyncToast({
        count: result.syncedCount,
        text: result.syncedCount > 0 
          ? `Synced ${result.syncedCount} items with caregiver portal.` 
          : 'All session and reminder data already in sync.'
      });
      onRefreshData();
      setTimeout(() => setSyncToast(null), 4000);
    }, 1000);
  };

  const handleResetDemo = () => {
    offlineService.resetToDefaults();
    onRefreshData();
    onViewChange('patient');
  };

  const handlePathwaySelect = (profileId: SupportProfileId) => {
    const p = offlineService.getPatient();
    p.supportProfileId = profileId;
    offlineService.savePatient(p);
    onRefreshData();
  };

  return (
    <div style={{
      background: '#0F253E',
      color: '#FFFFFF',
      borderBottom: '2px solid #244265',
      fontSize: '13px',
      position: 'sticky',
      top: 0,
      zIndex: 900,
      boxShadow: '0 2px 10px rgba(0,0,0,0.15)'
    }}>
      {/* Top Strip */}
      <div style={{
        maxWidth: '1380px',
        margin: '0 auto',
        padding: '6px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            background: '#2B6CB0',
            color: '#FFFFFF',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            letterSpacing: '0.5px'
          }}>
            SIH26003
          </span>
          <span style={{ fontWeight: 800, color: '#E2E8F0' }}>
            Mind Mate
          </span>
          <span style={{ color: '#718096' }}>|</span>

          {/* 4 Demo Accounts Switcher */}
          <div className="horizontal-scroll-pills" style={{ alignItems: 'center', background: '#0A1C30', padding: '2px 4px', borderRadius: '6px', border: '1px solid #1E3A5F' }}>
            <button
              onClick={() => {
                offlineService.setActivePatientId('patient-meera-01');
                onViewChange('patient');
                onRefreshData();
              }}
              style={{
                background: currentView === 'patient' && patient.id === 'patient-meera-01' ? '#2B6CB0' : 'transparent',
                color: currentView === 'patient' && patient.id === 'patient-meera-01' ? '#FFFFFF' : '#CBD5E0',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: currentView === 'patient' && patient.id === 'patient-meera-01' ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                minHeight: '28px'
              }}
              title="Patient 1: Meera Sharma (72, Tezpur, Assam) - Memory & Routine Support"
            >
              👤 Meera (Pt 1)
            </button>

            <button
              onClick={() => {
                offlineService.setActivePatientId('patient-tenzing-02');
                onViewChange('patient');
                onRefreshData();
              }}
              style={{
                background: currentView === 'patient' && patient.id === 'patient-tenzing-02' ? '#2B6CB0' : 'transparent',
                color: currentView === 'patient' && patient.id === 'patient-tenzing-02' ? '#FFFFFF' : '#CBD5E0',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: currentView === 'patient' && patient.id === 'patient-tenzing-02' ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                minHeight: '28px'
              }}
              title="Patient 2: Tenzing Norbu (68, Gangtok, Sikkim) - Vascular-Cognitive Support"
            >
              👤 Tenzing (Pt 2)
            </button>

            <button
              onClick={() => {
                offlineService.setActivePatientId('patient-biren-03');
                onViewChange('patient');
                onRefreshData();
              }}
              style={{
                background: currentView === 'patient' && patient.id === 'patient-biren-03' ? '#2B6CB0' : 'transparent',
                color: currentView === 'patient' && patient.id === 'patient-biren-03' ? '#FFFFFF' : '#CBD5E0',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: currentView === 'patient' && patient.id === 'patient-biren-03' ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                minHeight: '28px'
              }}
              title="Patient 3: Biren Singha (75, Silchar, Barak Valley) - Attention & Planning"
            >
              👤 Biren (Pt 3)
            </button>

            <button
              onClick={() => {
                onViewChange('caregiver');
                onRefreshData();
              }}
              style={{
                background: currentView === 'caregiver' ? '#0F766E' : 'transparent',
                color: currentView === 'caregiver' ? '#FFFFFF' : '#99F6E4',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: currentView === 'caregiver' ? 700 : 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                minHeight: '28px'
              }}
              title="Caregiver: Ananya Sharma (Fleet Coordinator with access to all 3 patients)"
            >
              🩺 Caregiver Ananya
            </button>
          </div>
        </div>

        {/* View Switchers & Controls */}
        <div className="horizontal-scroll-pills" style={{ alignItems: 'center' }}>

          <button
            onClick={() => onViewChange('story')}
            style={{
              background: currentView === 'story' ? '#2B6CB0' : '#1A365D',
              color: '#FFFFFF',
              border: 'none',
              padding: '4px 10px',
              borderRadius: '4px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Product Story
          </button>

          <button
            onClick={() => onViewChange('validation')}
            style={{
              background: currentView === 'validation' ? '#2B6CB0' : '#1A365D',
              color: '#FFFFFF',
              border: 'none',
              padding: '4px 10px',
              borderRadius: '4px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Validation Testbed
          </button>

          <button
            onClick={() => onViewChange('architecture')}
            style={{
              background: currentView === 'architecture' ? '#2B6CB0' : '#1A365D',
              color: '#FFFFFF',
              border: 'none',
              padding: '4px 10px',
              borderRadius: '4px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Architecture
          </button>

          <button
            onClick={() => onViewChange('differentiation')}
            style={{
              background: currentView === 'differentiation' ? '#2B6CB0' : '#1A365D',
              color: '#FFFFFF',
              border: 'none',
              padding: '4px 10px',
              borderRadius: '4px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Why Mind Mate?
          </button>

          <button
            onClick={() => setShowMLModal(true)}
            style={{
              background: '#805AD5',
              color: '#FFFFFF',
              border: 'none',
              padding: '4px 10px',
              borderRadius: '4px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer'
            }}
          >
            <Cpu size={14} />
            <span>ML Inspector</span>
          </button>

          {onOpenPresentationGuide && (
            <button
              onClick={onOpenPresentationGuide}
              style={{
                background: '#319795',
                color: '#FFFFFF',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '4px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
            >
              <BookOpen size={14} />
              <span>3-Min Guide</span>
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'transparent',
              color: '#A0AEC0',
              border: '1px solid #2D3748',
              padding: '4px 8px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer'
            }}
            title="Toggle Scenario Panel"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expanded Scenario Bar */}
      {isExpanded && (
        <div style={{
          background: '#0B1C30',
          borderTop: '1px solid #1A365D',
          padding: '8px 16px'
        }}>
          <div style={{
            maxWidth: '1380px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {/* Row 1: 1-Click Scenarios & Offline/Sync */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', color: '#A0AEC0', fontWeight: 700, textTransform: 'uppercase' }}>
                  Judge Scenarios:
                </span>

                <button
                  onClick={() => onScenarioSelect('strong')}
                  style={{
                    background: '#143826',
                    color: '#9AE6B4',
                    border: '1px solid #22543D',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                  title="Scenario A: Accuracy 92%, Level 2 -> Level 3"
                >
                  <TrendingUp size={14} />
                  <span>Strong (L2 → L3)</span>
                </button>

                <button
                  onClick={() => onScenarioSelect('average')}
                  style={{
                    background: '#1E3A5F',
                    color: '#BEE3F8',
                    border: '1px solid #2B6CB0',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                  title="Scenario: Accuracy 72%, Level 2 Maintained"
                >
                  <RefreshCw size={14} />
                  <span>Average (Maintain L2)</span>
                </button>

                <button
                  onClick={() => onScenarioSelect('struggling')}
                  style={{
                    background: '#442813',
                    color: '#FBD38D',
                    border: '1px solid #744210',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                  title="Scenario B: Accuracy 48%, Level 3 -> Level 2"
                >
                  <TrendingDown size={14} />
                  <span>Struggling (L3 → L2)</span>
                </button>

                <button
                  onClick={() => onScenarioSelect('personalized')}
                  style={{
                    background: '#1A365D',
                    color: '#90CDF4',
                    border: '1px solid #2B6CB0',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                  title="Scenario D: Patient morning routine activity"
                >
                  <HeartHandshake size={14} />
                  <span>Personal Routine</span>
                </button>

                <button
                  onClick={() => onScenarioSelect('toggle_reminders')}
                  style={{
                    background: '#2D3748',
                    color: '#E2E8F0',
                    border: '1px solid #4A5568',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                  title="Toggle reminder states between Pending and Completed"
                >
                  <CheckCircle2 size={14} />
                  <span>Toggle Reminders</span>
                </button>
              </div>

              {/* Offline & Sync Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={handleToggleOffline}
                  style={{
                    background: isOffline ? '#742A2A' : '#1A202C',
                    color: isOffline ? '#FEB2B2' : '#CBD5E0',
                    border: isOffline ? '1px solid #9B2C2C' : '1px solid #4A5568',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  {isOffline ? <WifiOff size={14} /> : <Wifi size={14} />}
                  <span>{isOffline ? 'Simulating Offline' : 'Online Connected'}</span>
                </button>

                <button
                  onClick={handleSyncNow}
                  disabled={isSyncing}
                  style={{
                    background: '#2B6CB0',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    opacity: isSyncing ? 0.7 : 1
                  }}
                >
                  <RefreshCw size={14} className={isSyncing ? 'spin' : ''} />
                  <span>Sync Now {pendingSyncCount > 0 ? `(${pendingSyncCount})` : ''}</span>
                </button>

                <button
                  onClick={handleResetDemo}
                  style={{
                    background: 'transparent',
                    color: '#E2E8F0',
                    border: '1px solid #4A5568',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                  title="Reset all demo state to starting baseline"
                >
                  <RotateCcw size={14} />
                  <span>Reset Demo</span>
                </button>
              </div>
            </div>

            {/* Row 2: Pathway Matrix Quick Selector (Section 5 & 52) */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              paddingTop: '6px'
            }}>
              <span style={{ fontSize: '11px', color: '#A0AEC0', fontWeight: 700, textTransform: 'uppercase' }}>
                Demonstration Pathway:
              </span>
              {SUPPORT_PROFILES.map(prof => {
                const isSelected = patient.supportProfileId === prof.id;
                return (
                  <button
                    key={prof.id}
                    onClick={() => handlePathwaySelect(prof.id)}
                    style={{
                      background: isSelected ? '#2B6CB0' : 'rgba(255, 255, 255, 0.06)',
                      color: isSelected ? '#FFFFFF' : '#CBD5E0',
                      border: `1px solid ${isSelected ? '#3182CE' : 'rgba(255, 255, 255, 0.15)'}`,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer'
                    }}
                  >
                    {prof.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sync Confirmation Toast */}
      {syncToast && (
        <div style={{
          background: '#22543D',
          color: '#C6F6D5',
          padding: '8px 16px',
          textAlign: 'center',
          fontSize: '13px',
          fontWeight: 600,
          borderTop: '1px solid #276749',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          animation: 'fadeIn 0.2s ease'
        }}>
          <CheckCircle2 size={16} />
          <span>{syncToast.text}</span>
        </div>
      )}

      {/* ML Telemetry Modal */}
      <MLTelemetryModal
        isOpen={showMLModal}
        onClose={() => setShowMLModal(false)}
      />
    </div>
  );
};
