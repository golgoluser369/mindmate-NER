import React, { useState, useEffect } from 'react';
import { GameSession, AdaptiveDecision, Reminder, LanguageCode, Patient } from '../../models/types';
import { offlineService } from '../../services/offlineService';
import { getStrings } from '../../locales';
import { getLocalizedReminder, ACTIVITY_TRANSLATIONS } from '../../services/localizationHelper';
import { CognitiveTrendChart } from './CognitiveTrendChart';
import { AdaptiveExplanationModal } from './AdaptiveExplanationModal';
import { MemoryManager } from './MemoryManager';
import { MLTelemetryModal } from './MLTelemetryModal';
import { 
  User, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Heart, 
  WifiOff, 
  Calendar, 
  ArrowUpRight, 
  ShieldCheck, 
  Brain,
  Plus,
  Pill,
  Droplets,
  Footprints,
  Bell,
  Cpu,
  Users,
  Eye,
  Activity,
  ChevronRight,
  Sparkles,
  Bot,
  MessageSquare
} from 'lucide-react';

const getReminderIcon = (category: string) => {
  switch (category) {
    case 'medicine': return <Pill size={20} strokeWidth={1.75} style={{ color: 'var(--color-navy)' }} />;
    case 'hydration': return <Droplets size={20} strokeWidth={1.75} style={{ color: '#2B6CB0' }} />;
    case 'daily_activity': return <Footprints size={20} strokeWidth={1.75} style={{ color: 'var(--color-teal)' }} />;
    case 'appointment': return <Calendar size={20} strokeWidth={1.75} style={{ color: 'var(--color-warning)' }} />;
    default: return <Bell size={20} strokeWidth={1.75} />;
  }
};

interface CaregiverDashboardProps {
  language?: LanguageCode;
  onSwitchToPatientView: () => void;
  initialPatientId?: string;
}

