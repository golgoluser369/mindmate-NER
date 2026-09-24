// Mind Mate Automated Verification Test Suite
// SIH26003: Cognitive Gaming & Memory Assistance Platform

import { ACTIVITY_REGISTRY, SUPPORT_PROFILES, getActivitiesForProfile, getProfileById } from '../services/activityRegistry';
import { calculatePerformanceScore, determineDifficulty, evaluateSessionAdaptively, recommendNextActivity } from '../services/adaptiveEngine';
import { extractMLFeatures, predictClientSideML, FEATURE_IMPORTANCE } from '../services/mlPersonalizationService';
import { bhashiniService, BHASHINI_NER_PROFILES } from '../services/bhashiniService';
import { locales } from '../locales';

// Mock localStorage for Node environment if needed
if (typeof localStorage === 'undefined') {
  const store: Record<string, string> = {};
  (globalThis as any).localStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, val: string) => { store[key] = val; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { for (const k in store) delete store[k]; }
  };
}

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failed++;
  }
}

console.log('====================================================');
console.log('      MIND MATE (SIH26003) SYSTEM VERIFICATION');
console.log('====================================================\n');

// TEST 1: Centralized Activity Registry
console.log('1. Centralized Activity Registry Verification:');
assert(ACTIVITY_REGISTRY.length >= 19, `Activity registry contains ${ACTIVITY_REGISTRY.length} activities (>= 19 required)`);

const requiredActivities = [
  'memory_match', 'who_am_i', 'daily_routine', 'find_object',
  'shopping_memory', 'route_memory', 'picture_pair', 'sequence_recall',
  'story_recall', 'object_memory', 'family_quiz', 'pattern',
  'number_sequence', 'planning', 'attention_challenge', 'tap_target',
  'picture_naming', 'object_selection', 'spatial_tasks', 'step_sequencing', 'rule_switch'
];

requiredActivities.forEach(actId => {
  const found = ACTIVITY_REGISTRY.find(a => a.id === actId);
  assert(found !== undefined, `Activity '${actId}' registered with complete metadata`);
  if (found) {
    assert(found.difficultyLevels.length >= 2, `Activity '${actId}' has >= 2 difficulty levels`);
    assert(found.cognitiveFunction.length > 0, `Activity '${actId}' specifies cognitive function`);
    assert(found.supportProfiles.length > 0, `Activity '${actId}' maps to >= 1 support profile`);
  }
});

// TEST 2: Demonstration Pathways Matrix
console.log('\n2. Demonstration Pathways & Activity Matrix:');
assert(SUPPORT_PROFILES.length >= 6, `Supports ${SUPPORT_PROFILES.length} clinical profiles (>= 6 required)`);

SUPPORT_PROFILES.forEach(profile => {
  const acts = getActivitiesForProfile(profile.id);
  assert(acts.length >= 3, `Profile '${profile.name}' maps to ${acts.length} activities (>= 3 required)`);
});

// TEST 3: Adaptive Engine Mathematical Validation
console.log('\n3. Adaptive Engine Mathematical Thresholds:');
const strongEval = evaluateSessionAdaptively({
  accuracy: 92,
  responseTimeMs: 2100,
  completionRate: 100,
  attempts: 4,
  errors: 0,
  recentSessions: [],
  currentLevel: 2
}, 'memory_match');

assert(strongEval.score > 0.80, `Strong user score (${strongEval.score}) exceeds 0.80 promotion threshold`);
assert(strongEval.decision === 'increase', `Strong user triggers decision 'increase'`);
assert(strongEval.newLevel === 3, `Level promoted from 2 to 3`);

const strugglingEval = evaluateSessionAdaptively({
  accuracy: 38,
  responseTimeMs: 6500,
  completionRate: 70,
  attempts: 4,
  errors: 3,
  recentSessions: [],
  currentLevel: 3
}, 'memory_match');

