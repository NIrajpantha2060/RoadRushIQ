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

function HomeScreen({ onPlay }) {
  const [activeTab,     setActiveTab]     = useState('home');
  const [showModeModal, setShowModeModal] = useState(false);

  const handlePlayClick = () => {
    setShowModeModal(true);
  };

  const handleModeSelect = (modeId) => {
    setShowModeModal(false);
    onPlay(modeId);
  };

  const handleModalClose = () => {
    setShowModeModal(false);
  };

  return (
    <div className="hs-root">
      {/* Ambient glows */}
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

        <button className="hs-notif-btn" aria-label="Notifications – daily reward available">
          <MdNotifications className="hs-notif-btn__icon" />
          <span className="hs-notif-btn__dot" aria-hidden="true" />
        </button>
      </header>

      {/* ── MAIN STAGE ── */}
      <main className="hs-stage">
        <span className="hs-stage__eyebrow">Current Vehicle</span>

        {/* Car display card */}
        <div className="hs-car-card">
          <div className="hs-car-card__shine" aria-hidden="true" />

          <svg
            className="hs-car-svg"
            viewBox="0 0 320 140"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Blue Blaze Runner car"
          >
            <ellipse cx="160" cy="118" rx="100" ry="8" fill="rgba(0,0,0,0.4)" />
            <rect x="30" y="72" width="260" height="42" rx="8" fill="#2a6dd9" />
            <path d="M90 72 L110 38 L210 38 L230 72 Z" fill="#1e54b0" />
            <path d="M115 70 L128 45 L192 45 L205 70 Z" fill="rgba(180,230,255,0.75)" />
            <rect x="96" y="48" width="28" height="22" rx="3" fill="rgba(180,230,255,0.6)" />
            <rect x="196" y="48" width="28" height="22" rx="3" fill="rgba(180,230,255,0.6)" />
            <rect x="18" y="88" width="24" height="14" rx="5" fill="#1a4fa0" />
            <rect x="278" y="88" width="24" height="14" rx="5" fill="#1a4fa0" />
            <line x1="160" y1="73" x2="160" y2="114" stroke="rgba(0,0,0,0.18)" strokeWidth="1.5" />
            <circle cx="85"  cy="114" r="20" fill="#1a1a2e" />
            <circle cx="85"  cy="114" r="13" fill="#2d2d4a" />
            <circle cx="85"  cy="114" r="6"  fill="#c0c8d8" />
            <circle cx="235" cy="114" r="20" fill="#1a1a2e" />
            <circle cx="235" cy="114" r="13" fill="#2d2d4a" />
            <circle cx="235" cy="114" r="6"  fill="#c0c8d8" />
            <rect x="285" y="84" width="14" height="8" rx="3" fill="rgba(255,240,120,0.9)" />
            <rect x="20"  y="84" width="14" height="8" rx="3" fill="rgba(255,100,100,0.7)" />
            <path d="M110 72 Q130 60 190 60 L205 72" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2" />
          </svg>

          <div className="hs-car-card__road" aria-hidden="true" />
        </div>

        <h1 className="hs-car-name">Blaze Runner</h1>

        {/* Score pills */}
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

        {/* Play — opens mode picker */}
        <button className="hs-play-btn" aria-label="Play" onClick={handlePlayClick}>
          <FaPlay className="hs-play-btn__icon" aria-hidden="true" />
          <span>Play</span>
        </button>
      </main>

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