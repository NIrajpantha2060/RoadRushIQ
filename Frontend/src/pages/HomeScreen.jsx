import React, { useState } from 'react';
import {
  MdHome,
  MdSettings,
  MdLeaderboard,
  MdNotifications,
  MdDiamond,
  MdCardGiftcard,
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
import DailyRewards    from './DailyRewards';
import { UNLOCKS, getUnlockedMap } from '../game/progressionConfig';
import '../css/HomeScreen.css';

const NAV_ITEMS = [
  { id: 'home',     Icon: MdHome,        label: 'Home'     },
  { id: 'garage',   Icon: FaCar,          label: 'Garage'   },
  { id: 'shop',     Icon: FaShoppingCart, label: 'Shop'     },
  { id: 'iq',       Icon: FaBrain,        label: 'IQ'       },
  { id: 'settings', Icon: MdSettings,     label: 'Settings' },
];

const BIKE_CATALOGUE = UNLOCKS.bikes;

function getBikePowerIcon(powerName) {
  if (powerName === 'Shield') return FaShieldAlt;
  if (powerName === 'Magnet') return FaMagnet;
  return null;
}

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
              {(() => {
                const Icon = getBikePowerIcon(bike.power.name);
                return Icon ? <Icon style={{ fontSize: 11 }} /> : null;
              })()}
          <span>{bike.power.name}</span>
        </div>
      )}
      <div className="hs-car-card__road" aria-hidden="true" />
    </div>
  );
}

