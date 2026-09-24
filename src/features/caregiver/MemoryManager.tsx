import React, { useState } from 'react';
import { PersonalMemoryItem, MemoryCategory, LanguageCode } from '../../models/types';
import { offlineService } from '../../services/offlineService';
import { getLocalizedMemoryItem } from '../../services/localizationHelper';
import { RealLifeImage } from '../../services/realLifeAssets';
import { Plus, Users, MapPin, Coffee, CalendarCheck, CheckCircle2 } from 'lucide-react';

interface MemoryManagerProps {
  patientId?: string;
  language?: LanguageCode;
}

export const MemoryManager: React.FC<MemoryManagerProps> = ({ patientId, language = 'en' }) => {
  const [memories, setMemories] = useState<PersonalMemoryItem[]>(offlineService.getMemories(patientId));
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  React.useEffect(() => {
    setMemories(offlineService.getMemories(patientId));
  }, [patientId]);

  // Form State
  const [category, setCategory] = useState<MemoryCategory>('person');
  const [name, setName] = useState('');
  const [relationshipOrDetail, setRelationshipOrDetail] = useState('');
  const [description, setDescription] = useState('');
  const [iconOrEmoji, setIconOrEmoji] = useState('🌸');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;

    const newMemory: PersonalMemoryItem = {
      id: 'mem-' + Date.now(),
      category,
      name: name.trim(),
      relationshipOrDetail: relationshipOrDetail.trim() || 'Familiar Item',
      description: description.trim(),
      iconOrEmoji: iconOrEmoji.trim() || '🌸'
    };

    offlineService.saveMemory(newMemory, patientId);
    setMemories(offlineService.getMemories(patientId));
    setIsAdding(false);
    setName('');
    setRelationshipOrDetail('');
    setDescription('');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div style={{
      background: 'var(--color-bg-surface)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-card)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-navy)' }}>
            Personalized Memory Configuration
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
            Configure familiar family members, regional places, objects, and daily routines
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="btn btn-primary"
          style={{ padding: '8px 16px', fontSize: '14px' }}
        >
          <Plus size={18} />
          <span>{isAdding ? 'Cancel' : 'Add New Memory'}</span>
        </button>
      </div>

      {saveSuccess && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          background: 'var(--color-success-soft)',
          color: 'var(--color-success)',
          border: '1px solid var(--color-success-border)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '20px',
          fontSize: '14px',
          fontWeight: 600
        }}>
          <CheckCircle2 size={18} />
          <span>Memory item added successfully. It is now active in patient activities.</span>
        </div>
      )}

      {/* Add Memory Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} style={{
          background: 'var(--color-bg-subtle)',
          padding: '20px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          marginBottom: '24px'
        }}>
          <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '16px' }}>
            New Memory Profile Item
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                Memory Type
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as MemoryCategory)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  fontSize: '14px',
                  background: '#FFFFFF'
                }}
              >
                <option value="person">Family Member / Person</option>
                <option value="place">Familiar Place / Landmark</option>
                <option value="object">Household Object</option>
                <option value="routine">Daily Routine Step</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                Name / Title
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g., Ananya, Blue Cup, Morning Walk"
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                Relationship / Context
              </label>
              <input
                type="text"
                value={relationshipOrDetail}
                onChange={e => setRelationshipOrDetail(e.target.value)}
                placeholder="e.g., Daughter, Ancestral Home, Step 2"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                Icon / Emoji
              </label>
              <input
                type="text"
                value={iconOrEmoji}
                onChange={e => setIconOrEmoji(e.target.value)}
                placeholder="e.g., 👩‍👧, 🏡, ☕, 🌸"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
              Description & Grounding Narrative
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Provide a reassuring 1-2 sentence description used for recall cues..."
              rows={2}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="btn btn-subtle"
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '8px 18px', fontSize: '14px' }}
            >
              Save Memory Item
            </button>
          </div>
        </form>
      )}

      {/* Existing Memories Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '14px'
      }}>
        {memories.map(item => {
          const locItem = getLocalizedMemoryItem(item, language);
          return (
            <div
              key={item.id}
              style={{
                background: 'var(--color-bg-subtle)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start'
              }}
            >
              <div style={{
                marginRight: '12px',
                flexShrink: 0
              }}>
                <RealLifeImage
                  assetKey={item.id}
                  category={item.category}
                  title={item.name}
                  photoUrl={item.imageUrl}
                  size={52}
                  rounded={true}
                  alt={locItem.name}
                />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-navy)' }}>
                    {locItem.name}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    background: 'var(--color-navy-soft)',
                    color: 'var(--color-navy)',
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 600
                  }}>
                    {item.category}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-teal-dark)', fontWeight: 600, marginBottom: '4px' }}>
                  {locItem.relationshipOrDetail}
                </div>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                  {locItem.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
