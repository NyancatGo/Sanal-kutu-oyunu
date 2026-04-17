import type { GameConfig, GameState } from '@/types/game';

export const DEFAULT_CONFIG: GameConfig = {
  player1: '',
  player2: '',
  secretCode: '',
  category: 'genel-kultur',
  difficulty: 'easy',
  timeLimit: 30,
};

export const INITIAL_STATE: GameState = {
  phase: 'setup',
  config: DEFAULT_CONFIG,
  activePlayer: 1,
  firstAttempterFailed: false,
  currentQuestion: null,
  usedQuestionIds: [],
  lockUntil: 0,
  lastCodeError: null,
  result: null,
  teacherUnlocked: false,
};

export function newRoundState(prev: GameState): GameState {
  return {
    ...INITIAL_STATE,
    config: prev.config,
    phase: 'code',
    usedQuestionIds: prev.usedQuestionIds,
  };
}