assert(strugglingEval.score < 0.55, `Struggling user score (${strugglingEval.score}) is below 0.55 demotion threshold`);
assert(strugglingEval.decision === 'decrease', `Struggling user triggers decision 'decrease'`);
assert(strugglingEval.newLevel === 2, `Level gently demoted from 3 to 2 to eliminate anxiety`);

const avgEval = evaluateSessionAdaptively({
  accuracy: 68,
  responseTimeMs: 3800,
  completionRate: 100,
  attempts: 4,
  errors: 1,
  recentSessions: [],
  currentLevel: 2
}, 'memory_match');

assert(avgEval.score >= 0.55 && avgEval.score <= 0.80, `Average user score (${avgEval.score}) is within maintain range`);
assert(avgEval.decision === 'maintain', `Average user triggers decision 'maintain'`);
assert(avgEval.newLevel === 2, `Level remains Level 2`);

// TEST 4: Non-Diagnostic Language Safety Audit
console.log('\n4. Non-Diagnostic Healthcare Safety Audit:');
const allStrings = JSON.stringify(locales);
const forbiddenPhrases = [
  'you have dementia', 'you have alzheimer', 'your dementia is worsening',
  'probability of dementia', 'ai detected alzheimer', 'game diagnoses cognitive'
];

forbiddenPhrases.forEach(phrase => {
  const found = allStrings.toLowerCase().includes(phrase);
  assert(!found, `Safety check: No dangerous diagnostic claim "${phrase}" in localization`);
});

// TEST 5: Multilingual Locales & Bhashini Expansion
console.log('\n5. Multilingual Localization Architecture (NER 8 Sister States + Bhashini):');
assert(locales.en !== undefined && locales.en.appName === 'Mind Mate', 'English locale loaded and verified as Mind Mate');
assert(locales.hi !== undefined && locales.hi.appName.includes('Mind Mate'), 'Hindi locale loaded and verified as Mind Mate');
assert(locales.regional !== undefined && locales.regional.appName.includes('Mind Mate'), 'Regional locale loaded and verified as Mind Mate');
assert(locales.as !== undefined && locales.as.appName.includes('অসমীয়া'), 'Assam: Assamese (as) locale loaded');
assert(locales.brx !== undefined && locales.brx.appName.includes('बर\''), 'Assam/Bodoland: Bodo (brx) locale loaded');
assert(locales.mni !== undefined && locales.mni.appName.includes('মৈতৈলোন্'), 'Manipur: Manipuri/Meitei (mni) locale loaded');
assert(locales.kha !== undefined && locales.kha.appName.includes('Khasi'), 'Meghalaya: Khasi (kha) locale loaded');
assert(locales.grt !== undefined && locales.grt.appName.includes('A·chik'), 'Meghalaya: Garo (grt) locale loaded');
assert(locales.lus !== undefined && locales.lus.appName.includes('Mizo'), 'Mizoram: Mizo (lus) locale loaded');
assert(locales.kok !== undefined && locales.kok.appName.includes('Kokborok'), 'Tripura: Kokborok (kok) locale loaded');
assert(locales.nag !== undefined && locales.nag.appName.includes('Nagamese'), 'Nagaland: Nagamese (nag) locale loaded');
assert(locales.ne !== undefined && locales.ne.appName.includes('नेपाली'), 'Sikkim: Nepali (ne) locale loaded');
assert(locales.adi !== undefined && locales.adi.appName.includes('Nyishi / Adi'), 'Arunachal Pradesh: Nyishi/Adi (adi) locale loaded');
assert((locales as any).bn !== undefined && (locales as any).bn.appName.includes('বাংলা'), 'Tripura / Barak Valley: Bengali (bn) Bhashini locale loaded');
assert((locales as any).mjw !== undefined && (locales as any).mjw.appName.includes('Karbi'), 'Karbi Anglong: Karbi (mjw) Bhashini locale loaded');
assert((locales as any).mif !== undefined && (locales as any).mif.appName.includes('Mising'), 'Assam Valley: Mishing (mif) Bhashini locale loaded');

