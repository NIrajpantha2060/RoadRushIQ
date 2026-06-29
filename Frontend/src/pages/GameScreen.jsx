

// // GameScreen.jsx
// import { useEffect, useRef, useState, useCallback } from 'react';
// import Phaser      from 'phaser';
// import GameScene   from '../game/scenes/GameScene';
// import OneWayScene from '../game/scenes/OneWayScene';
// import UIScene     from '../game/scenes/UIScene';
// import IQPopup     from './IQPopup';

// // ── NEW: accept selectedBike prop (defaults to 'skooter' if not passed) ───
// function GameScreen({ onExit, onRestart, mode = 'two-way', selectedBike = 'skooter' }) {
//   const containerRef = useRef(null);
//   const gameRef      = useRef(null);

//   const onExitRef    = useRef(onExit);
//   const onRestartRef = useRef(onRestart);
//   useEffect(() => { onExitRef.current    = onExit;    }, [onExit]);
//   useEffect(() => { onRestartRef.current = onRestart; }, [onRestart]);

//   const iqCallbacksRef = useRef(null);
//   const [iqQuestion, setIqQuestion] = useState(null);

//   const handleIQCollected = useCallback(({ question, onAnswer, onSkip }) => {
//     iqCallbacksRef.current = { onAnswer, onSkip };
//     setIqQuestion(question);
//   }, []);

//   const handleAnswer = useCallback((correct) => {
//     setIqQuestion(null);
//     iqCallbacksRef.current?.onAnswer(correct);
//     iqCallbacksRef.current = null;
//   }, []);

//   const handleSkip = useCallback(() => {
//     setIqQuestion(null);
//     iqCallbacksRef.current?.onSkip();
//     iqCallbacksRef.current = null;
//   }, []);

//   useEffect(() => {
//     if (gameRef.current) return;

//     const scenes = mode === 'one-way'
//       ? [OneWayScene, UIScene]
//       : [GameScene,   UIScene];

//     const config = {
//       type:            Phaser.AUTO,
//       width:           window.innerWidth,
//       height:          window.innerHeight,
//       backgroundColor: '#0d0d1a',
//       parent:          containerRef.current,
//       physics: { default: 'arcade', arcade: { debug: false } },
//       scene:   scenes,
//       callbacks: {
//         preBoot: (game) => {
//           game.events.on('iq-collected', handleIQCollected);

//           game.registry.set('onExit',    () => onExitRef.current?.());
//           game.registry.set('onRestart', () => onRestartRef.current?.());
//           game.registry.set('trafficMode',     mode);
//           game.registry.set('blueDiamonds',    0);
//           game.registry.set('redDiamonds',     0);
//           game.registry.set('scoreMultiplier', 1);
//           game.registry.set('shieldActive',    false);
//           game.registry.set('selectedBike',    selectedBike);  // ← NEW
//         },
//       },
//     };

//     const game = new Phaser.Game(config);
//     gameRef.current = game;

//     const onResize = () => {
//       gameRef.current?.scale.resize(window.innerWidth, window.innerHeight);
//     };
//     window.addEventListener('resize', onResize);

