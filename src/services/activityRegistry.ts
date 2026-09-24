// Mind Mate Centralized Activity Registry
// SIH26003: Cognitive Gaming & Memory Assistance Platform

import { ActivityDefinition, SupportProfileDefinition, SupportProfileId, ActivityType } from '../models/types';

export const SUPPORT_PROFILES: SupportProfileDefinition[] = [
  {
    id: 'general',
    name: 'General Cognitive Support',
    subtitle: 'Balanced cognitive engagement & everyday wellness',
    description: 'Emphasizes balanced memory, routine consistency, vigilance, and familiar household concepts.',
    badge: 'Balanced Pathway',
    focusAreas: ['Working Memory', 'Daily Routines', 'Vigilance', 'Rule Induction'],
    recommendedActivities: ['memory_match', 'daily_routine', 'attention_challenge', 'pattern', 'shopping_memory', 'rule_switch']
  },
  {
    id: 'memory_routine',
    name: 'Memory & Routine Support',
    subtitle: 'Familiar recall, daily routines & family memory context',
    description: 'Designed around familiar personal history, morning routines, story recall, and family connection.',
    badge: 'Memory Pathway',
    focusAreas: ['Personal Routines', 'Picture Pairs', 'Story Comprehension', 'Family Quiz'],
    recommendedActivities: ['memory_match', 'picture_pair', 'story_recall', 'object_memory', 'daily_routine', 'family_quiz']
  },
  {
    id: 'vascular_cognitive',
    name: 'Vascular-Cognitive Support',
    subtitle: 'Motor-reaction timing, spatial routes & functional errands',
    description: 'Emphasizes processing speed, visual search, shopping lists, and local route orientation.',
    badge: 'Processing & Motor Pathway',
    focusAreas: ['Target Interaction', 'Shopping Lists', 'Route Navigation', 'Reaction Timing'],
    recommendedActivities: ['tap_target', 'shopping_memory', 'route_memory', 'attention_challenge', 'find_object']
  },
  {
    id: 'memory_focused',
    name: 'Memory-Focused Support',
    subtitle: 'Visual retention, identity recognition & object recall',
    description: 'Emphasizes gentle memory recognition, familiar identity cards, and low-distraction visual recall.',
    badge: 'Retention Pathway',
    focusAreas: ['Object Recognition', 'Identity Familiarity', 'Picture Pairs', 'Gentle Recall'],
    recommendedActivities: ['memory_match', 'object_memory', 'who_am_i', 'picture_pair', 'story_recall']
  },
  {
    id: 'attention_planning',
    name: 'Attention & Planning Support',
    subtitle: 'Cognitive flexibility, sequence deduction & task planning',
    description: 'Emphasizes executive planning, number progressions, sustained vigilance, and rule-switching flexibility.',
    badge: 'Executive Pathway',
    focusAreas: ['Pattern Induction', 'Number Sequences', 'Task Planning', 'Rule Switching'],
    recommendedActivities: ['pattern', 'number_sequence', 'planning', 'attention_challenge', 'rule_switch']
  },
  {
    id: 'post_stroke',
    name: 'Post-Stroke Cognitive Support',
    subtitle: 'Expressive naming, spatial relations & procedural sequencing',
    description: 'Emphasizes expressive speech/touch naming, functional object categories, spatial tasks, and procedural steps.',
    badge: 'Functional Pathway',
    focusAreas: ['Picture Naming', 'Object Categorization', 'Spatial Relations', 'Procedural Steps'],
    recommendedActivities: ['picture_naming', 'object_selection', 'spatial_tasks', 'step_sequencing', 'attention_challenge']
  }
];

