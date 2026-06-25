// import LoadingScreen from './pages/LoadingScreen'

// function App() {
//   return <LoadingScreen />
// }

// export default App

import { useState } from 'react';
import LoadingScreen from './pages/LoadingScreen';
import HomeScreen    from './pages/HomeScreen';

function App() {
	const [loaded, setLoaded] = useState(false);

	return loaded
		? <HomeScreen />
		: <LoadingScreen onDone={() => setLoaded(true)} />;
}

export default App;