import React, { useState, useEffect } from 'react';

export interface RealLifeAsset {
  id: string;
  nameEn: string;
  nameHi: string;
  nameRegional: string;
  category: 'object' | 'person' | 'place' | 'routine';
  photoUrl: string;
  svgFallback: string; // High-detail realistic SVG data URI for 100% offline resilience
  altText: string;
}

// Inline realistic SVG generator for 100% offline fallback
function makeSvgDataUri(svgContent: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
}

export const REAL_LIFE_ASSETS: Record<string, RealLifeAsset> = {
  // --- Objects ---
  cup: {
    id: 'cup',
    nameEn: 'Tea Cup',
    nameHi: 'चाय का कप',
    nameRegional: 'চাহৰ কাপ',
    category: 'object',
    photoUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=400&q=80',
    altText: 'Ceramic tea cup with warm steaming Assam tea',
    svgFallback: makeSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        <defs>
          <linearGradient id="cupGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#3182CE"/>
            <stop offset="50%" stop-color="#2B6CB0"/>
            <stop offset="100%" stop-color="#1A365D"/>
          </linearGradient>
          <linearGradient id="teaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#C05621"/>
            <stop offset="100%" stop-color="#7B341E"/>
          </linearGradient>
          <linearGradient id="saucerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#EDF2F7"/>
            <stop offset="100%" stop-color="#CBD5E0"/>
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" flood-opacity="0.25"/>
          </filter>
        </defs>
        <ellipse cx="100" cy="165" rx="75" ry="18" fill="url(#saucerGrad)" filter="url(#shadow)"/>
        <ellipse cx="100" cy="163" rx="55" ry="12" fill="#E2E8F0"/>
        <!-- Handle -->
        <path d="M135 90 C165 90 165 140 135 140" fill="none" stroke="url(#cupGrad)" stroke-width="12" stroke-linecap="round"/>
        <!-- Cup Body -->
        <path d="M55 75 L68 150 C70 156 80 160 100 160 C120 160 130 156 132 150 L145 75 Z" fill="url(#cupGrad)" filter="url(#shadow)"/>
        <!-- Cup Rim & Tea -->
        <ellipse cx="100" cy="75" rx="45" ry="16" fill="url(#teaGrad)"/>
        <ellipse cx="100" cy="74" rx="42" ry="14" fill="#9C4221"/>
        <ellipse cx="100" cy="75" rx="45" ry="16" fill="none" stroke="#E2E8F0" stroke-width="3"/>
        <!-- Steam -->
        <path d="M90 55 Q95 40 88 28" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="3" stroke-linecap="round"/>
        <path d="M102 52 Q108 35 100 22" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="3" stroke-linecap="round"/>
        <path d="M114 56 Q120 42 112 30" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="3" stroke-linecap="round"/>
      </svg>
    `)
  },

  flower: {
    id: 'flower',
    nameEn: 'Orchid Flower',
    nameHi: 'ऑर्किड फूल',
    nameRegional: 'কপৌ ফুল',
    category: 'object',
    photoUrl: 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=400&q=80',
    altText: 'Kopou blooming purple and pink orchid flower',
    svgFallback: makeSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        <defs>
          <linearGradient id="petalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#F687B3"/>
            <stop offset="50%" stop-color="#D53F8C"/>
            <stop offset="100%" stop-color="#97266D"/>
          </linearGradient>
          <linearGradient id="centerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#FAF089"/>
            <stop offset="100%" stop-color="#D69E2E"/>
          </linearGradient>
        </defs>
        <!-- Stem & Leaves -->
        <path d="M100 180 Q95 130 100 100" fill="none" stroke="#2F855A" stroke-width="8" stroke-linecap="round"/>
        <path d="M96 140 Q60 130 45 150 Q75 160 96 145" fill="#38A169"/>
        <path d="M100 120 Q140 105 155 125 Q125 140 100 125" fill="#38A169"/>
        <!-- Petals -->
        <ellipse cx="100" cy="60" rx="26" ry="42" fill="url(#petalGrad)"/>
        <ellipse cx="60" cy="85" rx="38" ry="24" transform="rotate(-30 60 85)" fill="url(#petalGrad)"/>
        <ellipse cx="140" cy="85" rx="38" ry="24" transform="rotate(30 140 85)" fill="url(#petalGrad)"/>
        <ellipse cx="75" cy="125" rx="34" ry="22" transform="rotate(25 75 125)" fill="url(#petalGrad)"/>
        <ellipse cx="125" cy="125" rx="34" ry="22" transform="rotate(-25 125 125)" fill="url(#petalGrad)"/>
        <!-- Flower Center -->
        <circle cx="100" cy="98" r="18" fill="url(#centerGrad)"/>
        <circle cx="97" cy="95" r="4" fill="#744210"/>
        <circle cx="103" cy="95" r="4" fill="#744210"/>
      </svg>
    `)
  },

  key: {
    id: 'key',
    nameEn: 'Brass Key',
    nameHi: 'पीतल की चाबी',
    nameRegional: 'পিতলৰ চাবি',
    category: 'object',
    photoUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=400&q=80',
    altText: 'Vintage solid brass house key',
    svgFallback: makeSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        <defs>
          <linearGradient id="brassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ECC94B"/>
            <stop offset="35%" stop-color="#D69E2E"/>
            <stop offset="70%" stop-color="#B7791F"/>
            <stop offset="100%" stop-color="#744210"/>
          </linearGradient>
        </defs>
        <!-- Bow / Ring -->
        <circle cx="65" cy="70" r="38" fill="none" stroke="url(#brassGrad)" stroke-width="14"/>
        <circle cx="65" cy="70" r="18" fill="none" stroke="url(#brassGrad)" stroke-width="4"/>
        <!-- Shaft -->
        <rect x="90" y="80" width="85" height="12" rx="4" transform="rotate(25 90 80)" fill="url(#brassGrad)"/>
        <!-- Key Teeth / Bit -->
        <rect x="150" y="115" width="10" height="22" rx="2" transform="rotate(25 150 115)" fill="url(#brassGrad)"/>
        <rect x="162" y="120" width="8" height="16" rx="2" transform="rotate(25 162 120)" fill="url(#brassGrad)"/>
      </svg>
    `)
  },

  basket: {
    id: 'basket',
    nameEn: 'Woven Basket',
    nameHi: 'बांस की टोकरी',
    nameRegional: 'বাঁহৰ খৰাহী',
    category: 'object',
    photoUrl: 'https://images.unsplash.com/photo-1595407753234-0882f0e74d53?auto=format&fit=crop&w=400&q=80',
    altText: 'Handmade woven bamboo basket with fresh tea leaves',
    svgFallback: makeSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        <defs>
          <linearGradient id="caneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ED8936"/>
            <stop offset="50%" stop-color="#C05621"/>
            <stop offset="100%" stop-color="#7B341E"/>
          </linearGradient>
        </defs>
        <!-- Basket Handle -->
        <path d="M45 110 C45 35 155 35 155 110" fill="none" stroke="url(#caneGrad)" stroke-width="10" stroke-linecap="round"/>
        <!-- Basket Body -->
        <path d="M35 105 L52 165 C55 172 70 176 100 176 C130 176 145 172 148 165 L165 105 Z" fill="url(#caneGrad)"/>
        <!-- Woven Weave Lines -->
        <ellipse cx="100" cy="105" rx="65" ry="16" fill="#DD6B20"/>
        <path d="M45 125 Q100 145 155 125" fill="none" stroke="#7B341E" stroke-width="3"/>
        <path d="M50 145 Q100 165 150 145" fill="none" stroke="#7B341E" stroke-width="3"/>
        <!-- Leaves poking out -->
        <path d="M70 100 Q80 80 100 95 Q85 105 70 100" fill="#38A169"/>
        <path d="M100 95 Q115 75 130 92 Q115 105 100 95" fill="#48BB78"/>
      </svg>
    `)
  },

  book: {
    id: 'book',
    nameEn: 'Prayer Book',
    nameHi: 'धार्मिक पुस्तक',
    nameRegional: 'নামপুথি',
    category: 'object',
    photoUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
    altText: 'Hardcover traditional scripture and prayer book with golden ribbon',
    svgFallback: makeSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        <defs>
          <linearGradient id="coverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#9B2C2C"/>
            <stop offset="50%" stop-color="#742A2A"/>
            <stop offset="100%" stop-color="#4A1E1E"/>
          </linearGradient>
        </defs>
        <!-- Book Pages Thickness -->
        <polygon points="40,65 150,45 165,135 55,155" fill="#EDF2F7"/>
        <polygon points="40,75 150,55 165,145 55,165" fill="#E2E8F0"/>
        <!-- Hardcover Front -->
        <polygon points="35,55 145,35 162,130 52,150" fill="url(#coverGrad)"/>
        <!-- Golden Border & Motif -->
        <polygon points="45,63 137,47 152,123 60,139" fill="none" stroke="#ECC94B" stroke-width="3"/>
        <circle cx="98" cy="92" r="14" fill="none" stroke="#ECC94B" stroke-width="2"/>
        <!-- Red Bookmark Ribbon -->
        <path d="M98 42 L98 160 L108 152 L118 160 L118 42" fill="#E53E3E"/>
      </svg>
    `)
  },

  jug: {
    id: 'jug',
    nameEn: 'Water Jug',
    nameHi: 'मिट्टी की सुराही / जग',
    nameRegional: 'মাটিৰ কলহ',
    category: 'object',
    photoUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=80',
    altText: 'Traditional clay water jug for fresh cool water',
    svgFallback: makeSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        <defs>
          <linearGradient id="clayGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#DD6B20"/>
            <stop offset="50%" stop-color="#C05621"/>
            <stop offset="100%" stop-color="#7B341E"/>
          </linearGradient>
        </defs>
        <!-- Spout & Neck -->
        <ellipse cx="100" cy="45" rx="25" ry="8" fill="#9C4221"/>
        <path d="M80 45 L86 85 C55 105 55 155 85 170 C92 173 108 173 115 170 C145 155 145 105 114 85 L120 45 Z" fill="url(#clayGrad)"/>
        <!-- Handle -->
        <path d="M115 65 C150 70 150 120 118 135" fill="none" stroke="url(#clayGrad)" stroke-width="12" stroke-linecap="round"/>
        <!-- Traditional Patterns -->
        <path d="M72 115 Q100 130 128 115" fill="none" stroke="#F6AD55" stroke-width="3"/>
        <path d="M75 130 Q100 145 125 130" fill="none" stroke="#F6AD55" stroke-width="3"/>
      </svg>
    `)
  },

  bell: {
    id: 'bell',
    nameEn: 'Puja Bell',
    nameHi: 'पूजा की घंटी',
    nameRegional: 'পূজাৰ ঘণ্টা',
    category: 'object',
    photoUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=400&q=80',
    altText: 'Polished Indian brass puja bell with sacred handle',
    svgFallback: makeSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        <defs>
          <linearGradient id="bellGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FAF089"/>
            <stop offset="40%" stop-color="#D69E2E"/>
            <stop offset="80%" stop-color="#B7791F"/>
            <stop offset="100%" stop-color="#744210"/>
          </linearGradient>
        </defs>
        <!-- Bell Handle Top (Garuda / Trishul Finial) -->
        <circle cx="100" cy="35" r="10" fill="url(#bellGold)"/>
        <rect x="94" y="45" width="12" height="50" rx="3" fill="url(#bellGold)"/>
        <ellipse cx="100" cy="70" rx="12" ry="5" fill="#ECC94B"/>
        <!-- Bell Flare -->
        <path d="M92 95 Q65 130 50 155 L150 155 Q135 130 108 95 Z" fill="url(#bellGold)"/>
        <ellipse cx="100" cy="155" rx="50" ry="14" fill="#975A16"/>
        <ellipse cx="100" cy="155" rx="46" ry="12" fill="#744210"/>
        <!-- Clapper Tongue -->
        <circle cx="100" cy="162" r="8" fill="url(#bellGold)"/>
      </svg>
    `)
  },

  gamusa: {
    id: 'gamusa',
    nameEn: 'Woven Gamusa',
    nameHi: 'सूती गमछा',
    nameRegional: 'ফুলাম গামোচা',
    category: 'object',
    photoUrl: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=400&q=80',
    altText: 'Traditional white and red handwoven Assamese Phulam Gamosa',
    svgFallback: makeSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        <!-- Cotton White Base Scarf folded -->
        <path d="M30 60 C30 50 170 50 170 60 L160 150 C160 160 40 160 40 150 Z" fill="#F7FAFC" stroke="#E2E8F0" stroke-width="2"/>
        <!-- Red Border Strips -->
        <rect x="36" y="80" width="128" height="6" fill="#E53E3E"/>
        <rect x="38" y="90" width="124" height="3" fill="#E53E3E"/>
        <!-- Assamese Floral Gos / Kingkhap Motifs -->
        <path d="M60 115 L66 100 L72 115 L66 110 Z" fill="#E53E3E"/>
        <path d="M85 115 L91 100 L97 115 L91 110 Z" fill="#E53E3E"/>
        <path d="M110 115 L116 100 L122 115 L116 110 Z" fill="#E53E3E"/>
        <path d="M135 115 L141 100 L147 115 L141 110 Z" fill="#E53E3E"/>
        <!-- Bottom Red Strip & Fringes -->
        <rect x="40" y="130" width="120" height="8" fill="#E53E3E"/>
        <line x1="42" y1="150" x2="42" y2="165" stroke="#E2E8F0" stroke-width="2"/>
        <line x1="60" y1="150" x2="60" y2="165" stroke="#E2E8F0" stroke-width="2"/>
        <line x1="80" y1="150" x2="80" y2="165" stroke="#E2E8F0" stroke-width="2"/>
        <line x1="100" y1="150" x2="100" y2="165" stroke="#E2E8F0" stroke-width="2"/>
        <line x1="120" y1="150" x2="120" y2="165" stroke="#E2E8F0" stroke-width="2"/>
        <line x1="140" y1="150" x2="140" y2="165" stroke="#E2E8F0" stroke-width="2"/>
        <line x1="158" y1="150" x2="158" y2="165" stroke="#E2E8F0" stroke-width="2"/>
      </svg>
    `)
  },

  glasses: {
    id: 'glasses',
    nameEn: 'Spectacles',
    nameHi: 'चश्मा',
    nameRegional: 'চশমা',
    category: 'object',
    photoUrl: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=400&q=80',
    altText: 'Wire-rimmed reading spectacles on a clean desk',
    svgFallback: makeSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        <defs>
          <linearGradient id="lensGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="rgba(226, 232, 240, 0.4)"/>
            <stop offset="100%" stop-color="rgba(190, 227, 248, 0.6)"/>
          </linearGradient>
        </defs>
        <!-- Left Frame -->
        <rect x="30" y="80" width="55" height="42" rx="14" fill="url(#lensGrad)" stroke="#4A5568" stroke-width="6"/>
        <!-- Right Frame -->
        <rect x="115" y="80" width="55" height="42" rx="14" fill="url(#lensGrad)" stroke="#4A5568" stroke-width="6"/>
        <!-- Bridge -->
        <path d="M85 92 Q100 85 115 92" fill="none" stroke="#4A5568" stroke-width="6" stroke-linecap="round"/>
        <!-- Left & Right Temples (Arms) -->
        <path d="M30 90 L10 70 Q5 65 12 60" fill="none" stroke="#718096" stroke-width="5" stroke-linecap="round"/>
        <path d="M170 90 L190 70 Q195 65 188 60" fill="none" stroke="#718096" stroke-width="5" stroke-linecap="round"/>
        <!-- Lens Glare -->
        <path d="M42 90 L60 90" stroke="rgba(255,255,255,0.8)" stroke-width="3" stroke-linecap="round"/>
        <path d="M127 90 L145 90" stroke="rgba(255,255,255,0.8)" stroke-width="3" stroke-linecap="round"/>
      </svg>
    `)
  },

  comb: {
    id: 'comb',
    nameEn: 'Wooden Comb',
    nameHi: 'लकड़ी की कंघी',
    nameRegional: 'কাঠৰ ফণি',
    category: 'object',
    photoUrl: 'https://images.unsplash.com/photo-1590159763121-7c9ff3149e0a?auto=format&fit=crop&w=400&q=80',
    altText: 'Traditional handcrafted neem wooden hair comb',
    svgFallback: makeSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        <defs>
          <linearGradient id="woodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#C05621"/>
            <stop offset="50%" stop-color="#9C4221"/>
            <stop offset="100%" stop-color="#652B19"/>
          </linearGradient>
        </defs>
        <!-- Spine of Comb -->
        <path d="M30 90 Q100 65 170 90 L170 115 L30 115 Z" fill="url(#woodGrad)"/>
        <!-- Teeth -->
        ${Array.from({ length: 14 }).map((_, i) => `
          <rect x="${38 + i * 9}" y="115" width="4" height="40" rx="1.5" fill="url(#woodGrad)"/>
        `).join('')}
      </svg>
    `)
  },

  clock: {
    id: 'clock',
    nameEn: 'Table Clock',
    nameHi: 'घड़ी',
    nameRegional: 'ঘড়ী',
    category: 'object',
    photoUrl: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=400&q=80',
    altText: 'Analog bedside table clock with large clear numbers',
    svgFallback: makeSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        <!-- Bell Twin Tops -->
        <circle cx="65" cy="45" r="18" fill="#319795"/>
        <circle cx="135" cy="45" r="18" fill="#319795"/>
        <!-- Legs -->
        <line x1="60" y1="160" x2="45" y2="180" stroke="#2D3748" stroke-width="8" stroke-linecap="round"/>
        <line x1="140" y1="160" x2="155" y2="180" stroke="#2D3748" stroke-width="8" stroke-linecap="round"/>
        <!-- Clock Body -->
        <circle cx="100" cy="110" r="62" fill="#319795"/>
        <circle cx="100" cy="110" r="52" fill="#FFFFFF"/>
        <!-- Hour Markers -->
        <circle cx="100" cy="68" r="3" fill="#2D3748"/>
        <circle cx="142" cy="110" r="3" fill="#2D3748"/>
        <circle cx="100" cy="152" r="3" fill="#2D3748"/>
        <circle cx="58" cy="110" r="3" fill="#2D3748"/>
        <!-- Hands (10:10 pleasant time) -->
        <line x1="100" y1="110" x2="80" y2="85" stroke="#2D3748" stroke-width="5" stroke-linecap="round"/>
        <line x1="100" y1="110" x2="128" y2="80" stroke="#2D3748" stroke-width="4" stroke-linecap="round"/>
        <circle cx="100" cy="110" r="5" fill="#E53E3E"/>
      </svg>
    `)
  },

  lantern: {
    id: 'lantern',
    nameEn: 'Lantern',
    nameHi: 'दीपक / लालटेन',
    nameRegional: 'চাকি',
    category: 'object',
    photoUrl: 'https://images.unsplash.com/photo-1603555501671-8f96b3fce8b4?auto=format&fit=crop&w=400&q=80',
    altText: 'Traditional warm brass lantern glowing warmly',
    svgFallback: makeSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        <defs>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#FFFAF0"/>
            <stop offset="40%" stop-color="#FEEBC8"/>
            <stop offset="80%" stop-color="#F6AD55"/>
            <stop offset="100%" stop-color="#ED8936"/>
          </radialGradient>
        </defs>
        <!-- Handle -->
        <path d="M70 50 C70 15 130 15 130 50" fill="none" stroke="#2D3748" stroke-width="6"/>
        <!-- Top Cap -->
        <rect x="80" y="45" width="40" height="15" rx="3" fill="#C53030"/>
        <!-- Glass Chamber -->
        <rect x="70" y="60" width="60" height="75" rx="10" fill="url(#glow)"/>
        <!-- Flame inside -->
        <ellipse cx="100" cy="100" rx="8" ry="16" fill="#ECC94B"/>
        <ellipse cx="100" cy="100" rx="4" ry="10" fill="#DD6B20"/>
        <!-- Base -->
        <path d="M60 135 L140 135 L145 165 L55 165 Z" fill="#C53030"/>
      </svg>
    `)
  },

  spoon: {
    id: 'spoon',
    nameEn: 'Wooden Spoon',
    nameHi: 'लकड़ी की चम्मच',
    nameRegional: 'কাঠৰ হেতা',
    category: 'object',
    photoUrl: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=400&q=80',
    altText: 'Smoothly carved wooden cooking spoon',
    svgFallback: makeSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        <defs>
          <linearGradient id="spoonWood" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#D69E2E"/>
            <stop offset="70%" stop-color="#975A16"/>
            <stop offset="100%" stop-color="#5F370E"/>
          </linearGradient>
        </defs>
        <!-- Handle -->
        <rect x="94" y="65" width="12" height="110" rx="6" fill="url(#spoonWood)"/>
        <!-- Spoon Bowl -->
        <ellipse cx="100" cy="50" rx="28" ry="38" fill="url(#spoonWood)"/>
        <ellipse cx="100" cy="50" rx="22" ry="30" fill="#744210" opacity="0.3"/>
      </svg>
    `)
  },

  stick: {
    id: 'stick',
    nameEn: 'Walking Stick',
    nameHi: 'छड़ी',
    nameRegional: 'লাঠী',
    category: 'object',
    photoUrl: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&w=400&q=80',
    altText: 'Polished sturdy wooden walking stick with curved handle',
    svgFallback: makeSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        <!-- Handle Curve -->
        <path d="M125 65 C125 35 70 35 70 65 L70 175" fill="none" stroke="#7B341E" stroke-width="12" stroke-linecap="round"/>
        <!-- Rubber Tip -->
        <rect x="64" y="172" width="12" height="10" rx="2" fill="#2D3748"/>
      </svg>
    `)
  },

  bag: {
    id: 'bag',
    nameEn: 'Cloth Bag',
    nameHi: 'थैला',
    nameRegional: 'কাপোৰৰ মোনা',
    category: 'object',
    photoUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80',
    altText: 'Natural cotton woven shopping bag',
    svgFallback: makeSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        <!-- Straps -->
        <path d="M70 100 C70 45 130 45 130 100" fill="none" stroke="#DD6B20" stroke-width="8"/>
        <!-- Tote Body -->
        <rect x="50" y="85" width="100" height="95" rx="10" fill="#ED8936"/>
        <rect x="60" y="95" width="80" height="75" rx="6" fill="#F6AD55"/>
      </svg>
    `)
  },

  plate: {
    id: 'plate',
    nameEn: 'Ceramic Plate',
    nameHi: 'थाली',
    nameRegional: 'কাঁহৰ কাঁহী',
    category: 'object',
    photoUrl: 'https://images.unsplash.com/photo-1514986888952-8cd320577b68?auto=format&fit=crop&w=400&q=80',
    altText: 'Traditional polished bell metal / ceramic dinner plate',
    svgFallback: makeSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        <!-- Rim -->
        <circle cx="100" cy="100" r="75" fill="#D69E2E"/>
        <circle cx="100" cy="100" r="68" fill="#ECC94B"/>
        <!-- Inner Plate Basin -->
        <circle cx="100" cy="100" r="54" fill="#FEFCBF"/>
      </svg>
    `)
  },

  // --- Real-Life People (Portraits) ---
  ananya: {
    id: 'ananya',
    nameEn: 'Ananya Sharma',
    nameHi: 'अनन्या शर्मा',
    nameRegional: 'অনন্যা শর্মা',
    category: 'person',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    altText: 'Ananya Sharma, caring daughter and primary caregiver',
    svgFallback: makeSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        <defs>
          <linearGradient id="skin" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#F6AD55"/>
            <stop offset="100%" stop-color="#ED8936"/>
          </linearGradient>
          <linearGradient id="kurti" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#319795"/>
            <stop offset="100%" stop-color="#234E52"/>
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="90" fill="#E6FFFA"/>
        <!-- Shoulders & Kurti -->
        <path d="M45 190 C45 140 155 140 155 190 Z" fill="url(#kurti)"/>
        <!-- Neck -->
        <rect x="90" y="115" width="20" height="25" fill="url(#skin)"/>
        <!-- Face -->
        <ellipse cx="100" cy="90" rx="34" ry="40" fill="url(#skin)"/>
        <!-- Hair -->
        <path d="M60 85 C60 45 140 45 140 85 C140 115 130 115 130 100 C130 65 70 65 70 100 Z" fill="#1A202C"/>
        <!-- Bindi -->
        <circle cx="100" cy="78" r="2.5" fill="#E53E3E"/>
        <!-- Gentle Eyes & Warm Smile -->
        <path d="M82 86 Q88 83 94 86" stroke="#2D3748" stroke-width="2.5" fill="none"/>
        <path d="M106 86 Q112 83 118 86" stroke="#2D3748" stroke-width="2.5" fill="none"/>
        <path d="M90 105 Q100 115 110 105" stroke="#C53030" stroke-width="3" fill="none" stroke-linecap="round"/>
      </svg>
    `)
  },

  rohan: {
    id: 'rohan',
    nameEn: 'Rohan Sharma',
    nameHi: 'रोहन शर्मा',
    nameRegional: 'ৰোহন শর্মা',
    category: 'person',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    altText: 'Rohan Sharma, engineering student grandson',
    svgFallback: makeSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        <circle cx="100" cy="100" r="90" fill="#EBF8FF"/>
        <!-- Shirt -->
        <path d="M45 190 C45 145 155 145 155 190 Z" fill="#2B6CB0"/>
        <!-- Face -->
        <ellipse cx="100" cy="95" rx="34" ry="38" fill="#F6AD55"/>
        <!-- Modern Hair -->
        <path d="M65 80 C65 40 135 40 135 80 C135 60 65 60 65 80 Z" fill="#1A202C"/>
        <!-- Eyes & Smile -->
        <circle cx="86" cy="90" r="3" fill="#2D3748"/>
        <circle cx="114" cy="90" r="3" fill="#2D3748"/>
        <path d="M88 110 Q100 122 112 110" stroke="#7B341E" stroke-width="3" fill="none" stroke-linecap="round"/>
      </svg>
    `)
  },

  sonam: {
    id: 'sonam',
    nameEn: 'Sonam Norbu',
    nameHi: 'सोनम नोर्बु',
    nameRegional: 'সোণম নৰবু',
    category: 'person',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    altText: 'Sonam Norbu, son in Sikkim',
    svgFallback: makeSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        <circle cx="100" cy="100" r="90" fill="#FEFCBF"/>
        <!-- Fleece Jacket -->
        <path d="M45 190 C45 140 155 140 155 190 Z" fill="#7B341E"/>
        <!-- Face -->
        <ellipse cx="100" cy="92" rx="36" ry="38" fill="#ED8936"/>
        <path d="M64 75 C64 45 136 45 136 75 Z" fill="#1A202C"/>
        <circle cx="86" cy="88" r="3" fill="#2D3748"/>
        <circle cx="114" cy="88" r="3" fill="#2D3748"/>
        <path d="M88 108 Q100 118 112 108" stroke="#4A1E1E" stroke-width="3" fill="none" stroke-linecap="round"/>
      </svg>
    `)
  },

  debabrata: {
    id: 'debabrata',
    nameEn: 'Debabrata Roy',
    nameHi: 'देवाशीष रॉय',
    nameRegional: 'দেবাশীষ ৰায়',
    category: 'person',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    altText: 'Debabrata Roy, caring son with spectacles',
    svgFallback: makeSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        <circle cx="100" cy="100" r="90" fill="#FEEBC8"/>
        <path d="M45 190 C45 145 155 145 155 190 Z" fill="#C53030"/>
        <ellipse cx="100" cy="94" rx="35" ry="38" fill="#F6AD55"/>
        <path d="M65 72 C65 45 135 45 135 72 Z" fill="#2D3748"/>
        <circle cx="86" cy="90" r="10" fill="none" stroke="#2D3748" stroke-width="2.5"/>
        <circle cx="114" cy="90" r="10" fill="none" stroke="#2D3748" stroke-width="2.5"/>
        <line x1="96" y1="90" x2="104" y2="90" stroke="#2D3748" stroke-width="2.5"/>
        <path d="M90 114 Q100 122 110 114" stroke="#7B341E" stroke-width="3" fill="none" stroke-linecap="round"/>
      </svg>
    `)
  },

  debjani: {
    id: 'debjani',
    nameEn: 'Debjani Singha',
    nameHi: 'देवयानी सिंघा',
    nameRegional: 'দেবযানী সিংহ',
    category: 'person',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    altText: 'Debjani Singha, loving daughter and Bengali teacher',
    svgFallback: makeSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        <circle cx="100" cy="100" r="90" fill="#FFF5F5"/>
        <path d="M45 190 C45 145 155 145 155 190 Z" fill="#9B2C2C"/>
        <ellipse cx="100" cy="94" rx="34" ry="38" fill="#F6AD55"/>
        <path d="M62 82 C62 48 138 48 138 82 C138 110 128 110 128 95 C128 65 72 65 72 95 Z" fill="#1A202C"/>
        <circle cx="100" cy="78" r="2.5" fill="#E53E3E"/>
        <circle cx="86" cy="90" r="2.5" fill="#2D3748"/>
        <circle cx="114" cy="90" r="2.5" fill="#2D3748"/>
        <path d="M88 112 Q100 122 112 112" stroke="#C53030" stroke-width="3" fill="none" stroke-linecap="round"/>
      </svg>
    `)
  },

  subir: {
    id: 'subir',
    nameEn: 'Subir Singha',
    nameHi: 'सुबीर सिंघा',
    nameRegional: 'সুবীর সিংহ',
    category: 'person',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    altText: 'Subir Singha, high school grandson who loves chess',
    svgFallback: makeSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        <circle cx="100" cy="100" r="90" fill="#EBF8FF"/>
        <path d="M45 190 C45 145 155 145 155 190 Z" fill="#3182CE"/>
        <ellipse cx="100" cy="95" rx="34" ry="38" fill="#F6AD55"/>
        <path d="M65 75 C65 45 135 45 135 75 Z" fill="#1A202C"/>
        <circle cx="86" cy="90" r="3" fill="#2D3748"/>
        <circle cx="114" cy="90" r="3" fill="#2D3748"/>
        <path d="M88 112 Q100 122 112 112" stroke="#7B341E" stroke-width="3" fill="none" stroke-linecap="round"/>
      </svg>
    `)
  },

  dolma: {
    id: 'dolma',
    nameEn: 'Dolma Tenzing',
    nameHi: 'डोल्मा तेन्जिंग',
    nameRegional: 'ডোলমা তেনজিং',
    category: 'person',
    photoUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=400&q=80',
    altText: 'Dolma Tenzing, smiling granddaughter in Sikkim',
    svgFallback: makeSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        <circle cx="100" cy="100" r="90" fill="#FAF5FF"/>
        <path d="M45 190 C45 145 155 145 155 190 Z" fill="#805AD5"/>
        <ellipse cx="100" cy="92" rx="34" ry="38" fill="#F6AD55"/>
        <path d="M60 85 C60 48 140 48 140 85 Z" fill="#1A202C"/>
        <circle cx="86" cy="88" r="3" fill="#2D3748"/>
        <circle cx="114" cy="88" r="3" fill="#2D3748"/>
        <path d="M88 110 Q100 120 112 110" stroke="#C53030" stroke-width="3" fill="none" stroke-linecap="round"/>
      </svg>
    `)
  },

  pema_norbu: {
    id: 'pema_norbu',
    nameEn: 'Pema Norbu',
    nameHi: 'पेमा नोर्बु',
    nameRegional: 'পেমা নৰবু',
    category: 'person',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    altText: 'Pema Norbu, caring son in Gangtok',
    svgFallback: makeSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        <circle cx="100" cy="100" r="90" fill="#FEFCBF"/>
        <path d="M45 190 C45 140 155 140 155 190 Z" fill="#7B341E"/>
        <ellipse cx="100" cy="92" rx="36" ry="38" fill="#ED8936"/>
        <path d="M64 75 C64 45 136 45 136 75 Z" fill="#1A202C"/>
        <circle cx="86" cy="88" r="3" fill="#2D3748"/>
        <circle cx="114" cy="88" r="3" fill="#2D3748"/>
        <path d="M88 108 Q100 118 112 108" stroke="#4A1E1E" stroke-width="3" fill="none" stroke-linecap="round"/>
      </svg>
    `)
  },

  // --- Real-Life Places ---
  residence: {
    id: 'residence',
    nameEn: 'Tezpur Family Residence',
    nameHi: 'पारिवारिक घर',
    nameRegional: 'পৰিয়ালৰ ঘৰ',
    category: 'place',
    photoUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=400&q=80',
    altText: 'Traditional Assam family residence with green veranda and garden tea bushes',
    svgFallback: makeSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        <rect width="200" height="200" fill="#E6FFFA"/>
        <!-- Green Sloped Roof -->
        <polygon points="100,30 20,90 180,90" fill="#234E52"/>
        <!-- House Walls -->
        <rect x="35" y="90" width="130" height="75" fill="#FAF5FF" stroke="#CBD5E0" stroke-width="2"/>
        <!-- Veranda Door & Windows -->
        <rect x="85" y="105" width="30" height="60" rx="3" fill="#7B341E"/>
        <rect x="48" y="105" width="26" height="26" rx="2" fill="#E2E8F0" stroke="#4A5568" stroke-width="2"/>
        <rect x="126" y="105" width="26" height="26" rx="2" fill="#E2E8F0" stroke="#4A5568" stroke-width="2"/>
        <!-- Lawn & Tea Bushes -->
        <rect y="165" width="200" height="35" fill="#2F855A"/>
        <circle cx="25" cy="165" r="16" fill="#38A169"/>
        <circle cx="175" cy="165" r="16" fill="#38A169"/>
      </svg>
    `)
  },

  bazaar: {
    id: 'bazaar',
    nameEn: 'Community Bazaar',
    nameHi: 'स्थानीय बाज़ार',
    nameRegional: 'স্থানীয় বজাৰ',
    category: 'place',
    photoUrl: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=400&q=80',
    altText: 'Community bazaar with fresh produce and Joha rice',
    svgFallback: makeSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        <rect width="200" height="200" fill="#FEEBC8"/>
        <!-- Market Stalls Canopy -->
        <polygon points="10,50 190,50 170,90 30,90" fill="#DD6B20"/>
        <rect x="30" y="90" width="140" height="60" fill="#ED8936"/>
        <!-- Produce Baskets -->
        <circle cx="60" cy="150" r="18" fill="#C05621"/>
        <circle cx="100" cy="150" r="18" fill="#C05621"/>
        <circle cx="140" cy="150" r="18" fill="#C05621"/>
      </svg>
    `)
  },

  mountain: {
    id: 'mountain',
    nameEn: 'Mt. Kanchenjunga View',
    nameHi: 'कंचनजंघा पर्वत',
    nameRegional: 'কাঞ্চনজংঘা শৃংগ',
    category: 'place',
    photoUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80',
    altText: 'Golden sunrise over Mt. Kanchenjunga snow peaks',
    svgFallback: makeSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        <defs>
          <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#FBD38D"/>
            <stop offset="60%" stop-color="#90CDF4"/>
            <stop offset="100%" stop-color="#EBF8FF"/>
          </linearGradient>
        </defs>
        <rect width="200" height="200" fill="url(#skyGrad)"/>
        <!-- Golden Morning Sun -->
        <circle cx="100" cy="85" r="32" fill="#FAF089"/>
        <!-- Mountain Peak 1 -->
        <polygon points="100,55 30,175 170,175" fill="#4A5568"/>
        <polygon points="100,55 75,100 125,100" fill="#FFFFFF"/>
        <!-- Side Peak -->
        <polygon points="150,80 100,175 200,175" fill="#2D3748"/>
        <polygon points="150,80 135,110 165,110" fill="#EDF2F7"/>
        <rect y="170" width="200" height="30" fill="#234E52"/>
      </svg>
    `)
  },

  monastery: {
    id: 'monastery',
    nameEn: 'Enchey Monastery',
    nameHi: 'बौद्ध मठ',
    nameRegional: 'বৌদ্ধ মঠ',
    category: 'place',
    photoUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=400&q=80',
    altText: 'Historic Buddhist monastery courtyard with prayer flags',
    svgFallback: makeSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        <rect width="200" height="200" fill="#EBF8FF"/>
        <!-- Pagoda Tiered Roofs -->
        <polygon points="100,35 40,70 160,70" fill="#C53030"/>
        <polygon points="100,65 30,105 170,105" fill="#C53030"/>
        <!-- Monastery Sanctuary -->
        <rect x="45" y="105" width="110" height="65" fill="#FEFCBF" stroke="#B7791F" stroke-width="2"/>
        <rect x="85" y="125" width="30" height="45" fill="#742A2A"/>
      </svg>
    `)
  },

  bungalow: {
    id: 'bungalow',
    nameEn: 'Cachar Tea Estate Bungalow',
    nameHi: 'चाय बागान का बंगला',
    nameRegional: 'চাহ বাগিচাৰ বঙলা',
    category: 'place',
    photoUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=400&q=80',
    altText: 'Historic colonial tea estate bungalow surrounded by green tea slopes',
    svgFallback: makeSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        <rect width="200" height="200" fill="#E6FFFA"/>
        <polygon points="100,45 25,95 175,95" fill="#9B2C2C"/>
        <rect x="40" y="95" width="120" height="70" fill="#FFFFFF" stroke="#CBD5E0" stroke-width="2"/>
        <line x1="40" y1="120" x2="160" y2="120" stroke="#718096" stroke-width="4"/>
        <rect y="165" width="200" height="35" fill="#276749"/>
      </svg>
    `)
  },

  river: {
    id: 'river',
    nameEn: 'Barak River Promenade',
    nameHi: 'नदी का किनारा',
    nameRegional: 'বৰাক নদীৰ ঘাট',
    category: 'place',
    photoUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
    altText: 'Peaceful riverbank promenade at evening sunset',
    svgFallback: makeSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        <rect width="200" height="110" fill="#FEEBC8"/>
        <circle cx="140" cy="65" r="28" fill="#F6AD55"/>
        <rect y="110" width="200" height="90" fill="#319795"/>
        <path d="M0 135 Q50 120 100 135 T200 135" fill="none" stroke="#E6FFFA" stroke-width="3"/>
        <path d="M0 160 Q50 145 100 160 T200 160" fill="none" stroke="#E6FFFA" stroke-width="3"/>
      </svg>
    `)
  },

  // --- Keepsakes & Specialized Objects ---
  pocket_watch: {
    id: 'pocket_watch',
    nameEn: 'Silver Pocket Watch',
    nameHi: 'सिल्वर पॉकेट वॉच',
    nameRegional: 'ৰূপৰ পকেট ঘড়ী',
    category: 'object',
    photoUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80',
    altText: 'Vintage silver mechanical pocket watch with chain',
    svgFallback: makeSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        <!-- Crown & Loop -->
        <circle cx="100" cy="35" r="16" fill="none" stroke="#A0AEC0" stroke-width="5"/>
        <rect x="94" y="44" width="12" height="14" fill="#718096"/>
        <!-- Watch Casing -->
        <circle cx="100" cy="115" r="62" fill="#E2E8F0" stroke="#718096" stroke-width="5"/>
        <circle cx="100" cy="115" r="50" fill="#FFFFFF"/>
        <!-- Hour Markers & Hands -->
        <circle cx="100" cy="74" r="3" fill="#2D3748"/>
        <circle cx="141" cy="115" r="3" fill="#2D3748"/>
        <circle cx="100" cy="156" r="3" fill="#2D3748"/>
        <circle cx="59" cy="115" r="3" fill="#2D3748"/>
        <line x1="100" y1="115" x2="82" y2="92" stroke="#2D3748" stroke-width="4" stroke-linecap="round"/>
        <line x1="100" y1="115" x2="128" y2="98" stroke="#2D3748" stroke-width="3" stroke-linecap="round"/>
        <circle cx="100" cy="115" r="4" fill="#C53030"/>
      </svg>
    `)
  },

  prayer_wheel: {
    id: 'prayer_wheel',
    nameEn: 'Brass Mani Prayer Wheel',
    nameHi: 'प्रार्थना चक्र (प्रेयर व्हील)',
    nameRegional: 'প্ৰাৰ্থনা চক্ৰ',
    category: 'object',
    photoUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=400&q=80',
    altText: 'Embossed brass Tibetan Mani prayer wheel',
    svgFallback: makeSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        <!-- Wooden Handle -->
        <rect x="94" y="115" width="12" height="70" rx="4" fill="#7B341E"/>
        <!-- Cylindrical Drum -->
        <rect x="65" y="55" width="70" height="60" rx="6" fill="#D69E2E" stroke="#744210" stroke-width="3"/>
        <ellipse cx="100" cy="55" rx="35" ry="12" fill="#ECC94B"/>
        <circle cx="100" cy="40" r="10" fill="#ECC94B"/>
        <!-- Weighted Spinner Cord -->
        <line x1="135" y1="85" x2="165" y2="105" stroke="#744210" stroke-width="3"/>
        <circle cx="165" cy="105" r="7" fill="#ECC94B"/>
      </svg>
    `)
  },

  // --- Routines ---
  medicine: {
    id: 'medicine',
    nameEn: 'Daily Medicine & Water',
    nameHi: 'दवाई और पानी',
    nameRegional: 'দৈনিক ঔষধ আৰু পানী',
    category: 'routine',
    photoUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80',
    altText: 'Daily medication tablet with clear fresh glass of water',
    svgFallback: makeSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        <rect width="200" height="200" fill="#EBF8FF"/>
        <!-- Glass of Water -->
        <path d="M50 70 L60 160 C62 166 72 170 90 170 C108 170 118 166 120 160 L130 70 Z" fill="rgba(144, 205, 244, 0.4)" stroke="#63B3ED" stroke-width="3"/>
        <ellipse cx="90" cy="70" rx="40" ry="12" fill="none" stroke="#63B3ED" stroke-width="3"/>
        <!-- Medicine Capsule -->
        <rect x="120" y="145" width="46" height="22" rx="11" transform="rotate(-25 120 145)" fill="#E53E3E"/>
        <rect x="120" y="145" width="23" height="22" rx="11" transform="rotate(-25 120 145)" fill="#FFFFFF"/>
      </svg>
    `)
  },

  garden_walk: {
    id: 'garden_walk',
    nameEn: 'Courtyard Garden Walk',
    nameHi: 'बगीचे की सैर',
    nameRegional: 'চোতাল আৰু বাগিচাৰ খোজকঢ়া',
    category: 'routine',
    photoUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80',
    altText: 'Morning stone pathway through green garden flowers',
    svgFallback: makeSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        <rect width="200" height="200" fill="#C6F6D5"/>
        <!-- Stone Path -->
        <polygon points="60,200 140,200 115,50 85,50" fill="#CBD5E0"/>
        <!-- Stepping Stones -->
        <ellipse cx="100" cy="180" rx="30" ry="10" fill="#A0AEC0"/>
        <ellipse cx="100" cy="150" rx="24" ry="8" fill="#A0AEC0"/>
        <ellipse cx="100" cy="120" rx="18" ry="6" fill="#A0AEC0"/>
        <!-- Garden Plants -->
        <circle cx="35" cy="120" r="24" fill="#38A169"/>
        <circle cx="165" cy="120" r="24" fill="#38A169"/>
      </svg>
    `)
  },

  butter_tea: {
    id: 'butter_tea',
    nameEn: 'Warm Butter Tea',
    nameHi: 'मक्खन वाली चाय',
    nameRegional: 'মাখন চাহ',
    category: 'routine',
    photoUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=400&q=80',
    altText: 'Traditional warm salted butter tea in a wooden cup',
    svgFallback: makeSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        <rect width="200" height="200" fill="#FEFCBF"/>
        <!-- Wooden Himalayan Tea Bowl -->
        <path d="M50 80 L62 145 C65 155 80 160 100 160 C120 160 135 155 138 145 L150 80 Z" fill="#7B341E" stroke="#5F370E" stroke-width="4"/>
        <ellipse cx="100" cy="80" rx="50" ry="16" fill="#ECC94B"/>
        <!-- Steam -->
        <path d="M90 60 Q95 45 88 35" stroke="rgba(0,0,0,0.3)" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M110 60 Q115 45 108 35" stroke="rgba(0,0,0,0.3)" stroke-width="3" fill="none" stroke-linecap="round"/>
      </svg>
    `)
  },

  breathing: {
    id: 'breathing',
    nameEn: 'Veranda Breathing & Meditation',
    nameHi: 'सुबह का ध्यान',
    nameRegional: 'পুৱাৰ উশাহ-নিশাহ আৰু ধ্যান',
    category: 'routine',
    photoUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=400&q=80',
    altText: 'Peaceful morning breathing and meditation on the sunny veranda',
    svgFallback: makeSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        <rect width="200" height="200" fill="#E6FFFA"/>
        <!-- Gentle Lotus / Calming Ripple Symbol -->
        <circle cx="100" cy="100" r="60" fill="none" stroke="#319795" stroke-width="3" stroke-dasharray="6,4"/>
        <circle cx="100" cy="100" r="40" fill="none" stroke="#319795" stroke-width="3"/>
        <circle cx="100" cy="100" r="20" fill="#319795"/>
      </svg>
    `)
  },

  newspaper: {
    id: 'newspaper',
    nameEn: 'Morning Newspaper & Music',
    nameHi: 'अखबार और संगीत',
    nameRegional: 'বাতৰিকাকত আৰু সংগীত',
    category: 'routine',
    photoUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=400&q=80',
    altText: 'Morning newspaper and classic radio songs',
    svgFallback: makeSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        <rect width="200" height="200" fill="#EDF2F7"/>
        <!-- Newspaper Fold -->
        <polygon points="35,60 145,45 165,145 55,160" fill="#FFFFFF" stroke="#CBD5E0" stroke-width="2"/>
        <line x1="55" y1="75" x2="135" y2="65" stroke="#718096" stroke-width="4"/>
        <line x1="57" y1="90" x2="137" y2="80" stroke="#A0AEC0" stroke-width="2"/>
        <line x1="59" y1="105" x2="139" y2="95" stroke="#A0AEC0" stroke-width="2"/>
        <line x1="61" y1="120" x2="141" y2="110" stroke="#A0AEC0" stroke-width="2"/>
      </svg>
    `)
  }
};

/**
 * Robust asset resolver that:
 * 1. Checks specific memory IDs (e.g. mem-m-1, mem-t-3, mem-b-5)
 * 2. Checks keyword aliases
 * 3. Categorizes appropriately (person, place, routine, object) so photos match context!
 */
export function getRealLifeAsset(
  key: string = '', 
  category?: string, 
  title?: string
): RealLifeAsset {
  const normKey = (key || '').toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
  const normTitle = (title || '').toLowerCase().trim();
  const normCat = (category || '').toLowerCase().trim();

  // 1. Direct ID lookups
  if (REAL_LIFE_ASSETS[normKey]) return REAL_LIFE_ASSETS[normKey];

  // Meera Memories IDs
  if (normKey === 'mem-m-1' || normKey === 'm-1' || normKey === 'm1') return REAL_LIFE_ASSETS.ananya;
  if (normKey === 'mem-m-2' || normKey === 'm-2' || normKey === 'm2') return REAL_LIFE_ASSETS.rohan;
  if (normKey === 'mem-m-3' || normKey === 'm-3' || normKey === 'm3') return REAL_LIFE_ASSETS.residence;
  if (normKey === 'mem-m-4' || normKey === 'm-4' || normKey === 'm4') return REAL_LIFE_ASSETS.bazaar;
  if (normKey === 'mem-m-5' || normKey === 'm-5' || normKey === 'm5') return REAL_LIFE_ASSETS.cup;
  if (normKey === 'mem-m-6' || normKey === 'm-6' || normKey === 'm6') return REAL_LIFE_ASSETS.flower;
  if (normKey === 'mem-m-7' || normKey === 'm-7' || normKey === 'm7') return REAL_LIFE_ASSETS.cup;
  if (normKey === 'mem-m-8' || normKey === 'm-8' || normKey === 'm8') return REAL_LIFE_ASSETS.medicine;
  if (normKey === 'mem-m-9' || normKey === 'm-9' || normKey === 'm9') return REAL_LIFE_ASSETS.garden_walk;

  // Tenzing Memories IDs
  if (normKey === 'mem-t-1' || normKey === 't-1' || normKey === 't1') return REAL_LIFE_ASSETS.pema_norbu;
  if (normKey === 'mem-t-2' || normKey === 't-2' || normKey === 't2') return REAL_LIFE_ASSETS.dolma;
  if (normKey === 'mem-t-3' || normKey === 't-3' || normKey === 't3') return REAL_LIFE_ASSETS.mountain;
  if (normKey === 'mem-t-4' || normKey === 't-4' || normKey === 't4') return REAL_LIFE_ASSETS.monastery;
  if (normKey === 'mem-t-5' || normKey === 't-5' || normKey === 't5') return REAL_LIFE_ASSETS.prayer_wheel;
  if (normKey === 'mem-t-6' || normKey === 't-6' || normKey === 't6') return REAL_LIFE_ASSETS.butter_tea;
  if (normKey === 'mem-t-7' || normKey === 't-7' || normKey === 't7') return REAL_LIFE_ASSETS.medicine;
  if (normKey === 'mem-t-8' || normKey === 't-8' || normKey === 't8') return REAL_LIFE_ASSETS.breathing;

  // Biren Memories IDs
  if (normKey === 'mem-b-1' || normKey === 'b-1' || normKey === 'b1') return REAL_LIFE_ASSETS.debjani;
  if (normKey === 'mem-b-2' || normKey === 'b-2' || normKey === 'b2') return REAL_LIFE_ASSETS.subir;
  if (normKey === 'mem-b-3' || normKey === 'b-3' || normKey === 'b3') return REAL_LIFE_ASSETS.bungalow;
  if (normKey === 'mem-b-4' || normKey === 'b-4' || normKey === 'b4') return REAL_LIFE_ASSETS.river;
  if (normKey === 'mem-b-5' || normKey === 'b-5' || normKey === 'b5') return REAL_LIFE_ASSETS.pocket_watch;
  if (normKey === 'mem-b-6' || normKey === 'b-6' || normKey === 'b6') return REAL_LIFE_ASSETS.newspaper;
  if (normKey === 'mem-b-7' || normKey === 'b-7' || normKey === 'b7') return REAL_LIFE_ASSETS.medicine;
  if (normKey === 'mem-b-8' || normKey === 'b-8' || normKey === 'b8') return REAL_LIFE_ASSETS.garden_walk;

  const combined = `${normKey} ${normTitle}`.toLowerCase();

  // Specific people keyword checks
  if (combined.includes('ananya') || combined.includes('daughter')) return REAL_LIFE_ASSETS.ananya;
  if (combined.includes('rohan') || combined.includes('grandson')) return REAL_LIFE_ASSETS.rohan;
  if (combined.includes('pema') || combined.includes('sonam') || combined.includes('norbu')) return REAL_LIFE_ASSETS.pema_norbu;
  if (combined.includes('dolma') || combined.includes('granddaughter')) return REAL_LIFE_ASSETS.dolma;
  if (combined.includes('debjani') || combined.includes('teacher')) return REAL_LIFE_ASSETS.debjani;
  if (combined.includes('subir')) return REAL_LIFE_ASSETS.subir;
  if (combined.includes('debabrata') || combined.includes('biren')) return REAL_LIFE_ASSETS.debabrata;

  // Places checks
  if (combined.includes('residence') || combined.includes('house') || combined.includes('home')) return REAL_LIFE_ASSETS.residence;
  if (combined.includes('bazaar') || combined.includes('market')) return REAL_LIFE_ASSETS.bazaar;
  if (combined.includes('kanchenjunga') || combined.includes('ridge') || combined.includes('mountain') || combined.includes('peak')) return REAL_LIFE_ASSETS.mountain;
  if (combined.includes('monastery') || combined.includes('shrine') || combined.includes('enchey')) return REAL_LIFE_ASSETS.monastery;
  if (combined.includes('bungalow') || combined.includes('estate')) return REAL_LIFE_ASSETS.bungalow;
  if (combined.includes('river') || combined.includes('promenade') || combined.includes('barak')) return REAL_LIFE_ASSETS.river;

  // Objects checks
  if (combined.includes('watch') || combined.includes('pocket')) return REAL_LIFE_ASSETS.pocket_watch;
  if (combined.includes('wheel') || combined.includes('mani') || combined.includes('prayer wheel')) return REAL_LIFE_ASSETS.prayer_wheel;
  if (combined.includes('flower') || combined.includes('orchid') || combined.includes('kopou')) return REAL_LIFE_ASSETS.flower;
  if (combined.includes('bell')) return REAL_LIFE_ASSETS.bell;
  if (combined.includes('key')) return REAL_LIFE_ASSETS.key;
  if (combined.includes('basket')) return REAL_LIFE_ASSETS.basket;
  if (combined.includes('book') || combined.includes('prayer') || combined.includes('namputhi')) return REAL_LIFE_ASSETS.book;
  if (combined.includes('jug') || combined.includes('water')) return REAL_LIFE_ASSETS.jug;
  if (combined.includes('gamusa') || combined.includes('scarf')) return REAL_LIFE_ASSETS.gamusa;
  if (combined.includes('glass') || combined.includes('spectacle')) return REAL_LIFE_ASSETS.glasses;
  if (combined.includes('comb')) return REAL_LIFE_ASSETS.comb;
  if (combined.includes('clock') || combined.includes('time')) return REAL_LIFE_ASSETS.clock;
  if (combined.includes('lantern') || combined.includes('chaki')) return REAL_LIFE_ASSETS.lantern;
  if (combined.includes('spoon')) return REAL_LIFE_ASSETS.spoon;
  if (combined.includes('stick') || combined.includes('cane')) return REAL_LIFE_ASSETS.stick;
  if (combined.includes('bag')) return REAL_LIFE_ASSETS.bag;
  if (combined.includes('plate')) return REAL_LIFE_ASSETS.plate;

  // Routine checks
  if (combined.includes('medicine') || combined.includes('tablet') || combined.includes('metformin') || combined.includes('aspirin') || combined.includes('pressure')) return REAL_LIFE_ASSETS.medicine;
  if (combined.includes('butter tea')) return REAL_LIFE_ASSETS.butter_tea;
  if (combined.includes('walk') || combined.includes('garden') || combined.includes('stroll')) return REAL_LIFE_ASSETS.garden_walk;
  if (combined.includes('breathing') || combined.includes('meditation') || combined.includes('breath')) return REAL_LIFE_ASSETS.breathing;
  if (combined.includes('newspaper') || combined.includes('jugasankha') || combined.includes('song')) return REAL_LIFE_ASSETS.newspaper;
  if (combined.includes('tea') || combined.includes('cup') || combined.includes('chai')) return REAL_LIFE_ASSETS.cup;

  // Category-level sensible fallbacks (NEVER return a cup for a person or a place!)
  if (normCat === 'person') return REAL_LIFE_ASSETS.ananya;
  if (normCat === 'place') return REAL_LIFE_ASSETS.residence;
  if (normCat === 'routine') return REAL_LIFE_ASSETS.garden_walk;
  if (normCat === 'object') return REAL_LIFE_ASSETS.cup;

  return REAL_LIFE_ASSETS.cup;
}

interface RealLifeImageProps {
  assetKey: string;
  alt?: string;
  size?: number | string;
  style?: React.CSSProperties;
  className?: string;
  rounded?: boolean;
  category?: string;
  title?: string;
  photoUrl?: string;
}

/**
 * Robust RealLifeImage component with:
 * - High-res real-world photograph
 * - 100% offline fallback to high-fidelity SVG illustration
 * - Smooth fade-in
 * - Accessible alt tags
 */
export const RealLifeImage: React.FC<RealLifeImageProps> = ({
  assetKey,
  alt,
  size = 80,
  style,
  className = '',
  rounded = true,
  category,
  title,
  photoUrl
}) => {
  const asset = getRealLifeAsset(assetKey, category, title);
  const [imgSrc, setImgSrc] = useState<string>(photoUrl || asset.photoUrl);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    setImgSrc(photoUrl || asset.photoUrl);
    setHasError(false);
  }, [photoUrl, asset.photoUrl, assetKey, category, title]);

  const dimension = typeof size === 'number' ? `${size}px` : size;

  const handleImageError = () => {
    // If the Unsplash image fails or device is offline, smoothly switch to the guaranteed SVG illustration
    if (!hasError) {
      setHasError(true);
      setImgSrc(asset.svgFallback);
    }
  };

  return (
    <div
      className={`real-life-img-container ${className}`}
      style={{
        width: dimension,
        height: dimension,
        minWidth: dimension,
        minHeight: dimension,
        borderRadius: rounded ? '14px' : '0px',
        overflow: 'hidden',
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg-surface, #F7FAFC)',
        border: '1.5px solid rgba(0,0,0,0.08)',
        boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
        ...style
      }}
    >
      <img
        src={imgSrc}
        alt={alt || asset.altText}
        loading="lazy"
        onError={handleImageError}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          transition: 'transform 0.2s ease'
        }}
      />
    </div>
  );
};
