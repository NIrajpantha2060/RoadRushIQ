// import React, { useState } from 'react';
// import {
//   MdHome,
//   MdSettings,
//   MdLeaderboard,
//   MdNotifications,
//   MdDiamond,
// } from 'react-icons/md';
// import {
//   FaCar,
//   FaShoppingCart,
//   FaBrain,
//   FaPlay,
//   FaCoins,
//   FaGem,
//   FaUserCircle,
// } from 'react-icons/fa';
// import ModeSelectModal from './ModeSelectModal';
// import '../css/HomeScreen.css';

// const NAV_ITEMS = [
//   { id: 'home',     Icon: MdHome,        label: 'Home'     },
//   { id: 'garage',   Icon: FaCar,          label: 'Garage'   },
//   { id: 'shop',     Icon: FaShoppingCart, label: 'Shop'     },
//   { id: 'iq',       Icon: FaBrain,        label: 'IQ'       },
//   { id: 'settings', Icon: MdSettings,     label: 'Settings' },
// ];

// function HomeScreen({ onPlay }) {
//   const [activeTab,     setActiveTab]     = useState('home');
//   const [showModeModal, setShowModeModal] = useState(false);

//   const handlePlayClick = () => {
//     setShowModeModal(true);
//   };

//   const handleModeSelect = (modeId) => {
//     setShowModeModal(false);
//     onPlay(modeId);
//   };

//   const handleModalClose = () => {
//     setShowModeModal(false);
//   };

//   return (
//     <div className="hs-root">
//       {/* Ambient glows */}
//       <div className="hs-glow hs-glow--tl" aria-hidden="true" />
//       <div className="hs-glow hs-glow--br" aria-hidden="true" />

//       {/* ── TOP BAR ── */}
//       <header className="hs-topbar">
//         <button className="hs-profile-btn" aria-label="Profile">
//           <FaUserCircle className="hs-profile-btn__icon" />
//         </button>

//         <div className="hs-resources" aria-label="Resources">
//           <div className="hs-chip hs-chip--gold">
//             <FaCoins className="hs-chip__icon" />
//             <span className="hs-chip__val">12,450</span>
//           </div>
//           <div className="hs-chip hs-chip--blue">
//             <FaGem className="hs-chip__icon" />
//             <span className="hs-chip__val">340</span>
//           </div>
//           <div className="hs-chip hs-chip--red">
//             <MdDiamond className="hs-chip__icon" />
//             <span className="hs-chip__val">18</span>
//           </div>
//         </div>

//         <button className="hs-notif-btn" aria-label="Notifications – daily reward available">
//           <MdNotifications className="hs-notif-btn__icon" />
//           <span className="hs-notif-btn__dot" aria-hidden="true" />
//         </button>
//       </header>

//       {/* ── MAIN STAGE ── */}
//       <main className="hs-stage">
//         <span className="hs-stage__eyebrow">Current Vehicle</span>

//         {/* Car display card */}
//         <div className="hs-car-card">
//           <div className="hs-car-card__shine" aria-hidden="true" />

//           <svg
//             className="hs-car-svg"
//             viewBox="0 0 320 140"
//             xmlns="http://www.w3.org/2000/svg"
//             aria-label="Blue Blaze Runner car"
//           >
//             <ellipse cx="160" cy="118" rx="100" ry="8" fill="rgba(0,0,0,0.4)" />
//             <rect x="30" y="72" width="260" height="42" rx="8" fill="#2a6dd9" />
//             <path d="M90 72 L110 38 L210 38 L230 72 Z" fill="#1e54b0" />
//             <path d="M115 70 L128 45 L192 45 L205 70 Z" fill="rgba(180,230,255,0.75)" />
//             <rect x="96" y="48" width="28" height="22" rx="3" fill="rgba(180,230,255,0.6)" />
//             <rect x="196" y="48" width="28" height="22" rx="3" fill="rgba(180,230,255,0.6)" />
//             <rect x="18" y="88" width="24" height="14" rx="5" fill="#1a4fa0" />
//             <rect x="278" y="88" width="24" height="14" rx="5" fill="#1a4fa0" />
//             <line x1="160" y1="73" x2="160" y2="114" stroke="rgba(0,0,0,0.18)" strokeWidth="1.5" />
//             <circle cx="85"  cy="114" r="20" fill="#1a1a2e" />
//             <circle cx="85"  cy="114" r="13" fill="#2d2d4a" />
//             <circle cx="85"  cy="114" r="6"  fill="#c0c8d8" />
//             <circle cx="235" cy="114" r="20" fill="#1a1a2e" />
//             <circle cx="235" cy="114" r="13" fill="#2d2d4a" />
//             <circle cx="235" cy="114" r="6"  fill="#c0c8d8" />
//             <rect x="285" y="84" width="14" height="8" rx="3" fill="rgba(255,240,120,0.9)" />
//             <rect x="20"  y="84" width="14" height="8" rx="3" fill="rgba(255,100,100,0.7)" />
//             <path d="M110 72 Q130 60 190 60 L205 72" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2" />
//           </svg>

