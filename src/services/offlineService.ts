import { 
  Patient, 
  GameSession, 
  AdaptiveDecision, 
  Reminder, 
  PersonalMemoryItem, 
  SyncEvent,
  ChatMessage
} from '../models/types';
import { 
  demoPatients, 
  demoCaregiver,
  SEED_DATA_MAP,
  initialPatient, 
  initialReminders, 
  initialPersonalMemories, 
  initialSessions, 
  initialAdaptiveDecisions 
} from '../data/seedData';

const STORAGE_KEYS = {
  ACTIVE_PATIENT: 'mindmate_active_patient_id',
  SYNC_QUEUE: 'mindmate_sync_queue',
  OFFLINE_MODE: 'mindmate_simulated_offline',
  LAST_SYNCED: 'mindmate_last_synced',
  // Helpers for patient-scoped keys
  patientKey: (id: string) => `mindmate_patient_${id}`,
  sessionsKey: (id: string) => `mindmate_sessions_${id}`,
  decisionsKey: (id: string) => `mindmate_decisions_${id}`,
  remindersKey: (id: string) => `mindmate_reminders_${id}`,
  memoriesKey: (id: string) => `mindmate_memories_${id}`,
  companionKey: (id: string) => `mindmate_companion_${id}`
};

const inMemoryStore: Record<string, string> = {};

const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {}
    return inMemoryStore[key] || null;
  },
  setItem: (key: string, val: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, val);
        return;
      }
    } catch (e) {}
    inMemoryStore[key] = val;
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
        return;
      }
    } catch (e) {}
    delete inMemoryStore[key];
  }
};

class OfflineService {
  private isSimulatedOffline: boolean = false;

  constructor() {
    this.init();
  }

  private init() {
    // Check if initial active patient exists; if not, initialize all 3 demo accounts
    const active = safeStorage.getItem(STORAGE_KEYS.ACTIVE_PATIENT);
    if (!active || !safeStorage.getItem(STORAGE_KEYS.patientKey('patient-meera-01'))) {
      this.resetToDefaults();
    } else {
      const storedOffline = safeStorage.getItem(STORAGE_KEYS.OFFLINE_MODE);
      this.isSimulatedOffline = storedOffline === 'true';
    }
  }

