import React from 'react';
import { Cpu, ShieldCheck, Database, Layers, ArrowDown, CheckCircle2 } from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  return (
    <div style={{ maxWidth: 'var(--max-dashboard-width)', margin: '0 auto', padding: '24px 20px 60px' }}>
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-teal)', marginBottom: '4px' }}>
          <Layers size={20} />
          <span style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Technical Documentation & System Design
          </span>
        </div>
        <h1 style={{ fontSize: 'var(--text-cg-title)', fontWeight: 800, color: 'var(--color-navy)' }}>
          Mind Mate Platform Architecture (SIH26003)
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', maxWidth: '780px' }}>
          An offline-first, deterministic adaptive cognitive-care system designed for elderly users and caregivers in connectivity-constrained regions.
        </p>
      </div>

      {/* Visual Layered Architecture Diagram */}
      <div style={{
        background: 'var(--color-bg-surface)',
        borderRadius: 'var(--radius-lg)',
        padding: '32px',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-card)',
        marginBottom: '32px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-navy)', marginBottom: '24px', textAlign: 'center' }}>
          End-to-End System Topology
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '780px', margin: '0 auto' }}>
          {/* Top Tier: Patient & Caregiver Interfaces */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px'
          }}>
            <div style={{
              background: 'var(--color-bg-patient)',
              border: '2px solid var(--color-teal)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-navy)', marginBottom: '4px' }}>
                PATIENT INTERFACE
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                Elderly-first UX • Min 48px targets • Speech API • Multilingual (EN/HI/Regional) • Works 100% Offline
              </p>
            </div>

            <div style={{
              background: 'var(--color-bg-subtle)',
              border: '2px solid var(--color-navy)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-navy)', marginBottom: '4px' }}>
                CAREGIVER PORTAL
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                Longitudinal trends • SVG charts • Explainable adaptation audit • Memory manager • Compliance tracking
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
            <ArrowDown size={28} />
          </div>

          {/* Middle Tier: Local Offline Store & Sync Queue */}
          <div style={{
            background: '#F0FDF4',
            border: '2px solid #86EFAC',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#166534', marginBottom: '4px' }}>
              OFFLINE-FIRST DATA ENGINE (Client Persistent Store)
            </div>
            <p style={{ fontSize: '13px', color: '#15803D' }}>
              IndexedDB / LocalStorage abstraction • Pending Event Queue (`SyncEvent[]`) • Network state monitor • Zero-latency offline operation
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
            <ArrowDown size={28} />
          </div>

          {/* Core Engine: Adaptive Intelligence */}
          <div style={{
            background: 'var(--color-navy-soft)',
            border: '2px solid var(--color-navy)',
            borderRadius: 'var(--radius-md)',
            padding: '24px'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-navy)' }}>
                EXPLAINABLE ADAPTIVE INTELLIGENCE ENGINE
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                Deterministic mathematical scoring with transparent boundary thresholds
              </div>
            </div>

            <div style={{
              background: '#FFFFFF',
              borderRadius: 'var(--radius-sm)',
              padding: '14px 18px',
              fontFamily: 'monospace',
              fontSize: '13px',
              color: 'var(--color-navy)',
              border: '1px solid var(--color-border)',
              marginBottom: '14px'
            }}>
              Score = (0.40 × Acc) + (0.25 × Speed) + (0.15 × Consistency) + (0.10 × Completion) + (0.10 × Trend)
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '10px',
              textAlign: 'center',
              fontSize: '12px'
            }}>
              <div style={{ background: '#FFFFFF', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)' }}>
                <strong>&gt; 0.80</strong><br />
                <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>Increase Difficulty (+1)</span>
              </div>
              <div style={{ background: '#FFFFFF', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)' }}>
                <strong>0.55 – 0.80</strong><br />
                <span style={{ color: 'var(--color-navy)', fontWeight: 700 }}>Maintain Level (0)</span>
              </div>
              <div style={{ background: '#FFFFFF', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)' }}>
                <strong>&lt; 0.55</strong><br />
                <span style={{ color: 'var(--color-warning)', fontWeight: 700 }}>Lower Difficulty (-1)</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
            <ArrowDown size={28} />
          </div>

          {/* Bottom Tier: Future Scalability & ML Roadmap */}
          <div style={{
            background: 'var(--color-bg-surface)',
            border: '2px dashed var(--color-border-strong)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-navy)', marginBottom: '4px' }}>
              FUTURE LONGITUDINAL ML & REGIONAL HEALTHCARE PIPELINE
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              Deterministic Rule MVP → Longitudinal Patient Interaction Dataset → Personalized Transformer/RL Recommender → Clinical Research Cohort Validation
            </p>
          </div>
        </div>
      </div>

      {/* Prototype Validation Evidence Panel */}
      <div style={{
        background: 'var(--color-bg-surface)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-card)'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-navy)', marginBottom: '16px' }}>
          SIH26003 Prototype System Validation Evidence
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'var(--color-bg-subtle)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)', fontWeight: 700, marginBottom: '6px' }}>
              <CheckCircle2 size={18} />
              <span>Adaptive Difficulty Test</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              • High performance profile (87% accuracy, prompt response) triggers Level 2 → Level 3.<br />
              • Struggling session (48% accuracy, high latency) triggers Level 3 → Level 2.<br />
              • Generates instant explainable reasoning for patient and caregiver.
            </p>
          </div>

          <div style={{ background: 'var(--color-bg-subtle)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)', fontWeight: 700, marginBottom: '6px' }}>
              <CheckCircle2 size={18} />
              <span>Offline Persistence Test</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              • Network disabled: activities execute with zero network roundtrip.<br />
              • Scores and reminder status persist to client store and queue.<br />
              • Reconnection triggers atomic batch synchronization.
            </p>
          </div>

          <div style={{ background: 'var(--color-bg-subtle)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)', fontWeight: 700, marginBottom: '6px' }}>
              <CheckCircle2 size={18} />
              <span>Personalization Test</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              • Unlike generic puzzle games, activities dynamically pull from Meera Sharma's family, Tezpur landmarks, and morning tea routine.<br />
              • Caregivers can configure personal memories in real-time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