// TEST 6: Next-Best Activity Recommendation
console.log('\n6. Next-Best Activity Recommendation:');
const rec1 = recommendNextActivity([]);
assert(rec1.recommendedType === 'memory_recall', 'Initial baseline recommends Memory Recall');

const rec2 = recommendNextActivity([{
  id: 's1', patientId: 'p1', activityId: 'memory_recall', activityTitle: 'Memory Recall',
  timestamp: 'Today', difficultyLevel: 2, accuracy: 88, responseTimeMs: 2800,
  responseSpeedRating: 'Good', completionRate: 100, consistencyScore: 0.9,
  attempts: 4, errors: 0, isPersonalized: false, syncStatus: 'synced'
}]);
assert(rec2.recommendedType === 'routine_recall', 'After memory activity, alternates to Routine Recall');

// TEST 7: Machine Learning Telemetry & Random Forest V2 Predictor
console.log('\n7. Machine Learning Telemetry & Random Forest V2 Model:');
const sampleMLFeatures = extractMLFeatures({
  accuracy: 94,
  responseTimeMs: 1950,
  attempts: 1,
  completionRate: 100,
  hintUsage: 0,
  currentLevel: 2,
  activityId: 'memory_match'
});

assert(sampleMLFeatures.accuracy === 0.94, 'ML feature accuracy normalized correctly');
assert(sampleMLFeatures.response_time === 1.95, 'ML feature response_time converted to seconds');
assert(sampleMLFeatures.game_type === 0, 'Memory activity correctly mapped to game_type 0');
assert(sampleMLFeatures.fatigue_proxy >= 0 && sampleMLFeatures.fatigue_proxy <= 1, 'Fatigue proxy within normalized bounds [0, 1]');
assert(sampleMLFeatures.engagement_score >= 0.8, 'High completion and 1 attempt gives high engagement');

const mlPredStrong = predictClientSideML(sampleMLFeatures);
assert([0, 1].includes(mlPredStrong.predictedClass), 'Strong user receives Increase (0) or Maintain (1) difficulty');
const probSum = Object.values(mlPredStrong.probabilities).reduce((a, b) => a + b, 0);
assert(Math.abs(probSum - 1.0) < 0.02, `Softmax class probabilities sum to 1.0 (actual: ${probSum.toFixed(3)})`);

const strugglingFeatures = extractMLFeatures({
  accuracy: 28,
  responseTimeMs: 9200,
  attempts: 4,
  completionRate: 50,
  hintUsage: 4,
  currentLevel: 3,
  activityId: 'attention_challenge'
});
const mlPredStruggling = predictClientSideML(strugglingFeatures);
assert([2, 4].includes(mlPredStruggling.predictedClass), 'Struggling user receives Reduce (2) or Repeat (4) recommendation');
assert(mlPredStruggling.telemetry.fatigue_proxy > 0.4, 'High latency and attempts correctly reflect elevated fatigue');

// TEST 8: Digital India Bhashini Service Verification
console.log('\n8. Digital India Bhashini Language Platform Integration:');
const nerLanguages = ['as', 'brx', 'mni', 'bn', 'ne', 'kha', 'grt', 'lus', 'kok', 'nag', 'adi', 'mjw', 'mif'];
nerLanguages.forEach(code => {
  const isSupported = bhashiniService.isBhashiniSupported(code as any);
  assert(isSupported, `Bhashini profile active for '${code}'`);
  const profile = bhashiniService.getProfile(code as any);
  assert(profile.speechRate <= 0.90 && profile.speechRate >= 0.85, `'${code}' speech rate (${profile.speechRate}) calibrated for elderly comprehension`);
});

// TEST 9: Multi-Patient Accounts & Data Isolation Verification
console.log('\n9. Multi-Patient Accounts & Data Isolation:');
import { offlineService } from '../services/offlineService';
import { getStrings } from '../locales';

