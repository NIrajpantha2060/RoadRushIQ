/**
 * IQQuestions.js
 * 
 * Reward is NO LONGER stored per-question.
 * Instead, reward is picked randomly at collection time in IQBoxManager
 * based on rarity weights:
 *   60% → gold coins
 *   35% → blue diamond
 *    5% → red diamond
 *
 * Questions are still difficulty-tiered for score-based selection.
 */

export const IQ_QUESTIONS = [

  // ── EASY ─────────────────────────────────────────────────────────────────
  {
    question: 'What is 12 × 12?',
    options: ['124', '144', '132', '148'],
    answer: 1,
    difficulty: 'easy',
  },
  {
    question: 'Which planet is closest to the Sun?',
    options: ['Venus', 'Earth', 'Mercury', 'Mars'],
    answer: 2,
    difficulty: 'easy',
  },
  {
    question: 'How many sides does a hexagon have?',
    options: ['5', '7', '8', '6'],
    answer: 3,
    difficulty: 'easy',
  },
  {
    question: 'What is the capital of France?',
    options: ['Rome', 'Berlin', 'Paris', 'Madrid'],
    answer: 2,
    difficulty: 'easy',
  },
  {
    question: 'What is the square root of 64?',
    options: ['6', '9', '7', '8'],
    answer: 3,
    difficulty: 'easy',
  },
  {
    question: 'Which gas do plants absorb from the air?',
    options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'],
    answer: 2,
    difficulty: 'easy',
  },
  {
    question: 'How many days are in a leap year?',
    options: ['365', '364', '366', '367'],
    answer: 2,
    difficulty: 'easy',
  },
  {
    question: 'What is 9 × 8?',
    options: ['63', '72', '81', '64'],
    answer: 1,
    difficulty: 'easy',
  },
  {
    question: 'What color do you get mixing blue and yellow?',
    options: ['Purple', 'Orange', 'Green', 'Brown'],
    answer: 2,
    difficulty: 'easy',
  },
  {
    question: 'How many continents are there on Earth?',
    options: ['5', '6', '7', '8'],
    answer: 2,
    difficulty: 'easy',
  },

  // ── MEDIUM ────────────────────────────────────────────────────────────────
  {
    question: 'What is 17 × 13?',
    options: ['211', '221', '231', '241'],
    answer: 1,
    difficulty: 'medium',
  },
  {
    question: 'Which country has the largest land area?',
    options: ['USA', 'China', 'Canada', 'Russia'],
    answer: 3,
    difficulty: 'medium',
  },
  {
    question: 'What is the speed of light (approx)?',
    options: ['300,000 km/s', '150,000 km/s', '450,000 km/s', '100,000 km/s'],
    answer: 0,
    difficulty: 'medium',
  },
  {
    question: 'What is 2 to the power of 10?',
    options: ['512', '1024', '2048', '256'],
    answer: 1,
    difficulty: 'medium',
  },
  {
    question: 'In which year did World War II end?',
    options: ['1943', '1944', '1946', '1945'],
    answer: 3,
    difficulty: 'medium',
  },
  {
    question: 'What is the chemical symbol for Gold?',
    options: ['Gd', 'Go', 'Au', 'Ag'],
    answer: 2,
    difficulty: 'medium',
  },
  {
    question: 'How many bones are in the adult human body?',
    options: ['196', '206', '216', '186'],
    answer: 1,
    difficulty: 'medium',
  },
  {
    question: 'What is the largest ocean on Earth?',
    options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'],
    answer: 3,
    difficulty: 'medium',
  },
  {
    question: 'Which planet is known as the Red Planet?',
    options: ['Jupiter', 'Saturn', 'Mars', 'Venus'],
    answer: 2,
    difficulty: 'medium',
  },
  {
    question: 'What is the powerhouse of the cell?',
    options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Vacuole'],
    answer: 2,
    difficulty: 'medium',
  },

  // ── HARD ──────────────────────────────────────────────────────────────────
  {
    question: 'What is the integral of x² dx?',
    options: ['x³', '2x', 'x³/3 + C', 'x²/2 + C'],
    answer: 2,
    difficulty: 'hard',
  },
  {
    question: 'Which element has atomic number 79?',
    options: ['Silver', 'Platinum', 'Gold', 'Copper'],
    answer: 2,
    difficulty: 'hard',
  },
  {
    question: 'What is the Pythagorean triple with legs 5 and 12?',
    options: ['14', '13', '15', '17'],
    answer: 1,
    difficulty: 'hard',
  },
  {
    question: 'Who developed the theory of general relativity?',
    options: ['Newton', 'Bohr', 'Tesla', 'Einstein'],
    answer: 3,
    difficulty: 'hard',
  },
  {
    question: 'What is the value of π to 4 decimal places?',
    options: ['3.1416', '3.1412', '3.1428', '3.1400'],
    answer: 0,
    difficulty: 'hard',
  },
  {
    question: 'What is the derivative of ln(x)?',
    options: ['x', 'ln(x)/x', '1/x', 'e^x'],
    answer: 2,
    difficulty: 'hard',
  },
  {
    question: 'How many zeroes are in one googol?',
    options: ['10', '1000', '100', '1,000,000'],
    answer: 2,
    difficulty: 'hard',
  },
];

/**
 * Returns a random question biased by score.
 */
export function getRandomQuestion(score = 0) {
  const easy   = IQ_QUESTIONS.filter(q => q.difficulty === 'easy');
  const medium = IQ_QUESTIONS.filter(q => q.difficulty === 'medium');
  const hard   = IQ_QUESTIONS.filter(q => q.difficulty === 'hard');

  let pool;
  if (score < 500) {
    pool = [...easy, ...easy, ...easy, ...medium];
  } else if (score < 2000) {
    pool = [...easy, ...medium, ...medium, ...hard];
  } else {
    pool = [...medium, ...hard, ...hard];
  }

  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Picks a reward type based on rarity weights.
 *   60% → gold coins  (common)
 *   35% → blue diamond (rare)
 *    5% → red diamond  (legendary)
 */
export function getRandomReward() {
  const r = Math.random() * 100;
  if (r < 60)  return { type: 'gold', amount: Math.floor(Math.random() * 16) + 15 }; // 15–30
  if (r < 95)  return { type: 'blue', amount: 1 };
                return { type: 'red',  amount: 1 };
}