//     return () => {
//       window.removeEventListener('resize', onResize);
//       if (gameRef.current) {
//         gameRef.current.events.off('iq-collected', handleIQCollected);
//         gameRef.current.destroy(true);
//         gameRef.current = null;
//       }
//     };
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   return (
//     <>
//       <div
//         ref={containerRef}
//         style={{ width: '100vw', height: '100svh', overflow: 'hidden' }}
//       />

//       {iqQuestion && (
//         <IQPopup
//           question={iqQuestion}
//           onAnswer={handleAnswer}
//           onSkip={handleSkip}
//         />
//       )}
//     </>
//   );
// }

// export default GameScreen;

// GameScreen.jsx
import { useEffect, useRef, useState, useCallback } from 'react';
import Phaser      from 'phaser';
import GameScene   from '../game/scenes/GameScene';
import OneWayScene from '../game/scenes/OneWayScene';
import UIScene     from '../game/scenes/UIScene';
import IQPopup     from './IQPopup';

const AD_VIDEO_ID = '0nJw77ctzRA'; // YouTube video ID for the ad

function GameScreen({ onExit, onRestart, mode = 'two-way', selectedBike = 'skooter' }) {
  const containerRef = useRef(null);
  const gameRef      = useRef(null);

  const onExitRef    = useRef(onExit);
  const onRestartRef = useRef(onRestart);
  useEffect(() => { onExitRef.current    = onExit;    }, [onExit]);
  useEffect(() => { onRestartRef.current = onRestart; }, [onRestart]);

  const iqCallbacksRef = useRef(null);
  const [iqQuestion, setIqQuestion]   = useState(null);

  // ── Ad / Save Me state ────────────────────────────────────────────────────
  const [adVisible,   setAdVisible]   = useState(false);
  const [adReason,    setAdReason]    = useState(null);
  const [adWatched,   setAdWatched]   = useState(false); // true once timer fires
  const adTimerRef = useRef(null);

  // ── IQ handlers ───────────────────────────────────────────────────────────
  const handleIQCollected = useCallback(({ question, onAnswer, onSkip }) => {
    iqCallbacksRef.current = { onAnswer, onSkip };
    setIqQuestion(question);
  }, []);

  const handleAnswer = useCallback((correct) => {
    setIqQuestion(null);
    iqCallbacksRef.current?.onAnswer(correct);
    iqCallbacksRef.current = null;
  }, []);

  const handleSkip = useCallback(() => {
    setIqQuestion(null);
    iqCallbacksRef.current?.onSkip();
    iqCallbacksRef.current = null;
  }, []);

  // ── Ad handlers ───────────────────────────────────────────────────────────
  const handleShowAd = useCallback(({ reason }) => {
    setAdReason(reason);
    setAdWatched(false);
    setAdVisible(true);

    // Auto-enable "Claim" after 15s (simulating ad watch)
    adTimerRef.current = setTimeout(() => {
      setAdWatched(true);
    }, 15000);
  }, []);

  const handleAdClaim = useCallback(() => {
    clearTimeout(adTimerRef.current);
    setAdVisible(false);
    gameRef.current?.events.emit('ad-result', { success: true, reason: adReason });
    setAdReason(null);
    setAdWatched(false);
  }, [adReason]);

  const handleAdSkip = useCallback(() => {
    clearTimeout(adTimerRef.current);
    setAdVisible(false);
    gameRef.current?.events.emit('ad-result', { success: false, reason: adReason });
    setAdReason(null);
    setAdWatched(false);
  }, [adReason]);

  // ── Phaser init ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (gameRef.current) return;

    const scenes = mode === 'one-way'
      ? [OneWayScene, UIScene]
      : [GameScene,   UIScene];

    const config = {
      type:            Phaser.AUTO,
      width:           window.innerWidth,
      height:          window.innerHeight,
      backgroundColor: '#0d0d1a',
      parent:          containerRef.current,
      physics: { default: 'arcade', arcade: { debug: false } },
      scene:   scenes,
      callbacks: {
        preBoot: (game) => {
          game.events.on('iq-collected', handleIQCollected);
          game.events.on('show-ad',      handleShowAd);

          game.registry.set('onExit',          (runSummary) => onExitRef.current?.(runSummary));
          game.registry.set('onRestart',       (runSummary) => onRestartRef.current?.(runSummary));
          game.registry.set('trafficMode',     mode);
          game.registry.set('blueDiamonds',    0);
          game.registry.set('redDiamonds',     0);
          game.registry.set('scoreMultiplier', 1);
          game.registry.set('shieldActive',    false);
          game.registry.set('selectedBike',    selectedBike);
        },
      },
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    const onResize = () => {
      gameRef.current?.scale.resize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      clearTimeout(adTimerRef.current);
      window.removeEventListener('resize', onResize);
      if (gameRef.current) {
        gameRef.current.events.off('iq-collected', handleIQCollected);
        gameRef.current.events.off('show-ad',      handleShowAd);
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* Phaser canvas */}
      <div
        ref={containerRef}
        style={{ width: '100vw', height: '100svh', overflow: 'hidden' }}
      />

      {/* IQ Popup */}
      {iqQuestion && (
        <IQPopup
          question={iqQuestion}
          onAnswer={handleAnswer}
          onSkip={handleSkip}
        />
      )}

      {/* ── Ad Overlay ─────────────────────────────────────────────────── */}
      {adVisible && (
        <div style={styles.adOverlay}>
          <div style={styles.adCard}>

            {/* Header */}
            <div style={styles.adHeader}>
              <span style={styles.adHeaderText}>Watch Ad to Continue</span>
              <button style={styles.adSkipBtn} onClick={handleAdSkip}>✕</button>
            </div>

            {/* YouTube embed */}
            <div style={styles.adVideoWrap}>
              <iframe
                style={styles.adIframe}
                src={`https://www.youtube.com/embed/${AD_VIDEO_ID}?autoplay=1&rel=0&modestbranding=1`}
                title="Ad"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </div>

            {/* Footer */}
            <div style={styles.adFooter}>
              {adWatched ? (
                <button style={styles.adClaimBtn} onClick={handleAdClaim}>
                  ✅ Claim Reward & Continue
                </button>
              ) : (
                <div style={styles.adWaitingRow}>
                  <div style={styles.adSpinner} />
                  <span style={styles.adWaitingText}>
                    Watch for a few seconds to unlock your reward…
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Inline styles for ad overlay ─────────────────────────────────────────────
const styles = {
  adOverlay: {
    position:       'fixed',
    inset:          0,
    zIndex:         9999,
    background:     'rgba(0,0,0,0.92)',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    padding:        '16px',
    boxSizing:      'border-box',
  },
  adCard: {
    width:        '100%',
    maxWidth:     '520px',
    background:   '#0d1220',
    borderRadius: '20px',
    border:       '2px solid rgba(0,195,255,0.5)',
    overflow:     'hidden',
    display:      'flex',
    flexDirection:'column',
  },
  adHeader: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    padding:        '14px 18px',
    borderBottom:   '1px solid rgba(255,255,255,0.08)',
  },
  adHeaderText: {
    color:      '#ffffff',
    fontFamily: 'system-ui, sans-serif',
    fontSize:   '15px',
    fontWeight: '700',
    letterSpacing: '0.04em',
  },
  adSkipBtn: {
    background:   'rgba(255,255,255,0.08)',
    border:       '1px solid rgba(255,255,255,0.15)',
    borderRadius: '50%',
    width:        '30px',
    height:       '30px',
    color:        'rgba(255,255,255,0.6)',
    fontSize:     '13px',
    cursor:       'pointer',
    display:      'flex',
    alignItems:   'center',
    justifyContent:'center',
  },
  adVideoWrap: {
    position:      'relative',
    paddingBottom: '56.25%', // 16:9
    height:        0,
    background:    '#000',
  },
  adIframe: {
    position: 'absolute',
    top:      0,
    left:     0,
    width:    '100%',
    height:   '100%',
    border:   'none',
  },
  adFooter: {
    padding:        '16px 18px',
    borderTop:      '1px solid rgba(255,255,255,0.08)',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
  },
  adClaimBtn: {
    background:    'linear-gradient(135deg, #00c3ff 0%, #0077cc 100%)',
    border:        'none',
    borderRadius:  '999px',
    color:         '#ffffff',
    fontFamily:    'system-ui, sans-serif',
    fontSize:      '15px',
    fontWeight:    '700',
    padding:       '13px 28px',
    cursor:        'pointer',
    letterSpacing: '0.05em',
    width:         '100%',
  },
  adWaitingRow: {
    display:    'flex',
    alignItems: 'center',
    gap:        '10px',
  },
  adSpinner: {
    width:        '18px',
    height:       '18px',
    borderRadius: '50%',
    border:       '2px solid rgba(0,195,255,0.3)',
    borderTopColor: '#00c3ff',
    animation:    'spin 0.8s linear infinite',
    flexShrink:   0,
  },
  adWaitingText: {
    color:      'rgba(255,255,255,0.45)',
    fontFamily: 'system-ui, sans-serif',
    fontSize:   '12px',
  },
};

// Inject spinner keyframe once
if (typeof document !== 'undefined' && !document.getElementById('gs-spinner-style')) {
  const style = document.createElement('style');
  style.id = 'gs-spinner-style';
  style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
  document.head.appendChild(style);
}

export default GameScreen;