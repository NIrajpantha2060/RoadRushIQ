// App.jsx
import React, { useState, useCallback, useRef } from 'react';
import HomeScreen from './pages/HomeScreen';
import GameScreen from './pages/GameScreen';

function App() {
  const [screen,      setScreen]      = useState('home');
  const [trafficMode, setTrafficMode] = useState('two-way');
  // ↑ Incrementing this key forces GameScreen to fully unmount + remount
  // cleanly, without a setTimeout race.
  const [gameKey, setGameKey] = useState(0);

  const handlePlay = useCallback((modeId) => {
    setTrafficMode(modeId);
    setScreen('game');
  }, []);

  const handleExit = useCallback(() => {
    setScreen('home');
  }, []);

  const handleRestart = useCallback(() => {
    // Bump the key → React unmounts the old GameScreen (destroying Phaser)
    // then mounts a fresh one. No setTimeout needed.
    setGameKey(k => k + 1);
  }, []);

  if (screen === 'game') {
    return (
      <GameScreen
        key={gameKey}
        mode={trafficMode}
        onExit={handleExit}
        onRestart={handleRestart}
      />
    );
  }

  return <HomeScreen onPlay={handlePlay} />;
}

export default App;