export const ACTIVITY_REGISTRY: ActivityDefinition[] = [
  {
    id: 'memory_match',
    name: 'Memory Match',
    category: 'memory',
    supportProfiles: ['general', 'memory_routine', 'memory_focused'],
    cognitiveFunction: 'working-memory',
    difficultyLevels: [1, 2, 3, 4],
    estimatedDuration: 3,
    languageSupport: true,
    voiceSupport: true,
    personalizable: true,
    offlineCapable: true,
    metrics: ['accuracy', 'responseTime', 'attempts', 'completion'],
    description: 'Memorize familiar cards and uncover matching pairs. Adapts card count and display timing.',
    iconName: 'Brain'
  },
  {
    id: 'who_am_i',
    name: 'Who Am I?',
    category: 'recognition',
    supportProfiles: ['general', 'memory_focused', 'memory_routine'],
    cognitiveFunction: 'identity-familiarity',
    difficultyLevels: [1, 2],
    estimatedDuration: 2,
    languageSupport: true,
    voiceSupport: true,
    personalizable: true,
    offlineCapable: true,
    metrics: ['accuracy', 'responseTime', 'attempts'],
    description: 'Identity and familiarity recognition using caregiver-configured family photos and relationships.',
    iconName: 'Users'
  },
  {
    id: 'daily_routine',
    name: 'Daily Routine Recall',
    category: 'routine',
    supportProfiles: ['general', 'memory_routine'],
    cognitiveFunction: 'routine-ordering',
    difficultyLevels: [1, 2, 3],
    estimatedDuration: 3,
    languageSupport: true,
    voiceSupport: true,
    personalizable: true,
    offlineCapable: true,
    metrics: ['correctSequence', 'time', 'errors', 'completion'],
    description: 'Sequence daily household activities (tea, medicine, walk) based on personal schedule.',
    iconName: 'HeartHandshake'
  },
  {
    id: 'find_object',
    name: 'Find Object',
    category: 'attention',
    supportProfiles: ['general', 'memory_routine', 'vascular_cognitive'],
    cognitiveFunction: 'visual-search',
    difficultyLevels: [1, 2, 3],
    estimatedDuration: 2,
    languageSupport: true,
    voiceSupport: true,
    personalizable: true,
    offlineCapable: true,
    metrics: ['reactionTime', 'accuracy', 'missedAttempts'],
    description: 'Visual search for a target household item among familiar distractors in a visual grid.',
    iconName: 'Target'
  },
  {
    id: 'shopping_memory',
    name: 'Shopping Memory',
    category: 'memory',
    supportProfiles: ['vascular_cognitive', 'general'],
    cognitiveFunction: 'delayed-recall',
    difficultyLevels: [1, 2, 3],
    estimatedDuration: 3,
    languageSupport: true,
    voiceSupport: true,
    personalizable: true,
    offlineCapable: true,
    metrics: ['accuracy', 'listRecall', 'responseTime'],
    description: 'Review a familiar market basket list (tea, rice, soap), then select the items that were on the list.',
    iconName: 'ShoppingBag'
  },
  {
    id: 'route_memory',
    name: 'Route Memory',
    category: 'spatial',
    supportProfiles: ['vascular_cognitive'],
    cognitiveFunction: 'spatial-navigation',
    difficultyLevels: [1, 2],
    estimatedDuration: 3,
    languageSupport: true,
    voiceSupport: true,
    personalizable: false,
    offlineCapable: true,
    metrics: ['routeAccuracy', 'responseTime'],
    description: 'Observe a gentle route sequence (Home → Market → Pharmacy → Home) and recall stops.',
    iconName: 'Compass'
  },
  {
    id: 'picture_pair',
    name: 'Picture Pair',
    category: 'memory',
    supportProfiles: ['memory_routine', 'memory_focused', 'general'],
    cognitiveFunction: 'visual-association',
    difficultyLevels: [1, 2, 3],
    estimatedDuration: 2,
    languageSupport: true,
    voiceSupport: true,
    personalizable: false,
    offlineCapable: true,
    metrics: ['accuracy', 'matchSpeed', 'completion'],
    description: 'Match pairs of familiar household items (tea cups, flowers, woven baskets) with low visual clutter.',
    iconName: 'Images'
  },
  {
    id: 'sequence_recall',
    name: 'Sequence Recall',
    category: 'sequencing',
    supportProfiles: ['memory_routine', 'attention_planning'],
    cognitiveFunction: 'sequential-processing',
    difficultyLevels: [1, 2, 3],
    estimatedDuration: 3,
    languageSupport: true,
    voiceSupport: true,
    personalizable: true,
    offlineCapable: true,
    metrics: ['sequenceAccuracy', 'responseSpeed'],
    description: 'Observe sequential symbols or daily events and select what comes next in sequence.',
    iconName: 'ArrowRight'
  },
  {
    id: 'story_recall',
    name: 'Story Recall',
    category: 'memory',
    supportProfiles: ['memory_routine', 'memory_focused'],
    cognitiveFunction: 'auditory-narrative-memory',
    difficultyLevels: [1, 2],
    estimatedDuration: 4,
    languageSupport: true,
    voiceSupport: true,
    personalizable: false,
    offlineCapable: true,
    metrics: ['comprehensionAccuracy', 'responseTime'],
    description: 'Read or listen to a short everyday story, then answer 2-3 simple comprehension questions.',
    iconName: 'BookOpen'
  },
  {
    id: 'object_memory',
    name: 'Object Memory',
    category: 'memory',
    supportProfiles: ['memory_routine', 'memory_focused'],
    cognitiveFunction: 'visual-retention',
    difficultyLevels: [1, 2, 3],
    estimatedDuration: 2,
    languageSupport: true,
    voiceSupport: true,
    personalizable: true,
    offlineCapable: true,
    metrics: ['retentionAccuracy', 'recognitionSpeed'],
    description: 'Briefly view 3-5 familiar household objects, then select which specific object was shown.',
    iconName: 'Eye'
  },
  {
    id: 'family_quiz',
    name: 'Family Quiz',
    category: 'memory',
    supportProfiles: ['memory_routine', 'memory_focused'],
    cognitiveFunction: 'autobiographical-memory',
    difficultyLevels: [1, 2],
    estimatedDuration: 2,
    languageSupport: true,
    voiceSupport: true,
    personalizable: true,
    offlineCapable: true,
    metrics: ['recallAccuracy', 'responseTime'],
    description: 'Gentle recall questions based on caregiver-entered family milestones and weekly visits.',
    iconName: 'Heart'
  },
  {
    id: 'pattern',
    name: 'Pattern Activity',
    category: 'planning',
    supportProfiles: ['attention_planning', 'general'],
    cognitiveFunction: 'rule-induction',
    difficultyLevels: [1, 2, 3],
    estimatedDuration: 3,
    languageSupport: true,
    voiceSupport: true,
    personalizable: false,
    offlineCapable: true,
    metrics: ['accuracy', 'responseTime', 'attempts'],
    description: 'Identify geometric and color sequence rules (▲ ● ▲ ● ?) and tap the missing shape.',
    iconName: 'Shapes'
  },
  {
    id: 'number_sequence',
    name: 'Number Sequence',
    category: 'sequencing',
    supportProfiles: ['attention_planning'],
    cognitiveFunction: 'numerical-reasoning',
    difficultyLevels: [1, 2, 3],
    estimatedDuration: 3,
    languageSupport: true,
    voiceSupport: true,
    personalizable: false,
    offlineCapable: true,
    metrics: ['accuracy', 'stepTime'],
    description: 'Simple progression sequences (2 → 4 → 6 → ?) with large accessible numbers without complex math.',
    iconName: 'Hash'
  },
  {
    id: 'planning',
    name: 'Everyday Planning',
    category: 'planning',
    supportProfiles: ['attention_planning'],
    cognitiveFunction: 'executive-planning',
    difficultyLevels: [1, 2],
    estimatedDuration: 3,
    languageSupport: true,
    voiceSupport: true,
    personalizable: true,
    offlineCapable: true,
    metrics: ['sequenceCorrectness', 'completionTime'],
    description: 'Prioritize and sequence real everyday goals (e.g. preparing for a doctor appointment).',
    iconName: 'Calendar'
  },
  {
    id: 'attention_challenge',
    name: 'Attention Challenge',
    category: 'attention',
    supportProfiles: ['attention_planning', 'vascular_cognitive', 'post_stroke', 'general'],
    cognitiveFunction: 'sustained-vigilance',
    difficultyLevels: [1, 2, 3, 4],
    estimatedDuration: 2,
    languageSupport: true,
    voiceSupport: false,
    personalizable: false,
    offlineCapable: true,
    metrics: ['reactionTime', 'falseTaps', 'missedTargets', 'accuracy'],
    description: 'Vigilance exercise: Tap ONLY when the designated target symbol appears on screen.',
    iconName: 'Target'
  },
  {
    id: 'tap_target',
    name: 'Tap / Target Interaction',
    category: 'attention',
    supportProfiles: ['vascular_cognitive', 'post_stroke'],
    cognitiveFunction: 'motor-speed-coordination',
    difficultyLevels: [1, 2, 3],
    estimatedDuration: 2,
    languageSupport: true,
    voiceSupport: false,
    personalizable: false,
    offlineCapable: true,
    metrics: ['tapSpeed', 'accuracy'],
    description: 'Tap the moving target circle as it repositions across a calm grid. Evaluates motor coordination.',
    iconName: 'MousePointer'
  },
  {
    id: 'picture_naming',
    name: 'Picture Naming',
    category: 'recognition',
    supportProfiles: ['post_stroke'],
    cognitiveFunction: 'expressive-naming',
    difficultyLevels: [1, 2],
    estimatedDuration: 3,
    languageSupport: true,
    voiceSupport: true,
    personalizable: true,
    offlineCapable: true,
    metrics: ['namingAccuracy', 'voiceAttempted', 'responseTime'],
    description: 'Identify common everyday household items using voice speech input or clear button selection.',
    iconName: 'Mic'
  },
  {
    id: 'object_selection',
    name: 'Object Selection',
    category: 'recognition',
    supportProfiles: ['post_stroke'],
    cognitiveFunction: 'semantic-categorization',
    difficultyLevels: [1, 2],
    estimatedDuration: 2,
    languageSupport: true,
    voiceSupport: true,
    personalizable: false,
    offlineCapable: true,
    metrics: ['categoryAccuracy', 'responseTime'],
    description: 'Select the object matching functional categories (e.g. "Select the item used for drinking").',
    iconName: 'CheckSquare'
  },
  {
    id: 'spatial_tasks',
    name: 'Spatial Reasoning',
    category: 'spatial',
    supportProfiles: ['post_stroke'],
    cognitiveFunction: 'visuospatial-relations',
    difficultyLevels: [1, 2],
    estimatedDuration: 2,
    languageSupport: true,
    voiceSupport: true,
    personalizable: false,
    offlineCapable: true,
    metrics: ['spatialAccuracy', 'responseTime'],
    description: 'Identify spatial relationships (above, below, left of, right of) between familiar objects.',
    iconName: 'Maximize2'
  },
  {
    id: 'step_sequencing',
    name: 'Step Sequencing',
    category: 'sequencing',
    supportProfiles: ['post_stroke'],
    cognitiveFunction: 'procedural-sequencing',
    difficultyLevels: [1, 2],
    estimatedDuration: 3,
    languageSupport: true,
    voiceSupport: true,
    personalizable: true,
    offlineCapable: true,
    metrics: ['stepOrderAccuracy', 'time'],
    description: 'Arrange steps of a familiar procedural task (such as making tea: boil water, add tea, add milk, serve).',
    iconName: 'ListOrdered'
  },
  {
    id: 'rule_switch',
    name: 'Rule Switch',
    category: 'attention',
    supportProfiles: ['attention_planning', 'general'],
    cognitiveFunction: 'cognitive-flexibility',
    difficultyLevels: [1, 2, 3],
    estimatedDuration: 3,
    languageSupport: true,
    voiceSupport: true,
    personalizable: false,
    offlineCapable: true,
    metrics: ['correctResponses', 'switchErrors', 'responseTime'],
    description: 'Cognitive flexibility: The rule alternates between rounds (tap circles → tap squares → tap colors).',
    iconName: 'Shuffle'
  }
];

export function getProfileById(profileId: SupportProfileId): SupportProfileDefinition {
  return SUPPORT_PROFILES.find(p => p.id === profileId) || SUPPORT_PROFILES[0];
}

export function getActivitiesForProfile(profileId: SupportProfileId): ActivityDefinition[] {
  return ACTIVITY_REGISTRY.filter(act => act.supportProfiles.includes(profileId));
}

export function getActivityById(id: ActivityType | string): ActivityDefinition | undefined {
  // Normalize alias IDs
  let cleanId: string = id;
  if (id === 'memory_recall') cleanId = 'memory_match';
  if (id === 'pattern_recognition') cleanId = 'pattern';
  if (id === 'routine_recall') cleanId = 'daily_routine';
  if (id === 'attention') cleanId = 'attention_challenge';

  return ACTIVITY_REGISTRY.find(act => act.id === cleanId);
}
