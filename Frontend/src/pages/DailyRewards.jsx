import { useState, useEffect } from 'react';
import { FaCoins, FaGem, FaTimes, FaPlay } from 'react-icons/fa';
import { MdDiamond } from 'react-icons/md';
import { claimDailyReward } from '../api/api';
import '../css/DailyRewards.css';

const DAILY_REWARDS = [
  { day: 1, type: 'coins', amount: 500,  label: '500',   adsRequired: 1 },
  { day: 2, type: 'blue',  amount: 5,    label: '5',     adsRequired: 1 },
  { day: 3, type: 'coins', amount: 1200, label: '1,200', adsRequired: 1 },
  { day: 4, type: 'blue',  amount: 15,   label: '15',    adsRequired: 1 },
  { day: 5, type: 'coins', amount: 2500, label: '2,500', adsRequired: 1 },
  { day: 6, type: 'blue',  amount: 30,   label: '30',    adsRequired: 2 },
  { day: 7, type: 'red',   amount: 3,    label: '3',     adsRequired: 3 },
];

const AD_VIDEO_ID = '0nJw77ctzRA';

function RewardIcon({ type, size }) {
  const s = size || 22;
  if (type === 'coins') return <FaCoins   style={{ fontSize: s, color: '#f7c948' }} />;
  if (type === 'blue')  return <FaGem     style={{ fontSize: s, color: '#00c3ff' }} />;
  if (type === 'red')   return <MdDiamond style={{ fontSize: s, color: '#ff4d6d' }} />;
  return null;
}

function toIsoDate(value) {
  return value ? new Date(value).toISOString().split('T')[0] : null;
}

function getNextDay(day) {
  return day < 7 ? day + 1 : 1;
}

function getRewardState(user) {
  const claimedDays = Array.isArray(user?.claimed_days) ? user.claimed_days.map(Number) : [];
  const streakDay = user?.day_streak ?? 1;
  const nextAvailableAt = user?.next_available_at ? new Date(user.next_available_at) : null;
  const coolingDown = nextAvailableAt ? Date.now() < nextAvailableAt.getTime() : false;
  const latestClaimedDay = claimedDays.length > 0 ? claimedDays[claimedDays.length - 1] : 1;
  const currentDay = !user?.last_claim_at
    ? 1
    : (coolingDown ? latestClaimedDay : getNextDay(streakDay));

  return {
    currentDay,
    claimedDays,
    claimedToday: coolingDown,
    nextAvailableAt,
  };
}