//           <div className="hs-car-card__road" aria-hidden="true" />
//         </div>

//         <h1 className="hs-car-name">Blaze Runner</h1>

//         {/* Score pills */}
//         <div className="hs-stat-row" aria-label="Stats">
//           <div className="hs-stat-pill">
//             <span className="hs-stat-pill__dot hs-stat-pill__dot--gold" aria-hidden="true" />
//             <span className="hs-stat-pill__label">Best</span>
//             <span className="hs-stat-pill__val">48,200</span>
//           </div>
//           <div className="hs-stat-pill">
//             <MdLeaderboard className="hs-stat-pill__icon" aria-hidden="true" />
//             <span className="hs-stat-pill__label">Rank</span>
//             <span className="hs-stat-pill__val">#142</span>
//           </div>
//         </div>

//         {/* Play — opens mode picker */}
//         <button className="hs-play-btn" aria-label="Play" onClick={handlePlayClick}>
//           <FaPlay className="hs-play-btn__icon" aria-hidden="true" />
//           <span>Play</span>
//         </button>
//       </main>

//       {/* ── BOTTOM NAV ── */}
//       <nav className="hs-nav" aria-label="Main navigation">
//         {NAV_ITEMS.map(({ id, Icon, label }, i) => (
//           <React.Fragment key={id}>
//             <button
//               className={`hs-nav-item${activeTab === id ? ' hs-nav-item--active' : ''}`}
//               onClick={() => setActiveTab(id)}
//               aria-label={label}
//               aria-current={activeTab === id ? 'page' : undefined}
//             >
//               <Icon className="hs-nav-item__icon" aria-hidden="true" />
//               <span className="hs-nav-item__label">{label}</span>
//             </button>
//             {i < NAV_ITEMS.length - 1 && (
//               <div className="hs-nav-divider" aria-hidden="true" />
//             )}
//           </React.Fragment>
//         ))}
//       </nav>

//       {/* ── MODE SELECT MODAL ── */}
//       {showModeModal && (
//         <ModeSelectModal
//           onSelect={handleModeSelect}
//           onClose={handleModalClose}
//         />
//       )}
//     </div>
//   );
// }

// export default HomeScreen;

