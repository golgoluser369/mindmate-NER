import React, { useState, useRef } from 'react';
import { LanguageCode, GameSession, AdaptiveDecision } from '../../models/types';
import { getStrings } from '../../locales';
import { offlineService } from '../../services/offlineService';
import { evaluateAndAdaptSession } from '../../services/adaptiveEngine';
import { voiceService } from '../../services/voiceService';
import { RealLifeImage } from '../../services/realLifeAssets';
import { SessionResultModal } from './SessionResultModal';
import { ArrowRight, ArrowLeft, Volume2, CheckCircle2, HelpCircle } from 'lucide-react';

interface SequenceRecallGameProps {
  language: LanguageCode;
  onFinish: () => void;
  onBack: () => void;
}

type LocalizedText = Partial<Record<LanguageCode, string>> & { en: string };

interface SequenceStep {
  id: string;
  assetKey: string;
  labels: LocalizedText;
}

interface SequenceScenario {
  id: string;
  themeTitle: LocalizedText;
  steps: SequenceStep[];
  correctNext: SequenceStep;
  distractorOptions: SequenceStep[];
}

const SEQ_TITLE: LocalizedText = {
  en: 'Sequence Recall',
  as: 'ক্ৰম নিৰ্ণয় স্মৃতি',
  bn: 'ধারাবাহিকতা স্মরণ',
  ne: 'क्रम स्मरण अभ्यास',
  mni: 'ক্ৰম নিংশিংবা',
  hi: 'अनुक्रम स्मरण',
  brx: 'फारि गोसो खांनाय'
};

