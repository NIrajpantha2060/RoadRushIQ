// GameScreen.jsx
import { useEffect, useRef, useState, useCallback } from 'react';
import Phaser      from 'phaser';
import GameScene   from '../game/scenes/GameScene';
import OneWayScene from '../game/scenes/OneWayScene';
import UIScene     from '../game/scenes/UIScene';
import IQPopup     from './IQPopup';

function GameScreen({ onExit, onRestart, mode = 'two-way' }) {
  const containerRef = useRef(null);
  const gameRef      = useRef(null);

  const onExitRef    = useRef(onExit);
  const onRestartRef = useRef(onRestart);
  useEffect(() => { onExitRef.current    = onExit;    }, [onExit]);
  useEffect(() => { onRestartRef.current = onRestart; }, [onRestart]);

  const iqCallbacksRef = useRef(null);
  const [iqQuestion, setIqQuestion] = useState(null);

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
          // Register BEFORE any scene boots — this is the key fix.
          // Previously the listener was added after new Phaser.Game(),
          // which was too late: the scene could emit before React listened.
          game.events.on('iq-collected', handleIQCollected);

          game.registry.set('onExit',    () => onExitRef.current?.());
          game.registry.set('onRestart', () => onRestartRef.current?.());
          game.registry.set('trafficMode',     mode);
          game.registry.set('blueDiamonds',    0);
          game.registry.set('redDiamonds',     0);
          game.registry.set('scoreMultiplier', 1);
          game.registry.set('shieldActive',    false);
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
      window.removeEventListener('resize', onResize);
      if (gameRef.current) {
        gameRef.current.events.off('iq-collected', handleIQCollected);
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        style={{ width: '100vw', height: '100svh', overflow: 'hidden' }}
      />

      {iqQuestion && (
        <IQPopup
          question={iqQuestion}
          onAnswer={handleAnswer}
          onSkip={handleSkip}
        />
      )}
    </>
  );
}

export default GameScreen;