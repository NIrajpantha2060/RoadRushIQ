// import { useState } from 'react';
// import LoadingScreen from './pages/LoadingScreen';
// import HomeScreen    from './pages/HomeScreen';
// import GameScreen    from './pages/GameScreen';

// /**
//  * Screens:
//  *   'loading' → 'home' → 'game' → back to 'home'
//  */
// function App() {
// 	const [screen, setScreen] = useState('loading');
// 	const [gameSession, setGameSession] = useState(0);

// 	if (screen === 'loading') {
// 		return <LoadingScreen onDone={() => setScreen('home')} />;
// 	}

// 	if (screen === 'game') {
// 		return (
// 			<GameScreen
// 				key={gameSession}
// 				onExit={() => setScreen('home')}
// 				onRestart={() => setGameSession(session => session + 1)}
// 			/>
// 		);
// 	}

// 	// Default: home
// 	return <HomeScreen onPlay={() => setScreen('game')} />;
// }

// export default App;

// App.jsx — example wiring for mode selection
import React, { useState, useCallback } from 'react';
import HomeScreen from './pages/HomeScreen';
import GameScreen from './pages/GameScreen';

function App() {
  const [screen,      setScreen]      = useState('home'); // 'home' | 'game'
  const [trafficMode, setTrafficMode] = useState('two-way');

  // Called by HomeScreen → ModeSelectModal when a mode card is tapped
  const handlePlay = useCallback((modeId) => {
    setTrafficMode(modeId);
    setScreen('game');
  }, []);

  const handleExit = useCallback(() => {
    setScreen('home');
  }, []);

  const handleRestart = useCallback(() => {
    // Remount GameScreen with the same mode
    setScreen('home');
    // Small tick so the component fully unmounts before remounting
    setTimeout(() => setScreen('game'), 50);
  }, []);

  if (screen === 'game') {
    return (
      <GameScreen
        mode={trafficMode}
        onExit={handleExit}
        onRestart={handleRestart}
      />
    );
  }

  return <HomeScreen onPlay={handlePlay} />;
}

export default App;