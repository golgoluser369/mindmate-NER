import React, { useState, useEffect, useRef } from 'react';
import { LanguageCode, ChatMessage, ActivityType } from '../../models/types';
import { getStrings } from '../../locales';
import { offlineService } from '../../services/offlineService';
import { voiceService } from '../../services/voiceService';
import { companionEngine } from '../../services/companionEngine';
import { 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Sparkles, 
  Heart, 
  Calendar, 
  Pill, 
  Bot, 
  ArrowLeft,
  Wifi,
  WifiOff,
  User,
  ShieldCheck,
  CheckCircle2,
  Globe,
  Languages
} from 'lucide-react';

interface CompanionChatViewProps {
  language: LanguageCode;
  onLanguageChange?: (lang: LanguageCode) => void;
  onBack?: () => void;
  onNavigateToTab?: (tab: 'home' | 'activities' | 'memory' | 'reminders') => void;
  onStartActivity?: (type: ActivityType) => void;
}

const VOICE_LANG_OPTIONS: { code: LanguageCode; label: string; nativeName: string; flag: string }[] = [
  { code: 'as', label: 'Assamese', nativeName: 'অসমীয়া', flag: '🌿' },
  { code: 'bn', label: 'Bengali', nativeName: 'বাংলা', flag: '🌺' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी', flag: '🪷' },
  { code: 'ne', label: 'Nepali', nativeName: 'नेपाली', flag: '🏔️' },
  { code: 'mni', label: 'Manipuri', nativeName: 'মৈতৈলোন্', flag: '🌸' },
  { code: 'brx', label: 'Bodo', nativeName: 'बर\'', flag: '🌾' },
  { code: 'en', label: 'English', nativeName: 'English', flag: '🌐' }
];

export const CompanionChatView: React.FC<CompanionChatViewProps> = ({
  language,
  onLanguageChange,
  onBack,
  onNavigateToTab,
  onStartActivity
}) => {
  const [activeVoiceLang, setActiveVoiceLang] = useState<LanguageCode>(language);

  useEffect(() => {
    setActiveVoiceLang(language);
  }, [language]);

  const strings = getStrings(activeVoiceLang);
  const patient = offlineService.getPatient();
  const patientFirstName = patient?.name ? patient.name.split(' ')[0] : 'friend';
  const isOffline = offlineService.isOffline();

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = offlineService.getCompanionMessages(patient.id);
    if (saved && saved.length > 0) return saved;
    // Initial welcome message
    const initialGreeting = getInitialGreeting(activeVoiceLang, patientFirstName);
    return [initialGreeting];
  });

  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeRecognitionRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    // Scroll to bottom on message update
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (activeRecognitionRef.current) {
        activeRecognitionRef.current.stop();
      }
      voiceService.stopSpeaking();
    };
  }, []);

  const handleSwitchVoiceLanguage = (newLang: LanguageCode) => {
    if (newLang === activeVoiceLang) return;

    setActiveVoiceLang(newLang);
    voiceService.stopSpeaking();
    setIsSpeaking(false);
    setSpeechError(null);

    // Spoken voice announcement in the new language
    let spokenAnnouncement = 'I will now speak with you in English.';
    if (newLang === 'as' || newLang === 'regional') spokenAnnouncement = `মই এতিয়া অসমীয়াত আপোনাৰ সৈতে কথা পাতিম, ${patientFirstName} ডাঙৰীয়া।`;
    else if (newLang === 'bn') spokenAnnouncement = `আমি এখন বাংলায় আপনার সাথে কথা বলব, ${patientFirstName} দেবী।`;
    else if (newLang === 'hi') spokenAnnouncement = `अब मैं आपसे हिन्दी में बात करूँगा, ${patientFirstName} जी।`;
    else if (newLang === 'ne') spokenAnnouncement = `अब म तपाईंसँग नेपालीमा कुरा गर्नेछु, ${patientFirstName} जी।`;
    else if (newLang === 'mni') spokenAnnouncement = `ঐহাক্না হৌজিক মণিপুরীদা অদোমগা ৱারী শাগনি, ${patientFirstName}।`;
    else if (newLang === 'brx') spokenAnnouncement = `आं दा बर' रावजों नोंथांजों खोथा बुंगोन, ${patientFirstName}।`;

    if (voiceEnabled) {
      setIsSpeaking(true);
      voiceService.speakText(spokenAnnouncement, newLang, () => {
        setIsSpeaking(false);
      });
    }

    // Visual bubble informing patient
    const noticeMsg: ChatMessage = {
      id: 'msg-lang-' + Date.now(),
      sender: 'assistant',
      text: getLanguageChangeNotice(newLang, patientFirstName),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      topic: 'general'
    };

    setMessages(prev => [...prev, noticeMsg]);
    offlineService.addCompanionMessage(noticeMsg, patient.id);

    // Propagate up to shell if callback provided
    if (onLanguageChange) {
      onLanguageChange(newLang);
    }
  };

  const handleSendMessage = async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed) return;

    setSpeechError(null);

    // Stop speaking if currently reading previous message
    voiceService.stopSpeaking();
    setIsSpeaking(false);

    const userMsg: ChatMessage = {
      id: 'msg-u-' + Date.now(),
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    offlineService.addCompanionMessage(userMsg, patient.id);
    setInputText('');
    setIsThinking(true);

    try {
      const response = await companionEngine.generateResponse(trimmed, activeVoiceLang);

      const assistantMsg: ChatMessage = {
        id: 'msg-a-' + Date.now(),
        sender: 'assistant',
        text: response.replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        topic: response.topic,
        sentiment: response.sentiment,
        actions: response.actions
      };

      const finalMessages = [...newMessages, assistantMsg];
      setMessages(finalMessages);
      offlineService.addCompanionMessage(assistantMsg, patient.id);

      // Read aloud to the patient in active voice language
      if (voiceEnabled) {
        setIsSpeaking(true);
        voiceService.speakText(response.replyText, activeVoiceLang, () => {
          setIsSpeaking(false);
        });
      }
    } catch (err) {
      console.error('Error generating companion response:', err);
    } finally {
      setIsThinking(false);
    }
  };

  const handleToggleVoiceInput = () => {
    if (isListening) {
      // Stop listening
      if (activeRecognitionRef.current) {
        activeRecognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    // Stop any ongoing speech playback
    voiceService.stopSpeaking();
    setIsSpeaking(false);
    setSpeechError(null);

    setIsListening(true);
    const recognition = voiceService.startListening(
      activeVoiceLang,
      (transcript) => {
        setIsListening(false);
        if (transcript && transcript.trim()) {
          handleSendMessage(transcript);
        }
      },
      (errorMsg) => {
        setIsListening(false);
        console.warn('Speech error:', errorMsg);
        setSpeechError('Could not hear clearly. Please tap again and speak slowly.');
      },
      () => {
        setIsListening(false);
      }
    );

    activeRecognitionRef.current = recognition;
  };

  const handleSpeakAloud = (text: string) => {
    voiceService.stopSpeaking();
    setIsSpeaking(true);
    voiceService.speakText(text, activeVoiceLang, () => {
      setIsSpeaking(false);
    });
  };

  const handleClearHistory = () => {
    offlineService.clearCompanionMessages(patient.id);
    const initial = getInitialGreeting(activeVoiceLang, patientFirstName);
    setMessages([initial]);
  };

  const handleActionClick = (action: { label: string; actionType: string; payload?: string }) => {
    if (action.actionType === 'view_reminders' && onNavigateToTab) {
      onNavigateToTab('reminders');
    } else if (action.actionType === 'view_memories' && onNavigateToTab) {
      onNavigateToTab('memory');
    } else if (action.actionType === 'start_activity') {
      if (onStartActivity) {
        onStartActivity((action.payload as ActivityType) || 'memory_recall');
      } else if (onNavigateToTab) {
        onNavigateToTab('activities');
      }
    }
  };

  const promptChips = getPromptChips(activeVoiceLang, patientFirstName);
  const currentLangMeta = VOICE_LANG_OPTIONS.find(l => l.code === activeVoiceLang) || VOICE_LANG_OPTIONS[0];

  return (
    <div style={{
      maxWidth: '720px',
      margin: '0 auto',
      minHeight: 'calc(100vh - 120px)',
      display: 'flex',
      flexDirection: 'column',
      padding: '12px 16px 32px'
    }}>
      {/* Top Header Card */}
      <div style={{
        background: 'var(--color-bg-surface)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        border: '1.5px solid var(--color-border)',
        boxShadow: 'var(--shadow-card)',
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {onBack && (
            <button
              onClick={onBack}
              className="btn btn-subtle"
              style={{ padding: '8px 12px', minHeight: '44px' }}
              title="Return to Home"
            >
              <ArrowLeft size={20} />
            </button>
          )}

          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-teal) 0%, var(--color-navy) 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <Bot size={26} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{
                fontSize: '20px',
                fontWeight: 800,
                color: 'var(--color-navy)',
                margin: 0
              }}>
                Saathi (সাৰথি / साथी)
              </h1>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-teal-soft)',
                color: 'var(--color-teal-dark)'
              }}>
                Companion
              </span>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Speaking with <strong style={{ color: 'var(--color-navy)' }}>{patientFirstName}</strong> • 100% Private & Safe
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className="btn btn-subtle"
            style={{
              padding: '8px 12px',
              fontSize: '13px',
              minHeight: '40px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: voiceEnabled ? 'var(--color-teal)' : 'var(--color-text-muted)'
            }}
            title={voiceEnabled ? 'Voice playback is ON' : 'Voice playback is MUTED'}
          >
            {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            <span style={{ fontWeight: 600 }}>{voiceEnabled ? 'Voice: On' : 'Voice: Muted'}</span>
          </button>

          <button
            onClick={handleClearHistory}
            className="btn btn-subtle"
            style={{ padding: '8px', minHeight: '40px', color: 'var(--color-text-muted)' }}
            title="Start fresh conversation"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* Voice Assistant Spoken Language Bar */}
      <div style={{
        background: 'var(--color-bg-surface)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 14px',
        border: '1.5px solid var(--color-teal-light, #B2F5EA)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Languages size={18} style={{ color: 'var(--color-teal)' }} />
          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-navy)' }}>
            Voice Language:
          </span>
          <span style={{
            fontSize: '12px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-teal-soft)',
            color: 'var(--color-teal-dark)'
          }}>
            {currentLangMeta.nativeName} ({currentLangMeta.label})
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {VOICE_LANG_OPTIONS.map(opt => {
            const isSelected = activeVoiceLang === opt.code || (activeVoiceLang === 'regional' && opt.code === 'as');
            return (
              <button
                key={opt.code}
                onClick={() => handleSwitchVoiceLanguage(opt.code)}
                style={{
                  padding: '4px 10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-full)',
                  background: isSelected ? 'var(--color-teal)' : 'var(--color-bg-patient)',
                  color: isSelected ? '#FFFFFF' : 'var(--color-navy)',
                  border: `1.5px solid ${isSelected ? 'var(--color-teal)' : 'var(--color-border)'}`,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease'
                }}
                title={`Switch companion voice to ${opt.label}`}
              >
                <span>{opt.nativeName}</span>
                {isSelected && <CheckCircle2 size={12} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Suggested Quick Starters (Elderly Prompts) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '8px',
        marginBottom: '14px',
        scrollbarWidth: 'none'
      }}>
        {promptChips.map((chip, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(chip.text)}
            disabled={isListening || isThinking}
            style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-bg-surface)',
              border: '1.5px solid var(--color-border)',
              color: 'var(--color-navy)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-teal)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
          >
            <span>{chip.icon}</span>
            <span>{chip.label}</span>
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        padding: '8px 4px 16px'
      }}>
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: isUser ? 'flex-end' : 'flex-start',
                alignItems: 'flex-start',
                gap: '10px'
              }}
            >
              {!isUser && (
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'var(--color-teal)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '4px'
                }}>
                  <Bot size={20} />
                </div>
              )}

              <div style={{
                maxWidth: '82%',
                background: isUser ? 'var(--color-teal)' : 'var(--color-bg-surface)',
                color: isUser ? '#FFFFFF' : 'var(--color-text-primary)',
                padding: '14px 18px',
                borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                border: isUser ? 'none' : '1.5px solid var(--color-border)',
                boxShadow: 'var(--shadow-sm)',
                lineHeight: 1.5,
                fontSize: '16px'
              }}>
                <div>{msg.text}</div>

                {/* Optional Assistant Quick Actions */}
                {msg.actions && msg.actions.length > 0 && (
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginTop: '12px',
                    paddingTop: '10px',
                    borderTop: '1px solid var(--color-border)'
                  }}>
                    {msg.actions.map((act, actIdx) => (
                      <button
                        key={actIdx}
                        onClick={() => handleActionClick(act)}
                        style={{
                          background: 'var(--color-teal-soft)',
                          color: 'var(--color-teal-dark)',
                          border: '1px solid var(--color-teal)',
                          padding: '6px 12px',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {act.label} →
                      </button>
                    ))}
                  </div>
                )}

                {/* Footer timestamp and Read Aloud button */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isUser ? 'flex-end' : 'space-between',
                  marginTop: '8px',
                  fontSize: '11px',
                  color: isUser ? 'rgba(255,255,255,0.8)' : 'var(--color-text-muted)'
                }}>
                  <span>{msg.timestamp}</span>

                  {!isUser && (
                    <button
                      onClick={() => handleSpeakAloud(msg.text)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-teal)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 600,
                        padding: '2px 6px'
                      }}
                      title="Read this message aloud"
                    >
                      <Volume2 size={14} />
                      <span>Listen</span>
                    </button>
                  )}
                </div>
              </div>

              {isUser && (
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'var(--color-navy)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '4px'
                }}>
                  <User size={20} />
                </div>
              )}
            </div>
          );
        })}

        {isThinking && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--color-teal)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Bot size={20} />
            </div>
            <div style={{
              background: 'var(--color-bg-surface)',
              border: '1.5px solid var(--color-border)',
              padding: '12px 18px',
              borderRadius: '18px 18px 18px 4px',
              color: 'var(--color-text-secondary)',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Sparkles size={16} className="animate-spin" />
              <span>Saathi is thinking with care...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Listening State Banner & Error */}
      {speechError && (
        <div style={{
          background: 'var(--color-warning-soft)',
          border: '1px solid var(--color-warning-border)',
          color: 'var(--color-warning)',
          padding: '8px 14px',
          borderRadius: 'var(--radius-md)',
          fontSize: '13px',
          fontWeight: 600,
          marginBottom: '10px',
          textAlign: 'center'
        }}>
          {speechError}
        </div>
      )}

      {isListening && (
        <div style={{
          background: 'var(--color-navy-soft)',
          color: 'var(--color-navy)',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          fontWeight: 700,
          fontSize: '15px',
          border: '1.5px solid var(--color-teal)',
          animation: 'pulse 1.5s infinite'
        }}>
          <span style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: 'red',
            display: 'inline-block'
          }}></span>
          <span>Listening in {currentLangMeta.nativeName} ({currentLangMeta.label})... Speak calmly into your microphone</span>
        </div>
      )}

      {/* Voice-First Input Section */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: 'var(--color-bg-surface)',
        padding: '14px 16px',
        borderRadius: 'var(--radius-lg)',
        border: '1.5px solid var(--color-border)',
        boxShadow: 'var(--shadow-card)'
      }}>
        {/* Large Accessible Microphone Button */}
        <button
          onClick={handleToggleVoiceInput}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: isListening ? '#E53E3E' : 'var(--color-teal)',
            color: '#FFFFFF',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            boxShadow: isListening ? '0 0 0 6px rgba(229, 62, 62, 0.25)' : 'var(--shadow-md)',
            transition: 'all 0.2s ease'
          }}
          title={isListening ? 'Stop listening' : `Tap to speak with Saathi in ${currentLangMeta.label}`}
        >
          {isListening ? <MicOff size={28} /> : <Mic size={28} />}
        </button>

        {/* Text Input Fallback Bar */}
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage(inputText);
              }
            }}
            placeholder={
              isListening 
                ? `Listening in ${currentLangMeta.nativeName}...` 
                : getVoiceInputPlaceholder(activeVoiceLang)
            }
            disabled={isListening}
            style={{
              width: '100%',
              padding: '14px 16px',
              fontSize: '16px',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-border)',
              outline: 'none',
              color: 'var(--color-navy)',
              background: 'var(--color-bg-patient)'
            }}
          />
        </div>

        {/* Send Button */}
        <button
          onClick={() => handleSendMessage(inputText)}
          disabled={!inputText.trim() || isListening}
          className="btn btn-primary"
          style={{
            padding: '12px 18px',
            minHeight: '48px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Send size={18} />
          <span style={{ fontWeight: 700 }}>Send</span>
        </button>
      </div>
    </div>
  );
};