// Reset offline service to guarantee clean state
offlineService.resetToDefaults();

const allPts = offlineService.getAllPatients();
assert(allPts.length === 3, `System registers exactly 3 demo patient accounts (found: ${allPts.length})`);

const pt1 = offlineService.getPatient('patient-meera-01');
const pt2 = offlineService.getPatient('patient-tenzing-02');
const pt3 = offlineService.getPatient('patient-biren-03');

assert(pt1.name === 'Meera Sharma' && pt1.currentLevel === 2, 'Patient 1: Meera Sharma, Level 2 (Tezpur, Assam)');
assert(pt2.name === 'Tenzing Norbu' && pt2.currentLevel === 1, 'Patient 2: Tenzing Norbu, Level 1 (Gangtok, Sikkim)');
assert(pt3.name === 'Biren Singha' && pt3.currentLevel === 3, 'Patient 3: Biren Singha, Level 3 (Silchar, Barak Valley)');

// Verify Caregiver Account
const cg = offlineService.getCaregiver();
assert(cg.id === 'cg-ananya-01' && cg.name === 'Ananya Sharma', 'Demo Caregiver Account: Ananya Sharma registered');
assert(cg.assignedPatientIds.length === 3, 'Caregiver Ananya has fleet oversight across all 3 patients');

// Test strict data isolation
const pt1SessionsInitial = offlineService.getSessions('patient-meera-01').length;
const pt2SessionsInitial = offlineService.getSessions('patient-tenzing-02').length;
const pt3SessionsInitial = offlineService.getSessions('patient-biren-03').length;

// Save a session for Patient 2 ONLY
offlineService.saveSession({
  id: 'sess-test-isolation-' + Date.now(),
  patientId: 'patient-tenzing-02',
  activityId: 'find_object',
  activityTitle: 'Find The Object',
  timestamp: 'Just now (Isolation Test)',
  difficultyLevel: 1,
  accuracy: 75,
  responseTimeMs: 3200,
  responseSpeedRating: 'Good',
  completionRate: 100,
  consistencyScore: 0.8,
  attempts: 4,
  errors: 1,
  isPersonalized: false,
  syncStatus: 'synced'
}, 'patient-tenzing-02');

const pt1SessionsAfter = offlineService.getSessions('patient-meera-01').length;
const pt2SessionsAfter = offlineService.getSessions('patient-tenzing-02').length;
const pt3SessionsAfter = offlineService.getSessions('patient-biren-03').length;

assert(pt2SessionsAfter === pt2SessionsInitial + 1, 'Patient 2 session count incremented by 1');
assert(pt1SessionsAfter === pt1SessionsInitial, 'Patient 1 session store remained strictly isolated and untouched');
assert(pt3SessionsAfter === pt3SessionsInitial, 'Patient 3 session store remained strictly isolated and untouched');

// Test reminder isolation
const pt3RemindersInitial = offlineService.getReminders('patient-biren-03');
const firstPt3RemId = pt3RemindersInitial[0].id;
offlineService.updateReminderStatus(firstPt3RemId, 'completed', 'patient-biren-03');

const pt3RemindersAfter = offlineService.getReminders('patient-biren-03');
const pt1RemindersAfter = offlineService.getReminders('patient-meera-01');

assert(pt3RemindersAfter.find(r => r.id === firstPt3RemId)?.status === 'completed', 'Patient 3 reminder status updated');
assert(pt1RemindersAfter.every(r => r.id !== firstPt3RemId), 'Patient 1 reminders remain completely separate');

