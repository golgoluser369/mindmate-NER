import { Patient, Reminder, PersonalMemoryItem, GameSession, AdaptiveDecision } from '../models/types';

export interface CaregiverProfile {
  id: string;
  name: string;
  role: string;
  assignedPatientIds: string[];
}

export const demoCaregiver: CaregiverProfile = {
  id: 'cg-ananya-01',
  name: 'Ananya Sharma',
  role: 'Lead Care Coordinator & Family Caregiver',
  assignedPatientIds: ['patient-meera-01', 'patient-tenzing-02', 'patient-biren-03']
};

export const demoPatients: Patient[] = [
  {
    id: 'patient-meera-01',
    name: 'Meera Sharma',
    age: 72,
    preferredLanguage: 'as',
    region: 'Tezpur, Assam (NER)',
    caregiverId: 'cg-ananya-01',
    caregiverName: 'Ananya Sharma',
    connectivityProfile: 'intermittent',
    supportProfileId: 'memory_routine',
    currentLevel: 2,
    notes: 'Familiar with local Tezpur routines. Responds best to calm pacing, familiar objects, and visual cues.'
  },
  {
    id: 'patient-tenzing-02',
    name: 'Tenzing Norbu',
    age: 68,
    preferredLanguage: 'ne',
    region: 'Gangtok, Sikkim (NER)',
    caregiverId: 'cg-ananya-01',
    caregiverName: 'Ananya Sharma',
    connectivityProfile: 'intermittent',
    supportProfileId: 'vascular_cognitive',
    currentLevel: 1,
    notes: 'Post-TIA recovery. Benefiting from vascular-cognitive rehabilitation with generous response time buffers.'
  },
  {
    id: 'patient-biren-03',
    name: 'Biren Singha',
    age: 75,
    preferredLanguage: 'bn',
    region: 'Silchar, Barak Valley, Assam (NER)',
    caregiverId: 'cg-ananya-01',
    caregiverName: 'Ananya Sharma',
    connectivityProfile: 'online',
    supportProfileId: 'attention_planning',
    currentLevel: 3,
    notes: 'Retired tea estate superintendent. Highly engaged with executive planning drills, numbers, and sequence puzzles.'
  }
];

export const initialPatient: Patient = demoPatients[0];

// ==========================================
// 1. MEERA SHARMA (patient-meera-01) SEED DATA
// ==========================================
export const meeraReminders: Reminder[] = [
  {
    id: 'rem-m-1',
    title: 'Morning Blood Pressure Medicine',
    category: 'medicine',
    timeStr: '08:00 AM',
    detail: 'Amlodipine 5mg with a full glass of warm water.',
    status: 'completed',
    lastCompletedAt: 'Today, 08:15 AM',
    icon: '💊'
  },
  {
    id: 'rem-m-2',
    title: 'Midday Hydration',
    category: 'hydration',
    timeStr: '12:30 PM',
    detail: 'Time for hydration. Please drink some water or warm lemon water.',
    status: 'pending',
    icon: '💧'
  },
  {
    id: 'rem-m-3',
    title: 'Afternoon Courtyard Walk',
    category: 'daily_activity',
    timeStr: '04:30 PM',
    detail: 'Gentle 15-minute garden walk with Ananya in the courtyard.',
    status: 'pending',
    icon: '🌿'
  },
  {
    id: 'rem-m-4',
    title: 'Dr. Baruah Clinic Check-up',
    category: 'appointment',
    timeStr: 'Friday, 10:00 AM',
    detail: 'Routine health check-up and vitals review at Tezpur Civil Hospital.',
    status: 'pending',
    icon: '🩺'
  }
];

