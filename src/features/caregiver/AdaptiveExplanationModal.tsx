import React from 'react';
import { AdaptiveDecision } from '../../models/types';
import { X, TrendingUp, TrendingDown, Minus, Info, ShieldAlert, SlidersHorizontal } from 'lucide-react';

interface AdaptiveExplanationModalProps {
  decision: AdaptiveDecision | null;
  onClose: () => void;
}

export const AdaptiveExplanationModal: React.FC<AdaptiveExplanationModalProps> = ({
  decision,
  onClose
}) => {
  if (!decision) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(10, 28, 51, 0.65)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      zIndex: 1100,
      animation: 'fadeIn 0.15s ease'
    }}>
      <div style={{
        background: 'var(--color-bg-surface)',
        borderRadius: 'var(--radius-lg)',
        maxWidth: '640px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '28px',
        boxShadow: 'var(--shadow-modal)',
        border: '1px solid var(--color-border)',
        position: 'relative'
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            padding: '8px',
            borderRadius: 'var(--radius-full)',
            color: 'var(--color-text-muted)',
            background: 'var(--color-bg-subtle)'
          }}
          aria-label="Close modal"
        >
          <X size={20} strokeWidth={1.75} />
        </button>

        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-navy-soft)',
            color: 'var(--color-navy)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <SlidersHorizontal size={22} strokeWidth={1.75} />
          </div>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-navy)' }}>
              Why did Mind Mate adjust the activity?
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
              Explainable cognitive adaptation engine evaluation audit
            </p>
          </div>
        </div>

        {/* Decision Summary Card */}
        <div style={{
          background: 'var(--color-bg-patient)',
          border: '1.5px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '18px 20px',
          margin: '20px 0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {decision.decision === 'increase' && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--color-success-soft)',
                  color: 'var(--color-success)',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 700,
                  fontSize: '14px'
                }}>
                  <TrendingUp size={18} />
                  <span>Level {decision.previousLevel} → Level {decision.newLevel}</span>
                </div>
              )}
              {decision.decision === 'decrease' && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--color-warning-soft)',
                  color: 'var(--color-warning)',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 700,
                  fontSize: '14px'
                }}>
                  <TrendingDown size={18} />
                  <span>Level {decision.previousLevel} → Level {decision.newLevel}</span>
                </div>
              )}
              {decision.decision === 'maintain' && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--color-navy-soft)',
                  color: 'var(--color-navy)',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 700,
                  fontSize: '14px'
                }}>
                  <Minus size={18} />
                  <span>Maintained at Level {decision.newLevel}</span>
                </div>
              )}
            </div>

            <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-navy)' }}>
              Composite Score: {decision.performanceScore.toFixed(2)} / 1.00
            </div>
          </div>

          <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            <strong>System Decision Rationale:</strong> {decision.reason}
          </p>
        </div>

        {/* Component Breakdown Table */}
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-navy)', marginBottom: '10px' }}>
          Component Weighting & Normalization
        </h3>

        <div style={{
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          marginBottom: '20px'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg-subtle)', textAlign: 'left' }}>
                <th style={{ padding: '10px 14px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Signal Component</th>
                <th style={{ padding: '10px 14px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Weight</th>
                <th style={{ padding: '10px 14px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Normalized Value</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                <td style={{ padding: '10px 14px', fontWeight: 600 }}>Accuracy Score</td>
                <td style={{ padding: '10px 14px' }}>40%</td>
                <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--color-navy)' }}>
                  {(decision.metrics.accuracy / 100).toFixed(2)} ({decision.metrics.accuracy}%)
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                <td style={{ padding: '10px 14px', fontWeight: 600 }}>Response Speed Rating</td>
                <td style={{ padding: '10px 14px' }}>25%</td>
                <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--color-navy)' }}>
                  {decision.metrics.responseSpeedNorm.toFixed(2)}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                <td style={{ padding: '10px 14px', fontWeight: 600 }}>Session Consistency</td>
                <td style={{ padding: '10px 14px' }}>15%</td>
                <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--color-navy)' }}>
                  {decision.metrics.consistency.toFixed(2)}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                <td style={{ padding: '10px 14px', fontWeight: 600 }}>Activity Completion</td>
                <td style={{ padding: '10px 14px' }}>10%</td>
                <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--color-navy)' }}>
                  {decision.metrics.completion.toFixed(2)} (100%)
                </td>
              </tr>
              <tr>
                <td style={{ padding: '10px 14px', fontWeight: 600 }}>Recent 3-Session Trend</td>
                <td style={{ padding: '10px 14px' }}>10%</td>
                <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--color-navy)' }}>
                  {decision.metrics.recentTrend.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Deterministic Threshold Rules */}
        <div style={{
          background: 'var(--color-bg-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          marginBottom: '20px',
          fontSize: '13px',
          color: 'var(--color-text-secondary)'
        }}>
          <div style={{ fontWeight: 700, color: 'var(--color-navy)', marginBottom: '6px' }}>
            Decision Threshold Boundary Logic:
          </div>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <li><strong>Score &gt; 0.80:</strong> Increase difficulty to stimulate engagement and prevent boredom.</li>
            <li><strong>Score 0.55 – 0.80:</strong> Maintain current difficulty level for stability and reinforcement.</li>
            <li><strong>Score &lt; 0.55:</strong> Lower difficulty to prevent cognitive frustration and support positive retention.</li>
          </ul>
        </div>

        {/* Strict Medical Disclaimer Notice */}
        <div style={{
          display: 'flex',
          gap: '10px',
          background: '#FFFBEB',
          border: '1px solid #FDE68A',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          fontSize: '13px',
          color: '#92400E'
        }}>
          <ShieldAlert size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Healthcare Integrity Assurance:</strong> {decision.clinicalDisclaimer} Mind Mate does not diagnose dementia, compute medical severity, or replace licensed geriatric assessment.
          </div>
        </div>

        <button
          onClick={onClose}
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '20px' }}
        >
          Close Explanation
        </button>
      </div>
    </div>
  );
};