import React, { useState } from 'react';
import {
  MdHome,
  MdSettings,
  MdLeaderboard,
  MdNotifications,
  MdDiamond,
} from 'react-icons/md';
import {
  FaCar,
  FaShoppingCart,
  FaBrain,
  FaPlay,
  FaCoins,
  FaGem,
  FaUserCircle,
  FaShieldAlt,
  FaMagnet,
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa';
import ModeSelectModal from './ModeSelectModal';
import '../css/HomeScreen.css';

const NAV_ITEMS = [
  { id: 'home',     Icon: MdHome,        label: 'Home'     },
  { id: 'garage',   Icon: FaCar,          label: 'Garage'   },
  { id: 'shop',     Icon: FaShoppingCart, label: 'Shop'     },
  { id: 'iq',       Icon: FaBrain,        label: 'IQ'       },
  { id: 'settings', Icon: MdSettings,     label: 'Settings' },
];

// ── Bike catalogue — mirrors BikeConfig.js ─────────────────────────────────
// locked: false for all bikes during testing — re-enable later with backend
const BIKE_CATALOGUE = [
  {
    id:          'skooter',
    name:        'Skooter',
    tagline:     'The starter ride',
    unlockCost:  0,
    locked:      false,
    power:       null,
    accentColor: '#f7931e',
    svgFill:     '#f7931e',
  },
  {
    id:          'aveengeer',
    name:        'Aveengeer',
    tagline:     'Built for the impossible',
    unlockCost:  5000,
    locked:      false,   // TODO: set true when backend shop is ready
    power: {
      name:  'Shield',
      icon:  FaShieldAlt,
      color: '#00c3ff',
      desc:  '6s invincibility + speed boost · 25s cooldown',
    },
    accentColor: '#00c3ff',
    svgFill:     '#00c3ff',
  },
  {
    id:          'krossfire',
    name:        'Kross Fire',
    tagline:     'Coins come to you',
    unlockCost:  8000,
    locked:      false,   // TODO: set true when backend shop is ready
    power: {
      name:  'Magnet',
      icon:  FaMagnet,
      color: '#f7c948',
      desc:  'Pulls nearby coins for 8s · 35s cooldown',
    },
    accentColor: '#f7c948',
    svgFill:     '#f7c948',
  },
];

// ── Inline bike SVG ────────────────────────────────────────────────────────
function BikeSVG({ fill = '#f7931e', size = 56 }) {
  return (
    <svg
      width={size}
      height={size * 1.6}
      viewBox="0 0 28 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <ellipse cx="14" cy="38" rx="7"   ry="4"   fill="#111122" />
      <ellipse cx="14" cy="38" rx="4.5" ry="2.6" fill="#3a3a5c" />
      <circle  cx="14" cy="38" r="1.5"            fill="#888899" opacity="0.7" />
      <ellipse cx="14" cy="6"  rx="6"   ry="3.5" fill="#111122" />
      <ellipse cx="14" cy="6"  rx="4"   ry="2.2" fill="#3a3a5c" />
      <circle  cx="14" cy="6"  r="1.2"            fill="#888899" opacity="0.7" />
      <rect x="10"   y="10" width="8"  height="22" rx="3"   fill={fill} />
      <rect x="10.5" y="10" width="7"  height="10" rx="2.5" fill={fill} opacity="0.75" />
      <rect x="11.5" y="4"  width="5"  height="5"  rx="1.5" fill="#7ec8e3" opacity="0.75" />
      <rect x="11.5" y="2"  width="5"  height="3"  rx="1"   fill="#fff5aa" opacity="0.9" />
      <rect x="11.5" y="32" width="5"  height="2.5" rx="1"  fill="#ff3333" opacity="0.85" />
      <circle cx="14"   cy="15" r="3.5"              fill="#2c3e50" />
      <rect   x="11.5"  y="13" width="5" height="3"  rx="1"   fill="#3d5166" />
      <rect   x="12"    y="14" width="4" height="1.5" rx="0.5" fill="#7ec8e3" opacity="0.6" />
      <rect x="18"  y="12" width="2.5" height="7" rx="1" fill="#888899" opacity="0.8" />
      <rect x="7.5" y="12" width="2.5" height="7" rx="1" fill="#888899" opacity="0.8" />
    </svg>
  );
}

// ── Active bike display card (home stage) ─────────────────────────────────
function ActiveBikeCard({ bike }) {
  return (
    <div className="hs-car-card">
      <div className="hs-car-card__shine" aria-hidden="true" />
      <div className="hs-bike-display" style={{ '--bike-glow': bike.accentColor }}>
        <BikeSVG fill={bike.accentColor} size={80} />
      </div>
      {bike.power && (
        <div
          className="hs-bike-power-badge"
          style={{ '--badge-color': bike.power.color }}
        >
          <bike.power.icon style={{ fontSize: 11 }} />
          <span>{bike.power.name}</span>
        </div>
      )}
      <div className="hs-car-card__road" aria-hidden="true" />
    </div>
  );
}

// ── Garage panel ──────────────────────────────────────────────────────────
function GaragePanel({ selectedBike, onBikeSelect }) {
  return (
    <div className="hs-garage">
      <p className="hs-garage__eyebrow">Your collection</p>
      <h2 className="hs-garage__heading">Garage</h2>

      <div className="hs-garage__list">
        {BIKE_CATALOGUE.map(bike => {
          const isSelected = selectedBike === bike.id;

          return (
            <div
              key={bike.id}
              className={[
                'hs-bike-card',
                isSelected ? 'hs-bike-card--selected' : '',
              ].join(' ')}
              style={{ '--bike-accent': bike.accentColor }}
              onClick={() => onBikeSelect(bike.id)}
              role="button"
              tabIndex={0}
              aria-label={`${bike.name}${isSelected ? ' – equipped' : ' – equip'}`}
              onKeyDown={e => e.key === 'Enter' && onBikeSelect(bike.id)}
            >
              {/* Left: bike graphic */}
              <div className="hs-bike-card__icon">
                <BikeSVG fill={bike.accentColor} size={38} />
              </div>

              {/* Centre: info */}
              <div className="hs-bike-card__body">
                <div className="hs-bike-card__name-row">
                  <span className="hs-bike-card__name">{bike.name}</span>
                  {bike.power ? (
                    <span
                      className="hs-bike-card__power-chip"
                      style={{ '--chip-color': bike.power.color }}
                    >
                      <bike.power.icon style={{ fontSize: 9 }} />
                      {bike.power.name}
                    </span>
                  ) : (
                    <span className="hs-bike-card__power-chip hs-bike-card__power-chip--none">
                      No power
                    </span>
                  )}
                </div>
                <span className="hs-bike-card__tagline">{bike.tagline}</span>
                {bike.power && (
                  <span className="hs-bike-card__power-desc">{bike.power.desc}</span>
                )}
              </div>

              {/* Right: status */}
              <div className="hs-bike-card__status">
                {isSelected ? (
                  <div className="hs-bike-card__equipped">
                    <FaCheckCircle className="hs-bike-card__check" />
                    <span>Equipped</span>
                  </div>
                ) : (
                  <button
                    className="hs-bike-card__equip-btn"
                    onClick={e => { e.stopPropagation(); onBikeSelect(bike.id); }}
                    aria-label={`Equip ${bike.name}`}
                  >
                    Equip
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── HomeScreen ─────────────────────────────────────────────────────────────
function HomeScreen({ onPlay, selectedBike = 'skooter', onBikeSelect }) {
  const [activeTab,     setActiveTab]     = useState('home');
  const [showModeModal, setShowModeModal] = useState(false);

  const currentIndex   = BIKE_CATALOGUE.findIndex(b => b.id === selectedBike);
  const activeBikeData = BIKE_CATALOGUE[currentIndex] ?? BIKE_CATALOGUE[0];

  const handlePrevBike = () => {
    const prev = (currentIndex - 1 + BIKE_CATALOGUE.length) % BIKE_CATALOGUE.length;
    onBikeSelect(BIKE_CATALOGUE[prev].id);
  };

  const handleNextBike = () => {
    const next = (currentIndex + 1) % BIKE_CATALOGUE.length;
    onBikeSelect(BIKE_CATALOGUE[next].id);
  };

  const handlePlayClick  = () => setShowModeModal(true);
  const handleModeSelect = (modeId) => { setShowModeModal(false); onPlay(modeId); };
  const handleModalClose = () => setShowModeModal(false);

  return (
    <div className="hs-root">
      <div className="hs-glow hs-glow--tl" aria-hidden="true" />
      <div className="hs-glow hs-glow--br" aria-hidden="true" />

      {/* ── TOP BAR ── */}
      <header className="hs-topbar">
        <button className="hs-profile-btn" aria-label="Profile">
          <FaUserCircle className="hs-profile-btn__icon" />
        </button>

        <div className="hs-resources" aria-label="Resources">
          <div className="hs-chip hs-chip--gold">
            <FaCoins className="hs-chip__icon" />
            <span className="hs-chip__val">12,450</span>
          </div>
          <div className="hs-chip hs-chip--blue">
            <FaGem className="hs-chip__icon" />
            <span className="hs-chip__val">340</span>
          </div>
          <div className="hs-chip hs-chip--red">
            <MdDiamond className="hs-chip__icon" />
            <span className="hs-chip__val">18</span>
          </div>
        </div>

        <button className="hs-notif-btn" aria-label="Notifications">
          <MdNotifications className="hs-notif-btn__icon" />
          <span className="hs-notif-btn__dot" aria-hidden="true" />
        </button>
      </header>

      {/* ── MAIN AREA ── */}
      {activeTab === 'garage' ? (
        <GaragePanel
          selectedBike={selectedBike}
          onBikeSelect={onBikeSelect}
        />
      ) : (
        <main className="hs-stage">
          <span className="hs-stage__eyebrow">Current Vehicle</span>

          {/* Bike switcher row */}
          <div className="hs-bike-switcher">
            <button
              className="hs-bike-switcher__arrow"
              onClick={handlePrevBike}
              aria-label="Previous bike"
            >
              <FaChevronLeft />
            </button>

            <ActiveBikeCard bike={activeBikeData} />

            <button
              className="hs-bike-switcher__arrow"
              onClick={handleNextBike}
              aria-label="Next bike"
            >
              <FaChevronRight />
            </button>
          </div>

          {/* Dot indicators */}
          <div className="hs-bike-dots" aria-hidden="true">
            {BIKE_CATALOGUE.map((b, i) => (
              <button
                key={b.id}
                className={`hs-bike-dot${i === currentIndex ? ' hs-bike-dot--active' : ''}`}
                style={{ '--dot-color': b.accentColor }}
                onClick={() => onBikeSelect(b.id)}
                aria-label={`Select ${b.name}`}
              />
            ))}
          </div>

          <h1 className="hs-car-name" style={{ color: activeBikeData.accentColor }}>
            {activeBikeData.name}
          </h1>

          {/* Power-up hint */}
          {activeBikeData.power ? (
            <div
              className="hs-active-power-hint"
              style={{ '--hint-color': activeBikeData.power.color }}
            >
              <activeBikeData.power.icon style={{ fontSize: 13 }} />
              <span>
                <strong>{activeBikeData.power.name}</strong> — press SPACE in-game
              </span>
            </div>
          ) : (
            <div className="hs-active-power-hint hs-active-power-hint--none">
              <span>No power-up · Basic ride</span>
            </div>
          )}

          {/* Stat pills */}
          <div className="hs-stat-row" aria-label="Stats">
            <div className="hs-stat-pill">
              <span className="hs-stat-pill__dot hs-stat-pill__dot--gold" aria-hidden="true" />
              <span className="hs-stat-pill__label">Best</span>
              <span className="hs-stat-pill__val">48,200</span>
            </div>
            <div className="hs-stat-pill">
              <MdLeaderboard className="hs-stat-pill__icon" aria-hidden="true" />
              <span className="hs-stat-pill__label">Rank</span>
              <span className="hs-stat-pill__val">#142</span>
            </div>
          </div>

          {/* Play button */}
          <button className="hs-play-btn" aria-label="Play" onClick={handlePlayClick}>
            <FaPlay className="hs-play-btn__icon" aria-hidden="true" />
            <span>Play</span>
          </button>
        </main>
      )}

      {/* ── BOTTOM NAV ── */}
      <nav className="hs-nav" aria-label="Main navigation">
        {NAV_ITEMS.map(({ id, Icon, label }, i) => (
          <React.Fragment key={id}>
            <button
              className={`hs-nav-item${activeTab === id ? ' hs-nav-item--active' : ''}`}
              onClick={() => setActiveTab(id)}
              aria-label={label}
              aria-current={activeTab === id ? 'page' : undefined}
            >
              <Icon className="hs-nav-item__icon" aria-hidden="true" />
              <span className="hs-nav-item__label">{label}</span>
            </button>
            {i < NAV_ITEMS.length - 1 && (
              <div className="hs-nav-divider" aria-hidden="true" />
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* ── MODE SELECT MODAL ── */}
      {showModeModal && (
        <ModeSelectModal
          onSelect={handleModeSelect}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}

export default HomeScreen;