export const meeraMemories: PersonalMemoryItem[] = [
  {
    id: 'mem-m-1',
    category: 'person',
    name: 'Ananya Sharma',
    relationshipOrDetail: 'Daughter & Primary Caregiver',
    description: 'Visits every Sunday. Prepares Assam milk tea with ginger and tends the garden orchids together.',
    iconOrEmoji: '👩‍👧'
  },
  {
    id: 'mem-m-2',
    category: 'person',
    name: 'Rohan Sharma',
    relationshipOrDetail: 'Grandson',
    description: 'Engineering student in Guwahati. Calls every Wednesday evening to share university stories.',
    iconOrEmoji: '👦'
  },
  {
    id: 'mem-m-3',
    category: 'place',
    name: 'Tezpur Family Residence',
    relationshipOrDetail: 'Home for 45 years',
    description: 'The green roof home with a wide veranda overlooking the backyard tea bushes and jackfruit tree.',
    iconOrEmoji: '🏡'
  },
  {
    id: 'mem-m-4',
    category: 'place',
    name: 'Mahabhairab Bazaar',
    relationshipOrDetail: 'Local Market',
    description: 'The weekly community market Meera visited for fresh river fish and aromatic Joha rice.',
    iconOrEmoji: '🛍️'
  },
  {
    id: 'mem-m-5',
    category: 'object',
    name: 'Blue Ceramic Tea Cup',
    relationshipOrDetail: 'Morning Tea Cup',
    description: 'Handcrafted blue mug brought by Ananya from Shillong. Used daily for 7:00 AM tea.',
    iconOrEmoji: '☕'
  },
  {
    id: 'mem-m-6',
    category: 'object',
    name: 'Kopou Phool (Foxtail Orchid)',
    relationshipOrDetail: 'Courtyard Orchid',
    description: 'Delicate pink and white orchid that blooms every Rongali Bihu season in the garden.',
    iconOrEmoji: '🌸'
  },
  {
    id: 'mem-m-7',
    category: 'routine',
    name: 'Morning Assam Tea',
    relationshipOrDetail: 'Step 1 of Morning Routine',
    description: 'Freshly brewed warm CTC tea enjoyed on the veranda while watching the birds.',
    iconOrEmoji: '☕',
    sequenceStep: 1
  },
  {
    id: 'mem-m-8',
    category: 'routine',
    name: 'Take Blood Pressure Medicine',
    relationshipOrDetail: 'Step 2 of Morning Routine (Correct next step)',
    description: 'Daily tablet taken with a warm glass of water 15 minutes after finishing tea.',
    iconOrEmoji: '💊',
    sequenceStep: 2
  },
  {
    id: 'mem-m-9',
    category: 'routine',
    name: 'Courtyard Garden Walk',
    relationshipOrDetail: 'Step 3 of Morning Routine',
    description: 'Gentle stroll to check on the flowering plants and garden herbs.',
    iconOrEmoji: '🌿',
    sequenceStep: 3
  }
];

export const meeraSessions: GameSession[] = [
  {
    id: 'sess-m-01',
    patientId: 'patient-meera-01',
    activityId: 'memory_recall',
    activityTitle: 'Memory Recall',
    timestamp: 'Today, 10:42 AM',
    difficultyLevel: 2,
    accuracy: 87,
    responseTimeMs: 2950,
    responseSpeedRating: 'Good',
    completionRate: 100,
    consistencyScore: 0.88,
    attempts: 5,
    errors: 0,
    isPersonalized: false,
    syncStatus: 'synced'
  },
  {
    id: 'sess-m-02',
    patientId: 'patient-meera-01',
    activityId: 'routine_recall',
    activityTitle: 'Routine Recall',
    timestamp: 'Today, 10:30 AM',
    difficultyLevel: 1,
    accuracy: 90,
    responseTimeMs: 2750,
    responseSpeedRating: 'Fast',
    completionRate: 100,
    consistencyScore: 0.90,
    attempts: 3,
    errors: 0,
    isPersonalized: true,
    syncStatus: 'synced'
  },
  {
    id: 'sess-m-03',
    patientId: 'patient-meera-01',
    activityId: 'attention',
    activityTitle: 'Attention Focus',
    timestamp: 'Yesterday, 04:15 PM',
    difficultyLevel: 2,
    accuracy: 74,
    responseTimeMs: 1180,
    responseSpeedRating: 'Good',
    completionRate: 100,
    consistencyScore: 0.82,
    attempts: 10,
    errors: 2,
    isPersonalized: false,
    syncStatus: 'synced'
  }
];

export const meeraDecisions: AdaptiveDecision[] = [
  {
    id: 'dec-m-1',
    sessionId: 'sess-m-01',
    patientId: 'patient-meera-01',
    timestamp: 'Today, 10:43 AM',
    previousLevel: 1,
    newLevel: 2,
    performanceScore: 0.86,
    metrics: {
      accuracy: 87,
      responseSpeedNorm: 0.85,
      consistency: 0.88,
      completion: 1.0,
      recentTrend: 0.85
    },
    decision: 'increase',
    reason: 'Sustained recall performance above the 0.80 threshold with excellent response stability.',
    clinicalDisclaimer: 'This is an activity-personalization decision, not a clinical diagnosis.'
  }
];

