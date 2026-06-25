// // import { useEffect, useState } from 'react';
// // import '../css/LodaingScreen.css';
// // import logo from '../images/logo.jpg';

// // function LoadingScreen() {
// // 	const [logoReady, setLogoReady] = useState(false);

// // 	useEffect(() => {
// // 		let active = true;
// // 		const image = new Image();

// // 		image.src = logo;
// // 		image.onload = () => {
// // 			if (active) {
// // 				setLogoReady(true);
// // 			}
// // 		};
// // 		image.onerror = () => {
// // 			if (active) {
// // 				setLogoReady(true);
// // 			}
// // 		};

// // 		return () => {
// // 			active = false;
// // 		};
// // 	}, []);

// // 	return (
// // 		<main className="loading-screen" aria-busy={!logoReady} aria-live="polite">
// // 			<div className="loading-screen__glow loading-screen__glow--left" />
// // 			<div className="loading-screen__glow loading-screen__glow--right" />

// // 			<section className="loading-card">
// // 				<div className="loading-card__logo-shell">
// // 					{logoReady ? (
// // 						<img className="loading-card__logo" src={logo} alt="RoadRushIq logo" />
// // 					) : (
// // 						<div className="loading-card__logo loading-card__logo--placeholder" aria-hidden="true">
// // 							<span>RR</span>
// // 						</div>
// // 					)}
// // 				</div>

// // 				<div className="loading-card__spinner" aria-hidden="true">
// // 					<span />
// // 					<span />
// // 					<span />
// // 					<span />
// // 				</div>

// // 				<div className="loading-card__meter" aria-hidden="true">
// // 					<span />
// // 				</div>

// // 				<p className="loading-card__title">RoadRushIq</p>
// // 				<p className="loading-card__subtitle">
// // 					{logoReady ? 'Preparing the track' : 'Loading the logo'}
// // 				</p>
// // 			</section>
// // 		</main>
// // 	);
// // }

// // export default LoadingScreen;

// import { useEffect, useState } from 'react';
// import '../css/LodaingScreen.css';
// import logo from '../images/logo.jpg';

// function LoadingScreen() {
//   const [logoReady, setLogoReady] = useState(false);

//   useEffect(() => {
//     let active = true;
//     const image = new Image();

//     image.src = logo;
//     image.onload = () => {
//       if (active) setLogoReady(true);
//     };
//     image.onerror = () => {
//       if (active) setLogoReady(true);
//     };

//     return () => {
//       active = false;
//     };
//   }, []);

//   return (
//     <main className="loading-screen" aria-busy={!logoReady} aria-live="polite">
//       <div className="loading-screen__glow loading-screen__glow--left" />
//       <div className="loading-screen__glow loading-screen__glow--right" />

//       <section className="loading-card">
//         <div className="loading-card__logo-shell">
//           {logoReady ? (
//             <img
//               className="loading-card__logo"
//               src={logo}
//               alt="RoadRushIq logo"
//             />
//           ) : (
//             <div
//               className="loading-card__logo loading-card__logo--placeholder"
//               aria-hidden="true"
//             >
//               <span>RR</span>
//             </div>
//           )}
//         </div>

//         <div className="loading-card__spinner" aria-hidden="true">
//           <span />
//           <span />
//           <span />
//           <span />
//         </div>

//         <div className="loading-card__meter" aria-hidden="true">
//           <span />
//         </div>

//         <p className="loading-card__title">RoadRushIq</p>
//         <p className="loading-card__subtitle">Preparing the track</p>
//       </section>
//     </main>
//   );
// }

// export default LoadingScreen;


import { useEffect, useState } from 'react';
import '../css/LodaingScreen.css';
import logo from '../images/logo.jpg';

/**
 * LoadingScreen
 * – Simulates a loading sequence (logo load + fake progress)
 * – Calls onDone() when complete so App can switch to HomeScreen
 */
function LoadingScreen({ onDone }) {
	const [logoReady, setLogoReady]     = useState(false);
	const [progress, setProgress]       = useState(0);   // 0-100
	const [finished, setFinished]       = useState(false);

	/* ── 1. Preload logo ── */
	useEffect(() => {
		let active = true;
		const image = new Image();
		image.src = logo;
		image.onload  = () => { if (active) setLogoReady(true); };
		image.onerror = () => { if (active) setLogoReady(true); };
		return () => { active = false; };
	}, []);

	/* ── 2. Fake progress bar (runs after logo is ready) ── */
	useEffect(() => {
		if (!logoReady) return;

		let current = 0;
		const id = setInterval(() => {
			// Accelerate more as we get closer
			const step = current < 70 ? 3 : current < 90 ? 1.5 : 0.8;
			current = Math.min(current + step, 100);
			setProgress(Math.round(current));

			if (current >= 100) {
				clearInterval(id);
				setFinished(true);
			}
		}, 40);

		return () => clearInterval(id);
	}, [logoReady]);

	/* ── 3. Brief pause at 100% then hand off ── */
	useEffect(() => {
		if (!finished) return;
		const id = setTimeout(() => onDone?.(), 600);
		return () => clearTimeout(id);
	}, [finished, onDone]);

	const subtitle = !logoReady
		? 'Loading assets'
		: progress < 100
			? 'Preparing the track'
			: 'Ready!';

	return (
		<main
			className="loading-screen"
			aria-busy={!finished}
			aria-live="polite"
		>
			<div className="loading-screen__glow loading-screen__glow--left"  aria-hidden="true" />
			<div className="loading-screen__glow loading-screen__glow--right" aria-hidden="true" />

			<section className="loading-card">
				<div className="loading-card__logo-shell">
					{logoReady ? (
						<img
							className="loading-card__logo"
							src={logo}
							alt="RoadRush IQ logo"
						/>
					) : (
						<div
							className="loading-card__logo loading-card__logo--placeholder"
							aria-hidden="true"
						>
							<span>RR</span>
						</div>
					)}
				</div>

				<div className="loading-card__spinner" aria-hidden="true">
					<span /><span /><span /><span />
				</div>

				{/* Real progress bar (replaces the infinite sweep) */}
				<div
					className="loading-card__meter"
					role="progressbar"
					aria-valuenow={progress}
					aria-valuemin={0}
					aria-valuemax={100}
					aria-label="Loading progress"
				>
					<span style={{ width: `${progress}%`, animation: 'none' }} />
				</div>

				<p className="loading-card__title">RoadRush IQ</p>
				<p className="loading-card__subtitle">{subtitle}</p>
			</section>
		</main>
	);
}

export default LoadingScreen;