import { LanguageCode, ChatMessage, ChatMessageAction, Patient, Reminder, PersonalMemoryItem, GameSession } from '../models/types';
import { offlineService } from './offlineService';
import { recommendNextActivity } from './adaptiveEngine';

export interface CompanionResponse {
  replyText: string;
  sentiment: 'calm' | 'happy' | 'confused' | 'anxious' | 'neutral' | 'nostalgic';
  topic: 'routine' | 'medicine' | 'family' | 'memory' | 'emotional_support' | 'orientation' | 'general';
  actions?: ChatMessageAction[];
  isAiGenerated?: boolean;
}

class CompanionEngine {
  /**
   * Generates a compassionate, dementia-informed response tailored to the active patient,
   * their daily schedule, personal memories, and current language.
   */
  public async generateResponse(
    userQuery: string,
    language: LanguageCode = 'en',
    customApiKey?: string
  ): Promise<CompanionResponse> {
    const patient = offlineService.getPatient();
    const reminders = offlineService.getReminders();
    const memories = offlineService.getMemories();
    const sessions = offlineService.getSessions();
    const caregiver = offlineService.getCaregiver();

    const normalizedQuery = userQuery.trim().toLowerCase();

    // Check if user has Gemini API key configured and is online
    const apiKey = customApiKey || (typeof window !== 'undefined' ? localStorage.getItem('mindmate_gemini_api_key') : '') || (import.meta as any).env?.VITE_GEMINI_API_KEY;
    const isOffline = offlineService.isOffline();

    if (apiKey && !isOffline) {
      try {
        const geminiReply = await this.queryGemini(userQuery, language, patient, reminders, memories, caregiver, apiKey);
        if (geminiReply) {
          return geminiReply;
        }
      } catch (err) {
        console.warn('Gemini companion fallback to local engine:', err);
      }
    }

    // Default: Local Deterministic & Contextual Conversational Engine (100% offline reliable)
    return this.generateLocalResponse(normalizedQuery, language, patient, reminders, memories, sessions, caregiver);
  }

