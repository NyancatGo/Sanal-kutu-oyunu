import type { GameConfig, GameState, RevealedDigitsMap, SecretCodeMap } from '@/types/game';

export const DEFAULT_CONFIG: GameConfig = {
  group1: '',
  group2: '',
  digitCategory: 'genel-kultur',
  digitDifficulty: 'easy',
  digitTimeLimit: 30,
  finalCategory: 'genel-kultur',
  finalDifficulty: 'easy',
  finalTimeLimit: 30,
};

export const EMPTY_SECRET_CODES: SecretCodeMap = { 1: '', 2: '' };
export const EMPTY_REVEALED_DIGITS: RevealedDigitsMap = { 1: [], 2: [] };

export const INITIAL_STATE: GameState = {
  phase: 'setup',
  config: DEFAULT_CONFIG,
  activeGroup: 1,
  secretCodes: { ...EMPTY_SECRET_CODES },
  revealedDigits: { 1: [...EMPTY_REVEALED_DIGITS[1]], 2: [...EMPTY_REVEALED_DIGITS[2]] },
  readyMode: null,
  currentQuestion: null,
  finalQuestion: null,
  finalFailedGroup: null,
  lastDigitReveal: null,
  codeHandoff: null,
  usedQuestionIds: [],
  lastCodeError: null,
  result: null,
  teacherUnlocked: false,
};
