import React, { useState } from 'react';
import { GameSession } from '../../models/types';

interface CognitiveTrendChartProps {
  sessions: GameSession[];
}

type ChartMetric = 'accuracy' | 'responseTime' | 'completion' | 'consistency';

export const CognitiveTrendChart: React.FC<CognitiveTrendChartProps> = ({ sessions }) => {
  const [activeMetric, setActiveMetric] = useState<ChartMetric>('accuracy');

  // Chronological order (oldest to newest for graphing)
  const sortedSessions = [...sessions].reverse();

  const getMetricValue = (s: GameSession, metric: ChartMetric): number => {
    switch (metric) {
      case 'accuracy': return s.accuracy;
      case 'responseTime': return Number((s.responseTimeMs / 1000).toFixed(1));
      case 'completion': return s.completionRate;
      case 'consistency': return Math.round(s.consistencyScore * 100);
    }
  };

  const getMetricLabel = (metric: ChartMetric): string => {
    switch (metric) {
      case 'accuracy': return 'Accuracy (%)';
      case 'responseTime': return 'Response Latency (sec)';
      case 'completion': return 'Completion Rate (%)';
      case 'consistency': return 'Consistency Score (%)';
    }
  };

  const getYDomain = (metric: ChartMetric): [number, number] => {
    if (metric === 'responseTime') return [0, 6];
    return [40, 100];
  };

  const [minY, maxY] = getYDomain(activeMetric);

  // SVG dimensions
  const width = 680;
  const height = 240;
  const padding = { top: 20, right: 30, bottom: 40, left: 50 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  const points = sortedSessions.map((s, idx) => {
    const val = getMetricValue(s, activeMetric);
    const x = padding.left + (idx / Math.max(1, sortedSessions.length - 1)) * graphWidth;
    const yRatio = (val - minY) / (maxY - minY);
    const y = padding.top + (1 - Math.max(0, Math.min(1, yRatio))) * graphHeight;
    return { x, y, val, session: s };
  });

  const pathD = points.length > 0
    ? points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '')
    : '';

  // Area fill path
  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${padding.top + graphHeight} L ${points[0].x} ${padding.top + graphHeight} Z`
    : '';

  return (
    <div style={{
      background: 'var(--color-bg-surface)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-card)'
    }}>
      {/* Header & Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-navy)' }}>
            Cognitive Activity Performance Trends
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
            Multi-session longitudinal tracking over recent activities
          </p>
        </div>

        {/* Metric Selector Tabs */}
        <div style={{
          display: 'inline-flex',
          background: 'var(--color-bg-subtle)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          gap: '4px'
        }}>
          {(['accuracy', 'responseTime', 'completion', 'consistency'] as ChartMetric[]).map(m => {
            const isSelected = activeMetric === m;
            let tabLabel = 'Accuracy';
            if (m === 'responseTime') tabLabel = 'Speed';
            if (m === 'completion') tabLabel = 'Completion';
            if (m === 'consistency') tabLabel = 'Consistency';

            return (
              <button
                key={m}
                onClick={() => setActiveMetric(m)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  fontWeight: 700,
                  background: isSelected ? '#FFFFFF' : 'transparent',
                  color: isSelected ? 'var(--color-navy)' : 'var(--color-text-secondary)',
                  boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                  border: isSelected ? '1px solid var(--color-border-subtle)' : '1px solid transparent',
                  cursor: 'pointer'
                }}
              >
                {tabLabel}
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Chart Container */}
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', minWidth: '500px' }}>
          {/* Background Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = padding.top + ratio * graphHeight;
            const labelVal = Math.round(maxY - ratio * (maxY - minY));
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="var(--color-border-subtle)"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  fontSize="11"
                  fill="var(--color-text-muted)"
                  textAnchor="end"
                  fontFamily="sans-serif"
                >
                  {labelVal}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path
            d={areaD}
            fill="var(--color-teal-soft)"
            opacity={0.6}
          />

          {/* Line Path */}
          <path
            d={pathD}
            fill="none"
            stroke="var(--color-teal)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((pt, idx) => (
            <g key={idx}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r="5"
                fill="#FFFFFF"
                stroke="var(--color-teal)"
                strokeWidth="2.5"
              />
              {/* X-axis labels */}
              <text
                x={pt.x}
                y={padding.top + graphHeight + 20}
                fontSize="11"
                fill="var(--color-text-muted)"
                textAnchor="middle"
                fontFamily="sans-serif"
              >
                {pt.session.activityTitle.split(' ')[0]}
              </text>
              <text
                x={pt.x}
                y={padding.top + graphHeight + 34}
                fontSize="9"
                fill="var(--color-text-muted)"
                textAnchor="middle"
                fontFamily="sans-serif"
              >
                L{pt.session.difficultyLevel}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '12px',
        fontSize: '12px',
        color: 'var(--color-text-muted)',
        borderTop: '1px solid var(--color-border-subtle)',
        paddingTop: '8px'
      }}>
        <span>Metric: <strong>{getMetricLabel(activeMetric)}</strong></span>
        <span>Showing last {sortedSessions.length} sessions (oldest → newest)</span>
      </div>
    </div>
  );
};