// ==========================================
// 2. TENZING NORBU (patient-tenzing-02) SEED DATA
// ==========================================
export const tenzingReminders: Reminder[] = [
  {
    id: 'rem-t-1',
    title: 'Morning Aspirin & BP Vitals',
    category: 'medicine',
    timeStr: '07:30 AM',
    detail: 'Low-dose Aspirin 75mg with warm herbal water. Log cuff readings.',
    status: 'completed',
    lastCompletedAt: 'Today, 07:45 AM',
    icon: '💊'
  },
  {
    id: 'rem-t-2',
    title: 'Himalayan Herbal Hydration',
    category: 'hydration',
    timeStr: '11:00 AM',
    detail: 'Lukewarm water with crushed ginger and honey for vascular warmth.',
    status: 'pending',
    icon: '💧'
  },
  {
    id: 'rem-t-3',
    title: 'Enchey Monastery Walk',
    category: 'daily_activity',
    timeStr: '04:30 PM',
    detail: 'Gentle 20-minute walk with trekking pole along the paved prayer road.',
    status: 'pending',
    icon: '🌿'
  },
  {
    id: 'rem-t-4',
    title: 'Dr. Dorjee Cardiology Review',
    category: 'appointment',
    timeStr: 'Monday, 10:30 AM',
    detail: 'Vascular follow-up and ECG check at STNM Hospital, Gangtok.',
    status: 'pending',
    icon: '🩺'
  }
];

export const tenzingMemories: PersonalMemoryItem[] = [
  {
    id: 'mem-t-1',
    category: 'person',
    name: 'Pema Norbu',
    relationshipOrDetail: 'Son & Caregiver',
    description: 'Runs eco-tourism in Gangtok. Brings fresh yak cheese and checks blood pressure daily.',
    iconOrEmoji: '👨‍👦'
  },
  {
    id: 'mem-t-2',
    category: 'person',
    name: 'Dolma Tenzing',
    relationshipOrDetail: 'Granddaughter',
    description: 'School captain at Tashi Namgyal Academy. Recites monastery stories every weekend.',
    iconOrEmoji: '👧'
  },
  {
    id: 'mem-t-3',
    category: 'place',
    name: 'Ridge Park & Kanchenjunga View',
    relationshipOrDetail: 'Favorite Viewpoint',
    description: 'The hill ridge where the peaks of Mt. Kanchenjunga turn golden at morning sunrise.',
    iconOrEmoji: '🏔️'
  },
  {
    id: 'mem-t-4',
    category: 'place',
    name: 'Enchey Monastery',
    relationshipOrDetail: '200-Year-Old Nyingma Shrine',
    description: 'Peaceful pine-scented courtyard where Tenzing spins prayer wheels every morning.',
    iconOrEmoji: '🛕'
  },
  {
    id: 'mem-t-5',
    category: 'object',
    name: 'Brass Mani Prayer Wheel',
    relationshipOrDetail: 'Heirloom from grandfather',
    description: 'Handheld embossed prayer cylinder with Om Mani Padme Hum mantra inside.',
    iconOrEmoji: '☸️'
  },
  {
    id: 'mem-t-6',
    category: 'routine',
    name: 'Warm Butter Tea & Chanting',
    relationshipOrDetail: 'Step 1 of Morning Routine',
    description: 'Sip warm salted butter tea while facing Kanchenjunga ridge.',
    iconOrEmoji: '🍵',
    sequenceStep: 1
  },
  {
    id: 'mem-t-7',
    category: 'routine',
    name: 'Take Heart Medicine',
    relationshipOrDetail: 'Step 2 of Morning Routine (Correct next step)',
    description: 'Take daily Aspirin and blood pressure tablet with boiled spring water.',
    iconOrEmoji: '💊',
    sequenceStep: 2
  },
  {
    id: 'mem-t-8',
    category: 'routine',
    name: 'Gentle Veranda Breathing',
    relationshipOrDetail: 'Step 3 of Morning Routine',
    description: '10 deep rhythmic breaths to support oxygenation and calm blood flow.',
    iconOrEmoji: '🧘',
    sequenceStep: 3
  }
];

