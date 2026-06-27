import { useState, useEffect, useRef } from 'react';
import '../css/IQPopup.css';

const DIFFICULTY_COLORS = {
  easy:   '#2ecc71',
  medium: '#f7931e',
  hard:   '#ff4d6d',
};

const REWARD_LABELS = {
  gold:       (amt) => `+${amt} Coins 🪙`,
  blue:       (amt) => `+${amt} Blue Diamond 💎`,
  red:        (amt) => `+${amt} Red Diamond 💠`,
  multiplier: (amt) => `×${amt} Score Boost ⚡`,
  shield:     ()    => `Shield Power-Up 🛡`,
};

function IQPopup({ question, onAnswer, onSkip }) {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);

  // Use refs so timer callback always has fresh values without re-running effect
  const revealedRef  = useRef(false);
  const dismissedRef = useRef(false);

  // Countdown — auto-skip when it hits 0
  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(t => {
        const next = t - 1;
        if (next <= 0) {
          clearInterval(id);
          // Schedule skip outside the setState call to avoid "setState during render"
          setTimeout(() => {
            if (!dismissedRef.current && !revealedRef.current) {
              dismissedRef.current = true;
              onSkip();
            }
          }, 0);
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);  // run once on mount only

  function handleSelect(index) {
    if (revealedRef.current || dismissedRef.current) return;
    revealedRef.current = true;
    setSelected(index);
    setRevealed(true);

    const correct = index === question.answer;
    setTimeout(() => {
      dismissedRef.current = true;
      onAnswer(correct);
    }, correct ? 1400 : 1000);
  }

  function handleSkip() {
    if (dismissedRef.current || revealedRef.current) return;
    dismissedRef.current = true;
    onSkip();
  }

  const diffColor  = DIFFICULTY_COLORS[question.difficulty] ?? '#ffffff';
  const rewardText = REWARD_LABELS[question.reward.type]?.(question.reward.amount) ?? 'Mystery Reward';
  const timerPct   = (timeLeft / 15) * 100;

  return (
    <div className="iq-backdrop">
      <div className="iq-card">

        {/* ── Top bar ── */}
        <div className="iq-topbar">
          <span className="iq-label">IQ Challenge</span>
          <span className="iq-difficulty" style={{ color: diffColor }}>
            {question.difficulty.toUpperCase()}
          </span>
        </div>

        {/* ── Timer bar ── */}
        <div className="iq-timer-track">
          <div
            className="iq-timer-fill"
            style={{
              width: `${timerPct}%`,
              background: timeLeft > 5 ? '#00c3ff' : '#ff4d6d',
              transition: 'width 1s linear, background 0.3s ease',
            }}
          />
        </div>
        <div className="iq-timer-label">{timeLeft}s</div>

        {/* ── Reward preview ── */}
        <div className="iq-reward-hint">
          🎁 Correct answer: <strong>{rewardText}</strong>
        </div>

        {/* ── Question ── */}
        <div className="iq-question">{question.question}</div>

        {/* ── Options ── */}
        <div className="iq-options">
          {question.options.map((opt, i) => {
            let cls = 'iq-option';
            if (revealed) {
              if (i === question.answer)  cls += ' iq-option--correct';
              else if (i === selected)    cls += ' iq-option--wrong';
              else                        cls += ' iq-option--dim';
            }
            return (
              <button
                key={i}
                className={cls}
                onClick={() => handleSelect(i)}
                disabled={revealed}
              >
                <span className="iq-option-letter">
                  {['A', 'B', 'C', 'D'][i]}
                </span>
                <span className="iq-option-text">{opt}</span>
              </button>
            );
          })}
        </div>

        {/* ── Result message ── */}
        {revealed && (
          <div className={`iq-result ${selected === question.answer ? 'iq-result--correct' : 'iq-result--wrong'}`}>
            {selected === question.answer
              ? `✓ Correct! ${rewardText}`
              : `✗ The answer was: ${question.options[question.answer]}`
            }
          </div>
        )}

        {/* ── Skip button ── */}
        {!revealed && (
          <button className="iq-skip" onClick={handleSkip}>
            Skip
          </button>
        )}

      </div>
    </div>
  );
}

export default IQPopup;