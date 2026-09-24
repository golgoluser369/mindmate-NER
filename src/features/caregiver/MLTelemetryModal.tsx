import React, { useState, useEffect } from 'react';
import { 
  X, 
  Cpu, 
  Activity, 
  Brain, 
  CheckCircle2, 
  Server, 
  Wifi, 
  AlertCircle,
  BarChart3,
  TrendingUp,
  RefreshCw,
  Info
} from 'lucide-react';
import { 
  MLPredictionResult, 
  MLTelemetryFeatures, 
  MLRecommendationCode,
  GameSession 
} from '../../models/types';
import { 
  extractMLFeatures, 
  getMLPersonalizationRecommendation,
  ML_RECOMMENDATIONS,
  FEATURE_IMPORTANCE 
} from '../../services/mlPersonalizationService';
import { offlineService } from '../../services/offlineService';

interface MLTelemetryModalProps {
  isOpen: boolean;
  onClose: () => void;
  latestSession?: GameSession | null;
  patientId?: string;
}

export const MLTelemetryModal: React.FC<MLTelemetryModalProps> = ({ 
  isOpen, 
  onClose, 
  latestSession,
  patientId 
}) => {
  const [prediction, setPrediction] = useState<MLPredictionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);

  const checkApiHealth = async () => {
    try {
      const res = await fetch('http://localhost:8000/health', { method: 'GET', signal: AbortSignal.timeout(600) });
      if (res.ok) {
        setApiOnline(true);
      } else {
        setApiOnline(false);
      }
    } catch {
      setApiOnline(false);
    }
  };

  const runInference = async () => {
    setLoading(true);
    await checkApiHealth();
    
    const recent = offlineService.getSessions(patientId);
    const active = latestSession || recent[0];
    const patient = offlineService.getPatient(patientId);

    const inputFeatures = extractMLFeatures({
      accuracy: active ? active.accuracy : 82,
      responseTimeMs: active ? active.responseTimeMs : 2400,
      attempts: active ? active.attempts : 1,
      completionRate: active ? active.completionRate : 100,
      currentLevel: active ? active.difficultyLevel : (patient.currentLevel || 2),
      activityId: active ? active.activityId : 'memory_match',
      recentSessions: recent
    });

    const result = await getMLPersonalizationRecommendation(
      {
        accuracy: inputFeatures.accuracy * 100,
        responseTimeMs: inputFeatures.response_time * 1000,
        attempts: inputFeatures.attempts,
        completionRate: inputFeatures.completion * 100,
        hintUsage: inputFeatures.hint_usage,
        currentLevel: inputFeatures.difficulty,
        recentSessions: recent
      }
    );

    setPrediction(result);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      runInference();
    }
  }, [isOpen, latestSession, patientId]);

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{ 
          maxWidth: '860px', 
          width: '100%', 
          maxHeight: '90vh', 
          overflowY: 'auto',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          border: '1px solid #CBD5E1',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '20px 24px', 
          borderBottom: '1px solid #E2E8F0',
          backgroundColor: '#F8FAFC',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              background: '#0F766E', 
              padding: '10px', 
              borderRadius: '10px', 
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Cpu size={26} strokeWidth={2} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                  Mind Mate AI Personalization Engine
                </h2>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: '#E0F2FE',
                  color: '#0369A1',
                  padding: '2px 8px',
                  borderRadius: '12px'
                }}>
                  v2.0 RF
                </span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#475569', fontWeight: 500 }}>
                Random Forest Telemetry Classifier • 12 Features • 5 Adaptive Recommendation Classes
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              minWidth: '38px', 
              minHeight: '38px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.15s'
            }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Engine Status Banner */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '12px 16px', 
            background: prediction?.source === 'live_python_api' ? '#F0FDF4' : '#F0FDFA',
            borderRadius: '10px',
            border: prediction?.source === 'live_python_api' ? '1px solid #86EFAC' : '1px solid #99F6E4'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {prediction?.source === 'live_python_api' ? (
                <>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#16A34A' }} />
                  <Server size={22} color="#15803D" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.94rem', color: '#166534' }}>
                      Live Python REST Microservice Connected
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#14532D' }}>
                      Evaluating via Scikit-Learn service at <code>http://localhost:8000/predict</code>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0D9488' }} />
                  <Wifi size={22} color="#0F766E" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.94rem', color: '#115E59' }}>
                      Offline-First In-Browser ML Model Active
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#134E4A' }}>
                      High-fidelity client-side tree policy running locally with zero latency and 100% offline resilience
                    </div>
                  </div>
                </>
              )}
            </div>
            <button 
              onClick={runInference} 
              disabled={loading}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                padding: '7px 14px', 
                background: '#FFFFFF', 
                border: '1px solid #94A3B8', 
                borderRadius: '8px',
                fontSize: '0.84rem',
                fontWeight: 700,
                color: '#1E293B',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
            >
              <RefreshCw size={14} className={loading ? 'spinning' : ''} />
              {loading ? 'Evaluating...' : 'Re-run Inference'}
            </button>
          </div>

          {/* Prediction Summary Card */}
          {prediction && (
            <div style={{ 
              background: '#FFFFFF', 
              border: '2px solid #0D9488', 
              borderRadius: '14px', 
              padding: '20px', 
              boxShadow: '0 4px 12px rgba(13, 148, 136, 0.08)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <span style={{ 
                    display: 'inline-block', 
                    fontSize: '0.75rem', 
                    fontWeight: 800, 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.06em', 
                    color: '#0F766E',
                    background: '#CCFBF1',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    marginBottom: '6px'
                  }}>
                    Recommended Action
                  </span>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: '#0F172A', letterSpacing: '-0.02em' }}>
                    {prediction.recommendation}
                  </h3>
                </div>
                <div style={{ 
                  textAlign: 'right', 
                  backgroundColor: '#F8FAFC', 
                  padding: '8px 16px', 
                  borderRadius: '10px', 
                  border: '1px solid #E2E8F0' 
                }}>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Model Confidence</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F766E' }}>
                    {prediction.confidence}%
                  </div>
                </div>
              </div>

              {/* 5-Class Probability Distribution */}
              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '10px', color: '#1E293B' }}>
                  5-Class Probability Distribution:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {([0, 1, 2, 3, 4] as MLRecommendationCode[]).map(code => {
                    const prob = (prediction.probabilities[code] || 0) * 100;
                    const isTop = code === prediction.predictedClass;
                    return (
                      <div key={code}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '3px' }}>
                          <span style={{ 
                            fontWeight: isTop ? 800 : 600, 
                            color: isTop ? '#0F766E' : '#334155' 
                          }}>
                            {isTop ? '★ ' : ''}{ML_RECOMMENDATIONS[code]}
                          </span>
                          <span style={{ 
                            fontWeight: 800, 
                            color: isTop ? '#0F766E' : '#64748B' 
                          }}>
                            {prob.toFixed(1)}%
                          </span>
                        </div>
                        <div style={{ width: '100%', height: '10px', background: '#F1F5F9', borderRadius: '5px', overflow: 'hidden' }}>
                          <div style={{ 
                            width: `${Math.max(2, prob)}%`, 
                            height: '100%', 
                            background: isTop ? '#0D9488' : '#94A3B8',
                            borderRadius: '5px',
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 12-Feature Telemetry Matrix */}
          {prediction && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h4 style={{ 
                  fontSize: '1.05rem', 
                  fontWeight: 800, 
                  margin: 0, 
                  color: '#0F172A', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px' 
                }}>
                  <Activity size={20} color="#0D9488" />
                  12 Telemetry Input Features (Live Session Vector)
                </h4>
                <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
                  Highlighted = High Feature Weight
                </span>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
                gap: '10px' 
              }}>
                {[
                  { label: 'Accuracy', val: `${(prediction.telemetry.accuracy * 100).toFixed(0)}%`, weight: '18.7%', highlight: true },
                  { label: 'Recent Performance', val: `${(prediction.telemetry.recent_performance * 100).toFixed(0)}%`, weight: '16.3%', highlight: true },
                  { label: 'Fatigue Proxy', val: `${(prediction.telemetry.fatigue_proxy * 100).toFixed(0)}%`, weight: '12.7%', highlight: true },
                  { label: 'Difficulty Level', val: `Level ${prediction.telemetry.difficulty}`, weight: '12.1%', highlight: true },
                  { label: 'Engagement Score', val: `${(prediction.telemetry.engagement_score * 100).toFixed(0)}%`, weight: '10.6%', highlight: false },
                  { label: 'Memory Score', val: `${(prediction.telemetry.memory_score * 100).toFixed(0)}%`, weight: '8.8%', highlight: false },
                  { label: 'Response Time', val: `${prediction.telemetry.response_time}s`, weight: '6.0%', highlight: false },
                  { label: 'Attention Score', val: `${(prediction.telemetry.attention_score * 100).toFixed(0)}%`, weight: '5.5%', highlight: false },
                  { label: 'Completion Rate', val: `${(prediction.telemetry.completion * 100).toFixed(0)}%`, weight: '3.9%', highlight: false },
                  { label: 'Hint Usage', val: `${prediction.telemetry.hint_usage} hints`, weight: '2.9%', highlight: false },
                  { label: 'Game Type Code', val: `Type ${prediction.telemetry.game_type}`, weight: '1.4%', highlight: false },
                  { label: 'Attempts', val: `${prediction.telemetry.attempts}`, weight: '1.1%', highlight: false }
                ].map((feat, idx) => (
                  <div key={idx} style={{ 
                    background: feat.highlight ? '#F0FDFA' : '#FFFFFF', 
                    border: `1.5px solid ${feat.highlight ? '#99F6E4' : '#E2E8F0'}`, 
                    borderRadius: '10px', 
                    padding: '10px 14px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748B', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600 }}>{feat.label}</span>
                      <span style={{ color: '#0F766E', fontWeight: 800 }}>w: {feat.weight}</span>
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                      {feat.val}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dataset & Training Information */}
          <div style={{ 
            background: '#F8FAFC', 
            borderRadius: '12px', 
            padding: '16px 20px', 
            fontSize: '0.86rem', 
            color: '#334155',
            lineHeight: '1.5',
            border: '1px solid #E2E8F0'
          }}>
            <div style={{ fontWeight: 800, color: '#0F172A', marginBottom: '6px', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Info size={16} color="#0F766E" />
              Model Specifications & Training Baseline:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '6px' }}>
              <div>• <strong>Algorithm:</strong> Random Forest Classifier (500 estimators, max_depth=14)</div>
              <div>• <strong>Dataset:</strong> 30,000 synthetic gameplay sessions across 4 categories</div>
              <div>• <strong>Test Accuracy:</strong> 80.78% (Balanced Accuracy: 76.99%, Weighted F1: 0.8040)</div>
              <div>• <strong>Primary Metric:</strong> Accuracy & Recent Performance account for 35% weight</div>
            </div>
            <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #E2E8F0', fontStyle: 'italic', fontSize: '0.8rem', color: '#64748B' }}>
              <strong>Clinical Guardrail Note:</strong> This model is strictly used for activity difficulty pacing and engagement stabilization. It is not an automated medical diagnostic tool.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