const SCENARIOS: SequenceScenario[] = [
  // Scenario 1: Daily Morning Routine
  {
    id: 'morning_routine',
    themeTitle: {
      en: 'Morning Daily Living Sequence',
      as: 'ৰাতিপুৱাৰ দৈনন্দিন কামৰ ক্ৰম',
      bn: 'সকালের প্রাত্যহিক কাজের ধারা',
      ne: 'बिहानको दैनिक तालिकाको क्रम',
      mni: 'অয়ুক্কী নোংমগী থৌরমগী ক্ৰম',
      hi: 'सुबह की दैनिक दिनचर्या का क्रम',
      brx: 'फुंनि सानफ्रोमबोनि खामानि फारि'
    },
    steps: [
      {
        id: 'step_tea',
        assetKey: 'cup',
        labels: {
          en: '1. Morning Warm Tea',
          as: '১. পুৱাৰ গৰম চাহ',
          bn: '১. সকালের গরম চা',
          ne: '१. बिहानको तातो चिया',
          mni: '১. অয়ুক্কী খোইদাঙবা চা',
          hi: '१. सुबह की गरम चाय',
          brx: '१. फुंनि गुदुं साहा'
        }
      },
      {
        id: 'step_meds',
        assetKey: 'medicine',
        labels: {
          en: '2. Daily Medicine Tablet',
          as: '২. নিয়মীয়া ঔষধ সেৱন',
          bn: '২. দৈনিক ঔষধ খাওয়া',
          ne: '२. दैनिक औषधिको गोली',
          mni: '২. নোংমগী হিদাক চাবা',
          hi: '२. दैनिक दवा की गोली',
          brx: '२. सानफ्रोमबोनि मुलि'
        }
      }
    ],
    correctNext: {
      id: 'step_walk',
      assetKey: 'garden_walk',
      labels: {
        en: '3. Courtyard Garden Stroll',
        as: '৩. চোতালৰ বাগিচাত খোজ কঢ়া',
        bn: '৩. উঠোনের বাগানে মৃদু প্রাতঃভ্রমণ',
        ne: '३. आँगन र बगैँचामा हिँड्ने',
        mni: '৩. সুম্বাং লৈকোন্না চৎপা',
        hi: '३. आँगन और बगीचे में टहलना',
        brx: '३. नखरनि बारियाव थाबायनाय'
      }
    },
    distractorOptions: [
      {
        id: 'opt_sleep',
        assetKey: 'breathing',
        labels: {
          en: 'Deep Night Sleep',
          as: 'নিশাৰ গভীৰ টোপনি',
          bn: 'রাতের গভীর ঘুম',
          ne: 'रातको गहिरो निद्रा',
          mni: 'অহিংশাগী তুম্বা',
          hi: 'रात की गहरी नींद',
          brx: 'हरनि गोथौ उन्दुनाय'
        }
      },
      {
        id: 'opt_bazaar',
        assetKey: 'bazaar',
        labels: {
          en: 'Evening Market Bazaar',
          as: 'গধূলিৰ বজাৰ',
          bn: 'সন্ধ্যার বাজার',
          ne: 'साँझको बजार',
          mni: 'নুমিদাংগী কৈথেল',
          hi: 'शाम का बाजार',
          brx: 'सान्फुंनि हाथाय'
        }
      }
    ]
  },
  // Scenario 2: Traditional Tea Brewing Sequence
  {
    id: 'tea_brewing',
    themeTitle: {
      en: 'Fresh Tea Brewing Sequence',
      as: 'চাহ বনোৱাৰ ক্ৰম',
      bn: 'চা বানানোর ধারাবাহিক পদ্ধতি',
      ne: 'ताजा चिया बनाउने क्रम',
      mni: 'চা শেম্বগী ক্ৰম',
      hi: 'ताजा चाय बनाने का क्रम',
      brx: 'साहा बानायनाय फारि'
    },
    steps: [
      {
        id: 'step_water',
        assetKey: 'jug',
        labels: {
          en: '1. Fresh Water in Kettle',
          as: '১. কেটলীত পৰিষ্কাৰ পানী',
          bn: '১. কেটলিতে পরিষ্কার জল',
          ne: '१. केतलीमा ताजा पानी',
          mni: '১. ঈশিং চেতলিদা হাপ্পা',
          hi: '१. केतली में ताजा पानी',
          brx: '१. खेतलियाव दै होनाय'
        }
      },
      {
        id: 'step_leaves',
        assetKey: 'flower',
        labels: {
          en: '2. Fragrant Tea Leaves',
          as: '২. সুগন্ধি চাহপাত উতলোৱা',
          bn: '২. সুবাসিত চা পাতা ফোটানো',
          ne: '२. सुगन्धित चिया पत्ती उमाल्ने',
          mni: '২. মহাও লৈবা চা মনা',
          hi: '२. सुगंधित चाय पत्ती उबालना',
          brx: '२. मोदोमनाय साहा बिलाइ'
        }
      }
    ],
    correctNext: {
      id: 'step_cup_serve',
      assetKey: 'cup',
      labels: {
        en: '3. Serve Hot in Ceramic Cup',
        as: '৩. চিনামাটিৰ কাপত ঢালি পৰিৱেশন',
        bn: '৩. সেরামিক কাপে গরম চা পরিবেশন',
        ne: '३. कपमा तातो चिया हालेर पिउने',
        mni: '৩. কুপতা খোইদাঙবা চা থক্কদবা',
        hi: '३. कप में गरमा-गरम चाय परोसना',
        brx: '३. कपआव साहा गोसा लोंनाय'
      }
    },
    distractorOptions: [
      {
        id: 'opt_key',
        assetKey: 'key',
        labels: {
          en: 'Brass Door Key',
          as: 'পিতলৰ দুৱাৰৰ চাবি',
          bn: 'পিতলের দরজার চাবি',
          ne: 'ढोकाको पित्तलको चाबी',
          mni: 'থোংগী চাবি',
          hi: 'दरवाजे की पीतल की चाबी',
          brx: 'सिथारि दरजानि चाबि'
        }
      },
      {
        id: 'opt_comb',
        assetKey: 'comb',
        labels: {
          en: 'Wooden Hair Comb',
          as: 'কাঠৰ চুলিৰ ফণি',
          bn: 'কাঠের চিরুনি',
          ne: 'काठको काँयो',
          mni: 'সমজেৎ',
          hi: 'लकड़ी की कंघी',
          brx: 'खोनथा'
        }
      }
    ]
  },
  // Scenario 3: Natural Daytime Progression
  {
    id: 'day_cycle',
    themeTitle: {
      en: 'Times of Day & Sunrise Progression',
      as: 'দিনৰ সময় আৰু প্ৰকৃতিৰ ক্ৰম',
      bn: 'দিনের প্রহর ও প্রকৃতির ধারাবাহিকতা',
      ne: 'दिनको समय र प्रकृतिको क्रम',
      mni: 'নুমিৎপুংগী ক্ৰম',
      hi: 'दिन के समय और प्रकृति का क्रम',
      brx: 'साननि समाव फारि'
    },
    steps: [
      {
        id: 'step_mountain',
        assetKey: 'mountain',
        labels: {
          en: '1. Sunrise over Kanchenjunga',
          as: '১. কাঞ্চনজংঘাত পুৱাৰ সূৰ্যোদয়',
          bn: '১. কাঞ্চনজঙ্ঘার শিখরে সূর্যোদয়',
          ne: '१. कञ्चनजङ्घामा बिहानीको सूर्योदय',
          mni: '১. চীংদা নোংপোকপা',
          hi: '१. पहाड़ों पर सुबह का सूर्योदय',
          brx: '१. हाजोआव फुंनि सान ओंखारनाय'
        }
      },
      {
        id: 'step_bazaar',
        assetKey: 'bazaar',
        labels: {
          en: '2. Midday Community Market',
          as: '২. দুপৰীয়াৰ স্থানীয় বজাৰ',
          bn: '২. দুপুরের ব্যস্ত স্থানীয় বাজার',
          ne: '२. दिउँसोको स्थानीय बजार',
          mni: '২. নুংথিলগী কৈথেল চৎপা',
          hi: '२. दोपहर का स्थानीय बाजार',
          brx: '२. सान्झुफुनि हाथाय'
        }
      },
      {
        id: 'step_river',
        assetKey: 'river',
        labels: {
          en: '3. Sunset by Barak River',
          as: '৩. বৰাক নদীত গধূলিৰ বেলি লহিওৱা',
          bn: '৩. নদীর তীরে শান্ত সূর্যাস্ত',
          ne: '३. नदी किनारमा साँझको सूर्यास्त',
          mni: '৩. তুরেলদা নুমিৎ তাথবা',
          hi: '३. नदी किनारे शाम का सूर्यास्त',
          brx: '३. दैमा सेराव सान हाबनाय'
        }
      }
    ],
    correctNext: {
      id: 'step_night_home',
      assetKey: 'residence',
      labels: {
        en: '4. Peaceful Family Home at Night',
        as: '৪. ৰাতি নিজ ঘৰলৈ উভতি জিৰণি',
        bn: '৪. রাতে নিজের শান্তির ঘরে ফিরে বিশ্রাম',
        ne: '४. राति आफ्नै घर फर्केर विश्राम',
        mni: '৪. অহিংশাদা য়ুমদা পোথারবা',
        hi: '४. रात को अपने शांत घर में विश्राम',
        brx: '४. हराव नखरनि नआव बिखाय लानाय'
      }
    },
    distractorOptions: [
      {
        id: 'opt_bell',
        assetKey: 'bell',
        labels: {
          en: 'Morning Puja Bell',
          as: 'পুৱাৰ পূজাৰ ঘণ্টা',
          bn: 'সকালের পূজার ঘণ্টা',
          ne: 'बिहानको पूजा घण्टी',
          mni: 'পুজা ঘণ্টা',
          hi: 'सुबह की पूजा की घंटी',
          brx: 'फुंनि पुजा घन्टा'
        }
      },
      {
        id: 'opt_pocket_watch',
        assetKey: 'pocket_watch',
        labels: {
          en: 'Silver Pocket Watch',
          as: 'ৰূপালী পকেট ঘড়ী',
          bn: 'রুপার পকেট ঘড়ি',
          ne: 'चाँदीको पकेट घडी',
          mni: 'পোকেট পুং',
          hi: 'चांदी की पॉकेट घड़ी',
          brx: 'पकेट घडि'
        }
      }
    ]
  }
];