  private generateLocalResponse(
    q: string,
    lang: LanguageCode,
    patient: Patient,
    reminders: Reminder[],
    memories: PersonalMemoryItem[],
    sessions: GameSession[],
    caregiver: any
  ): CompanionResponse {
    const firstName = patient.name.split(' ')[0];
    const caregiverName = caregiver?.name ? caregiver.name.split(' ')[0] : 'Ananya';

    const completedReminders = reminders.filter(r => r.status === 'completed');
    const pendingReminders = reminders.filter(r => r.status === 'pending');
    const medReminder = reminders.find(r => r.category === 'medicine');
    const nextPending = pendingReminders[0];

    const recommendation = recommendNextActivity(sessions);

    // 1. CONFUSION, ANXIETY, OR FEELING LOST (Validation Therapy)
    if (
      this.matchesAny(q, [
        'confused', 'lost', 'where am i', 'who am i', 'scared', 'afraid', 'sad', 'crying', 
        'lonely', 'help me', 'forgot', 'forget', 'panic', 'worried', 'want to go home',
        'ভয়', 'কষ্ট', 'ভুল', 'ক\'ত আছো', 'কাহাঁ', 'डर', 'घबराहट', 'चिन्ता', 'কোথায় আমি', 'একলা'
      ])
    ) {
      return this.buildReassuranceResponse(lang, firstName, patient.region, caregiverName);
    }

    // 2. MEDICINE & HEALTH QUESTIONS
    if (
      this.matchesAny(q, [
        'medicine', 'med', 'pill', 'tablet', 'dose', 'pressure', 'bp', 'doctor', 'hospital', 
        'clinic', 'appointment', 'ঔষধ', 'দাওয়াই', 'হিদাক', 'দবা', 'दवाई', 'गोली', 'औषधि'
      ])
    ) {
      return this.buildMedicineResponse(lang, firstName, medReminder, pendingReminders);
    }

    // 3. DAILY SCHEDULE, PLAN, ROUTINE ("Remember their day")
    if (
      this.matchesAny(q, [
        'today', 'day', 'routine', 'plan', 'schedule', 'what next', 'what should i do', 'what did i do',
        'morning', 'afternoon', 'evening', 'lunch', 'walk', 'time', 'ৰুটিন', 'নিয়ম', 'দিনচৰ্যা',
        'আজকে', 'আজ', 'আজি', 'কাম', 'दिनचर्या', 'योजना', 'आज', 'काम', 'तालिका', 'কেয়া করনা', 'थবক', 'हाबा'
      ])
    ) {
      return this.buildDailyOrientationResponse(lang, firstName, completedReminders, pendingReminders, nextPending);
    }

    // 4. FAMILY, LOVED ONES & RELATIONSHIPS
    if (
      this.matchesAny(q, [
        'family', 'daughter', 'son', 'child', 'children', 'ananya', 'tashi', 'rohan', 'debjani', 
        'husband', 'wife', 'grandchild', 'grandson', 'granddaughter', 'visit', 'coming',
        'পৰিয়াল', 'মেয়ে', 'ছেলে', 'পরিবার', 'ইমুং', 'सन्तान', 'छोरी', 'छोरा', "न'ख'र"
      ])
    ) {
      return this.buildFamilyResponse(lang, firstName, patient, memories);
    }

    // 5. LOCATION, HOME & HOMETOWN ROOTS
    if (
      this.matchesAny(q, [
        'where do i live', 'my house', 'home', 'tezpur', 'gangtok', 'silchar', 'assam', 'sikkim',
        'brahmaputra', 'hills', 'garden', 'ক\'ত থাকো', 'বাড়ি', 'घर', 'गाउँ', 'মফম'
      ])
    ) {
      return this.buildLocationResponse(lang, firstName, patient);
    }

    // 6. BRAIN GAMES, SCORES & ACTIVITIES
    if (
      this.matchesAny(q, [
        'game', 'activity', 'exercise', 'play', 'brain', 'memory match', 'score', 'level',
        'খেল', 'অনুশীলন', 'খেলা', 'खेल', 'अभ्यास'
      ])
    ) {
      return this.buildActivityResponse(lang, firstName, sessions, recommendation);
    }

    // 7. GREETINGS & CASUAL EMOTIONAL CONNECTION
    if (
      this.matchesAny(q, [
        'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'how are you', 
        'who are you', 'what is your name', 'thank you', 'thanks', 'নমস্কাৰ', 'সুপ্রভাত', 'শুভ', 
        'नमस्ते', 'कस्तो छ', 'য়াইফরে'
      ])
    ) {
      return this.buildGreetingResponse(lang, firstName);
    }

    // 8. STORY, SONG, OR GENTLE ENTERTAINMENT
    if (
      this.matchesAny(q, [
        'story', 'tell me a story', 'talk to me', 'speak with me', 'song', 'poem', 'chat',
        'সাধু', 'গল্প', 'कहानी', 'कथा', 'ৱারী'
      ])
    ) {
      return this.buildStoryResponse(lang, firstName, patient);
    }

    // DEFAULT GENTLE FALLBACK
    return this.buildDefaultFriendlyResponse(lang, firstName, pendingReminders.length);
  }

  // --- Response Builders ---

