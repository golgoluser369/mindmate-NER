// Mind Mate Data Models & Domain Types
// SIH26003: Cognitive Gaming & Memory Assistance Platform

export type LanguageCode = 
  | 'en' 
  | 'hi' 
  | 'as' 
  | 'regional' 
  | 'brx' 
  | 'mni' 
  | 'kha' 
  | 'grt' 
  | 'lus' 
  | 'kok' 
  | 'nag' 
  | 'ne' 
  | 'adi'
  | 'bn'
  | 'mjw'
  | 'mif';

export interface NERLanguageOption {
  code: LanguageCode;
  label: string;
  nativeName: string;
  state: string;
  badge?: string;
  ttsTag: string;
  bhashiniCode?: string;
}

export const NER_LANGUAGES: NERLanguageOption[] = [
  { code: 'as', label: 'Assamese', nativeName: 'অসমীয়া', state: 'Assam', badge: 'Bhashini Official', ttsTag: 'as-IN', bhashiniCode: 'as' },
  { code: 'brx', label: 'Bodo', nativeName: 'बर\'', state: 'Bodoland / Assam', badge: 'Bhashini 8th Sched', ttsTag: 'brx-IN', bhashiniCode: 'brx' },
  { code: 'mni', label: 'Manipuri / Meitei', nativeName: 'মৈতৈলোন্', state: 'Manipur', badge: 'Bhashini 8th Sched', ttsTag: 'mni-IN', bhashiniCode: 'mni' },
  { code: 'bn', label: 'Bengali (NER)', nativeName: 'বাংলা (বৰাক উপত্যকা)', state: 'Tripura / Assam', badge: 'Bhashini 8th Sched', ttsTag: 'bn-IN', bhashiniCode: 'bn' },
  { code: 'kha', label: 'Khasi', nativeName: 'Ka Ktien Khasi', state: 'Meghalaya', badge: 'Bhashini NER', ttsTag: 'en-IN', bhashiniCode: 'kha' },
  { code: 'grt', label: 'Garo', nativeName: 'A·chik', state: 'Meghalaya', badge: 'Bhashini NER', ttsTag: 'en-IN', bhashiniCode: 'grt' },
  { code: 'lus', label: 'Mizo', nativeName: 'Mizo ṭawng', state: 'Mizoram', badge: 'Bhashini NER', ttsTag: 'en-IN', bhashiniCode: 'lus' },
  { code: 'kok', label: 'Kokborok', nativeName: 'Kokborok', state: 'Tripura', badge: 'Bhashini NER', ttsTag: 'bn-IN', bhashiniCode: 'kok' },
  { code: 'nag', label: 'Nagamese', nativeName: 'Nagamese', state: 'Nagaland', badge: 'Bhashini Lingua', ttsTag: 'as-IN', bhashiniCode: 'nag' },
  { code: 'ne', label: 'Nepali', nativeName: 'नेपाली', state: 'Sikkim', badge: 'Bhashini 8th Sched', ttsTag: 'ne-NP', bhashiniCode: 'ne' },
  { code: 'adi', label: 'Nyishi / Adi', nativeName: 'Nyishi / Adi', state: 'Arunachal Pradesh', badge: 'Bhashini Indigenous', ttsTag: 'hi-IN', bhashiniCode: 'adi' },
  { code: 'mjw', label: 'Karbi', nativeName: 'Karbi Lamthe', state: 'Karbi Anglong, Assam', badge: 'Bhashini NER', ttsTag: 'as-IN', bhashiniCode: 'mjw' },
  { code: 'mif', label: 'Mishing', nativeName: 'Mising Agom', state: 'Assam Valley', badge: 'Bhashini NER', ttsTag: 'as-IN', bhashiniCode: 'mif' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी', state: 'National', badge: 'Bhashini National', ttsTag: 'hi-IN', bhashiniCode: 'hi' },
  { code: 'en', label: 'English', nativeName: 'English', state: 'Standard', badge: 'Universal', ttsTag: 'en-IN', bhashiniCode: 'en' }
];

export type SupportProfileId = 
  | 'general' 
  | 'memory_routine' 
  | 'vascular_cognitive' 
  | 'memory_focused' 
  | 'attention_planning' 
  | 'post_stroke';

export type ActivityType = 
  | 'memory_match'
  | 'who_am_i'
  | 'daily_routine'
  | 'find_object'
  | 'shopping_memory'
  | 'route_memory'
  | 'picture_pair'
  | 'sequence_recall'
  | 'story_recall'
  | 'object_memory'
  | 'family_quiz'
  | 'pattern'
  | 'number_sequence'
  | 'planning'
  | 'attention_challenge'
  | 'tap_target'
  | 'picture_naming'
  | 'object_selection'
  | 'spatial_tasks'
  | 'step_sequencing'
  | 'rule_switch'
  | 'memory_recall'
  | 'pattern_recognition'
  | 'routine_recall'
  | 'attention';

export interface ActivityDefinition {
  id: ActivityType;
  name: string;
  category: 'memory' | 'attention' | 'planning' | 'routine' | 'recognition' | 'spatial' | 'sequencing';
  supportProfiles: SupportProfileId[];
  cognitiveFunction: string;
  difficultyLevels: number[];
  estimatedDuration: number; // in minutes
  languageSupport: boolean;
  voiceSupport: boolean;
  personalizable: boolean;
  offlineCapable: boolean;
  metrics: string[];
  description: string;
  iconName: string;
}

export interface SupportProfileDefinition {
  id: SupportProfileId;
  name: string;
  subtitle: string;
  description: string;
  badge: string;
  focusAreas: string[];
  recommendedActivities: ActivityType[];
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  preferredLanguage: LanguageCode;
  region: string;
  caregiverId: string;
  caregiverName: string;
  connectivityProfile: 'online' | 'intermittent' | 'offline';
  supportProfileId: SupportProfileId;
  currentLevel: number;
  avatarSeed?: string;
  notes?: string;
}

export interface ActivityMetricScore {
  accuracy: number; // 0 to 100
  responseSpeedNorm: number; // 0 to 1
  consistency: number; // 0 to 1
  completion: number; // 0 to 1
  recentTrend: number; // 0 to 1
}

export interface GameSession {
  id: string;
  patientId: string;
  activityId: ActivityType;
  activityTitle: string;
  timestamp: string;
  difficultyLevel: number;
  accuracy: number; // percentage 0-100
  responseTimeMs: number;
  responseSpeedRating: 'Fast' | 'Good' | 'Moderate' | 'Deliberate';
  completionRate: number; // percentage 0-100
  consistencyScore: number; // 0-1
  attempts: number;
  errors: number;
  isPersonalized: boolean;
  syncStatus: 'synced' | 'pending';
}

export interface AdaptiveDecision {
  id: string;
  sessionId: string;
  patientId: string;
  timestamp: string;
  previousLevel: number;
  newLevel: number;
  performanceScore: number; // 0.00 to 1.00
  metrics: ActivityMetricScore;
  decision: 'increase' | 'maintain' | 'decrease';
  reason: string;
  clinicalDisclaimer: string;
  mlRecommendation?: MLPredictionResult;
}

// Machine Learning Model Types (Random Forest Personalization V2)
export type MLRecommendationCode = 0 | 1 | 2 | 3 | 4;

export type MLRecommendationLabel = 
  | 'Increase difficulty'
  | 'Maintain difficulty'
  | 'Reduce difficulty'
  | 'Change game type'
  | 'Increase repetition';

export interface MLTelemetryFeatures {
  accuracy: number;            // 0.0 - 1.0
  response_time: number;       // seconds
  attempts: number;            // 1 - 10
  completion: number;          // 0.0 - 1.0
  hint_usage: number;          // 0 - 5
  recent_performance: number;  // 0.0 - 1.0
  difficulty: number;          // 1 - 4
  game_type: number;           // 0=Memory, 1=Attention, 2=Problem Solving, 3=Reaction
  memory_score: number;        // 0.0 - 1.0
  attention_score: number;     // 0.0 - 1.0
  engagement_score: number;    // 0.0 - 1.0
  fatigue_proxy: number;       // 0.0 - 1.0
}

export interface MLPredictionResult {
  predictedClass: MLRecommendationCode;
  recommendation: MLRecommendationLabel;
  probabilities: { [key in MLRecommendationCode]: number };
  featureImportance: { [feature: string]: number };
  telemetry: MLTelemetryFeatures;
  source: 'live_python_api' | 'offline_browser_model';
  modelName: string;
  confidence: number;
}

export type MemoryCategory = 'person' | 'place' | 'object' | 'routine';

export interface PersonalMemoryItem {
  id: string;
  category: MemoryCategory;
  name: string;
  relationshipOrDetail: string;
  description: string;
  iconOrEmoji: string;
  imageUrl?: string;
  sequenceStep?: number;
}

export type ReminderCategory = 'medicine' | 'hydration' | 'daily_activity' | 'appointment';

export interface Reminder {
  id: string;
  title: string;
  category: ReminderCategory;
  timeStr: string;
  detail: string;
  status: 'pending' | 'completed' | 'snoozed';
  lastCompletedAt?: string;
  icon: string;
}

export interface SyncEvent {
  id: string;
  entityType: 'session' | 'reminder' | 'memory' | 'profile';
  entityId: string;
  action: 'create' | 'update';
  payloadSummary: string;
  queuedAt: string;
  syncedAt?: string;
}

export interface ContentItem {
  id: string;
  language: LanguageCode;
  region: string;
  category: string;
  difficulty: number;
  activityType: ActivityType;
  title: string;
  prompt: string;
  items?: string[];
  options?: string[];
  correctAnswer?: string | string[];
  culturalNote?: string;
}

export type DemoScenarioId = 'strong' | 'struggling' | 'offline' | 'personalized' | 'caregiver_loop';

export interface ChatMessageAction {
  label: string;
  actionType: 'view_reminders' | 'view_memories' | 'start_activity' | 'speak' | 'call_caregiver';
  payload?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  topic?: 'routine' | 'medicine' | 'family' | 'memory' | 'emotional_support' | 'orientation' | 'general';
  actions?: ChatMessageAction[];
  sentiment?: 'calm' | 'happy' | 'confused' | 'anxious' | 'neutral' | 'nostalgic';
}

export interface CompanionConversation {
  id: string;
  patientId: string;
  timestamp: string;
  messages: ChatMessage[];
  summary?: string;
  primaryMood?: 'calm' | 'happy' | 'confused' | 'anxious' | 'nostalgic';
}