// TEST 10: Localization Coverage Verification
console.log('\n10. Complete Localization Coverage (16 Regional Locales):');
const allLocaleCodes = ['en', 'as', 'hi', 'bn', 'ne', 'brx', 'mni', 'kha', 'grt', 'lus', 'kok', 'nag', 'adi', 'mjw', 'mif', 'regional'];
allLocaleCodes.forEach(code => {
  const s = getStrings(code as any);
  assert(typeof s.todaysActivity === 'string' && s.todaysActivity.length > 0, `'${code}' has valid 'todaysActivity'`);
  assert(typeof s.level === 'string' && s.level.length > 0, `'${code}' has valid 'level'`);
  assert(typeof s.allCaughtUp === 'string' && s.allCaughtUp.length > 0, `'${code}' has valid 'allCaughtUp'`);
  assert(typeof s.otherActivities === 'string' && s.otherActivities.length > 0, `'${code}' has valid 'otherActivities'`);
  assert(typeof s.workingMemory === 'string' && s.workingMemory.length > 0, `'${code}' has valid 'workingMemory'`);
});

// TEST 11: Dynamic Regional Localization Helper Verification
console.log('\n11. Dynamic Regional Localization Helper Verification:');
import { 
  getLocalizedActivity, 
  getLocalizedSupportProfile, 
  getLocalizedReminder, 
  getLocalizedMemoryItem 
} from '../services/localizationHelper';

// 1. Verify Activity Localizations in Manipuri (Meitei Mayek / Bengali script)
const sampleAct = ACTIVITY_REGISTRY.find(a => a.id === 'find_object')!;
const locActMni = getLocalizedActivity(sampleAct, 'mni');
assert(locActMni.name === 'পোৎলম থিবীয়ু', `Manipuri activity name localized to '${locActMni.name}'`);
assert(locActMni.cognitiveFunction === 'মিৎয়েং থিবা', `Manipuri cognitive function localized to '${locActMni.cognitiveFunction}'`);
assert(locActMni.durationLabel.includes('মিনিৎ'), `Manipuri duration label contains 'মিনিৎ' (${locActMni.durationLabel})`);
assert(locActMni.levelsLabel.includes('স্তৱর'), `Manipuri levels label contains 'স্তৱর' (${locActMni.levelsLabel})`);

// 2. Verify Activity Localizations in Assamese, Bengali, Nepali
const locActAs = getLocalizedActivity(sampleAct, 'as');
assert(locActAs.name === 'বস্তু বিচাৰক', `Assamese activity name localized to '${locActAs.name}'`);
const locActBn = getLocalizedActivity(sampleAct, 'bn');
assert(locActBn.name === 'বস্তু খুঁজুন', `Bengali activity name localized to '${locActBn.name}'`);
const locActNe = getLocalizedActivity(sampleAct, 'ne');
assert(locActNe.name === 'वस्तु खोज्नुहोस्', `Nepali activity name localized to '${locActNe.name}'`);

// 3. Verify Clinical Support Profile Localization
const sampleProfile = SUPPORT_PROFILES.find(p => p.id === 'vascular_cognitive')!;
const locProfileMni = getLocalizedSupportProfile(sampleProfile, 'mni');
assert(locProfileMni.name === 'ই থৌবা অমসুং ৱাখলগী মতেং', `Support profile localized to '${locProfileMni.name}'`);

// 4. Verify Reminder Translation and Proper Noun Preservation
const tenzingReminders = offlineService.getReminders('patient-tenzing-02');
const aspirinRem = tenzingReminders.find(r => r.title.includes('Aspirin'))!;
const locAspirinMni = getLocalizedReminder(aspirinRem, 'mni');
assert(locAspirinMni.title.includes('Aspirin'), `Aspirin title in Manipuri preserves proper noun: '${locAspirinMni.title}'`);
assert(locAspirinMni.detail.includes('Aspirin 75mg'), `Aspirin detail in Manipuri preserves dosage: '${locAspirinMni.detail}'`);

