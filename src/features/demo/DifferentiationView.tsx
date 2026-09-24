import React from 'react';
import { Check, X, ShieldCheck, Heart, Globe, Layers } from 'lucide-react';

export const DifferentiationView: React.FC = () => {
  const comparisonItems = [
    {
      feature: 'Activity Difficulty',
      generic: 'Fixed or manually selected levels',
      mindMate: 'Dual Adaptive Engine: Deterministic clinical rule baseline + Random Forest V2 ML model (80.8% accuracy)'
    },
    {
      feature: 'Content Relevance',
      generic: 'Generic stock shapes, animals, and random numbers',
      mindMate: 'Personalized memory items (daughter Ananya, Tezpur tea cup, courtyard garden, actual morning routine)'
    },
    {
      feature: 'Adaptive Intelligence',
      generic: 'Black-box AI with mysterious decisions',
      mindMate: 'Fully explainable, clinically-disclaimed dual intelligence (transparent formula weights + 12-feature ML telemetry inspector)'
    },
    {
      feature: 'Connectivity Dependence',
      generic: 'Breaks or freezes without constant cloud connection',
      mindMate: 'Offline-First architecture with local IndexedDB queue and background synchronization'
    },
    {
      feature: 'Regional Inclusion',
      generic: 'English-only or rudimentary Hindi',
      mindMate: 'Digital India Bhashini integration covering all 8 North Eastern states + regional languages (Assamese, Bodo, Manipuri, Bengali, Mizo, Karbi, etc.)'
    },
    {
      feature: 'Target Audience Fit',
      generic: 'Dense gamified mobile screens with small buttons and confusing micro-interactions',
      mindMate: 'Elderly-first design system (56px+ targets, 22px body text, high-contrast, zero timer anxiety)'
    },
    {
      feature: 'Caregiver Connection',
      generic: 'Isolated single-player mobile game',
      mindMate: 'Dual-surface loop connecting elderly engagement with caregiver longitudinal trends & reminder management'
    }
  ];

  return (
    <div style={{ maxWidth: 'var(--max-dashboard-width)', margin: '0 auto', padding: '32px 20px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--color-teal-soft)',
          color: 'var(--color-teal-dark)',
          padding: '6px 14px',
          borderRadius: 'var(--radius-full)',
          fontSize: '13px',
          fontWeight: 700,
          marginBottom: '12px'
        }}>
          <ShieldCheck size={16} strokeWidth={1.75} />
          <span>Product Positioning & Architecture Differentiation</span>
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-navy)', marginBottom: '10px' }}>
          Why Mind Mate?
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
          “The game is not the product. The adaptive cognitive-care loop is the product.”
        </p>
      </div>

      {/* Comparison Table */}
      <div style={{
        background: 'var(--color-bg-surface)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-card)',
        marginBottom: '32px',
        overflowX: 'auto'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
              <th style={{ textAlign: 'left', padding: '14px 16px', color: 'var(--color-navy)', fontSize: '16px', width: '22%' }}>
                Capability
              </th>
              <th style={{ textAlign: 'left', padding: '14px 16px', color: '#9B2C2C', fontSize: '16px', width: '38%' }}>
                Generic Dementia Games
              </th>
              <th style={{ textAlign: 'left', padding: '14px 16px', color: 'var(--color-teal)', fontSize: '16px', width: '40%' }}>
                Mind Mate Cognitive-Care Platform
              </th>
            </tr>
          </thead>
          <tbody>
            {comparisonItems.map((item, idx) => (
              <tr key={idx} style={{
                borderBottom: '1px solid var(--color-border-subtle)',
                background: idx % 2 === 0 ? 'transparent' : 'var(--color-bg-subtle)'
              }}>
                <td style={{ padding: '16px', fontWeight: 700, color: 'var(--color-navy)', fontSize: '14px' }}>
                  {item.feature}
                </td>
                <td style={{ padding: '16px', color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: 1.4 }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <X size={18} style={{ color: '#E53E3E', flexShrink: 0, marginTop: '2px' }} />
                    <span>{item.generic}</span>
                  </div>
                </td>
                <td style={{ padding: '16px', color: 'var(--color-text-primary)', fontSize: '14px', lineHeight: 1.4, fontWeight: 600 }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <Check size={18} style={{ color: 'var(--color-teal)', flexShrink: 0, marginTop: '2px' }} />
                    <span>{item.mindMate}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Core Loop Architecture */}
      <div style={{
        background: 'var(--color-navy-soft)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px',
        border: '1.5px solid var(--color-navy-light)',
        textAlign: 'center'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-navy)', marginBottom: '8px' }}>
          The Mind Mate Continuous Care Loop
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
          How patient interaction continuously informs care and adaptation
        </p>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          fontSize: '14px',
          fontWeight: 800,
          color: 'var(--color-navy)'
        }}>
          <span style={{ background: '#FFFFFF', padding: '8px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>OBSERVE</span>
          <span>→</span>
          <span style={{ background: '#FFFFFF', padding: '8px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>ENGAGE</span>
          <span>→</span>
          <span style={{ background: '#FFFFFF', padding: '8px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>MEASURE</span>
          <span>→</span>
          <span style={{ background: '#FFFFFF', padding: '8px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>ADAPT</span>
          <span>→</span>
          <span style={{ background: '#FFFFFF', padding: '8px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>PERSONALIZE</span>
          <span>→</span>
          <span style={{ background: '#FFFFFF', padding: '8px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>ASSIST</span>
          <span>→</span>
          <span style={{ background: '#FFFFFF', padding: '8px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>INFORM CAREGIVER</span>
        </div>
      </div>
    </div>
  );
};