  private buildReassuranceResponse(
    lang: LanguageCode, 
    name: string, 
    region: string, 
    caregiverName: string
  ): CompanionResponse {
    let replyText = `Take a gentle, deep breath, ${name}. You are completely safe right here in your home in ${region}. Your caregiver ${caregiverName} is right nearby and looks after you with love. Everything is well, and I am right here beside you.`;

    if (lang === 'as' || lang === 'regional') {
      replyText = `চিন্তা নকৰিব ${name} ডাঙৰীয়া। আপুনি আপোনাৰ শান্ত, নিজৰ ঘৰতেই সুৰক্ষিতভাৱে আছে। আপোনাৰ মৰমৰ ${caregiverName} কাষতেই আছে। মন শান্ত কৰক, মই আপোনাৰ লগতে আছো।`;
    } else if (lang === 'bn') {
      replyText = `একদম চিন্তা করবেন না ${name} দেবী। আপনি আপনার নিজের শান্ত ঘরে সম্পূর্ণ নিরাপদে আছেন। আপনার যত্নের জন্য ${caregiverName} কাছেই আছেন। একটি গভীর শ্বাস নিন, আমি আপনার সাথেই আছি।`;
    } else if (lang === 'hi') {
      replyText = `शांत हो जाइए ${name} जी। आप अपने सुरक्षित और प्यारे घर में हैं। आपके परिवार और देखभालकर्ता ${caregiverName} बिल्कुल पास में हैं। सब कुछ ठीक है, मैं आपके साथ हूँ।`;
    } else if (lang === 'ne') {
      replyText = `शान्त हुनुहोस् ${name} जी। तपाईं आफ्नै सुरक्षित घरमा हुनुहुन्छ। तपाईंको हेरचाहकर्ता ${caregiverName} नजिकै हुनुहुन्छ। सबै कुरा राम्रो छ, म तपाईंसँगै छु।`;
    }

    return {
      replyText,
      sentiment: 'confused',
      topic: 'emotional_support',
      actions: [
        { label: 'View Today\'s Plan', actionType: 'view_reminders' },
        { label: 'Look at Family Photos', actionType: 'view_memories' }
      ]
    };
  }

  private buildMedicineResponse(
    lang: LanguageCode, 
    name: string, 
    med?: Reminder, 
    pending?: Reminder[]
  ): CompanionResponse {
    const isMedDone = med?.status === 'completed';
    let replyText = '';

    if (isMedDone) {
      replyText = `Good news, ${name}! You have already taken your morning medicine (${med?.title || 'blood pressure medicine'}) at ${med?.lastCompletedAt || '8:15 AM'}. You took it with water just like recommended.`;
    } else if (med) {
      replyText = `You have your ${med.title} scheduled for ${med.timeStr}. The instructions are: "${med.detail}". Remember to drink a glass of water when taking it.`;
    } else {
      replyText = `Your medical schedule is up to date, ${name}. You can review your daily medicines anytime in your Reminders tab.`;
    }

    if (lang === 'as' || lang === 'regional') {
      replyText = isMedDone
        ? `ভাল খবৰ ${name}! আপুনি আজি পুৱাৰ ঔষধ (${med?.title || 'ৰক্তচাপৰ ঔষধ'}) ইতিমধ্যে সময়মতে লৈছে। সকলো ঠিক আছে!`
        : `আপোনাৰ আজিৰ ঔষধৰ সময়: ${med?.title || 'পুৱাৰ ঔষধ'}, সময় ${med?.timeStr || 'পুৱা'}। অনুগ্ৰহ কৰি এগিলাচ পানীৰ সৈতে ঔষধ লওক।`;
    } else if (lang === 'bn') {
      replyText = isMedDone
        ? `খুব ভালো খবর ${name}! আপনি আজকের সকালের প্রেসারের ওষুধ সময়মতো নিয়ে ফেলেছেন। আপনি একদম নিশ্চিন্ত থাকুন।`
        : `আপনার ঔষধের সময় মনে করিয়ে দিচ্ছি: ${med?.title || 'প্রেসারের ওষুধ'}। এক গ্লাস গরম জলের সাথে ঔষধটি গ্রহণ করুন।`;
    } else if (lang === 'hi') {
      replyText = isMedDone
        ? `बहुत अच्छी बात है ${name} जी! आपने आज सुबह की दवाई (${med?.title || 'ब्लड प्रेशर की दवाई'}) समय पर ले ली है।`
        : `आपकी दवाई का समय: ${med?.title || 'सुबह की दवाई'}, समय ${med?.timeStr || 'सुबह'}। कृपया पानी के साथ लें।`;
    } else if (lang === 'ne') {
      replyText = isMedDone
        ? `राम्रो खबर ${name} जी! तपाईंले आज बिहानको औषधि (${med?.title || 'रक्तचापको औषधि'}) समयमै लिइसक्नुभएको छ।`
        : `तपाईंको औषधिको समय: ${med?.title || 'बिहानको औषधि'} (${med?.timeStr || 'बिहान'})। कृपया पानीसँग लिनुहोस्।`;
    } else if (lang === 'mni') {
      replyText = isMedDone
        ? `য়াইফবা পাউনি ${name}! অদোম্না অয়ুক্কী হিদাক (${med?.title || 'প্রেশারগী হিদাক'}) মতম চানা চারে।`
        : `অদোমগী হিদাক চাবগী মতম: ${med?.title || 'হিদাক'} (${med?.timeStr || 'অয়ুক'})। ঈশিংগা লোয়ননা চাবীয়ু।`;
    } else if (lang === 'brx') {
      replyText = isMedDone
        ? `मोजां खौरां ${name}! नोंथाङा फुंनि मुलिखौ (${med?.title || 'मुलि'}) सम मते लोंखाबाय।`
        : `नोंथांनि मुलि लोंनायनि सम: ${med?.title || 'फुंनि मुलि'} (${med?.timeStr || 'फुं'})। दैजों लों।`;
    }

    return {
      replyText,
      sentiment: 'calm',
      topic: 'medicine',
      actions: [
        { label: 'Open Reminders', actionType: 'view_reminders' }
      ]
    };
  }

