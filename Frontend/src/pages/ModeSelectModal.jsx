import { UNLOCKS, getUnlockedMap } from '../game/progressionConfig';
import '../css/ModeSelectModal.css';

const MODE_VISUALS = {
  'one-way': {
    icon: (
      <svg viewBox="0 0 64 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="msc-mode-icon">
        <rect x="22" y="0" width="20" height="80" rx="3" fill="currentColor" opacity="0.08"/>
        <rect x="30" y="4"  width="4" height="14" rx="2" fill="currentColor" opacity="0.25"/>
        <rect x="30" y="26" width="4" height="14" rx="2" fill="currentColor" opacity="0.25"/>
        <rect x="30" y="48" width="4" height="14" rx="2" fill="currentColor" opacity="0.25"/>
        <rect x="26" y="10" width="12" height="18" rx="3" fill="currentColor" opacity="0.45"/>
        <rect x="28" y="13" width="8" height="7"  rx="2" fill="currentColor" opacity="0.2"/>
        <rect x="28" y="48" width="8"  height="16" rx="3" fill="currentColor"/>
        <rect x="29" y="51" width="6"  height="5"  rx="1" fill="currentColor" opacity="0.3"/>
        <path d="M18 34 L18 42 M18 42 L15 39 M18 42 L21 39" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
        <path d="M46 34 L46 42 M46 42 L43 39 M46 42 L49 39" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
      </svg>
    ),
  },
  'two-way': {
    icon: (
      <svg viewBox="0 0 64 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="msc-mode-icon">
        <rect x="10" y="0" width="20" height="80" rx="3" fill="currentColor" opacity="0.06"/>
        <rect x="34" y="0" width="20" height="80" rx="3" fill="currentColor" opacity="0.06"/>
        <line x1="32" y1="0" x2="32" y2="80" stroke="currentColor" strokeWidth="2.5" strokeDasharray="8 6" opacity="0.3"/>
        <rect x="14" y="8"  width="12" height="18" rx="3" fill="currentColor" opacity="0.45"/>
        <rect x="16" y="11" width="8"  height="7"  rx="2" fill="currentColor" opacity="0.2"/>
        <rect x="38" y="14" width="12" height="18" rx="3" fill="currentColor" opacity="0.35"/>
        <rect x="40" y="17" width="8"  height="7"  rx="2" fill="currentColor" opacity="0.18"/>
        <rect x="40" y="50" width="8"  height="16" rx="3" fill="currentColor"/>
        <rect x="41" y="53" width="6"  height="5"  rx="1" fill="currentColor" opacity="0.3"/>
        <path d="M20 46 L20 38 M20 38 L17 41 M20 38 L23 41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.55"/>
        <path d="M46 38 L46 46 M46 46 L43 43 M46 46 L49 43" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.55"/>
      </svg>
    ),
  },
};

const MODES = UNLOCKS.modes.map((mode) => ({
  ...mode,
  ...MODE_VISUALS[mode.id],
}));

function ModeSelectModal({ onSelect, onClose, user, onUnlockItem }) {
  const progression = user?.progression ?? {};
  const unlockedMap = getUnlockedMap(user?.unlocks ?? []);

  return (
    <div className="msc-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Select game mode">
      <div className="msc-sheet" onClick={e => e.stopPropagation()}>
        <div className="msc-handle" aria-hidden="true" />

        <p className="msc-eyebrow">Choose mode</p>
        <h2 className="msc-heading">How do you want to ride?</h2>

        <div className="msc-cards">
          {MODES.map(mode => (
            <div
              key={mode.id}
              className={`msc-card${mode.badge ? ' msc-card--featured' : ''}`}
              role="group"
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
                <span className="msc-card__requirements">
                  Requires level {mode.requiredLevel} and {mode.requiredCoins.toLocaleString()} coins
                </span>
              </div>
              <div className="msc-card__actions">
                {(() => {
                  const isUnlocked = unlockedMap.get(mode.id)?.isUnlocked ?? mode.defaultUnlocked;
                  const canUnlock = progression.level >= mode.requiredLevel && progression.coins >= mode.requiredCoins;

                  if (isUnlocked) {
                    return (
                      <button
                        className="msc-card__primary-btn"
                        onClick={() => onSelect(mode.id)}
                        aria-label={`Play ${mode.label}`}
                      >
                        Play
                      </button>
                    );
                  }

                  if (canUnlock) {
                    return (
                      <button
                        className="msc-card__primary-btn msc-card__primary-btn--unlock"
                        onClick={() => onUnlockItem?.(mode.id)}
                        aria-label={`Unlock ${mode.label}`}
                      >
                        Unlock
                      </button>
                    );
                  }

                  return <span className="msc-card__locked-state">Locked</span>;
                })()}
                <div className="msc-card__arrow" aria-hidden="true">›</div>
              </div>
            </div>
          ))}
        </div>

        <button className="msc-cancel" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

export default ModeSelectModal;