  public resetToDefaults() {
    // Seed all 3 patients with independent, isolated data stores
    demoPatients.forEach(p => {
      const seed = SEED_DATA_MAP[p.id];
      if (seed) {
        safeStorage.setItem(STORAGE_KEYS.patientKey(p.id), JSON.stringify(seed.patient));
        safeStorage.setItem(STORAGE_KEYS.sessionsKey(p.id), JSON.stringify(seed.sessions));
        safeStorage.setItem(STORAGE_KEYS.decisionsKey(p.id), JSON.stringify(seed.decisions));
        safeStorage.setItem(STORAGE_KEYS.remindersKey(p.id), JSON.stringify(seed.reminders));
        safeStorage.setItem(STORAGE_KEYS.memoriesKey(p.id), JSON.stringify(seed.memories));
      }
    });

    safeStorage.setItem(STORAGE_KEYS.ACTIVE_PATIENT, 'patient-meera-01');
    safeStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify([]));
    safeStorage.setItem(STORAGE_KEYS.OFFLINE_MODE, 'false');
    safeStorage.setItem(STORAGE_KEYS.LAST_SYNCED, 'Today, 10:44 AM');
    this.isSimulatedOffline = false;
  }

  // Active Patient Switcher
  public getActivePatientId(): string {
    return safeStorage.getItem(STORAGE_KEYS.ACTIVE_PATIENT) || 'patient-meera-01';
  }

  public setActivePatientId(id: string) {
    if (demoPatients.some(p => p.id === id)) {
      safeStorage.setItem(STORAGE_KEYS.ACTIVE_PATIENT, id);
    }
  }

  public getAllPatients(): Patient[] {
    return demoPatients.map(p => this.getPatient(p.id));
  }

  public getCaregiver() {
    return demoCaregiver;
  }

  // Network state
  public isOffline(): boolean {
    return this.isSimulatedOffline;
  }

  public setOfflineSimulation(offline: boolean) {
    this.isSimulatedOffline = offline;
    safeStorage.setItem(STORAGE_KEYS.OFFLINE_MODE, offline ? 'true' : 'false');
  }

  public getLastSyncedTime(): string {
    return safeStorage.getItem(STORAGE_KEYS.LAST_SYNCED) || 'Just now';
  }

  // Patient
  public getPatient(patientId?: string): Patient {
    const id = patientId || this.getActivePatientId();
    const raw = safeStorage.getItem(STORAGE_KEYS.patientKey(id));
    if (raw) return JSON.parse(raw);
    const fallback = demoPatients.find(p => p.id === id) || initialPatient;
    return fallback;
  }

  public savePatient(patient: Patient) {
    safeStorage.setItem(STORAGE_KEYS.patientKey(patient.id), JSON.stringify(patient));
    if (this.isSimulatedOffline) {
      this.queueSyncEvent('profile', patient.id, 'update', `Updated profile for ${patient.name}`);
    }
  }

  // Sessions (Isolated per patient)
  public getSessions(patientId?: string): GameSession[] {
    const id = patientId || this.getActivePatientId();
    const raw = safeStorage.getItem(STORAGE_KEYS.sessionsKey(id));
    if (raw) return JSON.parse(raw);
    const seed = SEED_DATA_MAP[id];
    return seed ? seed.sessions : [];
  }

  public saveSession(session: GameSession, patientId?: string) {
    const id = patientId || session.patientId || this.getActivePatientId();
    const sessions = this.getSessions(id);
    const updated = [session, ...sessions];
    safeStorage.setItem(STORAGE_KEYS.sessionsKey(id), JSON.stringify(updated));

    if (this.isSimulatedOffline || session.syncStatus === 'pending') {
      this.queueSyncEvent(
        'session', 
        session.id, 
        'create', 
        `[${id}] ${session.activityTitle} (${session.accuracy}% accuracy, Level ${session.difficultyLevel})`
      );
    }
  }

  // Adaptive Decisions (Isolated per patient)
  public getDecisions(patientId?: string): AdaptiveDecision[] {
    const id = patientId || this.getActivePatientId();
    const raw = safeStorage.getItem(STORAGE_KEYS.decisionsKey(id));
    if (raw) return JSON.parse(raw);
    const seed = SEED_DATA_MAP[id];
    return seed ? seed.decisions : [];
  }

  public saveDecision(decision: AdaptiveDecision, patientId?: string) {
    const id = patientId || decision.patientId || this.getActivePatientId();
    const decisions = this.getDecisions(id);
    const updated = [decision, ...decisions];
    safeStorage.setItem(STORAGE_KEYS.decisionsKey(id), JSON.stringify(updated));
  }

  // Reminders (Isolated per patient)
  public getReminders(patientId?: string): Reminder[] {
    const id = patientId || this.getActivePatientId();
    const raw = safeStorage.getItem(STORAGE_KEYS.remindersKey(id));
    if (raw) return JSON.parse(raw);
    const seed = SEED_DATA_MAP[id];
    return seed ? seed.reminders : [];
  }

  public saveReminders(reminders: Reminder[], patientId?: string) {
    const id = patientId || this.getActivePatientId();
    safeStorage.setItem(STORAGE_KEYS.remindersKey(id), JSON.stringify(reminders));
  }

  public updateReminderStatus(reminderId: string, status: 'completed' | 'snoozed' | 'pending', patientId?: string) {
    const id = patientId || this.getActivePatientId();
    const reminders = this.getReminders(id);
    const target = reminders.find(r => r.id === reminderId);
    if (!target) return;

    target.status = status;
    if (status === 'completed') {
      target.lastCompletedAt = 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    this.saveReminders(reminders, id);

    if (this.isSimulatedOffline) {
      this.queueSyncEvent('reminder', reminderId, 'update', `[${id}] Reminder '${target.title}' marked as ${status}`);
    }
  }

  // Personal Memories (Isolated per patient)
  public getMemories(patientId?: string): PersonalMemoryItem[] {
    const id = patientId || this.getActivePatientId();
    const raw = safeStorage.getItem(STORAGE_KEYS.memoriesKey(id));
    if (raw) return JSON.parse(raw);
    const seed = SEED_DATA_MAP[id];
    return seed ? seed.memories : [];
  }

  public getPersonalMemories(patientId?: string): PersonalMemoryItem[] {
    return this.getMemories(patientId);
  }

  public saveMemory(memory: PersonalMemoryItem, patientId?: string) {
    const id = patientId || this.getActivePatientId();
    const memories = this.getMemories(id);
    const updated = [memory, ...memories];
    safeStorage.setItem(STORAGE_KEYS.memoriesKey(id), JSON.stringify(updated));

    if (this.isSimulatedOffline) {
      this.queueSyncEvent('memory', memory.id, 'create', `[${id}] New memory added: ${memory.name} (${memory.category})`);
    }
  }

  // Sync Queue
  public getSyncQueue(): SyncEvent[] {
    const raw = safeStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
    return raw ? JSON.parse(raw) : [];
  }

  public queueSyncEvent(
    entityType: 'session' | 'reminder' | 'memory' | 'profile', 
    entityId: string, 
    action: 'create' | 'update',
    payloadSummary: string
  ) {
    const queue = this.getSyncQueue();
    const newEvent: SyncEvent = {
      id: 'sync-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      entityType,
      entityId,
      action,
      payloadSummary,
      queuedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    queue.push(newEvent);
    safeStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
  }

  public clearSyncQueue() {
    safeStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify([]));
  }

  // Companion Chat Messages (Isolated per patient)
  public getCompanionMessages(patientId?: string): ChatMessage[] {
    const id = patientId || this.getActivePatientId();
    const raw = safeStorage.getItem(STORAGE_KEYS.companionKey(id));
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        return [];
      }
    }
    return [];
  }

  public saveCompanionMessages(messages: ChatMessage[], patientId?: string) {
    const id = patientId || this.getActivePatientId();
    safeStorage.setItem(STORAGE_KEYS.companionKey(id), JSON.stringify(messages));
  }

  public addCompanionMessage(message: ChatMessage, patientId?: string) {
    const id = patientId || this.getActivePatientId();
    const existing = this.getCompanionMessages(id);
    const updated = [...existing, message];
    // Keep last 40 messages to prevent unbounded growth
    if (updated.length > 40) {
      updated.splice(0, updated.length - 40);
    }
    this.saveCompanionMessages(updated, id);
  }

  public clearCompanionMessages(patientId?: string) {
    const id = patientId || this.getActivePatientId();
    safeStorage.removeItem(STORAGE_KEYS.companionKey(id));
  }


  /**
   * Simulates atomic synchronization with the cloud backend / caregiver portal
   */
  public async synchronizePending(): Promise<{ syncedCount: number; details: string[] }> {
    const queue = this.getSyncQueue();
    const count = queue.length;
    const details = queue.map(q => q.payloadSummary);

    // Sync all sessions across all 3 patients
    demoPatients.forEach(p => {
      const sessions = this.getSessions(p.id);
      const updatedSessions = sessions.map(s => ({ ...s, syncStatus: 'synced' as const }));
      safeStorage.setItem(STORAGE_KEYS.sessionsKey(p.id), JSON.stringify(updatedSessions));
    });

    // Clear queue and update last synced timestamp
    this.clearSyncQueue();
    const now = 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    safeStorage.setItem(STORAGE_KEYS.LAST_SYNCED, now);

    return {
      syncedCount: count,
      details
    };
  }
}

export const offlineService = new OfflineService();