export const tenzingSessions: GameSession[] = [
  {
    id: 'sess-t-01',
    patientId: 'patient-tenzing-02',
    activityId: 'pattern',
    activityTitle: 'Pattern Recognition',
    timestamp: 'Today, 09:15 AM',
    difficultyLevel: 1,
    accuracy: 64,
    responseTimeMs: 4400,
    responseSpeedRating: 'Deliberate',
    completionRate: 100,
    consistencyScore: 0.65,
    attempts: 4,
    errors: 1,
    isPersonalized: false,
    syncStatus: 'synced'
  },
  {
    id: 'sess-t-02',
    patientId: 'patient-tenzing-02',
    activityId: 'find_object',
    activityTitle: 'Find The Object',
    timestamp: 'Yesterday, 11:30 AM',
    difficultyLevel: 1,
    accuracy: 68,
    responseTimeMs: 3900,
    responseSpeedRating: 'Good',
    completionRate: 100,
    consistencyScore: 0.70,
    attempts: 5,
    errors: 1,
    isPersonalized: false,
    syncStatus: 'synced'
  },
  {
    id: 'sess-t-03',
    patientId: 'patient-tenzing-02',
    activityId: 'attention',
    activityTitle: 'Attention Focus',
    timestamp: '2 days ago',
    difficultyLevel: 1,
    accuracy: 60,
    responseTimeMs: 1650,
    responseSpeedRating: 'Deliberate',
    completionRate: 100,
    consistencyScore: 0.62,
    attempts: 8,
    errors: 3,
    isPersonalized: false,
    syncStatus: 'synced'
  }
];

export const tenzingDecisions: AdaptiveDecision[] = [
  {
    id: 'dec-t-1',
    sessionId: 'sess-t-01',
    patientId: 'patient-tenzing-02',
    timestamp: 'Today, 09:16 AM',
    previousLevel: 1,
    newLevel: 1,
    performanceScore: 0.64,
    metrics: {
      accuracy: 64,
      responseSpeedNorm: 0.60,
      consistency: 0.65,
      completion: 1.0,
      recentTrend: 0.64
    },
    decision: 'maintain',
    reason: 'Performance is within the target engagement zone (0.55 – 0.80). Level 1 maintained to build confidence.',
    clinicalDisclaimer: 'This is an activity-personalization decision, not a clinical diagnosis.'
  }
];

// ==========================================
// 3. BIREN SINGHA (patient-biren-03) SEED DATA
// ==========================================
export const birenReminders: Reminder[] = [
  {
    id: 'rem-b-1',
    title: 'Post-Breakfast Metformin',
    category: 'medicine',
    timeStr: '08:30 AM',
    detail: 'Metformin 500mg with lukewarm water following puffed rice breakfast.',
    status: 'completed',
    lastCompletedAt: 'Today, 08:40 AM',
    icon: '💊'
  },
  {
    id: 'rem-b-2',
    title: 'Midday Coconut Water & Hydration',
    category: 'hydration',
    timeStr: '01:00 PM',
    detail: 'Fresh green coconut water or electrolyte hydration.',
    status: 'pending',
    icon: '💧'
  },
  {
    id: 'rem-b-3',
    title: 'Silchar Club Chess & Walk',
    category: 'daily_activity',
    timeStr: '05:00 PM',
    detail: 'Evening walk down Club Road and a game of chess with fellow pensioners.',
    status: 'pending',
    icon: '♟️'
  },
  {
    id: 'rem-b-4',
    title: 'Dr. Bhattacharjee Eye Clinic',
    category: 'appointment',
    timeStr: 'Thursday, 11:00 AM',
    detail: 'Annual retinal evaluation and intraocular pressure check at Park Road.',
    status: 'pending',
    icon: '🩺'
  }
];

export const birenMemories: PersonalMemoryItem[] = [
  {
    id: 'mem-b-1',
    category: 'person',
    name: 'Debjani Singha',
    relationshipOrDetail: 'Daughter & High School Teacher',
    description: 'Teaches Bengali literature in Silchar. Visits every afternoon with fresh news and sweets.',
    iconOrEmoji: '👩‍🏫'
  },
  {
    id: 'mem-b-2',
    category: 'person',
    name: 'Subir Singha',
    relationshipOrDetail: 'Grandson',
    description: 'High school student who loves playing chess and solving math problems with Dadu.',
    iconOrEmoji: '👦'
  },
  {
    id: 'mem-b-3',
    category: 'place',
    name: 'Cachar Tea Estate Bungalow',
    relationshipOrDetail: 'Workplace for 35 Years',
    description: 'The historic colonial-style estate bungalow surrounded by rolling lush green tea gardens.',
    iconOrEmoji: '🏡'
  },
  {
    id: 'mem-b-4',
    category: 'place',
    name: 'Barak River Promenade',
    relationshipOrDetail: 'Evening Meeting Point',
    description: 'Scenic riverbank path where senior club members gather for evening breeze and discussions.',
    iconOrEmoji: '🌅'
  },
  {
    id: 'mem-b-5',
    category: 'object',
    name: 'Silver Pocket Watch',
    relationshipOrDetail: 'Retirement Memento (2012)',
    description: 'Swiss mechanical watch presented by the Tea Planters Association for 35 years of service.',
    iconOrEmoji: '⏱️'
  },
  {
    id: 'mem-b-6',
    category: 'routine',
    name: 'Bengali Newspaper & Rabindrasangeet',
    relationshipOrDetail: 'Step 1 of Morning Routine',
    description: 'Reading Dainik Jugasankha while listening to morning Tagore songs.',
    iconOrEmoji: '📰',
    sequenceStep: 1
  },
  {
    id: 'mem-b-7',
    category: 'routine',
    name: 'Take Metformin Tablet',
    relationshipOrDetail: 'Step 2 of Morning Routine (Correct next step)',
    description: 'Daily tablet taken exactly 20 minutes after completing morning breakfast.',
    iconOrEmoji: '💊',
    sequenceStep: 2
  },
  {
    id: 'mem-b-8',
    category: 'routine',
    name: 'Morning Chess Puzzle',
    relationshipOrDetail: 'Step 3 of Morning Routine',
    description: 'Solving the daily newspaper endgame puzzle on the wooden chess board.',
    iconOrEmoji: '♟️',
    sequenceStep: 3
  }
];

