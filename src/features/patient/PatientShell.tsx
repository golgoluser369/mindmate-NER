import React, { useState } from 'react';
import { LanguageCode, ActivityType, SupportProfileId, NER_LANGUAGES } from '../../models/types';
import { getStrings } from '../../locales';
import { offlineService } from '../../services/offlineService';
import { SUPPORT_PROFILES, ACTIVITY_REGISTRY, getActivitiesForProfile, getProfileById } from '../../services/activityRegistry';
import { getLocalizedActivity, getLocalizedSupportProfile } from '../../services/localizationHelper';
import { PatientHome } from './PatientHome';
import { PersonalMemoryView } from './PersonalMemoryView';
import { RemindersView } from './RemindersView';

// Activity Game Components
import { MemoryRecallGame } from '../activities/MemoryRecallGame';
import { AttentionGame } from '../activities/AttentionGame';
import { PatternGame } from '../activities/PatternGame';
import { RoutineRecallGame } from '../activities/RoutineRecallGame';
import { FindObjectGame } from '../activities/FindObjectGame';
import { ShoppingMemoryGame } from '../activities/ShoppingMemoryGame';
import { RouteMemoryGame } from '../activities/RouteMemoryGame';
import { StoryRecallGame } from '../activities/StoryRecallGame';
import { NumberSequenceGame } from '../activities/NumberSequenceGame';
import { PlanningGame } from '../activities/PlanningGame';
import { PictureNamingGame } from '../activities/PictureNamingGame';
import { RuleSwitchGame } from '../activities/RuleSwitchGame';
import { WhoAmIGame } from '../activities/WhoAmIGame';
import { ObjectSelectionGame } from '../activities/ObjectSelectionGame';
import { SpatialTasksGame } from '../activities/SpatialTasksGame';
import { StepSequencingGame } from '../activities/StepSequencingGame';
import { TapTargetGame } from '../activities/TapTargetGame';
import { FamilyQuizGame } from '../activities/FamilyQuizGame';
import { PicturePairGame } from '../activities/PicturePairGame';
import { SequenceRecallGame } from '../activities/SequenceRecallGame';

import { PatientWelcomeView } from './PatientWelcomeView';
import { SettingsModal } from '../settings/SettingsModal';
import { CompanionChatView } from '../companion/CompanionChatView';
import { FloatingCompanionButton } from '../companion/FloatingCompanionButton';

import { 
  Home, 
  LayoutGrid, 
  Heart, 
  Bell, 
  Bot,
  Wifi, 
  WifiOff, 
  Globe, 
  Volume2, 
  Layers,
  ArrowRight,
  Filter,
  CheckCircle2,
  Info,
  Settings,
  Brain,
  Target,
  Calendar,
  HeartHandshake,
  Shapes,
  Compass,
  ListOrdered,
  ChevronDown,
  X
} from 'lucide-react';

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'memory': return <Brain size={24} strokeWidth={1.75} />;
    case 'attention': return <Target size={24} strokeWidth={1.75} />;
    case 'planning': return <Calendar size={24} strokeWidth={1.75} />;
    case 'routine': return <HeartHandshake size={24} strokeWidth={1.75} />;
    case 'recognition': return <Shapes size={24} strokeWidth={1.75} />;
    case 'spatial': return <Compass size={24} strokeWidth={1.75} />;
    case 'sequencing': return <ListOrdered size={24} strokeWidth={1.75} />;
    default: return <Layers size={24} strokeWidth={1.75} />;
  }
};

interface PatientShellProps {
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  activeScenario?: string;
}