// --- Helper Data ---

function getInitialGreeting(lang: LanguageCode, name: string): ChatMessage {
  let text = `Hello ${name}! I am Saathi, your companion. You can tap the big microphone button to speak with me, ask what you have planned today, or tell me how you are feeling.`;

  if (lang === 'as' || lang === 'regional') {
    text = `নমস্কাৰ ${name} ডাঙৰীয়া! মই আপোনাৰ সাৰথি। আজিৰ দিনটোৰ কাম মনত পেলাবলৈ বা মনৰ কথা ক'বলৈ মোক যিকোনো সময়তে ক'ব পাৰে। ডাঙৰ মাইক্ৰ'ফোন বুটামত টিপি কথা পাতক।`;
  } else if (lang === 'bn') {
    text = `নমস্কার ${name} দেবী! আমি আপনার মনের সঙ্গী সাৰ্থী। আজকের রুটিন, ওষুধ বা পরিবারের কথা জানতে আপনি যে কোনো সময় আমাকে বলতে পারেন।`;
  } else if (lang === 'hi') {
    text = `नमस्ते ${name} जी! मैं आपका साथी हूँ। आप अपने दिन की योजना, दवाई या किसी भी बात के लिए मुझसे बोलकर या लिखकर बात कर सकते हैं।`;
  } else if (lang === 'ne') {
    text = `नमस्ते ${name} जी! म तपाईंको साथी हुँ। आजको दिनचर्या सम्झन वा कुराकानी गर्न म सधैं तयार छु।`;
  } else if (lang === 'mni') {
    text = `খুরুমজরি ${name}! ঐহাক্না অদোমগী সাথীনি। ঙসিগী থবকশিং অমসুং ইমুং মনুংগী ৱাফম খঙনবা মাইক অদু নম্লগা ৱারী শাবীযু।`;
  } else if (lang === 'brx') {
    text = `खुलुमबाय ${name}! आं नोंथांनि साथी। दिनैनि हाबा एबा न'खरनि खोथा मिथिनो थाखाय माइक थुनानै खोथा बुंनो हागोन।`;
  }

  return {
    id: 'msg-init-' + Date.now(),
    sender: 'assistant',
    text,
    timestamp: 'Just now',
    actions: [
      { label: 'What is my plan today?', actionType: 'view_reminders' }
    ]
  };
}

