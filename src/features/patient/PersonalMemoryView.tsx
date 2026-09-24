import React, { useState } from 'react';
import { LanguageCode, PersonalMemoryItem, MemoryCategory } from '../../models/types';
import { getStrings } from '../../locales';
import { offlineService } from '../../services/offlineService';
import { voiceService } from '../../services/voiceService';
import { Volume2, Users, MapPin, Coffee, CalendarCheck } from 'lucide-react';

import { getLocalizedMemoryItem } from '../../services/localizationHelper';
import { RealLifeImage } from '../../services/realLifeAssets';

interface PersonalMemoryViewProps {
  language: LanguageCode;
}

export const PersonalMemoryView: React.FC<PersonalMemoryViewProps> = ({ language }) => {
  const strings = getStrings(language);
  const patient = offlineService.getPatient();
  const memories = offlineService.getMemories();
  const [activeTab, setActiveTab] = useState<MemoryCategory>('person');

  const filteredMemories = memories.filter(m => m.category === activeTab);

  const handleListen = (item: PersonalMemoryItem) => {
    const loc = getLocalizedMemoryItem(item, language);
    const text = `${loc.name}. ${loc.relationshipOrDetail}. ${loc.description}`;
    voiceService.speakText(text, language);
  };

  const getCategoryIcon = (cat: MemoryCategory) => {
    switch (cat) {
      case 'person': return <Users size={20} />;
      case 'place': return <MapPin size={20} />;
      case 'object': return <Coffee size={20} />;
      case 'routine': return <CalendarCheck size={20} />;
    }
  };

  // Dynamically tailor title for the active patient
  const baseTitle = strings.personalMemoryTitleBase || 'Personal Memories';
  const localizedTitle = `${patient.name} - ${baseTitle}`;

  return (
    <div style={{ maxWidth: 'var(--max-patient-width)', margin: '0 auto', padding: '16px 16px 40px' }}>
      {/* Header */}
      <div style={{
        background: 'var(--color-bg-surface)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-card)',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-teal)', marginBottom: '6px' }}>
          <span style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {strings.memoriesBadge || strings.memories || 'Personal Memories'}
          </span>
        </div>
        <h1 style={{ fontSize: 'var(--text-elderly-title)', color: 'var(--color-navy)', marginBottom: '6px' }}>
          {localizedTitle}
        </h1>
        <p style={{ fontSize: 'var(--text-elderly-caption)', color: 'var(--color-text-secondary)' }}>
          {strings.personalMemorySubtitle}
        </p>
      </div>

      {/* Category Tabs */}
      <div className="horizontal-scroll-pills" style={{
        marginBottom: '24px',
        gap: '8px',
        paddingBottom: '4px'
      }}>
        {(['person', 'place', 'object', 'routine'] as MemoryCategory[]).map(cat => {
          const isActive = activeTab === cat;
          let label = strings.peopleCategory;
          if (cat === 'place') label = strings.placesCategory;
          if (cat === 'object') label = strings.objectsCategory;
          if (cat === 'routine') label = strings.routinesCategory;

          return (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '12px 8px',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'var(--color-navy)' : 'var(--color-bg-surface)',
                color: isActive ? '#FFFFFF' : 'var(--color-text-secondary)',
                border: isActive ? '2px solid var(--color-navy)' : '1px solid var(--color-border)',
                minHeight: '64px',
                minWidth: '76px',
                flex: 1,
                fontWeight: 700,
                fontSize: '14px',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
                cursor: 'pointer'
              }}
            >
              {getCategoryIcon(cat)}
              <span style={{ textAlign: 'center' }}>{label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Memory Items List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredMemories.map(item => {
          const locMem = getLocalizedMemoryItem(item, language);
          return (
            <div
              key={item.id}
              className="patient-card"
              style={{
                padding: '20px',
                border: '1.5px solid var(--color-border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ flexShrink: 0 }}>
                    <RealLifeImage
                      assetKey={item.id}
                      category={item.category}
                      title={locMem.name || item.name}
                      photoUrl={item.imageUrl}
                      size={64}
                      rounded={true}
                      alt={locMem.name}
                      style={{
                        boxShadow: 'var(--shadow-sm)',
                        border: '2px solid var(--color-border)'
                      }}
                    />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-navy)', marginBottom: '4px' }}>
                      {locMem.name}
                    </h3>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--color-teal-dark)',
                      background: 'var(--color-teal-soft)',
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      marginBottom: '8px'
                    }}>
                      {locMem.relationshipOrDetail}
                    </div>
                    <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                      {locMem.description}
                    </p>
                  </div>
                </div>

                {/* Audio Listen Button */}
                <button
                  onClick={() => handleListen(item)}
                  className="btn btn-outline btn-icon"
                  style={{ minWidth: '44px', minHeight: '44px', flexShrink: 0 }}
                  title="Listen to memory aloud"
                  aria-label={`Listen to memory of ${locMem.name}`}
                >
                  <Volume2 size={20} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