export const PatientShell: React.FC<PatientShellProps> = ({
  language,
  onLanguageChange,
  activeScenario
}) => {
  const strings = getStrings(language);
  const patient = offlineService.getPatient();
  const [activeTab, setActiveTab] = useState<'welcome' | 'home' | 'activities' | 'memory' | 'reminders' | 'companion'>('home');
  const [activeGame, setActiveGame] = useState<ActivityType | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<SupportProfileId>(patient.supportProfileId || 'memory_routine');
  const [showAllActivities, setShowAllActivities] = useState<boolean>(false);
  const [textSize, setTextSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState<boolean>(false);

  const currentLangMeta = NER_LANGUAGES.find(l => l.code === language || (language === 'regional' && l.code === 'as')) || NER_LANGUAGES[0];

  const isOffline = offlineService.isOffline();
  const reminders = offlineService.getReminders();
  const pendingRemindersCount = reminders.filter(r => r.status === 'pending').length;

  const currentProfile = getProfileById(selectedProfileId);
  const profileActivities = showAllActivities 
    ? ACTIVITY_REGISTRY 
    : getActivitiesForProfile(selectedProfileId);

  const handleStartActivity = (type: ActivityType) => {
    setActiveGame(type);
  };

  const handleGameFinish = () => {
    setActiveGame(null);
    setActiveTab('home');
  };

  const handleGameBack = () => {
    setActiveGame(null);
  };

  const handleProfileChange = (newProfileId: SupportProfileId) => {
    setSelectedProfileId(newProfileId);
    const p = offlineService.getPatient();
    p.supportProfileId = newProfileId;
    offlineService.savePatient(p);
  };

  return (
    <div 
      className={`text-size-${textSize}`}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-bg-app)'
      }}
    >
      {/* Patient Top Header Bar */}
      <header style={{
        background: 'var(--color-bg-surface)',
        borderBottom: '1.5px solid var(--color-border)',
        padding: '10px 16px',
        position: 'relative',
        zIndex: 100
      }}>
        <div style={{
          maxWidth: 'var(--max-patient-width)',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px'
        }}>
          {/* Logo & Tagline */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div 
              onClick={() => { setActiveGame(null); setActiveTab('home'); }}
              style={{
                fontSize: '22px',
                fontWeight: 900,
                color: 'var(--color-navy)',
                letterSpacing: '-0.5px',
                cursor: 'pointer'
              }}
            >
              {strings.appName}
            </div>
            <span className="hide-on-mobile" style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
              {strings.adaptiveSupportTagline || 'Adaptive Cognitive Support'}
            </span>
          </div>

          {/* Language Switcher & Network & Settings */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setIsLanguageModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                background: 'var(--color-bg-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--color-navy)',
                minHeight: '36px',
                transition: 'all 0.15s ease'
              }}
              title="Select North Eastern Regional Language (8 Sister States)"
            >
              <Globe size={15} style={{ color: 'var(--color-teal)' }} />
              <span>{currentLangMeta.nativeName}</span>
              <span style={{ 
                fontSize: '10px', 
                background: 'var(--color-navy)', 
                color: '#FFFFFF', 
                padding: '1px 6px', 
                borderRadius: '4px',
                fontWeight: 600
              }}>
                {currentLangMeta.state}
              </span>
              <ChevronDown size={14} style={{ color: 'var(--color-text-muted)' }} />
            </button>

            {/* Network status indicator */}
            <div
              className={`status-pill ${isOffline ? 'status-offline' : 'status-online'}`}
              style={{ fontSize: '12px', padding: '4px 8px' }}
              title={isOffline ? 'Operating offline on local database' : 'Connected to server'}
            >
              {isOffline ? <WifiOff size={14} /> : <Wifi size={14} />}
              <span>{isOffline ? (strings.offline || 'Offline') : (strings.online || 'Online')}</span>
            </div>

            {/* Settings Modal Trigger (Section 41 & 55) */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-bg-subtle)',
                color: 'var(--color-navy)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Elderly Accessibility & System Settings (Section 41 & 55)"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Patient Content Area */}
      <main style={{ flex: 1, paddingBottom: '90px' }}>
        {/* ACTIVE GAME VIEW DISPATCHER */}
        {(activeGame === 'object_memory' || activeGame === 'memory_recall') && (
          <MemoryRecallGame
            language={language}
            activityId={activeGame === 'object_memory' ? 'object_memory' : 'memory_recall'}
            onFinish={handleGameFinish}
            onBack={handleGameBack}
          />
        )}
        {(activeGame === 'attention_challenge' || activeGame === 'attention') && (
          <AttentionGame
            language={language}
            onFinish={handleGameFinish}
            onBack={handleGameBack}
          />
        )}
        {(activeGame === 'pattern' || activeGame === 'pattern_recognition') && (
          <PatternGame
            language={language}
            onFinish={handleGameFinish}
            onBack={handleGameBack}
          />
        )}
        {(activeGame === 'daily_routine' || activeGame === 'routine_recall') && (
          <RoutineRecallGame
            language={language}
            onFinish={handleGameFinish}
            onBack={handleGameBack}
          />
        )}
        {activeGame === 'find_object' && (
          <FindObjectGame
            language={language}
            onFinish={handleGameFinish}
            onBack={handleGameBack}
          />
        )}
        {activeGame === 'shopping_memory' && (
          <ShoppingMemoryGame
            language={language}
            onFinish={handleGameFinish}
            onBack={handleGameBack}
          />
        )}
        {activeGame === 'route_memory' && (
          <RouteMemoryGame
            language={language}
            onFinish={handleGameFinish}
            onBack={handleGameBack}
          />
        )}
        {activeGame === 'story_recall' && (
          <StoryRecallGame
            language={language}
            onFinish={handleGameFinish}
            onBack={handleGameBack}
          />
        )}
        {activeGame === 'number_sequence' && (
          <NumberSequenceGame
            language={language}
            onFinish={handleGameFinish}
            onBack={handleGameBack}
          />
        )}
        {activeGame === 'planning' && (
          <PlanningGame
            language={language}
            onFinish={handleGameFinish}
            onBack={handleGameBack}
          />
        )}
        {activeGame === 'picture_naming' && (
          <PictureNamingGame
            language={language}
            onFinish={handleGameFinish}
            onBack={handleGameBack}
          />
        )}
        {activeGame === 'rule_switch' && (
          <RuleSwitchGame
            language={language}
            onFinish={handleGameFinish}
            onBack={handleGameBack}
          />
        )}
        {activeGame === 'who_am_i' && (
          <WhoAmIGame
            language={language}
            onFinish={handleGameFinish}
            onBack={handleGameBack}
          />
        )}
        {activeGame === 'object_selection' && (
          <ObjectSelectionGame
            language={language}
            onFinish={handleGameFinish}
            onBack={handleGameBack}
          />
        )}
        {activeGame === 'spatial_tasks' && (
          <SpatialTasksGame
            language={language}
            onFinish={handleGameFinish}
            onBack={handleGameBack}
          />
        )}
        {activeGame === 'step_sequencing' && (
          <StepSequencingGame
            language={language}
            onFinish={handleGameFinish}
            onBack={handleGameBack}
          />
        )}
        {activeGame === 'tap_target' && (
          <TapTargetGame
            language={language}
            onFinish={handleGameFinish}
            onBack={handleGameBack}
          />
        )}
        {activeGame === 'family_quiz' && (
          <FamilyQuizGame
            language={language}
            onFinish={handleGameFinish}
            onBack={handleGameBack}
          />
        )}
        {(activeGame === 'picture_pair' || activeGame === 'memory_match') && (
          <PicturePairGame
            language={language}
            onFinish={handleGameFinish}
            onBack={handleGameBack}
          />
        )}
        {activeGame === 'sequence_recall' && (
          <SequenceRecallGame
            language={language}
            onFinish={handleGameFinish}
            onBack={handleGameBack}
          />
        )}

        {/* PRIMARY TABS */}
        {!activeGame && activeTab === 'welcome' && (
          <PatientWelcomeView
            language={language}
            onLanguageChange={onLanguageChange}
            onBeginSession={() => setActiveTab('home')}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {!activeGame && activeTab === 'home' && (
          <PatientHome
            language={language}
            onStartActivity={handleStartActivity}
            onOpenReminders={() => setActiveTab('reminders')}
            onOpenCompanion={() => setActiveTab('companion')}
          />
        )}

        {/* FULL ACTIVITIES LIBRARY & DEMO PATHWAY MATRIX */}
        {!activeGame && activeTab === 'activities' && (
          <div style={{ maxWidth: 'var(--max-patient-width)', margin: '0 auto', padding: '16px 16px 40px' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <h1 style={{ fontSize: 'var(--text-elderly-title)', color: 'var(--color-navy)' }}>
                  {strings.navActivities}
                </h1>
                <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  {strings.showingActivities || 'Showing Activities'}: {profileActivities.length}
                </span>
              </div>
              <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                {strings.librarySubtitle || 'Choose any cognitive activity from your daily library, or filter by demonstration pathway.'}
              </p>
            </div>

            {/* Support Pathway / Demonstration Selector (Sections 2, 5, 52) */}
            <div style={{
              background: 'var(--color-bg-surface)',
              borderRadius: 'var(--radius-lg)',
              padding: '18px 20px',
              border: '1.5px solid var(--color-border)',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Filter size={18} style={{ color: 'var(--color-teal)' }} />
                  <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-navy)', letterSpacing: '0.5px' }}>
                    {strings.choosePathway || 'CHOOSE A DEMONSTRATION PATHWAY'}
                  </span>
                </div>

                <button
                  onClick={() => setShowAllActivities(!showAllActivities)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-teal)',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {showAllActivities ? (strings.curatedOnly || 'Show Curated Only') : (strings.viewAllActivities || 'View All 21 Activities')}
                </button>
              </div>

              {/* Section 5 Mandatory Healthcare Disclaimer */}
              <div style={{
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
                marginBottom: '14px',
                background: 'var(--color-bg-patient)',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Info size={16} style={{ color: 'var(--color-teal)', flexShrink: 0 }} />
                <span>{strings.disclaimerNotice || 'Different support pathways emphasize different cognitive activities. This prototype does not diagnose medical conditions.'}</span>
              </div>

              {/* Profile Selector Pills */}
              <div className="horizontal-scroll-pills" style={{ paddingBottom: '4px' }}>
                {SUPPORT_PROFILES.map(profile => {
                  const isSelected = selectedProfileId === profile.id;
                  const locProfile = getLocalizedSupportProfile(profile, language);
                  return (
                    <button
                      key={profile.id}
                      onClick={() => handleProfileChange(profile.id)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '13px',
                        fontWeight: isSelected ? 800 : 600,
                        background: isSelected ? 'var(--color-navy)' : 'var(--color-bg-patient)',
                        color: isSelected ? '#FFFFFF' : 'var(--color-navy)',
                        border: `1.5px solid ${isSelected ? 'var(--color-navy)' : 'var(--color-border)'}`,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {locProfile.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* List of Activities */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {profileActivities.map(act => {
                const locAct = getLocalizedActivity(act, language);
                return (
                  <div
                    key={act.id}
                    onClick={() => handleStartActivity(act.id)}
                    className="patient-card patient-card-interactive"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '20px 22px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--color-navy-soft)',
                        color: 'var(--color-navy)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {getCategoryIcon(act.category)}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-navy)' }}>
                            {locAct.name}
                          </div>
                          {act.personalizable && (
                            <span style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              color: 'var(--color-teal)',
                              background: 'var(--color-teal-soft)',
                              padding: '2px 8px',
                              borderRadius: '4px'
                            }}>
                              {strings.personalized || 'Personalized'}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                          {locAct.description}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                          {locAct.durationLabel} • {locAct.cognitiveFunction} • {locAct.levelsLabel}
                        </div>
                      </div>
                    </div>

                    <button
                      className="btn btn-primary"
                      style={{ minHeight: '44px', padding: '8px 18px', fontSize: '15px', flexShrink: 0 }}
                    >
                      {strings.start || 'Start'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!activeGame && activeTab === 'memory' && (
          <PersonalMemoryView language={language} />
        )}

        {!activeGame && activeTab === 'reminders' && (
          <RemindersView language={language} />
        )}

        {!activeGame && activeTab === 'companion' && (
          <CompanionChatView
            language={language}
            onLanguageChange={onLanguageChange}
            onBack={() => setActiveTab('home')}
            onNavigateToTab={(t) => setActiveTab(t)}
            onStartActivity={handleStartActivity}
          />
        )}
      </main>

      {/* Elderly Bottom Navigation Bar (Large touch targets >= 48px) */}
      {!activeGame && (
        <nav className="patient-bottom-nav">
          <div className="patient-bottom-nav-inner">
            <button
              onClick={() => setActiveTab('home')}
              className="patient-nav-btn"
              style={{
                color: activeTab === 'home' ? 'var(--color-navy)' : 'var(--color-text-muted)',
                fontWeight: activeTab === 'home' ? 800 : 600,
                borderTop: activeTab === 'home' ? '3px solid var(--color-navy)' : '3px solid transparent'
              }}
            >
              <Home size={20} strokeWidth={1.75} />
              <span>{strings.navHome}</span>
            </button>

            <button
              onClick={() => setActiveTab('activities')}
              className="patient-nav-btn"
              style={{
                color: activeTab === 'activities' ? 'var(--color-navy)' : 'var(--color-text-muted)',
                fontWeight: activeTab === 'activities' ? 800 : 600,
                borderTop: activeTab === 'activities' ? '3px solid var(--color-navy)' : '3px solid transparent'
              }}
            >
              <LayoutGrid size={20} strokeWidth={1.75} />
              <span>{strings.navActivities}</span>
            </button>

            <button
              onClick={() => setActiveTab('memory')}
              className="patient-nav-btn"
              style={{
                color: activeTab === 'memory' ? 'var(--color-navy)' : 'var(--color-text-muted)',
                fontWeight: activeTab === 'memory' ? 800 : 600,
                borderTop: activeTab === 'memory' ? '3px solid var(--color-navy)' : '3px solid transparent'
              }}
            >
              <Heart size={20} strokeWidth={1.75} />
              <span>{strings.navMemory}</span>
            </button>

            <button
              onClick={() => setActiveTab('reminders')}
              className="patient-nav-btn"
              style={{
                color: activeTab === 'reminders' ? 'var(--color-navy)' : 'var(--color-text-muted)',
                fontWeight: activeTab === 'reminders' ? 800 : 600,
                position: 'relative',
                borderTop: activeTab === 'reminders' ? '3px solid var(--color-navy)' : '3px solid transparent'
              }}
            >
              <Bell size={20} strokeWidth={1.75} />
              <span>{strings.navReminders}</span>
              {pendingRemindersCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '6px',
                  right: 'calc(50% - 18px)',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: 'var(--color-warning)',
                  color: '#FFFFFF',
                  fontSize: '10px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {pendingRemindersCount}
                </span>
              )}
            </button>
          </div>
        </nav>
      )}

      {/* Floating Voice Companion Shortcut */}
      <FloatingCompanionButton
        onClick={() => setActiveTab('companion')}
        language={language}
        isActive={activeTab === 'companion' || activeGame !== null}
      />

      {/* Footer Banner */}
      <footer className="healthcare-disclaimer-banner">
        <strong>Mind Mate</strong> • Adaptive Cognitive Support Platform for SIH26003 • Demo Data Only • Not a diagnostic or clinical medical system.
      </footer>

      {/* Settings Modal (Section 41 & 55) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        language={language}
        onLanguageChange={onLanguageChange}
        textSize={textSize}
        onTextSizeChange={setTextSize}
        voiceEnabled={voiceEnabled}
        onVoiceToggle={setVoiceEnabled}
      />

      {/* NER Regional Languages Modal */}
      {isLanguageModalOpen && (
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
            maxWidth: '680px',
            width: '100%',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadow-modal)',
            border: '1.5px solid var(--color-border)',
            overflow: 'hidden'
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
                <Globe size={22} style={{ color: 'var(--color-teal)' }} />
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-navy)', margin: 0 }}>
                    Select Language / ভাষা নিৰ্বাচন / भाषा चयन
                  </h2>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    Indigenous & Regional Languages of the 8 North Eastern Sister States
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsLanguageModalOpen(false)}
                style={{
                  background: 'transparent',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Language Grid */}
            <div style={{
              padding: '20px 24px',
              overflowY: 'auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
              gap: '12px'
            }}>
              {NER_LANGUAGES.map(item => {
                const isSelected = language === item.code || (language === 'regional' && item.code === 'as');
                return (
                  <button
                    key={item.code}
                    onClick={() => {
                      onLanguageChange(item.code);
                      setIsLanguageModalOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? '2px solid var(--color-navy)' : '1px solid var(--color-border)',
                      background: isSelected ? 'var(--color-navy-soft)' : 'var(--color-bg-surface)',
                      color: isSelected ? 'var(--color-navy)' : 'var(--color-text-primary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      minHeight: '64px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '16px', fontWeight: 800, color: isSelected ? 'var(--color-navy)' : 'inherit' }}>
                        {item.nativeName}
                      </span>
                      {isSelected && <CheckCircle2 size={16} style={{ color: 'var(--color-navy)' }} />}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                        {item.label}
                      </span>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: isSelected ? '#CBD5E1' : 'var(--color-bg-subtle)',
                        color: 'var(--color-navy)'
                      }}>
                        {item.state}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div style={{
              padding: '12px 24px',
              borderTop: '1px solid var(--color-border)',
              background: 'var(--color-bg-subtle)',
              fontSize: '12px',
              color: 'var(--color-text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>Cognitive exercises, voice prompts & reminders adapt immediately.</span>
              <button
                onClick={() => setIsLanguageModalOpen(false)}
                style={{
                  padding: '6px 16px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-navy)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