  private buildDailyOrientationResponse(
    lang: LanguageCode, 
    name: string, 
    completed: Reminder[], 
    pending: Reminder[], 
    nextPending?: Reminder
  ): CompanionResponse {
    const currentHour = new Date().getHours();
    const timeOfDay = currentHour < 12 ? 'morning' : currentHour < 17 ? 'afternoon' : 'evening';

    let replyText = `It is a pleasant ${timeOfDay} today, ${name}. `;
    if (completed.length > 0) {
      replyText += `So far today, you have completed ${completed.length} task${completed.length > 1 ? 's' : ''}, including your ${completed[0].title}. `;
    }
    if (nextPending) {
      replyText += `Next on your plan is: "${nextPending.title}" scheduled for ${nextPending.timeStr}. Would you like to do a gentle brain exercise now?`;
    } else {
      replyText += `All your scheduled tasks for today are up to date! You can relax in the garden or enjoy a memory game.`;
    }

    if (lang === 'as' || lang === 'regional') {
      replyText = `আজিৰ দিনটো বৰ সুন্দৰ, ${name} ডাঙৰীয়া। আপুনি আজি ইতিমধ্যে ${completed.length} টা কাম সম্পূৰ্ণ কৰিছে। ${nextPending ? `আপোনাৰ পৰৱৰ্তী কাম হ'ল: ${nextPending.title} (${nextPending.timeStr})।` : 'আজিৰ সকলো কাম সুচাৰুৰূপে হৈছে!'}`;
    } else if (lang === 'bn') {
      replyText = `আজকের দিনটি খুব সুন্দর, ${name} দেবী। আপনি ইতিমধ্যে ${completed.length} টি কাজ সম্পন্ন করেছেন। ${nextPending ? `আপনার পরবর্তী কাজটি হলো: ${nextPending.title} (${nextPending.timeStr})।` : 'আজকের সব নিয়ম সুন্দরভাবে পালন করেছেন!'}`;
    } else if (lang === 'hi') {
      replyText = `आज का दिन बहुत अच्छा है, ${name} जी। आपने आज ${completed.length} कार्य पूरे कर लिए हैं। ${nextPending ? `आपका अगला कार्य: ${nextPending.title} (${nextPending.timeStr}) है।` : 'आज के सभी कार्य पूरे हो चुके हैं!'}`;
    } else if (lang === 'ne') {
      replyText = `आजको दिन धेरै राम्रो छ, ${name} जी। तपाईंले आज ${completed.length} काम पूरा गर्नुभएको छ। ${nextPending ? `अर्को कार्य: ${nextPending.title} (${nextPending.timeStr}) हो।` : 'आजका सबै तालिका पूरा भएका छन्!'}`;
    } else if (lang === 'mni') {
      replyText = `ঙসিগী নুমিৎ অসি য়াম্না ফৈ, ${name}। অদোম্না থবক ${completed.length} লোইশিনখ্রে। ${nextPending ? `মথংগী থবক: ${nextPending.title} (${nextPending.timeStr}) নি।` : 'ঙসিগী থবকশিং মপুং ফানা লোইশিনখ্রে!'}`;
    } else if (lang === 'brx') {
      replyText = `दिनैनि साना जोबोद मोजां, ${name}! नोंथाङा दिनै ${completed.length} हाबा मावफुंखाबाय। ${nextPending ? `गाबोननि हाबा: ${nextPending.title} (${nextPending.timeStr}) जाबाय।` : 'गासै हाबाफोरा मोजाङै जाबाय!'}`;
    }

    return {
      replyText,
      sentiment: 'calm',
      topic: 'routine',
      actions: [
        { label: 'View Daily Reminders', actionType: 'view_reminders' },
        { label: 'Play Memory Game', actionType: 'start_activity' }
      ]
    };
  }

