import React from 'react';
import { Bot, Sparkles, MessageCircle } from 'lucide-react';
import { LanguageCode } from '../../models/types';
import { getStrings } from '../../locales';

interface FloatingCompanionButtonProps {
  onClick: () => void;
  language: LanguageCode;
  isActive?: boolean;
}

export const FloatingCompanionButton: React.FC<FloatingCompanionButtonProps> = ({
  onClick,
  language,
  isActive = false
}) => {
  const getBadgeText = (lang: LanguageCode) => {
    switch (lang) {
      case 'as':
      case 'regional':
        return 'সাৰথিৰ সৈতে কথা পাতক';
      case 'bn':
        return 'সাথীর সাথে কথা বলুন';
      case 'hi':
        return 'साथी से बात करें';
      case 'ne':
        return 'साथीसँग कुरा गर्नुहोस्';
      default:
        return 'Talk with Saathi';
    }
  };

  if (isActive) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '84px',
      right: '20px',
      zIndex: 990,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      animation: 'fadeIn 0.3s ease'
    }}>
      {/* Friendly Speech Bubble / Tooltip */}
      <div 
        onClick={onClick}
        style={{
          background: 'var(--color-navy)',
          color: '#FFFFFF',
          padding: '8px 14px',
          borderRadius: 'var(--radius-full)',
          fontSize: '13px',
          fontWeight: 700,
          boxShadow: 'var(--shadow-md)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          border: '1.5px solid var(--color-teal)'
        }}
        className="hide-mobile-tooltip"
      >
        <Sparkles size={14} style={{ color: '#4FD1C5' }} />
        <span>{getBadgeText(language)}</span>
      </div>

      {/* Floating Action Circle Button */}
      <button
        onClick={onClick}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--color-teal) 0%, var(--color-navy) 100%)',
          color: '#FFFFFF',
          border: '2px solid #FFFFFF',
          boxShadow: '0 6px 16px rgba(10, 28, 51, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative'
        }}
        title="Open Conversational Companion"
      >
        <Bot size={28} />
        {/* Soft green online pulse ring */}
        <span style={{
          position: 'absolute',
          top: '2px',
          right: '2px',
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: 'var(--color-success)',
          border: '2px solid #FFFFFF'
        }} />
      </button>
    </div>
  );
};
