
// export default App;
// App.jsx
import { useState, useCallback } from 'react';
import HomeScreen    from './pages/HomeScreen';
import GameScreen    from './pages/GameScreen';
import LoadingScreen from './pages/LoadingScreen';
import LoginScreen   from './pages/LoginScreen';
import { getMe, saveRun, selectBike as selectBikeApi, unlockItem as unlockItemApi } from './api/api';

export default function App() {
  const [screen,       setScreen]       = useState('loading');
  const [trafficMode,  setTrafficMode]  = useState('two-way');
  const [selectedBike, setSelectedBike] = useState('skooter');
  const [gameKey,      setGameKey]      = useState(0);
  const [user,         setUser]         = useState(null);

  const persistRunAndRefresh = useCallback(async (runSummary) => {
    if (!runSummary) return;

    try {
      const response = await saveRun(runSummary);
      if (response?.profile) {
        setUser(response.profile);
      } else {
        const me = await getMe();
        setUser(me);
      }
    } catch (err) {
      console.error('Failed to persist run stats:', err);
    }
  }, []);

  const handleUnlockItem = useCallback(async (unlockId) => {
    try {
      const response = await unlockItemApi(unlockId);
      if (response?.profile) {
        setUser(response.profile);
      }
      return response;
    } catch (err) {
      console.error('Failed to unlock item:', err);
      throw err;
    }
  }, []);

  const handleBikeSelect = useCallback(async (bikeId) => {
    try {
      const response = await selectBikeApi(bikeId);
      setSelectedBike(bikeId);
      if (response?.profile) {
        setUser(response.profile);
      }
      return response;
    } catch (err) {
      console.error('Failed to select bike:', err);
      throw err;
    }
  }, []);

  // Called when LoadingScreen finishes
  const handleLoadingDone = useCallback(async () => {
    const token = localStorage.getItem('rr_token');
    if (!token) {
      setScreen('login');
      return;
    }
    try {
      const me = await getMe();
      setUser(me);
      if (me.selected_bike) setSelectedBike(me.selected_bike);
      setScreen('home');
    } catch {
      localStorage.removeItem('rr_token');
      setScreen('login');
    }
  }, []);

  // Called after successful login or signup
  const handleAuthSuccess = useCallback(async () => {
    try {
      const me = await getMe();
      setUser(me);
      if (me.selected_bike) setSelectedBike(me.selected_bike);
      setScreen('home');
    } catch {
      setScreen('login');
    }
  }, []);

  const handlePlay = useCallback((modeId) => {
    setTrafficMode(modeId);
    setScreen('game');
  }, []);

  const handleExit = useCallback((runSummary) => {
    setScreen('home');
    void persistRunAndRefresh(runSummary);
  }, [persistRunAndRefresh]);

  const handleRestart = useCallback((runSummary) => {
    void persistRunAndRefresh(runSummary);
    setGameKey(k => k + 1);
  }, [persistRunAndRefresh]);

  if (screen === 'loading') return <LoadingScreen onDone={handleLoadingDone} />;
  if (screen === 'login')   return <LoginScreen onAuthSuccess={handleAuthSuccess} />;

  if (screen === 'game') {
    return (
      <GameScreen
        key={gameKey}
        mode={trafficMode}
        selectedBike={selectedBike}
        onExit={handleExit}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <HomeScreen
      onPlay={handlePlay}
      selectedBike={selectedBike}
      onBikeSelect={handleBikeSelect}
      onUnlockItem={handleUnlockItem}
      user={user}
    />
  );
}