  private buildFamilyResponse(
    lang: LanguageCode, 
    name: string, 
    patient: Patient, 
    memories: PersonalMemoryItem[]
  ): CompanionResponse {
    const familyMems = memories.filter(m => m.category === 'person');
    const firstFam = familyMems[0];

    let replyText = `Your family loves you very much, ${name}. `;
    if (firstFam) {
      replyText += `${firstFam.name} (${firstFam.relationshipOrDetail}) often visits and checks in on you. ${firstFam.description} `;
    } else {
      replyText += `Your daughter Ananya coordinates your daily care and makes sure your days are peaceful and joyful.`;
    }
    replyText += ` You have wonderful photos and stories saved in your Personal Memories.`;

    if (lang === 'as' || lang === 'regional') {
      replyText = `আপোনাৰ পৰিয়ালে আপোনাক বহুত মৰম কৰে, ${name} ডাঙৰীয়া। ${firstFam ? `${firstFam.name} (${firstFam.relationshipOrDetail}) আপোনাৰ বৰ মৰমৰ। ${firstFam.description}` : 'আপোনাৰ জীয়াৰী অনন্যাই আপোনাৰ সকলো যত্ন লয়।'} আপোনাৰ আপোন স্মৃতিবোৰ সদায় আপোনাৰ লগত আছে।`;
    } else if (lang === 'bn') {
      replyText = `আপনার পরিবার আপনাকে ভীষণ ভালোবাসে, ${name} দেবী। ${firstFam ? `${firstFam.name} (${firstFam.relationshipOrDetail}) আপনার সাথে নিয়মিত সময় কাটান।` : 'আপনার পরিবার সর্বদা আপনার পাশে আছে।'} স্মৃতি পাতায় সুন্দর ছবিগুলো দেখতে পারেন।`;
    } else if (lang === 'hi') {
      replyText = `आपका परिवार आपको बहुत प्यार करता है, ${name} जी। ${firstFam ? `${firstFam.name} (${firstFam.relationshipOrDetail}) आपकी बहुत परवाह करते हैं।` : 'आपकी बेटी अनन्या आपकी हर देखभाल करती हैं।'} आपकी पुरानी प्यारी यादें सुरक्षित हैं।`;
    } else if (lang === 'ne') {
      replyText = `तपाईंको परिवारले तपाईंलाई धेरै माया गर्छ, ${name} जी। ${firstFam ? `${firstFam.name} (${firstFam.relationshipOrDetail}) ले तपाईंको धेरै ख्याल राख्नुहुन्छ।` : 'तपाईंको परिवार सधैं तपाईंको साथमा छ।'} तपाईंको स्मृतिहरू सुरक्षित छन्।`;
    } else if (lang === 'mni') {
      replyText = `অদোমগী ইমুং মনুংনা অদোমবু য়াম্না নুংশি, ${name}। ${firstFam ? `${firstFam.name} (${firstFam.relationshipOrDetail}) না অদোমবু য়াম্না য়েংশিনবী।` : 'অদোমগী ইমুং অদোমগা লোয়ননা লৈ।'}`;
    } else if (lang === 'brx') {
      const boroName = firstFam ? `${firstFam.name} (${firstFam.relationshipOrDetail})` : 'नखरा';
      replyText = `नोंथांनि नखरा नोंथांखौ जोबोद अननाय हरो, ${name}! ${boroName} नोंथांनि सेराव दं।`;
    }

    return {
      replyText,
      sentiment: 'nostalgic',
      topic: 'family',
      actions: [
        { label: 'Open Family Memories', actionType: 'view_memories' }
      ]
    };
  }

