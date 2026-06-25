import { useState } from 'react';
import LoadingScreen from './pages/LoadingScreen';
import HomeScreen    from './pages/HomeScreen';
import GameScreen    from './pages/GameScreen';

/**
 * Screens:
 *   'loading' → 'home' → 'game' → back to 'home'
 */
function App() {
	const [screen, setScreen] = useState('loading');
	const [gameSession, setGameSession] = useState(0);

	if (screen === 'loading') {
		return <LoadingScreen onDone={() => setScreen('home')} />;
	}

	if (screen === 'game') {
		return (
			<GameScreen
				key={gameSession}
				onExit={() => setScreen('home')}
				onRestart={() => setGameSession(session => session + 1)}
			/>
		);
	}

	// Default: home
	return <HomeScreen onPlay={() => setScreen('game')} />;
}

export default App;