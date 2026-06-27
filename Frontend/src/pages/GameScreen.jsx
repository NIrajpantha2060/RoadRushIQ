import { useEffect, useRef } from 'react';
import Phaser      from 'phaser';
import GameScene   from '../game/scenes/GameScene';
import OneWayScene from '../game/scenes/OneWayScene';
import UIScene     from '../game/scenes/UIScene';

// mode: 'one-way' | 'two-way'
function GameScreen({ onExit, onRestart, mode = 'two-way' }) {
  const containerRef = useRef(null);
  const gameRef      = useRef(null);

  useEffect(() => {
    if (gameRef.current) return;

    // Select scenes based on mode
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
      scene:  scenes,
      callbacks: {
        preBoot: (game) => {
          game.registry.set('onExit',    onExit);
          game.registry.set('onRestart', onRestart);
          // Store traffic mode so scenes can read it in create()
          game.registry.set('trafficMode', mode);
        },
      },
    };

    gameRef.current = new Phaser.Game(config);

    const onResize = () => {
      gameRef.current?.scale.resize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [onExit, onRestart, mode]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100vw', height: '100svh', overflow: 'hidden' }}
    />
  );
}

export default GameScreen;