function getLanguageChangeNotice(lang: LanguageCode, name: string): string {
  switch (lang) {
    case 'as':
    case 'regional':
      return `ভাষা সলনি কৰা হ'ল: এতিয়া মই অসমীয়াত আপোনাৰ সৈতে কথা পাতিম, ${name} ডাঙৰীয়া। মাইক্ৰ'ফোন বুটামত টিপি কথা পাতক।`;
    case 'bn':
      return `ভাষা পরিবর্তন করা হয়েছে: এখন আমি বাংলায় আপনার সাথে কথা বলব, ${name} দেবী। মাইক চেপে কথা বলুন।`;
    case 'hi':
      return `भाषा बदल दी गई है: अब मैं आपसे हिन्दी में बात करूँगा, ${name} जी। माइक दबाकर बोलिए।`;
    case 'ne':
      return `भाषा परिवर्तन भयो: अब म तपाईंसँग नेपालीमा कुरा गर्नेछु, ${name} जी। माइक थिचेर बोल्नुहोस्।`;
    case 'mni':
      return `লোন হোংদোক্লে: ঐহাক্না হৌজিক মণিপুরীদা অদোমগা ৱারী শাগনি, ${name}। মাইক অদু নম্লগা ৱারী শাবীযু।`;
    case 'brx':
      return `राव सोलायबाय: आं दा बर' रावजों नोंथांजों खोथा बुंगोन, ${name}। माइक थुनानै बुं।`;
    case 'en':
    default:
      return `Voice language updated: I will now speak with you in English, ${name}. Tap the microphone to talk with me.`;
  }
}

