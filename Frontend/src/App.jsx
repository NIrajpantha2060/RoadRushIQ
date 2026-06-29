

// // App.jsx
// import React, { useState, useCallback } from 'react';
// import HomeScreen from './pages/HomeScreen';
// import GameScreen from './pages/GameScreen';
// import LoadingScreen from './pages/LoadingScreen';

// function App() {
//   const [screen,        setScreen]        = useState('loading');
//   const [trafficMode,   setTrafficMode]   = useState('two-way');
//   const [selectedBike,  setSelectedBike]  = useState('skooter');  // ← NEW
//   const [gameKey,       setGameKey]       = useState(0);

//   const handlePlay = useCallback((modeId) => {
//     setTrafficMode(modeId);
//     setScreen('game');
//   }, []);

//   const handleExit = useCallback(() => {
//     setScreen('home');
//   }, []);

//   const handleLoadingDone = useCallback(() => {
//     setScreen('home');
//   }, []);

//   const handleRestart = useCallback(() => {
//     setGameKey(k => k + 1);
//   }, []);

//   if (screen === 'game') {
//     return (
//       <GameScreen
//         key={gameKey}
//         mode={trafficMode}
//         selectedBike={selectedBike}          // ← NEW
//         onExit={handleExit}
//         onRestart={handleRestart}
//       />
//     );
//   }

//   if (screen === 'loading') {
//     return <LoadingScreen onDone={handleLoadingDone} />;
//   }

//   return (
//     <HomeScreen
//       onPlay={handlePlay}
//       selectedBike={selectedBike}            // ← NEW
//       onBikeSelect={setSelectedBike}         // ← NEW
//     />
//   );
// }

// export default App;
// App.jsx
import React, { useState, useCallback } from 'react';
import HomeScreen    from './pages/HomeScreen';
import GameScreen    from './pages/GameScreen';
import LoadingScreen from './pages/LoadingScreen';
import LoginScreen   from './pages/LoginScreen';
import { getMe, saveRun } from './api/api';

export default function App() {
  const [screen,       setScreen]       = useState('loading');
  const [trafficMode,  setTrafficMode]  = useState('two-way');
  const [selectedBike, setSelectedBike] = useState('skooter');
  const [gameKey,      setGameKey]      = useState(0);
  const [user,         setUser]         = useState(null);

  const persistRunAndRefresh = useCallback(async (runSummary) => {
    if (!runSummary) return;

    try {
      await saveRun(runSummary);
      const me = await getMe();
      setUser(me);
      if (me.selected_bike) setSelectedBike(me.selected_bike);
    } catch (err) {
      console.error('Failed to persist run stats:', err);
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
      onBikeSelect={setSelectedBike}
      user={user}
      onUserUpdate={setUser}
    />
  );
}