const birenReminders = offlineService.getReminders('patient-biren-03');
const metforminRem = birenReminders.find(r => r.title.includes('Metformin'))!;
const locMetforminBn = getLocalizedReminder(metforminRem, 'bn');
assert(locMetforminBn.title.includes('Metformin'), `Metformin title in Bengali preserves drug name: '${locMetforminBn.title}'`);
assert(locMetforminBn.detail.includes('Metformin 500mg'), `Metformin detail in Bengali preserves dosage: '${locMetforminBn.detail}'`);

// 5. Verify Personal Memory Localization and Proper Nouns
const tenzingMemories = offlineService.getMemories('patient-tenzing-02');
const sonMem = tenzingMemories.find(m => m.relationshipOrDetail.includes('Son'))!;
const locSonMni = getLocalizedMemoryItem(sonMem, 'mni');
assert(locSonMni.relationshipOrDetail === 'মচানুপা অমসুং মতেংপাংবা', `Relationship translated in Manipuri: '${locSonMni.relationshipOrDetail}'`);
assert(!locSonMni.relationshipOrDetail.includes('Son'), 'English term "Son" replaced in Manipuri');

// 6. Verify User's Screenshot 1 Fixes: Sequence Recall & Cognitive Functions
const seqRecallAct = ACTIVITY_REGISTRY.find(a => a.id === 'sequence_recall')!;
const locSeqRecallAs = getLocalizedActivity(seqRecallAct, 'as');
assert(locSeqRecallAs.name === 'ক্ৰম নিৰ্ণয় স্মৃতি', `Sequence Recall name in Assamese localized to: '${locSeqRecallAs.name}'`);
assert(locSeqRecallAs.cognitiveFunction === 'ক্ৰম অনুধাৱন', `sequential-processing badge in Assamese localized to: '${locSeqRecallAs.cognitiveFunction}'`);
assert(!locSeqRecallAs.description.startsWith('Observe'), 'Sequence Recall description in Assamese is fully translated');

const patternAct = ACTIVITY_REGISTRY.find(a => a.id === 'pattern')!;
const locPatternAs = getLocalizedActivity(patternAct, 'as');
assert(locPatternAs.cognitiveFunction === 'নীতি আৰু যুক্তি নিৰ্ণয়', `rule-induction badge in Assamese localized to: '${locPatternAs.cognitiveFunction}'`);

// 7. Verify User's Screenshot 2 Fixes: Routine Memory Items in Assamese
const butterTeaMem = tenzingMemories.find(m => m.id === 'mem-t-6')!;
const locButterTeaAs = getLocalizedMemoryItem(butterTeaMem, 'as');
assert(locButterTeaAs.name === 'গৰম মাখন চাহ আৰু মন্ত্ৰোচ্চাৰণ', `mem-t-6 name in Assamese localized to: '${locButterTeaAs.name}'`);
assert(locButterTeaAs.relationshipOrDetail === 'পুৱাৰ কামৰ ১ম ধাপ', `mem-t-6 step badge in Assamese localized to: '${locButterTeaAs.relationshipOrDetail}'`);
assert(locButterTeaAs.description.includes('কাঞ্চনজংঘা') || locButterTeaAs.description.includes('Kanchenjunga'), `mem-t-6 description preserves proper noun Kanchenjunga: '${locButterTeaAs.description}'`);

const heartMedsMem = tenzingMemories.find(m => m.id === 'mem-t-7')!;
const locHeartMedsAs = getLocalizedMemoryItem(heartMedsMem, 'as');
assert(locHeartMedsAs.name === 'হৃদৰোগৰ ঔষধ সেৱন', `mem-t-7 name in Assamese localized to: '${locHeartMedsAs.name}'`);
assert(locHeartMedsAs.relationshipOrDetail.includes('২য় ধাপ'), `mem-t-7 step badge in Assamese localized to: '${locHeartMedsAs.relationshipOrDetail}'`);
assert(locHeartMedsAs.description.includes('Aspirin'), `mem-t-7 description preserves proper noun Aspirin: '${locHeartMedsAs.description}'`);