export const birenSessions: GameSession[] = [
  {
    id: 'sess-b-01',
    patientId: 'patient-biren-03',
    activityId: 'number_sequence',
    activityTitle: 'Number Sequence',
    timestamp: 'Today, 11:10 AM',
    difficultyLevel: 3,
    accuracy: 94,
    responseTimeMs: 1850,
    responseSpeedRating: 'Fast',
    completionRate: 100,
    consistencyScore: 0.94,
    attempts: 5,
    errors: 0,
    isPersonalized: false,
    syncStatus: 'synced'
  },
  {
    id: 'sess-b-02',
    patientId: 'patient-biren-03',
    activityId: 'planning',
    activityTitle: 'Executive Planning',
    timestamp: 'Today, 10:50 AM',
    difficultyLevel: 3,
    accuracy: 90,
    responseTimeMs: 2300,
    responseSpeedRating: 'Fast',
    completionRate: 100,
    consistencyScore: 0.90,
    attempts: 4,
    errors: 0,
    isPersonalized: false,
    syncStatus: 'synced'
  },
  {
    id: 'sess-b-03',
    patientId: 'patient-biren-03',
    activityId: 'attention_challenge',
    activityTitle: 'Attention Challenge',
    timestamp: 'Yesterday, 05:20 PM',
    difficultyLevel: 2,
    accuracy: 88,
    responseTimeMs: 1120,
    responseSpeedRating: 'Fast',
    completionRate: 100,
    consistencyScore: 0.88,
    attempts: 10,
    errors: 1,
    isPersonalized: false,
    syncStatus: 'synced'
  }
];

export const birenDecisions: AdaptiveDecision[] = [
  {
    id: 'dec-b-1',
    sessionId: 'sess-b-01',
    patientId: 'patient-biren-03',
    timestamp: 'Today, 11:11 AM',
    previousLevel: 2,
    newLevel: 3,
    performanceScore: 0.92,
    metrics: {
      accuracy: 94,
      responseSpeedNorm: 0.90,
      consistency: 0.94,
      completion: 1.0,
      recentTrend: 0.92
    },
    decision: 'increase',
    reason: 'Exceptional executive accuracy and rapid reaction speed support Level 3 advancement.',
    clinicalDisclaimer: 'This is an activity-personalization decision, not a clinical diagnosis.'
  }
];

// Patient-scoped index dictionary
export const SEED_DATA_MAP: Record<string, {
  patient: Patient;
  reminders: Reminder[];
  memories: PersonalMemoryItem[];
  sessions: GameSession[];
  decisions: AdaptiveDecision[];
}> = {
  'patient-meera-01': {
    patient: demoPatients[0],
    reminders: meeraReminders,
    memories: meeraMemories,
    sessions: meeraSessions,
    decisions: meeraDecisions
  },
  'patient-tenzing-02': {
    patient: demoPatients[1],
    reminders: tenzingReminders,
    memories: tenzingMemories,
    sessions: tenzingSessions,
    decisions: tenzingDecisions
  },
  'patient-biren-03': {
    patient: demoPatients[2],
    reminders: birenReminders,
    memories: birenMemories,
    sessions: birenSessions,
    decisions: birenDecisions
  }
};

// Aliases for backwards compatibility
export const initialReminders = meeraReminders;
export const initialPersonalMemories = meeraMemories;
export const initialSessions = meeraSessions;
export const initialAdaptiveDecisions = meeraDecisions;