function AdOverlay({ videoId, adsWatched, adsRequired, onAdComplete, onClose }) {
  const [watched, setWatched] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setWatched(true), 15000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="dr-ad-overlay">
      <div className="dr-ad-card">
        <div className="dr-ad-header">
          <span className="dr-ad-title">Ad {adsWatched + 1} of {adsRequired}</span>
          <button className="dr-ad-close" onClick={onClose}>✕</button>
        </div>
        <div className="dr-ad-video-wrap">
          <iframe
            className="dr-ad-iframe"
            src={'https://www.youtube.com/embed/' + videoId + '?autoplay=1&rel=0&modestbranding=1'}
            title="Daily Reward Ad"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        </div>
        <div className="dr-ad-footer">
          {watched ? (
            <button className="dr-ad-claim-btn" onClick={onAdComplete}>
              {adsWatched + 1 < adsRequired ? 'Next Ad →' : '✅ Claim Reward'}
            </button>
          ) : (
            <div className="dr-ad-waiting">
              <div className="dr-ad-spinner" />
              <span>Watch the ad to earn your reward…</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DailyRewards({ user, onClose, onRewardClaimed, onUserRefresh }) {
  const [showingAd,   setShowingAd]   = useState(false);
  const [adTarget,    setAdTarget]    = useState(null);
  const [adsWatched,  setAdsWatched]  = useState(0);
  const [justClaimed, setJustClaimed] = useState(null);

  const rewardState = getRewardState(user);
  const currentDay = rewardState.currentDay;
  const claimedDays = rewardState.claimedDays;
  const claimedToday = rewardState.claimedToday;
  const nextAvailableAt = rewardState.nextAvailableAt;
  const todayReward  = DAILY_REWARDS.find(function(r) { return r.day === currentDay; });

  function handleClaimClick(reward) {
    if (claimedDays.includes(reward.day)) return;
    if (claimedToday) return;
    if (reward.day !== currentDay) return;
    setAdTarget(reward);
    setAdsWatched(0);
    setShowingAd(true);
  }

  async function handleAdComplete() {
    var newCount = adsWatched + 1;
    if (newCount < adTarget.adsRequired) {
      setAdsWatched(newCount);
      setShowingAd(false);
      setTimeout(function() { setShowingAd(true); }, 600);
    } else {
      setShowingAd(false);

      try {
        const response = await claimDailyReward({
          day: adTarget.day,
          type: adTarget.type,
          amount: adTarget.amount,
        });

        setJustClaimed(adTarget.day);
        if (response?.profile && onUserRefresh) {
          onUserRefresh(response.profile);
        }
        if (onRewardClaimed) {
          onRewardClaimed(response);
        }
      } catch (err) {
        console.error('Failed to claim daily reward:', err);
        setJustClaimed(null);
      } finally {
        setTimeout(function() { setJustClaimed(null); }, 2000);
        setAdTarget(null);
        setAdsWatched(0);
      }
    }
  }

  function handleAdClose() {
    setShowingAd(false);
    setAdTarget(null);
    setAdsWatched(0);
  }

  return (
    <>
      <div className="dr-backdrop" onClick={onClose} />
      <div className="dr-modal">
        <div className="dr-header">
          <div className="dr-header-left">
            <span className="dr-eyebrow">Log in every day</span>
            <h2 className="dr-title">Daily Rewards</h2>
          </div>
          <button className="dr-close-btn" onClick={onClose} aria-label="Close">
            <FaTimes />
          </button>
        </div>

        <div className="dr-streak-bar">
          <span className="dr-streak-label">🔥 Day {currentDay} {claimedToday ? 'claimed' : 'streak'}</span>
          <span className="dr-streak-sub">
            {claimedToday
              ? `Next reward available ${nextAvailableAt ? nextAvailableAt.toLocaleString() : 'tomorrow'}.`
              : 'Come back daily to keep your streak!'}
          </span>
        </div>

        <div className="dr-grid">
          {DAILY_REWARDS.map(function(reward) {
            var isClaimed = claimedDays.includes(reward.day);
            var isToday   = !claimedToday && reward.day === currentDay;
            var isLocked  = reward.day > currentDay || (claimedToday && reward.day === currentDay);
            var isJust    = justClaimed === reward.day;
            var classes   = [
              'dr-day-card',
              isClaimed ? 'dr-day-card--claimed' : '',
              isToday   ? 'dr-day-card--today'   : '',
              isLocked  ? 'dr-day-card--locked'  : '',
              isJust    ? 'dr-day-card--flash'   : '',
              reward.type === 'red' ? 'dr-day-card--special' : '',
            ].join(' ');

            return (
              <div
                key={reward.day}
                className={classes}
                onClick={function() { if (!isClaimed && !isLocked) handleClaimClick(reward); }}
                role={isToday && !isClaimed ? 'button' : undefined}
                tabIndex={isToday && !isClaimed ? 0 : undefined}
              >
                <span className="dr-day-label">Day {reward.day}</span>
                <div className="dr-day-icon">
                  {isClaimed
                    ? <span className="dr-claimed-check">✓</span>
                    : <RewardIcon type={reward.type} size={reward.type === 'red' ? 28 : 22} />
                  }
                </div>
                <span className={'dr-day-amount dr-day-amount--' + reward.type}>
                  {isClaimed ? 'Claimed' : '+' + reward.label}
                </span>
                {!isClaimed && reward.adsRequired > 1 && (
                  <div className="dr-ads-badge">
                    <FaPlay style={{ fontSize: 7 }} />
                    <span>x{reward.adsRequired}</span>
                  </div>
                )}
                {isToday && !isClaimed && (
                  <div className="dr-claim-cta">
                    <FaPlay style={{ fontSize: 9 }} />
                    <span>Watch Ad</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="dr-note">
          Watch {todayReward ? todayReward.adsRequired : 1} ad{(todayReward && todayReward.adsRequired > 1) ? 's' : ''} to
          claim today's reward. Day 7 red diamonds require 3 ads.
        </p>
      </div>

      {showingAd && adTarget && (
        <AdOverlay
          videoId={AD_VIDEO_ID}
          adsWatched={adsWatched}
          adsRequired={adTarget.adsRequired}
          onAdComplete={handleAdComplete}
          onClose={handleAdClose}
        />
      )}
    </>
  );
}

export default DailyRewards;