  private buildLocationResponse(
    lang: LanguageCode, 
    name: string, 
    patient: Patient
  ): CompanionResponse {
    const region = patient.region || 'Assam, North East India';
    let replyText = `You are at home in ${region}, ${name}. It is a tranquil, familiar place surrounded by green trees and fresh breeze. You are safe, comfortable, and well cared for.`;

    if (lang === 'as' || lang === 'regional') {
      replyText = `আপুনি ${region}ত নিজৰ মৰমৰ শান্ত ঘৰখনতেই আছে, ${name} ডাঙৰীয়া। ব্ৰহ্মপুত্ৰৰ মৃদু বতাহ আৰু সেউজীয়া পৰিৱেশেৰে ভৰা আপোনাৰ আপোন ঠাই।`;
    } else if (lang === 'bn') {
      replyText = `আপনি আপনার ভালোবাসার ঘর ${region}-এ আছেন, ${name} দেবী। চারপাশের চেনা পরিবেশ আর স্নিগ্ধ বাতাসে আপনি সম্পূর্ণ নিরাপদে ও শান্তিতে আছেন।`;
    } else if (lang === 'hi') {
      replyText = `आप ${region} में अपने सुंदर और शांत घर में हैं, ${name} जी। यह आपका अपना परिचित स्थान है जहाँ आप पूरी तरह सुरक्षित हैं।`;
    }

    return {
      replyText,
      sentiment: 'calm',
      topic: 'orientation'
    };
  }

  private buildActivityResponse(
    lang: LanguageCode, 
    name: string, 
    sessions: GameSession[], 
    rec: any
  ): CompanionResponse {
    const count = sessions.length;
    let replyText = `You have completed ${count} cognitive exercise${count === 1 ? '' : 's'} so far, ${name}! Your recommended activity for today is "${rec.recommendedType.replace('_', ' ')}", designed to keep your mind sharp and refreshed. Would you like to start?`;

    if (lang === 'as' || lang === 'regional') {
      replyText = `আপুনি আজি ইতিমধ্যে ${count}টা মগজুৰ অনুশীলন সুন্দৰভাৱে কৰিছে, ${name} ডাঙৰীয়া! এতিয়া আপোনাৰ বাবে উপযুক্ত অনুশীলন সাজু আছে। আৰম্ভ কৰিব নেকি?`;
    } else if (lang === 'bn') {
      replyText = `আপনি খুব চমৎকারভাবে ${count}টি স্মৃতি ও বুদ্ধির খেলা সম্পন্ন করেছেন, ${name} দেবী! আপনার মনকে সতেজ রাখার জন্য পরবর্তী কার্যকলাপ প্রস্তুত।`;
    } else if (lang === 'hi') {
      replyText = `आपने बहुत बढ़िया तरीके से ${count} दिमागी अभ्यास पूरे किए हैं, ${name} जी! आपकी अगली गतिविधि तैयार है। क्या आप खेलना चाहेंगे?`;
    }

    return {
      replyText,
      sentiment: 'happy',
      topic: 'routine',
      actions: [
        { label: 'Start Activity Now', actionType: 'start_activity', payload: rec.recommendedType }
      ]
    };
  }

