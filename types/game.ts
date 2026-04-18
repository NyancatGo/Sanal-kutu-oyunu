import type { Category, Difficulty, Question } from './question';

export type Phase =
  | 'setup'
  | 'player-select'
  | 'code'
  | 'reveal'
  | 'question'
  | 'result';

export type PlayerId = 1 | 2;

export type GameResult = 'p1' | 'p2' | 'none';

export type GameConfig = {
  player1: string;
  player2: string;
  secretCode: string;
  category: Category;
  difficulty: Difficulty;
  timeLimit: number;
};

export type Scores = { p1: number; p2: number };

export type PlayerCooldownMap = Record<PlayerId, number>;

export type GameState = {
  phase: Phase;
  config: GameConfig;
  activePlayer: PlayerId;
  failedQuestionPlayer: PlayerId | null;
  currentQuestion: Question | null;
  usedQuestionIds: string[];
  playerCooldownUntil: PlayerCooldownMap;
  lastCodeError: string | null;
  result: GameResult | null;
  teacherUnlocked: boolean;
  scores: Scores;
  roundNumber: number;
};

export type GameAction =
  | { type: 'UNLOCK_TEACHER' }
  | { type: 'LOCK_TEACHER' }
  | { type: 'SETUP_GAME'; payload: GameConfig }
  | { type: 'SELECT_PLAYER_FOR_CODE'; payload: { playerId: PlayerId; now: number } }
  | { type: 'SELECT_PLAYER_FOR_QUESTION'; payload: { playerId: PlayerId; now: number } }
  | {
      type: 'CODE_FAIL';
      payload: { playerId: PlayerId; cooldownUntil: number; message: string };
    }
  | { type: 'CLEAR_CODE_ERROR' }
  | { type: 'CODE_SUCCESS'; payload: { question: Question } }
  | { type: 'START_QUESTION' }
  | { type: 'ANSWER_CORRECT' }
  | { type: 'ANSWER_WRONG_OR_TIMEOUT'; payload: { cooldownUntil: number } }
  | { type: 'NEW_ROUND' }
  | { type: 'RESET_GAME' };