// 8. Verify all 21 activities have localized names and cognitive functions in Assamese and Manipuri
for (const act of ACTIVITY_REGISTRY) {
  const asLoc = getLocalizedActivity(act, 'as');
  assert(Boolean(asLoc.name && asLoc.name !== act.name), `Activity ${act.id} has localized name in Assamese: '${asLoc.name}'`);
  assert(Boolean(asLoc.cognitiveFunction && asLoc.cognitiveFunction !== act.cognitiveFunction), `Cognitive function ${act.cognitiveFunction} localized in Assamese: '${asLoc.cognitiveFunction}'`);
}

// 9. Verify Saathi Conversational Companion
import { companionEngine } from '../services/companionEngine';

const planReply = await companionEngine.generateResponse('What is my plan for today?', 'en');
assert(Boolean(planReply && planReply.replyText && planReply.topic === 'routine'), `Companion returns routine orientation for daily plan: '${planReply.replyText.substring(0, 40)}...'`);

const medReply = await companionEngine.generateResponse('Did I take my medicine?', 'en');
assert(Boolean(medReply && medReply.topic === 'medicine'), `Companion answers medicine status: '${medReply.replyText.substring(0, 40)}...'`);

const confusionReply = await companionEngine.generateResponse('I feel confused and scared', 'en');
assert(Boolean(confusionReply && confusionReply.sentiment === 'confused' && confusionReply.topic === 'emotional_support'), `Companion triggers dementia validation reassurance: '${confusionReply.replyText.substring(0, 40)}...'`);

const asReply = await companionEngine.generateResponse('আজি মোৰ কি কি কাম আছে?', 'as');
assert(Boolean(asReply && asReply.replyText && asReply.topic === 'routine'), `Companion returns Assamese native orientation: '${asReply.replyText.substring(0, 35)}...'`);

offlineService.addCompanionMessage({
  id: 'test-msg-1',
  sender: 'user',
  text: 'Hello Saathi',
  timestamp: '10:00 AM'
}, 'patient-meera-01');
const storedMsgs = offlineService.getCompanionMessages('patient-meera-01');
// 10. Verify Voice Language Tags & Real-Life Assets
import { voiceService } from '../services/voiceService';
import { getRealLifeAsset, REAL_LIFE_ASSETS } from '../services/realLifeAssets';

assert(voiceService.getSpeechLangTag('as') === 'as-IN', 'Voice service maps Assamese to as-IN');
assert(voiceService.getSpeechLangTag('bn') === 'bn-IN', 'Voice service maps Bengali to bn-IN');
assert(voiceService.getSpeechLangTag('hi') === 'hi-IN', 'Voice service maps Hindi to hi-IN');
assert(voiceService.getSpeechLangTag('ne') === 'ne-NP', 'Voice service maps Nepali to ne-NP');
assert(voiceService.getSpeechLangTag('mni') === 'mni-IN', 'Voice service maps Manipuri to mni-IN');
assert(voiceService.getSpeechLangTag('brx') === 'brx-IN', 'Voice service maps Bodo to brx-IN');

// Multilingual companion checks
const bnReply = await companionEngine.generateResponse('আজকে আমার কী কাজ আছে?', 'bn');
assert(Boolean(bnReply && bnReply.replyText && bnReply.topic === 'routine'), `Companion responds in Bengali: '${bnReply.replyText.substring(0, 30)}...'`);

const hiReply = await companionEngine.generateResponse('आज की क्या योजना है?', 'hi');
assert(Boolean(hiReply && hiReply.replyText && hiReply.topic === 'routine'), `Companion responds in Hindi: '${hiReply.replyText.substring(0, 30)}...'`);

const neReply = await companionEngine.generateResponse('आज मेरो के के काम छ?', 'ne');
assert(Boolean(neReply && neReply.replyText && neReply.topic === 'routine'), `Companion responds in Nepali: '${neReply.replyText.substring(0, 30)}...'`);

