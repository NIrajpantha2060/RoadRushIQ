import { useEffect, useRef } from 'react';
import Phaser      from 'phaser';
import GameScene   from '../game/scenes/GameScene';
import UIScene     from '../game/scenes/UIScene';

function GameScreen({ onExit, onRestart }) {
	const containerRef = useRef(null);
	const gameRef      = useRef(null);

	useEffect(() => {
		if (gameRef.current) return;

		const config = {
			type:            Phaser.AUTO,
			width:           window.innerWidth,
			height:          window.innerHeight,
			backgroundColor: '#0d0d1a',
			parent:          containerRef.current,
			physics: { default: 'arcade', arcade: { debug: false } },
			scene:  [GameScene, UIScene],
			callbacks: {
				preBoot: (game) => {
					game.registry.set('onExit', onExit);
					game.registry.set('onRestart', onRestart);
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
	}, [onExit, onRestart]);

	return (
		<div
			ref={containerRef}
			style={{ width: '100vw', height: '100svh', overflow: 'hidden' }}
		/>
	);
}

export default GameScreen;