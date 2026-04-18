import type { GameConfig, GameState, PlayerCooldownMap } from '@/types/game';

export const DEFAULT_CONFIG: GameConfig = {
  player1: '',
  player2: '',
  secretCode: '',
  category: 'genel-kultur',
  difficulty: 'easy',
  timeLimit: 30,
};

export const EMPTY_COOLDOWN: PlayerCooldownMap = { 1: 0, 2: 0 };

export const INITIAL_STATE: GameState = {
  phase: 'setup',
  config: DEFAULT_CONFIG,
  activePlayer: 1,
  failedQuestionPlayer: null,
  currentQuestion: null,
  usedQuestionIds: [],
  playerCooldownUntil: { ...EMPTY_COOLDOWN },
  lastCodeError: null,
  result: null,
  teacherUnlocked: false,
  scores: { p1: 0, p2: 0 },
  roundNumber: 1,
};

export function newRoundState(prev: GameState): GameState {
  return {
    ...INITIAL_STATE,
    config: prev.config,
    phase: 'player-select',
    usedQuestionIds: prev.usedQuestionIds,
    scores: prev.scores,
    roundNumber: prev.roundNumber + 1,
    // The player who lost the previous round starts the next one.
    activePlayer:
      prev.result === 'p1' ? 2 : prev.result === 'p2' ? 1 : prev.activePlayer,
  };
}