export const CaregiverDashboard: React.FC<CaregiverDashboardProps> = ({ 
  language = 'en',
  onSwitchToPatientView,
  initialPatientId = 'all'
}) => {
  const strings = getStrings(language);
  const caregiver = offlineService.getCaregiver();
  const allPatients = offlineService.getAllPatients();

  // Active view: 'all' (fleet overview) or individual patient id
  const [selectedPatientId, setSelectedPatientId] = useState<string>(initialPatientId);
  const [activePatient, setActivePatient] = useState<Patient>(
    selectedPatientId === 'all' ? allPatients[0] : offlineService.getPatient(selectedPatientId)
  );

  const [sessions, setSessions] = useState<GameSession[]>(
    offlineService.getSessions(selectedPatientId === 'all' ? allPatients[0].id : selectedPatientId)
  );
  const [decisions, setDecisions] = useState<AdaptiveDecision[]>(
    offlineService.getDecisions(selectedPatientId === 'all' ? allPatients[0].id : selectedPatientId)
  );
  const [reminders, setReminders] = useState<Reminder[]>(
    offlineService.getReminders(selectedPatientId === 'all' ? allPatients[0].id : selectedPatientId)
  );

  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'memories' | 'reminders' | 'companion'>('overview');
  const [selectedDecision, setSelectedDecision] = useState<AdaptiveDecision | null>(null);
  const [showMLModal, setShowMLModal] = useState<boolean>(false);

  // New Reminder Form State
  const [isAddingReminder, setIsAddingReminder] = useState<boolean>(false);
  const [newRemTitle, setNewRemTitle] = useState('');
  const [newRemTime, setNewRemTime] = useState('');
  const [newRemDetail, setNewRemDetail] = useState('');
  const [newRemCategory, setNewRemCategory] = useState<'medicine' | 'hydration' | 'daily_activity' | 'appointment'>('medicine');

  // Reload data whenever selected patient changes
  useEffect(() => {
    if (selectedPatientId !== 'all') {
      const p = offlineService.getPatient(selectedPatientId);
      setActivePatient(p);
      setSessions(offlineService.getSessions(selectedPatientId));
      setDecisions(offlineService.getDecisions(selectedPatientId));
      setReminders(offlineService.getReminders(selectedPatientId));
    }
  }, [selectedPatientId]);

  const latestSession = sessions[0];
  const latestDecision = decisions[0];

  // Current patient metrics
  const avgAccuracy = Math.round(sessions.reduce((acc, s) => acc + s.accuracy, 0) / Math.max(1, sessions.length));
  const completedReminders = reminders.filter(r => r.status === 'completed').length;

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRemTitle.trim() || !newRemTime.trim()) return;

    let icon = '🔔';
    if (newRemCategory === 'medicine') icon = '💊';
    if (newRemCategory === 'hydration') icon = '💧';
    if (newRemCategory === 'daily_activity') icon = '🌿';
    if (newRemCategory === 'appointment') icon = '🩺';

    const targetPatientId = selectedPatientId === 'all' ? allPatients[0].id : selectedPatientId;
    const newRem: Reminder = {
      id: 'rem-' + Date.now(),
      title: newRemTitle.trim(),
      category: newRemCategory,
      timeStr: newRemTime.trim(),
      detail: newRemDetail.trim() || 'Daily schedule reminder',
      status: 'pending',
      icon
    };

    const currentReminders = offlineService.getReminders(targetPatientId);
    const updated = [...currentReminders, newRem];
    offlineService.saveReminders(updated, targetPatientId);
    setReminders(updated);
    setIsAddingReminder(false);
    setNewRemTitle('');
    setNewRemTime('');
    setNewRemDetail('');
  };

  const handleSwitchToPatientApp = (patientId: string) => {
    offlineService.setActivePatientId(patientId);
    onSwitchToPatientView();
  };

  return (
    <div style={{ maxWidth: 'var(--max-dashboard-width)', margin: '0 auto', padding: '24px 20px 60px' }}>
      
      {/* Caregiver Portal Top Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-teal)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {strings.caregiverPortal || 'Caregiver Portal'}
            </span>
            <span style={{ color: 'var(--color-text-muted)' }}>•</span>
            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              {caregiver.role}
            </span>
          </div>
          <h1 style={{ fontSize: 'var(--text-cg-title)', fontWeight: 800, color: 'var(--color-navy)', margin: 0 }}>
            {strings.goodMorningCaregiver || 'Good morning'}, {caregiver.name}
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setShowMLModal(true)}
            style={{
              background: '#805AD5',
              color: '#FFFFFF',
              border: 'none',
              padding: '8px 14px',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <Cpu size={16} />
            <span>ML Engine Inspector</span>
          </button>

          <button
            onClick={() => handleSwitchToPatientApp(selectedPatientId === 'all' ? 'patient-meera-01' : selectedPatientId)}
            className="btn btn-outline"
            style={{ minHeight: '40px', padding: '6px 14px', fontSize: '14px' }}
          >
            <span>Open Patient App</span>
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>

      {/* Patient Account Selector Navigation Bar */}
      <div style={{
        background: '#FFFFFF',
        border: '1.5px solid var(--color-border)',
        borderRadius: '12px',
        padding: '8px 12px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div className="horizontal-scroll-pills" style={{ alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#4A5568', textTransform: 'uppercase', marginRight: '4px', whiteSpace: 'nowrap' }}>
            Patient:
          </span>

          <button
            onClick={() => setSelectedPatientId('all')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              border: selectedPatientId === 'all' ? '2px solid var(--color-teal)' : '1px solid var(--color-border)',
              background: selectedPatientId === 'all' ? 'var(--color-teal-soft)' : '#F8FAFC',
              color: selectedPatientId === 'all' ? 'var(--color-teal-dark)' : '#334155',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            <Users size={16} />
            <span>All 3 Patients</span>
          </button>

          {allPatients.map(p => {
            const isSelected = selectedPatientId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPatientId(p.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  border: isSelected ? '2px solid var(--color-navy)' : '1px solid var(--color-border)',
                  background: isSelected ? 'var(--color-navy)' : '#F8FAFC',
                  color: isSelected ? '#FFFFFF' : '#334155',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: isSelected ? '#38BDF8' : '#94A3B8'
                }} />
                <span>{p.name}</span>
                <span style={{ 
                  fontSize: '11px', 
                  opacity: 0.85, 
                  background: isSelected ? 'rgba(255,255,255,0.2)' : '#E2E8F0',
                  padding: '1px 5px',
                  borderRadius: '4px'
                }}>
                  Lvl {p.currentLevel}
                </span>
              </button>
            );
          })}
        </div>

        <div className="hide-on-mobile" style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
          3 Isolated Patient Data Stores Active
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SCENARIO 1: ALL 3 PATIENTS FLEET OVERVIEW                                  */}
      {/* ========================================================================= */}
      {selectedPatientId === 'all' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Top Fleet Summary Metrics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px'
          }}>
            <div className="patient-card" style={{ background: '#FFFFFF', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Total Active Patients
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-navy)', margin: '4px 0' }}>
                3 Assigned
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-teal)', fontWeight: 600 }}>
                Assam (Tezpur & Silchar) & Sikkim (Gangtok)
              </div>
            </div>

            <div className="patient-card" style={{ background: '#FFFFFF', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Fleet Average Accuracy
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-navy)', margin: '4px 0' }}>
                82.4%
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <TrendingUp size={14} />
                <span>Steady performance across all levels</span>
              </div>
            </div>

            <div className="patient-card" style={{ background: '#FFFFFF', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Today's Fleet Reminders
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-navy)', margin: '4px 0' }}>
                {allPatients.reduce((acc, p) => acc + offlineService.getReminders(p.id).filter(r => r.status === 'completed').length, 0)} / {allPatients.reduce((acc, p) => acc + offlineService.getReminders(p.id).length, 0)} Done
              </div>
              <div style={{ fontSize: '12px', color: '#D97706', fontWeight: 600 }}>
                {allPatients.reduce((acc, p) => acc + offlineService.getReminders(p.id).filter(r => r.status === 'pending').length, 0)} pending assistance
              </div>
            </div>

            <div className="patient-card" style={{ background: '#FFFFFF', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                AI Personalization Engine
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#0F766E', margin: '4px 0' }}>
                Active
              </div>
              <div style={{ fontSize: '12px', color: '#0F766E', fontWeight: 600 }}>
                12 Features • Random Forest V2
              </div>
            </div>
          </div>

          {/* 3 Individual Patient Comparison Cards */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-navy)', margin: 0 }}>
                Patient Fleet Breakdown & Individual Progress
              </h2>
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                Select any patient to inspect granular drill sessions and history
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {allPatients.map(pt => {
                const ptSessions = offlineService.getSessions(pt.id);
                const ptDecisions = offlineService.getDecisions(pt.id);
                const ptReminders = offlineService.getReminders(pt.id);
                const ptCompletedRem = ptReminders.filter(r => r.status === 'completed').length;
                const ptAvgAcc = ptSessions.length > 0 
                  ? Math.round(ptSessions.reduce((acc, s) => acc + s.accuracy, 0) / ptSessions.length)
                  : 0;
                const latestPtSess = ptSessions[0];

                let initials = 'MS';
                if (pt.name.includes('Tenzing')) initials = 'TN';
                if (pt.name.includes('Biren')) initials = 'BS';

                return (
                  <div
                    key={pt.id}
                    style={{
                      background: '#FFFFFF',
                      border: '1.5px solid var(--color-border)',
                      borderRadius: '14px',
                      padding: '20px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      {/* Patient Top Header */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: 'var(--color-navy-soft)',
                            color: 'var(--color-navy)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '18px'
                          }}>
                            {initials}
                          </div>
                          <div>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--color-navy)' }}>
                              {pt.name}
                            </h3>
                            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                              {pt.age} yrs • {pt.region}
                            </div>
                          </div>
                        </div>

                        <span style={{
                          fontSize: '12px',
                          fontWeight: 800,
                          background: 'var(--color-teal-soft)',
                          color: 'var(--color-teal-dark)',
                          padding: '3px 8px',
                          borderRadius: '6px'
                        }}>
                          Level {pt.currentLevel}
                        </span>
                      </div>

                      {/* Clinical Profile Badge */}
                      <div style={{
                        background: '#F8FAFC',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        fontSize: '12px',
                        color: '#475569',
                        marginBottom: '16px'
                      }}>
                        <strong>Pathway:</strong> {pt.supportProfileId === 'memory_routine' ? 'Memory & Daily Routine Support' : pt.supportProfileId === 'vascular_cognitive' ? 'Vascular-Cognitive Support' : 'Attention & Planning Support'}
                      </div>

                      {/* Performance Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
                        <div style={{ background: '#F8FAFC', padding: '10px', borderRadius: '8px' }}>
                          <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Avg Accuracy</div>
                          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-navy)' }}>{ptAvgAcc}%</div>
                          <div style={{ fontSize: '11px', color: '#16A34A', fontWeight: 600 }}>{ptSessions.length} total sessions</div>
                        </div>

                        <div style={{ background: '#F8FAFC', padding: '10px', borderRadius: '8px' }}>
                          <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Reminders</div>
                          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-navy)' }}>{ptCompletedRem} / {ptReminders.length}</div>
                          <div style={{ fontSize: '11px', color: '#D97706', fontWeight: 600 }}>{ptReminders.length - ptCompletedRem} pending today</div>
                        </div>
                      </div>

                      {/* Latest Session & Adaptive Status */}
                      <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
                        <div>• <strong>Latest Drill:</strong> {latestPtSess ? `${latestPtSess.activityTitle} (${latestPtSess.accuracy}%)` : 'No recent session'}</div>
                        <div>• <strong>Timestamp:</strong> {latestPtSess ? latestPtSess.timestamp : 'Pending'}</div>
                        <div>• <strong>Preferred Lang:</strong> {pt.preferredLanguage.toUpperCase()}</div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => setSelectedPatientId(pt.id)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: 'var(--color-navy)',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        transition: 'background 0.15s'
                      }}
                    >
                      <Eye size={16} />
                      <span>Inspect {pt.name.split(' ')[0]}'s Progress & Drills</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCENARIO 2: INDIVIDUAL PATIENT DRILL VIEW                                  */}
      {/* ========================================================================= */}
      {selectedPatientId !== 'all' && (
        <>
          {/* Individual Patient Overview Card */}
          <div style={{
            background: 'var(--color-bg-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            border: '1.5px solid var(--color-border)',
            boxShadow: 'var(--shadow-card)',
            marginBottom: '24px'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              alignItems: 'center'
            }}>
              {/* Patient Profile */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'var(--color-navy-soft)',
                  color: 'var(--color-navy)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  fontWeight: 800
                }}>
                  {activePatient.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-navy)' }}>
                    {activePatient.name}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                    {activePatient.age} yrs • {activePatient.region}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    Connectivity: {activePatient.connectivityProfile}
                  </div>
                </div>
              </div>

              {/* Current Activity Level */}
              <div style={{ borderLeft: '1px solid var(--color-border-subtle)', paddingLeft: '16px' }}>
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  Current Adaptive Level
                </div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-navy)' }}>
                  Level {activePatient.currentLevel}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-teal)', fontWeight: 600 }}>
                  {latestDecision ? `${latestDecision.decision.toUpperCase()} decision active` : 'Standard baseline'}
                </div>
              </div>

              {/* Average Accuracy */}
              <div style={{ borderLeft: '1px solid var(--color-border-subtle)', paddingLeft: '16px' }}>
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  Recent Average Accuracy
                </div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-navy)' }}>
                  {avgAccuracy}%
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-success)', fontWeight: 600 }}>
                  Consistent completion rate (100%)
                </div>
              </div>

              {/* Reminders Completed */}
              <div style={{ borderLeft: '1px solid var(--color-border-subtle)', paddingLeft: '16px' }}>
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  Today's Reminders
                </div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-navy)' }}>
                  {completedReminders} / {reminders.length}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  {reminders.length - completedReminders} pending assistance
                </div>
              </div>
            </div>
          </div>

          {/* Ethical Alert Banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--color-warning-soft)',
            border: '1px solid var(--color-warning-border)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertTriangle size={22} strokeWidth={1.75} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-warning)', letterSpacing: '0.2px' }}>
                  Activity Pacing Notice: {activePatient.name}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  Difficulty level stabilized for {activePatient.name} based on 12 telemetry features. Data is strictly isolated to this patient account.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setSelectedPatientId('all')}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--color-border)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                ← Back to Fleet Overview
              </button>
              {latestDecision && (
                <button
                  onClick={() => setSelectedDecision(latestDecision)}
                  className="btn btn-subtle btn-caregiver"
                  style={{ background: '#FFFFFF' }}
                >
                  View Scoring Rationale
                </button>
              )}
            </div>
          </div>

          {/* Individual Patient Navigation Tabs */}
          <div className="horizontal-scroll-pills" style={{
            borderBottom: '2px solid var(--color-border)',
            marginBottom: '24px',
            gap: '8px',
            paddingBottom: '0'
          }}>
            {[
              { id: 'overview', label: strings.overview || 'Dashboard Overview' },
              { id: 'history', label: `${strings.history || 'Activity History'} (${sessions.length})` },
              { id: 'memories', label: strings.memories || 'Personal Memories' },
              { id: 'reminders', label: strings.reminders || 'Reminders & Schedule' },
              { id: 'companion', label: 'Saathi Conversations & Sentiment' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '12px 16px',
                  fontSize: '15px',
                  fontWeight: 700,
                  color: activeTab === tab.id ? 'var(--color-navy)' : 'var(--color-text-muted)',
                  borderBottom: activeTab === tab.id ? '3px solid var(--color-navy)' : '3px solid transparent',
                  marginBottom: '-2px',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Cognitive Breakdown Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px'
              }}>
                <div className="patient-card">
                  <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Recall & Memory</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-navy)', margin: '4px 0' }}>{avgAccuracy}%</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-success)', fontSize: '13px', fontWeight: 600 }}>
                    <TrendingUp size={16} />
                    <span>Consistent completion rate</span>
                  </div>
                </div>

                <div className="patient-card">
                  <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Response Speed Rating</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-navy)', margin: '4px 0' }}>
                    {latestSession ? latestSession.responseSpeedRating : 'Good'}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                    {latestSession ? `${(latestSession.responseTimeMs / 1000).toFixed(1)}s avg response` : '2.4s avg response'}
                  </div>
                </div>

                <div className="patient-card">
                  <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Cognitive Consistency</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-navy)', margin: '4px 0' }}>
                    {latestSession ? `${Math.round(latestSession.consistencyScore * 100)}%` : '85%'}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--color-teal)', fontWeight: 600 }}>
                    High score reliability
                  </div>
                </div>
              </div>

              {/* Longitudinal Performance Trend Chart */}
              <div style={{
                background: 'var(--color-bg-surface)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-card)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-navy)', margin: 0 }}>
                      Cognitive Performance Trend: {activePatient.name}
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
                      Historical session progression across difficulty levels and accuracy metrics.
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowMLModal(true)}
                    style={{
                      background: 'rgba(128, 90, 213, 0.1)',
                      color: '#805AD5',
                      border: '1px solid #805AD5',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <Cpu size={14} />
                    <span>Open ML Telemetry</span>
                  </button>
                </div>
                <CognitiveTrendChart sessions={sessions} />
              </div>
            </div>
          )}

          {/* TAB 2: ACTIVITY HISTORY */}
          {activeTab === 'history' && (
            <div style={{
              background: 'var(--color-bg-surface)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-card)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-navy)', margin: 0 }}>
                  Detailed Game Drills: {activePatient.name}
                </h3>
                <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  Total Sessions: {sessions.length}
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                      <th style={{ padding: '12px 14px' }}>Timestamp</th>
                      <th style={{ padding: '12px 14px' }}>Activity</th>
                      <th style={{ padding: '12px 14px' }}>Level</th>
                      <th style={{ padding: '12px 14px' }}>Accuracy</th>
                      <th style={{ padding: '12px 14px' }}>Response Time</th>
                      <th style={{ padding: '12px 14px' }}>Speed</th>
                      <th style={{ padding: '12px 14px' }}>Sync</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map(sess => (
                      <tr key={sess.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                        <td style={{ padding: '12px 14px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                          {sess.timestamp}
                        </td>
                        <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--color-navy)' }}>
                          {(ACTIVITY_TRANSLATIONS[sess.activityId]?.name[language]) || sess.activityTitle}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ 
                            background: 'var(--color-navy-soft)', 
                            color: 'var(--color-navy)', 
                            padding: '2px 8px', 
                            borderRadius: '4px',
                            fontWeight: 700,
                            fontSize: '12px'
                          }}>
                            Level {sess.difficultyLevel}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', fontWeight: 800, color: sess.accuracy >= 80 ? 'var(--color-success)' : 'var(--color-navy)' }}>
                          {sess.accuracy}%
                        </td>
                        <td style={{ padding: '12px 14px', color: 'var(--color-text-secondary)' }}>
                          {(sess.responseTimeMs / 1000).toFixed(1)}s
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ 
                            fontSize: '12px', 
                            fontWeight: 600,
                            color: sess.responseSpeedRating === 'Fast' ? 'var(--color-success)' : 'var(--color-text-secondary)'
                          }}>
                            {sess.responseSpeedRating}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ 
                            fontSize: '11px', 
                            fontWeight: 700, 
                            color: sess.syncStatus === 'synced' ? 'var(--color-teal)' : '#D97706',
                            background: sess.syncStatus === 'synced' ? 'var(--color-teal-soft)' : '#FEF3C7',
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}>
                            {sess.syncStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PERSONAL MEMORIES */}
          {activeTab === 'memories' && (
            <MemoryManager patientId={activePatient.id} language={language} />
          )}

          {/* TAB 4: REMINDERS & SCHEDULE */}
          {activeTab === 'reminders' && (
            <div style={{
              background: 'var(--color-bg-surface)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-card)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-navy)', margin: 0 }}>
                    Scheduled Reminders for {activePatient.name}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
                    Caregiver configured daily routines, hydration, and medical check-ups.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddingReminder(true)}
                  className="btn btn-primary"
                  style={{ padding: '8px 16px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={16} />
                  <span>{strings.addReminder || 'Add Reminder'}</span>
                </button>
              </div>

              {/* Add Reminder Inline Form */}
              {isAddingReminder && (
                <form onSubmit={handleAddReminder} style={{ 
                  background: 'var(--color-bg-patient)', 
                  padding: '18px', 
                  borderRadius: '10px', 
                  border: '1px solid var(--color-border)',
                  marginBottom: '20px'
                }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: '15px', color: 'var(--color-navy)' }}>
                    Add New Reminder for {activePatient.name}
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
                        Title
                      </label>
                      <input
                        type="text"
                        value={newRemTitle}
                        onChange={e => setNewRemTitle(e.target.value)}
                        placeholder="e.g. Blood Pressure Tablet"
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '14px' }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
                        Time
                      </label>
                      <input
                        type="text"
                        value={newRemTime}
                        onChange={e => setNewRemTime(e.target.value)}
                        placeholder="e.g. 09:00 AM"
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '14px' }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
                        Category
                      </label>
                      <select
                        value={newRemCategory}
                        onChange={e => setNewRemCategory(e.target.value as any)}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '14px' }}
                      >
                        <option value="medicine">Medicine</option>
                        <option value="hydration">Hydration</option>
                        <option value="daily_activity">Daily Activity / Walk</option>
                        <option value="appointment">Medical Appointment</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
                      Instructions / Details
                    </label>
                    <input
                      type="text"
                      value={newRemDetail}
                      onChange={e => setNewRemDetail(e.target.value)}
                      placeholder="e.g. Take with a warm glass of water"
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '14px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="submit" className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '13px' }}>
                      {strings.save || 'Save Reminder'}
                    </button>
                    <button type="button" onClick={() => setIsAddingReminder(false)} className="btn btn-subtle" style={{ padding: '6px 12px', fontSize: '13px' }}>
                      {strings.cancel || 'Cancel'}
                    </button>
                  </div>
                </form>
              )}

              {/* Reminders List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {reminders.map(rem => {
                  const locRem = getLocalizedReminder(rem, language);
                  return (
                    <div
                      key={rem.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 18px',
                        background: rem.status === 'completed' ? 'var(--color-success-soft)' : '#F8FAFC',
                        border: rem.status === 'completed' ? '1px solid var(--color-success-border)' : '1px solid var(--color-border)',
                        borderRadius: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '6px',
                          background: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}>
                          {getReminderIcon(rem.category)}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-navy)' }}>
                              {rem.timeStr}
                            </span>
                            <span style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '1px 6px',
                              borderRadius: '4px',
                              background: rem.status === 'completed' ? 'var(--color-success)' : 'var(--color-warning)',
                              color: '#FFFFFF'
                            }}>
                              {rem.status === 'completed' ? (strings.completedStatus || 'Completed') : (strings.pendingStatus || 'Pending')}
                            </span>
                          </div>
                          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-navy)', marginTop: '2px' }}>
                            {locRem.title}
                          </div>
                          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                            {locRem.detail}
                          </div>
                        </div>
                      </div>

                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textAlign: 'right' }}>
                        {rem.lastCompletedAt ? `${strings.completedStatus || 'Completed'}: ${rem.lastCompletedAt}` : (strings.awaitingPatient || 'Awaiting patient')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: SAATHI COMPANION CONVERSATIONS & SENTIMENT TRACKING */}
          {activeTab === 'companion' && (() => {
            const companionMsgs = offlineService.getCompanionMessages(activePatient.id);
            const userMsgs = companionMsgs.filter(m => m.sender === 'user');
            const assistantMsgs = companionMsgs.filter(m => m.sender === 'assistant');

            const hasConfusion = assistantMsgs.some(m => m.sentiment === 'confused' || m.topic === 'emotional_support');
            const hasMedInquiry = assistantMsgs.some(m => m.topic === 'medicine');
            const hasFamilyInquiry = assistantMsgs.some(m => m.topic === 'family');

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Companion Health Summary Card */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '14px'
                }}>
                  <div className="patient-card" style={{ background: '#FFFFFF', border: '1px solid var(--color-border)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                      Dialogue Interactions
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-navy)', margin: '4px 0' }}>
                      {userMsgs.length} Exchanges
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-teal)', fontWeight: 600 }}>
                      Stored safely in isolated local device store
                    </div>
                  </div>

                  <div className="patient-card" style={{ background: '#FFFFFF', border: '1px solid var(--color-border)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                      Emotional Tone / Sentiment
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: hasConfusion ? 'var(--color-warning)' : 'var(--color-success)', margin: '4px 0' }}>
                      {hasConfusion ? 'Needs Gentle Reassurance' : 'Calm & Engaged'}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                      {hasConfusion ? 'Confusion/anxiety addressed with Validation' : 'No acute disorientation flags'}
                    </div>
                  </div>

                  <div className="patient-card" style={{ background: '#FFFFFF', border: '1px solid var(--color-border)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                      Topics Explored Today
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                      {hasMedInquiry && (
                        <span style={{ fontSize: '11px', background: 'var(--color-navy-soft)', color: 'var(--color-navy)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                          💊 Medicine
                        </span>
                      )}
                      {hasFamilyInquiry && (
                        <span style={{ fontSize: '11px', background: 'var(--color-teal-soft)', color: 'var(--color-teal-dark)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                          👨‍👩‍👧 Family
                        </span>
                      )}
                      <span style={{ fontSize: '11px', background: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                        🌅 Daily Routine
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dialogues Transcript Card */}
                <div className="patient-card" style={{ background: '#FFFFFF', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Bot size={20} style={{ color: 'var(--color-teal)' }} />
                      <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-navy)', margin: 0 }}>
                        Recorded Dialogue Log: {activePatient.name}
                      </h3>
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      Total messages: {companionMsgs.length}
                    </span>
                  </div>

                  {companionMsgs.length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '36px 20px',
                      color: 'var(--color-text-muted)',
                      fontSize: '14px',
                      background: 'var(--color-bg-subtle)',
                      borderRadius: '8px'
                    }}>
                      No conversation logs recorded yet today for {activePatient.name}. When the patient chats with Saathi via voice or text, transcripts and sentiment indicators appear here automatically.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto' }}>
                      {companionMsgs.map((msg) => {
                        const isUser = msg.sender === 'user';
                        return (
                          <div
                            key={msg.id}
                            style={{
                              padding: '12px 16px',
                              borderRadius: '8px',
                              background: isUser ? '#F1F5F9' : '#E6FFFA',
                              border: isUser ? '1px solid #CBD5E1' : '1px solid #B2F5EA',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{
                                fontSize: '12px',
                                fontWeight: 800,
                                color: isUser ? 'var(--color-navy)' : 'var(--color-teal-dark)'
                              }}>
                                {isUser ? `🗣️ ${activePatient.name}` : '🤖 Saathi Companion'}
                              </span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {msg.topic && (
                                  <span style={{
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    background: 'rgba(0,0,0,0.06)',
                                    padding: '1px 6px',
                                    borderRadius: '4px'
                                  }}>
                                    {msg.topic}
                                  </span>
                                )}
                                <span style={{ fontSize: '11px', color: '#64748B' }}>
                                  {msg.timestamp}
                                </span>
                              </div>
                            </div>
                            <div style={{ fontSize: '14px', color: '#1E293B', lineHeight: 1.4 }}>
                              {msg.text}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </>
      )}

      {/* Adaptive Explanation Modal */}
      {selectedDecision && (
        <AdaptiveExplanationModal
          decision={selectedDecision}
          onClose={() => setSelectedDecision(null)}
        />
      )}

      {/* ML Telemetry Modal */}
      <MLTelemetryModal
        isOpen={showMLModal}
        onClose={() => setShowMLModal(false)}
        latestSession={latestSession}
        patientId={selectedPatientId === 'all' ? allPatients[0].id : selectedPatientId}
      />
    </div>
  );
};