export const SequenceRecallGame: React.FC<SequenceRecallGameProps> = ({
  language,
  onFinish,
  onBack
}) => {
  const strings = getStrings(language);
  const patient = offlineService.getPatient();
  const currentLevel = patient.currentLevel || 2;

  // Select scenario matching difficulty level
  const scenarioIndex = Math.min(SCENARIOS.length - 1, Math.max(0, currentLevel - 1));
  const scenario = SCENARIOS[scenarioIndex];

  const [gameState, setGameState] = useState<'instruction' | 'playing' | 'completed'>('instruction');
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);

  const [finishedSession, setFinishedSession] = useState<GameSession | null>(null);
  const [adaptiveDecision, setAdaptiveDecision] = useState<AdaptiveDecision | null>(null);

  const startTimeRef = useRef<number>(0);

  // Combined options (correct + distractors), shuffled
  const [options, setOptions] = useState<SequenceStep[]>([]);

  const handleStart = () => {
    const allOptions = [scenario.correctNext, ...scenario.distractorOptions];
    // Simple deterministic shuffle
    const shuffled = [...allOptions].sort(() => Math.random() - 0.5);
    setOptions(shuffled);
    setSelectedOptionId(null);
    setIsAnswerCorrect(null);
    setGameState('playing');
    startTimeRef.current = Date.now();
  };

  const handleSelect = (option: SequenceStep) => {
    if (selectedOptionId !== null) return; // Prevent double taps

    const responseTime = Date.now() - startTimeRef.current;
    const isCorrect = option.id === scenario.correctNext.id;

    setSelectedOptionId(option.id);
    setIsAnswerCorrect(isCorrect);

    const { session, decision } = evaluateAndAdaptSession({
      patientId: patient.id,
      activityId: 'sequence_recall',
      activityTitle: SEQ_TITLE[language] || 'Sequence Recall',
      accuracy: isCorrect ? 100 : 35,
      responseTimeMs: responseTime,
      completionRate: 100,
      attempts: 1,
      errors: isCorrect ? 0 : 1,
      difficultyLevel: currentLevel,
      isPersonalized: true
    });

    // Provide brief visual confirmation, then show results
    setTimeout(() => {
      setFinishedSession(session);
      setAdaptiveDecision(decision);
      setGameState('completed');
    }, 900);
  };

  const promptText: LocalizedText = {
    en: 'Observe the sequence above. What comes next in sequence?',
    as: 'ওপৰৰ ক্ৰমটো চাওক। ইয়াৰ পিছত পৰৱৰ্তী কি আহিব বাছক?',
    bn: 'উপরের ধারাবাহিকতা লক্ষ্য করুন। এর পরবর্তী ধাপ কোনটি হবে?',
    ne: 'माथिको क्रम हेर्नुहोस्। यसपछि कुन आउँछ छान्नुहोस्?',
    mni: 'মথক্কী ক্ৰম অসি য়েংবীয়ু। মথংদা করিনো খনবীয়ু?',
    hi: 'ऊपर दिए गए क्रम को देखें। इसके बाद क्या आएगा?',
    brx: 'गोजौनि फारिखौ नाय। बेनि उनाव मा फैगोन सायख?'
  };

  const handleVoiceListen = () => {
    const textToSpeak = `${scenario.themeTitle[language] || scenario.themeTitle.en}. ${promptText[language] || promptText.en}`;
    voiceService.speak(textToSpeak, language);
  };

  return (
    <div style={{ maxWidth: 'var(--max-patient-width)', margin: '0 auto', padding: '16px 16px 40px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '16px',
            fontWeight: 600,
            color: 'var(--color-navy)',
            cursor: 'pointer'
          }}
          aria-label="Back"
        >
          <ArrowLeft size={20} />
          <span>{strings.navHome}</span>
        </button>

        <div style={{
          fontSize: '15px',
          fontWeight: 700,
          color: 'var(--color-teal)',
          background: 'var(--color-teal-soft)',
          padding: '6px 14px',
          borderRadius: 'var(--radius-full)'
        }}>
          {strings.level || 'Level'} {currentLevel} • {SEQ_TITLE[language] || 'Sequence Recall'}
        </div>

        <button
          onClick={handleVoiceListen}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--color-navy)',
            color: '#FFFFFF',
            border: 'none',
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
          title={strings.voiceListen}
          aria-label={strings.voiceListen}
        >
          <Volume2 size={20} />
          <span>{strings.voiceListen}</span>
        </button>
      </div>

      {/* 1. INSTRUCTION VIEW */}
      {gameState === 'instruction' && (
        <div className="patient-card" style={{ textAlign: 'center', padding: '36px 24px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 20px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-navy-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-navy)'
          }}>
            <ArrowRight size={44} strokeWidth={2.2} />
          </div>

          <h2 style={{ fontSize: 'var(--text-elderly-hero)', color: 'var(--color-navy)', marginBottom: '12px' }}>
            {scenario.themeTitle[language] || scenario.themeTitle.en}
          </h2>
          <p style={{
            fontSize: 'var(--text-elderly-instruction)',
            color: 'var(--color-text-secondary)',
            marginBottom: '28px',
            lineHeight: 1.5,
            maxWidth: '560px',
            margin: '0 auto 28px'
          }}>
            {promptText[language] || promptText.en}
          </p>

          <button
            onClick={handleStart}
            className="patient-btn patient-btn-primary"
            style={{ minWidth: '240px', margin: '0 auto' }}
          >
            {strings.beginSession || 'Start Sequence Activity'}
          </button>
        </div>
      )}

      {/* 2. PLAYING VIEW */}
      {gameState === 'playing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Sequence Stream Card */}
          <div className="patient-card" style={{ padding: '24px 20px', textAlign: 'center' }}>
            <h3 style={{
              fontSize: '17px',
              fontWeight: 700,
              color: 'var(--color-teal-dark)',
              marginBottom: '16px'
            }}>
              {scenario.themeTitle[language] || scenario.themeTitle.en}
            </h3>

            {/* Steps Track */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '20px'
            }}>
              {scenario.steps.map((step, idx) => (
                <React.Fragment key={step.id}>
                  <div style={{
                    background: 'var(--color-bg-patient)',
                    border: '2px solid var(--color-teal)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minWidth: '110px',
                    maxWidth: '140px',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    <RealLifeImage
                      assetKey={step.assetKey}
                      size={64}
                      rounded={true}
                      alt={step.labels[language] || step.labels.en}
                      style={{ marginBottom: '8px' }}
                    />
                    <span style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: 'var(--color-navy)',
                      lineHeight: 1.3
                    }}>
                      {step.labels[language] || step.labels.en}
                    </span>
                  </div>

                  {/* Flow Arrow */}
                  <div style={{
                    color: 'var(--color-teal)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <ArrowRight size={24} strokeWidth={2.5} />
                  </div>
                </React.Fragment>
              ))}

              {/* Target Placeholder [ ? ] */}
              <div style={{
                background: selectedOptionId ? 'var(--color-teal-soft)' : 'var(--color-navy-soft)',
                border: selectedOptionId
                  ? (isAnswerCorrect ? '3px solid var(--color-teal)' : '3px solid var(--color-coral)')
                  : '2.5px dashed var(--color-teal)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '110px',
                maxWidth: '140px',
                minHeight: '128px',
                boxShadow: 'var(--shadow-sm)'
              }}>
                {selectedOptionId ? (
                  <>
                    <RealLifeImage
                      assetKey={options.find(o => o.id === selectedOptionId)?.assetKey || 'cup'}
                      size={64}
                      rounded={true}
                      alt="Selected Choice"
                      style={{ marginBottom: '8px' }}
                    />
                    <span style={{
                      fontSize: '13px',
                      fontWeight: 800,
                      color: isAnswerCorrect ? 'var(--color-teal-dark)' : 'var(--color-coral)'
                    }}>
                      {options.find(o => o.id === selectedOptionId)?.labels[language] || ''}
                    </span>
                  </>
                ) : (
                  <>
                    <HelpCircle size={44} style={{ color: 'var(--color-teal)', marginBottom: '6px' }} />
                    <span style={{
                      fontSize: '14px',
                      fontWeight: 800,
                      color: 'var(--color-navy)'
                    }}>
                      ? Next
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Prompt Instruction */}
            <div style={{
              background: 'var(--color-bg-patient)',
              padding: '14px 18px',
              borderRadius: 'var(--radius-sm)',
              border: '1.5px solid var(--color-border-subtle)',
              display: 'inline-block',
              maxWidth: '540px'
            }}>
              <p style={{
                fontSize: 'var(--text-elderly-instruction)',
                fontWeight: 700,
                color: 'var(--color-navy)',
                margin: 0
              }}>
                {promptText[language] || promptText.en}
              </p>
            </div>
          </div>

          {/* Options To Select What Comes Next */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '14px'
          }}>
            {options.map(option => {
              const isSelected = selectedOptionId === option.id;
              const isCorrectOpt = option.id === scenario.correctNext.id;

              return (
                <button
                  key={option.id}
                  onClick={() => handleSelect(option)}
                  disabled={selectedOptionId !== null}
                  className="patient-card patient-card-interactive"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '18px 20px',
                    minHeight: '80px',
                    textAlign: 'left',
                    background: isSelected
                      ? (isCorrectOpt ? 'var(--color-teal-soft)' : '#FFF5F5')
                      : 'var(--color-bg-surface)',
                    border: isSelected
                      ? (isCorrectOpt ? '3px solid var(--color-teal)' : '3px solid var(--color-coral)')
                      : '2px solid var(--color-border)',
                    boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                    transition: 'all 0.2s ease',
                    cursor: selectedOptionId !== null ? 'default' : 'pointer'
                  }}
                  aria-pressed={isSelected}
                >
                  <div style={{ flexShrink: 0 }}>
                    <RealLifeImage
                      assetKey={option.assetKey}
                      size={54}
                      rounded={true}
                      alt={option.labels[language] || option.labels.en}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: 700,
                      color: 'var(--color-navy)',
                      lineHeight: 1.3
                    }}>
                      {option.labels[language] || option.labels.en}
                    </div>
                  </div>
                  {isSelected && isCorrectOpt && (
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'var(--color-teal)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <CheckCircle2 size={22} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. RESULT MODAL */}
      {gameState === 'completed' && finishedSession && (
        <SessionResultModal
          session={finishedSession}
          decision={adaptiveDecision || undefined}
          language={language}
          onContinue={onFinish}
          onReturnHome={onBack}
        />
      )}
    </div>
  );
};