  private buildGreetingResponse(lang: LanguageCode, name: string): CompanionResponse {
    let replyText = `Hello ${name}! It is wonderful to talk with you. I am Saathi, your Mind Mate companion. You can speak with me anytime to remember your schedule, recall your loved ones, or just share how you are feeling. How are you doing today?`;

    if (lang === 'as' || lang === 'regional') {
      replyText = `নমস্কাৰ ${name} ডাঙৰীয়া! আপোনাৰ লগত কথা পাতি বৰ ভাল লাগিল। মই আপোনাৰ সাৰথি। আজিৰ দিনটোৰ কথা জানিবলৈ, পৰিয়ালৰ স্মৃতি মনত পেলাবলৈ বা মনৰ কথা ক'বলৈ মোক যিকোনো সময়তে ক'ব পাৰে। আজি কেনে লাগিছে আপোনাৰ?`;
    } else if (lang === 'bn') {
      replyText = `নমস্কার ${name} দেবী! আপনার সাথে কথা বলতে পেরে খুব ভালো লাগছে। আমি আপনার মনের সঙ্গী সাৰ্থী। সারাদিনের কথা মনে করতে বা মনের ভাব প্রকাশ করতে আপনি যখন খুশি আমার সাথে কথা বলতে পারেন। কেমন আছেন আজকে?`;
    } else if (lang === 'hi') {
      replyText = `नमस्ते ${name} जी! आपसे बात करके बहुत खुशी हुई। मैं आपका साथी (Mind Mate Companion) हूँ। आप मुझसे अपने दिन की दिनचर्या, परिवार या मन की कोई भी बात साझा कर सकते हैं। आज आप कैसा महसूस कर रहे हैं?`;
    } else if (lang === 'ne') {
      replyText = `नमस्ते ${name} जी! म तपाईंको साथी हुँ। आफ्नो दिनको तालिका सम्झन वा कुराकानी गर्न म सधैं यहाँ छु। आज कस्तो महसुस हुँदैछ?`;
    }

    return {
      replyText,
      sentiment: 'happy',
      topic: 'general'
    };
  }

  private buildStoryResponse(lang: LanguageCode, name: string, patient: Patient): CompanionResponse {
    let replyText = `Here is a gentle thought for you, ${name}: Early this morning, a gentle breeze swept through the tea gardens, carrying the aroma of fresh leaves and golden marigolds. A songbird rested upon the garden branch, singing a peaceful melody for the new day. All is calm and well in our home.`;

    if (lang === 'as' || lang === 'regional') {
      replyText = `আপোনাৰ বাবে এটা সুন্দৰ মনৰ সাধু, ${name} ডাঙৰীয়া: পুৱাৰ সোণালী ৰ'দে চাহ বাগিচাৰ নতুন কুঁহিপাতবোৰ শুৱনি কৰি তুলিছে। চোতালৰ বকুলজোপাত কপৌ চৰায়ে মিঠা মাত দিছে। বতাহজাক জুৰ আৰু মন জুৰোৱা। আপোনাৰ ঘৰখন শান্তিৰে উপচি পৰিছে।`;
    } else if (lang === 'bn') {
      replyText = `একটি মধুর স্মৃতি আপনার জন্য, ${name} দেবী: ভোরের স্নিগ্ধ আলোয় উঠোনের কামিনী ফুলে শিশির চিকচিক করছে। বাগানের পাখিরা মিষ্টি সুরে গান গাইছে। স্নিগ্ধ শান্ত বাতাসে চারপাশ ভরে উঠেছে। আপনার মন শান্ত ও প্রসন্ন থাকুক।`;
    } else if (lang === 'hi') {
      replyText = `एक प्यारी सी बात आपके लिए, ${name} जी: सुबह की ताज़ा धूप में बगीचे के फूल खिल रहे हैं। चिड़ियों की मधुर आवाज़ से आँगन गूँज रहा है। चारों ओर शांति और सुखद वातावरण है। सब मंगलमय है।`;
    }

    return {
      replyText,
      sentiment: 'calm',
      topic: 'memory'
    };
  }

