import React from 'react';
import { GameSession, AdaptiveDecision, LanguageCode } from '../../models/types';
import { getStrings } from '../../locales';
import { 
  CheckCircle2, 
  ArrowRight, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Clock, 
  Target, 
  ShieldCheck, 
  WifiOff,
  Cpu 
} from 'lucide-react';

interface SessionResultModalProps {
  session: GameSession;
  decision?: AdaptiveDecision;
  language: LanguageCode;
  onContinue: () => void;
  onReturnHome: () => void;
}

export const SessionResultModal: React.FC<SessionResultModalProps> = ({
  session,
  decision,
  language,
  onContinue,
  onReturnHome
}) => {
  const strings = getStrings(language);

  const getDecisionBadge = () => {
    if (!decision) return null;
    if (decision.decision === 'increase') {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          background: 'var(--color-success-soft)',
          color: 'var(--color-success)',
          border: '1px solid var(--color-success-border)',
          borderRadius: 'var(--radius-md)',
          fontWeight: 700,
          fontSize: '18px'
        }}>
          <TrendingUp size={22} />
          <span>Difficulty Adjusted: Level {decision.previousLevel} → Level {decision.newLevel}</span>
        </div>
      );
    } else if (decision.decision === 'decrease') {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          background: 'var(--color-warning-soft)',
          color: 'var(--color-warning)',
          border: '1px solid var(--color-warning-border)',
          borderRadius: 'var(--radius-md)',
          fontWeight: 700,
          fontSize: '18px'
        }}>
          <TrendingDown size={22} />
          <span>Difficulty Adjusted: Level {decision.previousLevel} → Level {decision.newLevel}</span>
        </div>
      );
    } else {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          background: 'var(--color-navy-soft)',
          color: 'var(--color-navy)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          fontWeight: 700,
          fontSize: '18px'
        }}>
          <Minus size={22} />
          <span>Level Maintained at Level {decision.newLevel}</span>
        </div>
      );
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(10, 28, 51, 0.65)',
      backdropFilter: 'blur(2px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      zIndex: 1000,
      animation: 'fadeIn 0.2s ease'
    }}>
      <div style={{
        background: 'var(--color-bg-surface)',
        borderRadius: 'var(--radius-lg)',
        maxWidth: '560px',
        width: '100%',
        padding: '32px 28px',
        boxShadow: 'var(--shadow-modal)',
        border: '1px solid var(--color-border)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--color-success-soft)',
            color: 'var(--color-success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <CheckCircle2 size={40} />
          </div>
          <h2 style={{ fontSize: 'var(--text-elderly-hero)', color: 'var(--color-navy)', marginBottom: '6px' }}>
            {strings.sessionComplete}
          </h2>
          <p style={{ fontSize: 'var(--text-elderly-instruction)', color: 'var(--color-text-secondary)' }}>
            {strings.wellDone}
          </p>
        </div>

        {/* Metrics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
          gap: '10px',
          marginBottom: '24px'
        }}>
          <div style={{
            background: 'var(--color-bg-subtle)',
            padding: '16px 12px',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
            border: '1px solid var(--color-border-subtle)'
          }}>
            <Target size={22} style={{ color: 'var(--color-teal)', marginBottom: '6px' }} />
            <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', fontWeight: 600 }}>{strings.accuracy}</div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-navy)' }}>{session.accuracy}%</div>
          </div>

          <div style={{
            background: 'var(--color-bg-subtle)',
            padding: '16px 12px',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
            border: '1px solid var(--color-border-subtle)'
          }}>
            <Clock size={22} style={{ color: 'var(--color-teal)', marginBottom: '6px' }} />
            <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', fontWeight: 600 }}>{strings.responseTime}</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-navy)' }}>
              {(session.responseTimeMs / 1000).toFixed(1)}s
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-teal-dark)', fontWeight: 600 }}>
              {session.responseSpeedRating}
            </div>
          </div>

          <div style={{
            background: 'var(--color-bg-subtle)',
            padding: '16px 12px',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
            border: '1px solid var(--color-border-subtle)'
          }}>
            <ShieldCheck size={22} style={{ color: 'var(--color-teal)', marginBottom: '6px' }} />
            <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', fontWeight: 600 }}>{strings.completion}</div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-navy)' }}>{session.completionRate}%</div>
          </div>
        </div>

        {/* Adaptive Adjustment Callout */}
        {decision && (
          <div style={{
            background: 'var(--color-bg-patient)',
            border: '1.5px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '18px 20px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
              {getDecisionBadge()}
            </div>
            <p style={{
              fontSize: '16px',
              lineHeight: 1.5,
              color: 'var(--color-text-secondary)',
              textAlign: 'center'
            }}>
              {decision.reason}
            </p>

            {decision.mlRecommendation && (
              <div style={{
                marginTop: '12px',
                paddingTop: '10px',
                borderTop: '1px dashed var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--color-teal)'
              }}>
                <Cpu size={16} />
                <span>AI Recommendation: {decision.mlRecommendation.recommendation} ({decision.mlRecommendation.confidence}% confidence)</span>
              </div>
            )}
          </div>
        )}

        {/* Offline notice if session stored locally */}
        {session.syncStatus === 'pending' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            background: 'var(--color-warning-soft)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '14px',
            color: 'var(--color-warning)',
            marginBottom: '24px',
            border: '1px solid var(--color-warning-border)'
          }}>
            <WifiOff size={18} />
            <span>Saved locally on device. Will synchronize when online.</span>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={onContinue}
            className="btn btn-primary btn-large-elderly"
            style={{ width: '100%' }}
          >
            <span>{strings.nextActivity}</span>
            <ArrowRight size={22} />
          </button>
          
          <button
            onClick={onReturnHome}
            className="btn btn-subtle"
            style={{ width: '100%', fontSize: '17px', minHeight: '48px' }}
          >
            {strings.returnHome}
          </button>
        </div>

        {/* Healthcare Disclaimer */}
        <p style={{
          marginTop: '20px',
          textAlign: 'center',
          fontSize: '12px',
          color: 'var(--color-text-muted)'
        }}>
          {strings.disclaimer}
        </p>
      </div>
    </div>
  );
};