function getVoiceInputPlaceholder(lang: LanguageCode): string {
  switch (lang) {
    case 'as':
    case 'regional':
      return 'সাৰথিক কিবা কওক বা লিখক...';
    case 'bn':
      return 'সাৰ্থীকে কিছু বলুন বা লিখুন...';
    case 'hi':
      return 'साथी से बोलिए या प्रश्न यहाँ लिखिए...';
    case 'ne':
      return 'साथीलाई बोल्नुहोस् वा यहाँ प्रश्न लेख्नुहोस्...';
    case 'mni':
      return 'সাথীদা ৱারী শাবীযু নত্রগা ইবীযু...';
    case 'brx':
      return 'साथीजों रायलाय एबा लिर...';
    case 'en':
    default:
      return 'Or type a question for Saathi here...';
  }
}

function getPromptChips(lang: LanguageCode, name: string) {
  if (lang === 'as' || lang === 'regional') {
    return [
      { icon: '🌅', label: 'আজিৰ পৰিকল্পনা', text: 'আজি মোৰ কি কি কাম আছে?' },
      { icon: '💊', label: 'ঔষধ ললোনে?', text: 'মই পুৱাৰ ঔষধ ললোনে নাই?' },
      { icon: '🌸', label: 'মনত পৰা নাই', text: 'মই অলপ পাহৰিছো, মোক সহায় কৰক।' },
      { icon: '👨‍👩‍👧', label: 'পৰিয়ালৰ কথা', text: 'মোৰ পৰিয়ালৰ কথা কওক।' },
      { icon: '☕', label: 'মনৰ সাধু', text: 'মোক এটা সুন্দৰ সাধু শুনাওক।' }
    ];
  }

  if (lang === 'bn') {
    return [
      { icon: '🌅', label: 'আজকের পরিকল্পনা', text: 'আজকে আমার কী কী কাজ আছে?' },
      { icon: '💊', label: 'ওষুধ খেয়েছি?', text: 'আমি কি সকালের ওষুধ খেয়েছি?' },
      { icon: '🌸', label: 'একটু বিভ্রান্ত লাগছে', text: 'আমার একটু মন খারাপ লাগছে।' },
      { icon: '👨‍👩‍👧', label: 'পরিবারের কথা', text: 'আমার পরিবারের কথা বলুন।' },
      { icon: '☕', label: 'একটি গল্প', text: 'আমাকে একটি মিষ্টি গল্প বলুন।' }
    ];
  }

  if (lang === 'hi') {
    return [
      { icon: '🌅', label: 'आज की दिनचर्या', text: 'आज मेरी क्या योजना है?' },
      { icon: '💊', label: 'दवाई ली क्या?', text: 'क्या मैंने आज की दवाई ले ली है?' },
      { icon: '🌸', label: 'घबराहट लग रही है', text: 'मुझे थोड़ी घबराहट हो रही है।' },
      { icon: '👨‍👩‍👧', label: 'परिवार की बातें', text: 'मुझे मेरे परिवार के बारे में बताइए।' },
      { icon: '☕', label: 'कोई कहानी', text: 'मुझे एक प्यारी सी कहानी सुनाइए।' }
    ];
  }

  if (lang === 'ne') {
    return [
      { icon: '🌅', label: 'आजको दिनचर्या', text: 'आज मेरो के के काम छ?' },
      { icon: '💊', label: 'औषधि लिएँ?', text: 'के मैले आजको औषधि लिएँ?' },
      { icon: '🌸', label: 'सम्झना भएन', text: 'मलाई अलि अन्योल भएको छ, सम्झाउनुहोस्।' },
      { icon: '👨‍👩‍👧', label: 'परिवारको कुरा', text: 'मेरो परिवारको बारेमा भन्नुहोस्।' },
      { icon: '☕', label: 'मिठो कथा', text: 'मलाई एउटा शान्त कथा सुनाउनुहोस्।' }
    ];
  }

  if (lang === 'mni') {
    return [
      { icon: '🌅', label: 'ঙসিগী থৌরম', text: 'ঙসি ঐগী করি করি থবক লৈরি?' },
      { icon: '💊', label: 'হিদাক চারেবরা?', text: 'ঙসিগী হিদাক চারেবরা?' },
      { icon: '🌸', label: 'নিংশিংবা ঙমদ্রে', text: 'ঐবু নিংশিংহনবীবা ঙমগদরা?' },
      { icon: '👨‍👩‍👧', label: 'ইমুংগী ৱারী', text: 'ঐগী ইমুং মনুংগী ৱারী পীবীয়ু।' },
      { icon: '☕', label: 'ৱারী অমা', text: 'নুংঙাইবা ৱারী অমা তারকউ।' }
    ];
  }

  if (lang === 'brx') {
    return [
      { icon: '🌅', label: 'दिनैनि हाबा', text: 'दिनै आंहा मा मा हाबा दं?' },
      { icon: '💊', label: 'मुलि लोंबायना?', text: 'आं दिनैनि मुलिखौ लोंबायना?' },
      { icon: '🌸', label: 'गोसोआव गैया', text: 'आंनो एसे हेफाजाब होनांगौ।' },
      { icon: '👨‍👩‍👧', label: 'न\'खरनि खोथा', text: 'आंनि न\'खरनि खोथा बुं।' },
      { icon: '☕', label: 'सल\' मोनसे', text: 'आंनो मोनसे मोजां सल\' खोनथा।' }
    ];
  }

  return [
    { icon: '🌅', label: 'Today\'s Plan', text: 'What is my plan for today?' },
    { icon: '💊', label: 'Did I take meds?', text: 'Have I taken my medicine today?' },
    { icon: '🌸', label: 'I feel confused', text: 'I feel a little confused right now.' },
    { icon: '👨‍👩‍👧', label: 'My Family', text: 'Tell me about my family and loved ones.' },
    { icon: '🧠', label: 'Brain Exercise', text: 'What game should I play today?' },
    { icon: '🍵', label: 'Tell me a story', text: 'Tell me a gentle story to relax.' }
  ];
}