  private buildDefaultFriendlyResponse(lang: LanguageCode, name: string, pendingCount: number): CompanionResponse {
    let replyText = `I am listening, ${name}. You can ask me about your medicine, what's on your plan today (${pendingCount} reminder${pendingCount === 1 ? '' : 's'} remaining), or tell me about your thoughts. What would you like to talk about?`;

    if (lang === 'as' || lang === 'regional') {
      replyText = `মই আপোনাৰ কথা শুনি আছো, ${name} ডাঙৰীয়া। আপুনি মোক ঔষধৰ সময়, আজিৰ কাম বা মনৰ যিকোনো কথা ক'ব পাৰে। আপুনি কিবা সুধিব বিচাৰে নেকি?`;
    } else if (lang === 'bn') {
      replyText = `আমি আপনার কথা শুনছি, ${name} দেবী। আপনি আমাকে আপনার আজকের ওষুধ, কাজের রুটিন বা মনের যে কোনো কথা বলতে পারেন। বলুন, আমি শুনছি।`;
    } else if (lang === 'hi') {
      replyText = `मैं आपकी बात सुन रहा हूँ, ${name} जी। आप मुझसे अपनी दवाई, दिन की योजना या अपने मन की कोई भी बात कर सकते हैं। आप क्या जानना चाहते हैं?`;
    }

    return {
      replyText,
      sentiment: 'neutral',
      topic: 'general',
      actions: [
        { label: 'Check Today\'s Routine', actionType: 'view_reminders' },
        { label: 'Remember Family', actionType: 'view_memories' }
      ]
    };
  }

  private matchesAny(input: string, keywords: string[]): boolean {
    return keywords.some(k => input.includes(k.toLowerCase()));
  }

  /**
   * Optional Gemini API integration when user has API key and is online
   */
  private async queryGemini(
    userQuery: string,
    lang: LanguageCode,
    patient: Patient,
    reminders: Reminder[],
    memories: PersonalMemoryItem[],
    caregiver: any,
    apiKey: string
  ): Promise<CompanionResponse | null> {
    const systemPrompt = `You are "Saathi" (Mind Mate Companion), an empathetic, gentle conversational assistant designed for elderly individuals and patients with mild cognitive impairment or dementia in North East India.
PATIENT CONTEXT:
- Name: ${patient.name} (Address them warmly as ${patient.name.split(' ')[0]})
- Age: ${patient.age}
- Region: ${patient.region}
- Caregiver: ${caregiver?.name || 'Ananya'}
- Language: ${lang}
- Reminders for today: ${reminders.map(r => `${r.title} at ${r.timeStr} (Status: ${r.status})`).join('; ')}
- Personal memories / loved ones: ${memories.slice(0, 5).map(m => `${m.name}: ${m.description}`).join('; ')}

RULES FOR DEMENTIA COMMUNICATION:
1. Always be validating, gentle, calm, and reassuring. Never scold, never argue, never say "you already asked that".
2. Keep replies short (2 to 4 sentences maximum) so an elderly person can easily listen and comprehend.
3. If they feel confused or lost, gently orient them to their home and remind them they are safe and loved.
4. Reply in language: ${lang}.
5. If they ask about medicine, check the reminder list above.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\nPatient says: "${userQuery}"` }] }
      ],
      generationConfig: {
        maxOutputTokens: 250,
        temperature: 0.7
      }
    };

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      throw new Error(`Gemini API returned status ${resp.status}`);
    }

    const data = await resp.json();
    const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!replyText) return null;

    return {
      replyText: replyText.trim(),
      sentiment: 'calm',
      topic: 'general',
      isAiGenerated: true
    };
  }
}

export const companionEngine = new CompanionEngine();
