import React from 'react';
import '../css/ModeSelectModal.css';

const MODES = [
  {
    id: 'one-way',
    label: 'One way',
    sub: 'Same-direction traffic only',
    desc: 'All vehicles move with you. Overtake slower cars and trucks as you push your speed.',
    icon: (
      <svg viewBox="0 0 64 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="msc-mode-icon">
        <rect x="22" y="0" width="20" height="80" rx="3" fill="currentColor" opacity="0.08"/>
        {/* Road lines */}
        <rect x="30" y="4"  width="4" height="14" rx="2" fill="currentColor" opacity="0.25"/>
        <rect x="30" y="26" width="4" height="14" rx="2" fill="currentColor" opacity="0.25"/>
        <rect x="30" y="48" width="4" height="14" rx="2" fill="currentColor" opacity="0.25"/>
        {/* Car ahead */}
        <rect x="26" y="10" width="12" height="18" rx="3" fill="currentColor" opacity="0.45"/>
        <rect x="28" y="13" width="8" height="7"  rx="2" fill="currentColor" opacity="0.2"/>
        {/* Player bike */}
        <rect x="28" y="48" width="8"  height="16" rx="3" fill="currentColor"/>
        <rect x="29" y="51" width="6"  height="5"  rx="1" fill="currentColor" opacity="0.3"/>
        {/* Arrows — both pointing down */}
        <path d="M18 34 L18 42 M18 42 L15 39 M18 42 L21 39" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
        <path d="M46 34 L46 42 M46 42 L43 39 M46 42 L49 39" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
      </svg>
    ),
  },
  {
    id: 'two-way',
    label: 'Two way',
    sub: 'Oncoming + same-direction traffic',
    desc: 'Face oncoming vehicles head-on while navigating slower traffic behind you. The classic challenge.',
    badge: 'Classic',
    icon: (
      <svg viewBox="0 0 64 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="msc-mode-icon">
        <rect x="10" y="0" width="20" height="80" rx="3" fill="currentColor" opacity="0.06"/>
        <rect x="34" y="0" width="20" height="80" rx="3" fill="currentColor" opacity="0.06"/>
        <line x1="32" y1="0" x2="32" y2="80" stroke="currentColor" strokeWidth="2.5" strokeDasharray="8 6" opacity="0.3"/>
        {/* Oncoming car (top, flipped) */}
        <rect x="14" y="8"  width="12" height="18" rx="3" fill="currentColor" opacity="0.45"/>
        <rect x="16" y="11" width="8"  height="7"  rx="2" fill="currentColor" opacity="0.2"/>
        {/* Same-dir car */}
        <rect x="38" y="14" width="12" height="18" rx="3" fill="currentColor" opacity="0.35"/>
        <rect x="40" y="17" width="8"  height="7"  rx="2" fill="currentColor" opacity="0.18"/>
        {/* Player bike */}
        <rect x="40" y="50" width="8"  height="16" rx="3" fill="currentColor"/>
        <rect x="41" y="53" width="6"  height="5"  rx="1" fill="currentColor" opacity="0.3"/>
        {/* Arrow up (oncoming) */}
        <path d="M20 46 L20 38 M20 38 L17 41 M20 38 L23 41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.55"/>
        {/* Arrow down (same dir) */}
        <path d="M46 38 L46 46 M46 46 L43 43 M46 46 L49 43" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.55"/>
      </svg>
    ),
  },
];

function ModeSelectModal({ onSelect, onClose }) {
  return (
    <div className="msc-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Select game mode">
      <div className="msc-sheet" onClick={e => e.stopPropagation()}>
        <div className="msc-handle" aria-hidden="true" />

        <p className="msc-eyebrow">Choose mode</p>
        <h2 className="msc-heading">How do you want to ride?</h2>

        <div className="msc-cards">
          {MODES.map(mode => (
            <button
              key={mode.id}
              className="msc-card"
              onClick={() => onSelect(mode.id)}
              aria-label={`${mode.label} — ${mode.sub}`}
            >
              {mode.badge && (
                <span className="msc-badge" aria-label="Classic mode">{mode.badge}</span>
              )}
              <div className="msc-card__icon-wrap">
                {mode.icon}
              </div>
              <div className="msc-card__body">
                <span className="msc-card__label">{mode.label}</span>
                <span className="msc-card__sub">{mode.sub}</span>
                <span className="msc-card__desc">{mode.desc}</span>
              </div>
              <div className="msc-card__arrow" aria-hidden="true">›</div>
            </button>
          ))}
        </div>

        <button className="msc-cancel" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

export default ModeSelectModal;