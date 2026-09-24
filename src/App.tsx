import React, { useState } from 'react';
import { LanguageCode, GameSession, AdaptiveDecision } from './models/types';
import { offlineService } from './services/offlineService';
import { DemoControlBar } from './features/demo/DemoControlBar';
import { PatientShell } from './features/patient/PatientShell';
import { CaregiverDashboard } from './features/caregiver/CaregiverDashboard';
import { ArchitectureView } from './features/demo/ArchitectureView';
import { DifferentiationView } from './features/demo/DifferentiationView';
import { ProductStoryView } from './features/demo/ProductStoryView';
import { PrototypeValidationView } from './features/demo/PrototypeValidationView';
import { PresentationGuideModal } from './features/demo/PresentationGuideModal';
import './styles/global.css';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'patient' | 'caregiver' | 'architecture' | 'differentiation' | 'story' | 'validation'>('patient');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [activeScenario, setActiveScenario] = useState<string>('default');
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [scenarioNotice, setScenarioNotice] = useState<string | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  const handleRefreshData = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleScenarioSelect = (scenario: string) => {
    setActiveScenario(scenario);

    if (scenario === 'strong') {
      // Configure high-performance session: 92% accuracy, Level 2 -> Level 3
      const patient = offlineService.getPatient();
      patient.currentLevel = 3;
      offlineService.savePatient(patient);

      const session: GameSession = {
        id: 'sess-scenario-strong-' + Date.now(),
        patientId: patient.id,
        activityId: 'memory_match',
        activityTitle: 'Memory Match',
        timestamp: 'Just now (Scenario A)',
        difficultyLevel: 2,
        accuracy: 92,
        responseTimeMs: 2400,
        responseSpeedRating: 'Fast',
        completionRate: 100,
        consistencyScore: 0.92,
        attempts: 4,
        errors: 0,
        isPersonalized: false,
        syncStatus: 'synced'
      };

      const decision: AdaptiveDecision = {
        id: 'dec-scenario-strong-' + Date.now(),
        sessionId: session.id,
        patientId: patient.id,
        timestamp: session.timestamp,
        previousLevel: 2,
        newLevel: 3,
        performanceScore: 0.89,
        metrics: {
          accuracy: 92,
          responseSpeedNorm: 0.90,
          consistency: 0.92,
          completion: 1.0,
          recentTrend: 0.90
        },
        decision: 'increase',
        reason: 'Sustained strong performance (92% accuracy, prompt response) supports increasing to Level 3.',
        clinicalDisclaimer: 'This is an activity-personalization decision, not a clinical diagnosis.'
      };

      offlineService.saveSession(session);
      offlineService.saveDecision(decision);

      setScenarioNotice('Scenario A Active: High performance session simulated (Level 2 → Level 3 adaptation applied).');
      handleRefreshData();
      setCurrentView('caregiver');
    } else if (scenario === 'struggling') {
      // Configure struggling session: 48% accuracy, Level 3 -> Level 2
      const patient = offlineService.getPatient();
      patient.currentLevel = 2;
      offlineService.savePatient(patient);

      const session: GameSession = {
        id: 'sess-scenario-struggling-' + Date.now(),
        patientId: patient.id,
        activityId: 'memory_match',
        activityTitle: 'Memory Match',
        timestamp: 'Just now (Scenario B)',
        difficultyLevel: 3,
        accuracy: 48,
        responseTimeMs: 6800,
        responseSpeedRating: 'Deliberate',
        completionRate: 75,
        consistencyScore: 0.45,
        attempts: 5,
        errors: 3,
        isPersonalized: false,
        syncStatus: 'synced'
      };

      const decision: AdaptiveDecision = {
        id: 'dec-scenario-struggling-' + Date.now(),
        sessionId: session.id,
        patientId: patient.id,
        timestamp: session.timestamp,
        previousLevel: 3,
        newLevel: 2,
        performanceScore: 0.46,
        metrics: {
          accuracy: 48,
          responseSpeedNorm: 0.35,
          consistency: 0.45,
          completion: 0.75,
          recentTrend: 0.40
        },
        decision: 'decrease',
        reason: 'Recent accuracy dropped (48%) and response time increased. Lowered to Level 2 to lower cognitive strain.',
        clinicalDisclaimer: 'This is an activity-personalization decision, not a clinical diagnosis.'
      };

      offlineService.saveSession(session);
      offlineService.saveDecision(decision);

      setScenarioNotice('Scenario B Active: Struggling session simulated (Difficulty reduced Level 3 → Level 2).');
      handleRefreshData();
    } else if (scenario === 'average') {
      // Configure average session: 72% accuracy, Level 2 -> Level 2 (maintain)
      const patient = offlineService.getPatient();
      patient.currentLevel = 2;
      offlineService.savePatient(patient);

      const session: GameSession = {
        id: 'sess-scenario-avg-' + Date.now(),
        patientId: patient.id,
        activityId: 'memory_match',
        activityTitle: 'Memory Match',
        timestamp: 'Just now (Scenario: Average)',
        difficultyLevel: 2,
        accuracy: 72,
        responseTimeMs: 3600,
        responseSpeedRating: 'Good',
        completionRate: 100,
        consistencyScore: 0.78,
        attempts: 4,
        errors: 1,
        isPersonalized: false,
        syncStatus: 'synced'
      };

      const decision: AdaptiveDecision = {
        id: 'dec-scenario-avg-' + Date.now(),
        sessionId: session.id,
        patientId: patient.id,
        timestamp: session.timestamp,
        previousLevel: 2,
        newLevel: 2,
        performanceScore: 0.72,
        metrics: {
          accuracy: 72,
          responseSpeedNorm: 0.70,
          consistency: 0.78,
          completion: 1.0,
          recentTrend: 0.72
        },
        decision: 'maintain',
        reason: 'Performance score (0.72) is within the target engagement zone (0.55 – 0.80). Difficulty maintained at Level 2.',
        clinicalDisclaimer: 'This is an activity-personalization decision, not a clinical diagnosis.'
      };

      offlineService.saveSession(session);
      offlineService.saveDecision(decision);

      setScenarioNotice('Scenario: Average session simulated (Level 2 maintained within engagement corridor).');
      handleRefreshData();
      setCurrentView('caregiver');
    } else if (scenario === 'personalized') {
      setScenarioNotice('Scenario D Active: Patient personal routine recall selected.');
      setCurrentView('patient');
    } else if (scenario === 'caregiver_review') {
      setScenarioNotice('Scenario: Caregiver review portal active with latest cognitive analytics.');
      setCurrentView('caregiver');
    } else if (scenario === 'toggle_reminders') {
      const rems = offlineService.getReminders();
      const allCompleted = rems.every(r => r.status === 'completed');
      const updated = rems.map(r => ({
        ...r,
        status: (allCompleted ? 'pending' : 'completed') as any,
        lastCompletedAt: allCompleted ? undefined : 'Just now'
      }));
      offlineService.saveReminders(updated);
      setScenarioNotice(`Reminders toggled to ${allCompleted ? 'Pending' : 'Completed'}.`);
      handleRefreshData();
    }

    setTimeout(() => setScenarioNotice(null), 5000);
  };

  const handleGuideJump = (stepTarget: string) => {
    if (stepTarget === 'differentiation') setCurrentView('differentiation');
    else if (stepTarget === 'patient' || stepTarget.startsWith('patient_')) setCurrentView('patient');
    else if (stepTarget === 'caregiver' || stepTarget.startsWith('caregiver_')) setCurrentView('caregiver');
    else if (stepTarget === 'story') setCurrentView('story');
    else if (stepTarget === 'architecture') setCurrentView('architecture');
    else if (stepTarget === 'validation') setCurrentView('validation');
  };

  return (
    <div className="app-container" key={refreshKey}>
      {/* Persistent Demo Control Bar for Judges */}
      <DemoControlBar
        onScenarioSelect={handleScenarioSelect}
        onViewChange={setCurrentView}
        currentView={currentView}
        onRefreshData={handleRefreshData}
        onOpenPresentationGuide={() => setIsGuideOpen(true)}
      />

      {/* 3-Minute Presentation Guide Floating Assistant */}
      <PresentationGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onJumpToStep={handleGuideJump}
      />

      {/* Scenario Notification Banner */}
      {scenarioNotice && (
        <div style={{
          background: '#234E52',
          color: '#E6FFFA',
          padding: '8px 20px',
          textAlign: 'center',
          fontSize: '13px',
          fontWeight: 600,
          borderBottom: '1px solid #285E61'
        }}>
          {scenarioNotice}
        </div>
      )}

      {/* View Routing */}
      {currentView === 'patient' && (
        <PatientShell
          language={language}
          onLanguageChange={setLanguage}
          activeScenario={activeScenario}
        />
      )}

      {currentView === 'caregiver' && (
        <CaregiverDashboard
          language={language}
          onSwitchToPatientView={() => setCurrentView('patient')}
        />
      )}

      {currentView === 'story' && (
        <ProductStoryView />
      )}

      {currentView === 'validation' && (
        <PrototypeValidationView />
      )}

      {currentView === 'architecture' && (
        <ArchitectureView />
      )}

      {currentView === 'differentiation' && (
        <DifferentiationView />
      )}
    </div>
  );
};

export default App;