function GaragePanel({ selectedBike, onBikeSelect, onUnlockItem, progression, user }) {
  const unlockedMap = getUnlockedMap(user?.unlocks ?? []);

  return (
    <div className="hs-garage">
      <p className="hs-garage__eyebrow">Your collection</p>
      <h2 className="hs-garage__heading">Garage</h2>
      <div className="hs-garage__list">
        {BIKE_CATALOGUE.map(bike => {
          const isSelected = selectedBike === bike.id;
          const unlockState = unlockedMap.get(bike.id);
          const isUnlocked = unlockState?.isUnlocked ?? bike.defaultUnlocked;
          const canUnlock = progression && progression.level >= bike.requiredLevel && progression.coins >= bike.requiredCoins;
          return (
            <div
              key={bike.id}
              className={['hs-bike-card', isSelected ? 'hs-bike-card--selected' : '', !isUnlocked ? 'hs-bike-card--locked' : ''].join(' ')}
              style={{ '--bike-accent': bike.accentColor }}
              onClick={() => isUnlocked && onBikeSelect(bike.id)}
              role="button"
              tabIndex={0}
              aria-label={`${bike.name}${isSelected ? ' – equipped' : isUnlocked ? ' – equip' : ' – locked'}`}
              onKeyDown={e => e.key === 'Enter' && isUnlocked && onBikeSelect(bike.id)}
            >
              <div className="hs-bike-card__icon">
                <BikeSVG fill={bike.accentColor} size={38} />
              </div>
              <div className="hs-bike-card__body">
                <div className="hs-bike-card__name-row">
                  <span className="hs-bike-card__name">{bike.name}</span>
                  {bike.power ? (
                    <span className="hs-bike-card__power-chip" style={{ '--chip-color': bike.power.color }}>
                      {(() => {
                        const Icon = getBikePowerIcon(bike.power.name);
                        return Icon ? <Icon style={{ fontSize: 9 }} /> : null;
                      })()}
                      {bike.power.name}
                    </span>
                  ) : (
                    <span className="hs-bike-card__power-chip hs-bike-card__power-chip--none">No power</span>
                  )}
                </div>
                <span className="hs-bike-card__tagline">{bike.tagline}</span>
                {bike.power && (
                  <span className="hs-bike-card__power-desc">{bike.power.desc}</span>
                )}
                {!isUnlocked && (
                  <span className="hs-bike-card__requirements">
                    Requires level {bike.requiredLevel} and {bike.requiredCoins.toLocaleString()} coins
                  </span>
                )}
              </div>
              <div className="hs-bike-card__status">
                {isSelected ? (
                  <div className="hs-bike-card__equipped">
                    <FaCheckCircle className="hs-bike-card__check" />
                    <span>Equipped</span>
                  </div>
                ) : !isUnlocked ? (
                  canUnlock ? (
                    <button
                      className="hs-bike-card__unlock-btn"
                      onClick={async e => {
                        e.stopPropagation();
                        await onUnlockItem?.(bike.id);
                        await onBikeSelect?.(bike.id);
                      }}
                      aria-label={`Unlock ${bike.name}`}
                    >
                      Unlock
                    </button>
                  ) : (
                    <div className="hs-bike-card__locked-state">
                      <span>Locked</span>
                    </div>
                  )
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

function ProgressionStrip({ progression = {} }) {
  const level = progression.level ?? 1;
  const currentXp = progression.currentXp ?? 0;
  const xpForNextLevel = progression.xpForNextLevel ?? 0;
  const progressPercent = progression.progressPercent ?? 0;

  return (
    <div className="hs-progress-strip" aria-label="Player progression">
      <div className="hs-progress-strip__meta">
        <span className="hs-progress-strip__level">Level {level}</span>
        <span className="hs-progress-strip__xp">{currentXp.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP</span>
      </div>
      <div className="hs-progress-strip__bar" aria-hidden="true">
        <div className="hs-progress-strip__fill" style={{ width: `${progressPercent}%` }} />
      </div>
    </div>
  );
}

// ── HomeScreen ─────────────────────────────────────────────────────────────
function HomeScreen({ onPlay, selectedBike = 'skooter', onBikeSelect, onUnlockItem, user, onUserUpdated }) {
  const [activeTab,       setActiveTab]       = useState('home');
  const [showModeModal,   setShowModeModal]   = useState(false);
  const [showDailyRewards, setShowDailyRewards] = useState(false);

  const unlockedMap   = getUnlockedMap(user?.unlocks ?? []);
  const currentIndex   = BIKE_CATALOGUE.findIndex(b => b.id === selectedBike);
  const activeBikeData = BIKE_CATALOGUE[currentIndex] ?? BIKE_CATALOGUE[0];
  const progression    = user?.progression ?? {};

  const isBikeUnlocked = (bikeId) => {
    const bike = BIKE_CATALOGUE.find((item) => item.id === bikeId);
    return unlockedMap.get(bikeId)?.isUnlocked ?? bike?.defaultUnlocked ?? false;
  };

  const findNextUnlockedBike = (direction) => {
    let index = currentIndex;

    for (let i = 0; i < BIKE_CATALOGUE.length; i += 1) {
      index = (index + direction + BIKE_CATALOGUE.length) % BIKE_CATALOGUE.length;
      if (isBikeUnlocked(BIKE_CATALOGUE[index].id)) {
        return BIKE_CATALOGUE[index].id;
      }
    }

    return selectedBike;
  };

  const handlePrevBike = () => {
    const prevBikeId = findNextUnlockedBike(-1);
    if (prevBikeId !== selectedBike) {
      onBikeSelect(prevBikeId);
    }
  };

  const handleNextBike = () => {
    const nextBikeId = findNextUnlockedBike(1);
    if (nextBikeId !== selectedBike) {
      onBikeSelect(nextBikeId);
    }
  };

  const handlePlayClick  = () => setShowModeModal(true);
  const handleModeSelect = (modeId) => { setShowModeModal(false); onPlay(modeId); };
  const handleModalClose = () => setShowModeModal(false);

  const handleRewardClaimed = (response) => {
    if (response?.profile && onUserUpdated) {
      onUserUpdated(response.profile);
    }
  };

  return (
    <div className="hs-root">
      <div className="hs-glow hs-glow--tl" aria-hidden="true" />
      <div className="hs-glow hs-glow--br" aria-hidden="true" />

      {/* ── TOP BAR ── */}
      <header className="hs-topbar">
        <div className="hs-topbar-left">
          <button className="hs-profile-btn" aria-label="Profile">
            {user?.avatar_url
              ? <img src={user.avatar_url} alt={user.display_name} className="hs-profile-btn__avatar" />
              : <FaUserCircle className="hs-profile-btn__icon" />
            }
          </button>

          <ProgressionStrip progression={progression} />
        </div>

        <div className="hs-resources" aria-label="Resources">
          <div className="hs-chip hs-chip--gold">
            <FaCoins className="hs-chip__icon" />
            <span className="hs-chip__val">{user?.coins?.toLocaleString() ?? '—'}</span>
          </div>
          <div className="hs-chip hs-chip--blue">
            <FaGem className="hs-chip__icon" />
            <span className="hs-chip__val">{user?.blue_diamonds?.toLocaleString() ?? '—'}</span>
          </div>
          <div className="hs-chip hs-chip--red">
            <MdDiamond className="hs-chip__icon" />
            <span className="hs-chip__val">{user?.red_diamonds?.toLocaleString() ?? '—'}</span>
          </div>
        </div>

        <div className="hs-topbar-right">
          {/* Daily Rewards button */}
          <button
            className="hs-daily-btn"
            aria-label="Daily Rewards"
            onClick={() => setShowDailyRewards(true)}
          >
            <MdCardGiftcard className="hs-daily-btn__icon" />
            <span className="hs-daily-btn__dot" aria-hidden="true" />
          </button>

          <button className="hs-notif-btn" aria-label="Notifications">
            <MdNotifications className="hs-notif-btn__icon" />
            <span className="hs-notif-btn__dot" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* ── MAIN AREA ── */}
      {activeTab === 'garage' ? (
        <GaragePanel
          selectedBike={selectedBike}
          onBikeSelect={onBikeSelect}
          onUnlockItem={onUnlockItem}
          progression={progression}
          user={user}
        />
      ) : (
        <main className="hs-stage">
          <span className="hs-stage__eyebrow">Current Vehicle</span>

          <div className="hs-bike-switcher">
            <button className="hs-bike-switcher__arrow" onClick={handlePrevBike} aria-label="Previous bike">
              <FaChevronLeft />
            </button>
            <ActiveBikeCard bike={activeBikeData} />
            <button className="hs-bike-switcher__arrow" onClick={handleNextBike} aria-label="Next bike">
              <FaChevronRight />
            </button>
          </div>

          <div className="hs-bike-dots" aria-hidden="true">
            {BIKE_CATALOGUE.map((b, i) => (
              <button
                key={b.id}
                className={`hs-bike-dot${i === currentIndex ? ' hs-bike-dot--active' : ''}`}
                style={{ '--dot-color': b.accentColor }}
                onClick={() => isBikeUnlocked(b.id) && onBikeSelect(b.id)}
                disabled={!isBikeUnlocked(b.id)}
                aria-label={`Select ${b.name}`}
              />
            ))}
          </div>

          <h1 className="hs-car-name" style={{ color: activeBikeData.accentColor }}>
            {activeBikeData.name}
          </h1>

          {activeBikeData.power ? (
            <div className="hs-active-power-hint" style={{ '--hint-color': activeBikeData.power.color }}>
              {(() => {
                const PowerIcon = getBikePowerIcon(activeBikeData.power.name);
                return PowerIcon ? <PowerIcon style={{ fontSize: 13 }} /> : null;
              })()}
              <span>
                <strong>{activeBikeData.power.name}</strong> — press SPACE in-game
              </span>
            </div>
          ) : (
            <div className="hs-active-power-hint hs-active-power-hint--none">
              <span>No power-up · Basic ride</span>
            </div>
          )}

          <div className="hs-stat-row" aria-label="Stats">
            <div className="hs-stat-pill">
              <span className="hs-stat-pill__dot hs-stat-pill__dot--gold" aria-hidden="true" />
              <span className="hs-stat-pill__label">Highest Score</span>
              <span className="hs-stat-pill__val">
                {user?.progression?.highestScore?.toLocaleString() ?? user?.highest_score?.toLocaleString() ?? '—'}
              </span>
            </div>
            <div className="hs-stat-pill">
              <MdLeaderboard className="hs-stat-pill__icon" aria-hidden="true" />
              <span className="hs-stat-pill__label">Rank</span>
              <span className="hs-stat-pill__val">#{user?.progression?.rank ?? '—'}</span>
            </div>
          </div>

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
          user={user}
          onUnlockItem={onUnlockItem}
        />
      )}

      {/* ── DAILY REWARDS MODAL ── */}
      {showDailyRewards && (
        <DailyRewards
          user={user}
          onClose={() => setShowDailyRewards(false)}
          onRewardClaimed={handleRewardClaimed}
          onUserRefresh={onUserUpdated}
        />
      )}
    </div>
  );
}

export default HomeScreen;