// Real-Life Assets checks
const cupAsset = getRealLifeAsset('cup');
assert(Boolean(cupAsset && cupAsset.photoUrl && cupAsset.svgFallback), 'Tea Cup real life asset has valid photo and offline SVG fallback');

const ananyaAsset = getRealLifeAsset('ananya');
assert(Boolean(ananyaAsset && ananyaAsset.category === 'person' && ananyaAsset.photoUrl), 'Ananya real life portrait asset has valid photography URL');

const keyAsset = getRealLifeAsset('brass_key');
assert(Boolean(keyAsset && keyAsset.id === 'key'), 'Key asset resolves alias brass_key properly');

// Memory items direct ID & Category-aware tests
assert(getRealLifeAsset('mem-m-1').id === 'ananya', 'Memory mem-m-1 maps to Ananya portrait');
assert(getRealLifeAsset('mem-m-3').id === 'residence', 'Memory mem-m-3 maps to residence photo');
assert(getRealLifeAsset('mem-t-3').id === 'mountain', 'Memory mem-t-3 maps to Kanchenjunga mountain photo');
assert(getRealLifeAsset('mem-b-5').id === 'pocket_watch', 'Memory mem-b-5 maps to pocket watch photo');
assert(getRealLifeAsset('mem-t-6').id === 'butter_tea', 'Memory mem-t-6 maps to butter tea photo');
assert(getRealLifeAsset('mem-m-8').id === 'medicine', 'Memory mem-m-8 maps to daily medicine photo');
assert(getRealLifeAsset('unknown-1', 'person').id === 'ananya', 'Unknown person category correctly falls back to person photo, never cup');
assert(getRealLifeAsset('unknown-2', 'place').id === 'residence', 'Unknown place category correctly falls back to place photo, never cup');

// 11. Sequence Recall & Object Recall Activities Verification
import { evaluateAndAdaptSession } from '../services/adaptiveEngine';
import { SequenceRecallGame } from '../features/activities/SequenceRecallGame';
import { MemoryRecallGame } from '../features/activities/MemoryRecallGame';

assert(typeof SequenceRecallGame === 'function', 'SequenceRecallGame component is properly exported and valid React component');
assert(typeof MemoryRecallGame === 'function', 'MemoryRecallGame component is properly exported and valid React component');

const seqSessionResult = evaluateAndAdaptSession({
  patientId: 'patient-meera-01',
  activityId: 'sequence_recall',
  activityTitle: 'Sequence Recall',
  accuracy: 100,
  responseTimeMs: 3200,
  completionRate: 100,
  attempts: 1,
  errors: 0,
  difficultyLevel: 2
});
assert(Boolean(seqSessionResult.session && seqSessionResult.session.activityId === 'sequence_recall'), 'Sequence Recall generates valid adaptive session');
assert(Boolean(seqSessionResult.decision && seqSessionResult.decision.performanceScore >= 0.8), 'Sequence Recall high accuracy produces high performance score');

const objSessionResult = evaluateAndAdaptSession({
  patientId: 'patient-meera-01',
  activityId: 'object_memory',
  activityTitle: 'Object Memory',
  accuracy: 90,
  responseTimeMs: 3500,
  completionRate: 100,
  attempts: 1,
  errors: 0,
  difficultyLevel: 2
});
assert(Boolean(objSessionResult.session && objSessionResult.session.activityId === 'object_memory'), 'Object Memory generates valid adaptive session');
assert(Boolean(objSessionResult.decision && objSessionResult.decision.mlRecommendation), 'Object Memory decision contains client-side ML recommendation');

console.log('\n====================================================');
console.log(`VERIFICATION COMPLETE: ${passed} Passed, ${failed} Failed.`);
console.log('====================================================');

const proc = (globalThis as any).process;
if (failed > 0) {
  if (proc && typeof proc.exit === 'function') {
    proc.exit(1);
  }
} else {
  if (proc && typeof proc.exit === 'function') {
    proc.exit(0);
  }
}
