import type { Category, Difficulty, Question } from './question';

export type Phase =
  | 'setup'
  | 'starter-selection'
  | 'ready'
  | 'question'
  | 'digit-reveal'
  | 'code-entry'
  | 'code-handoff'
  | 'final-question'
  | 'result';

export type GroupId = 1 | 2;
export type PlayerId = GroupId;

export type GameResult = 'g1' | 'g2' | 'none';

export type GameConfig = {
  group1: string;
  group2: string;
  digitCategory: Category;
  digitDifficulty: Difficulty;
  digitTimeLimit: number;
  finalCategory: Category;
  finalDifficulty: Difficulty;
  finalTimeLimit: number;
};

export type ReadyMode = 'normal' | 'final';
export type SecretCodeMap = Record<GroupId, string>;
export type RevealedDigitsMap = Record<GroupId, string[]>;
export type DigitReveal = {
  groupId: GroupId;
  digit: string;
  position: number;
};

export type CodeHandoff = {
  fromGroup: GroupId;
  toGroup: GroupId;
  message: string;
  nextQuestion: Question | null;
};

export type GameState = {
  phase: Phase;
  config: GameConfig;
  activeGroup: GroupId;
  secretCodes: SecretCodeMap;
  revealedDigits: RevealedDigitsMap;
  readyMode: ReadyMode | null;
  currentQuestion: Question | null;
  finalQuestion: Question | null;
  finalFailedGroup: GroupId | null;
  lastDigitReveal: DigitReveal | null;
  codeHandoff: CodeHandoff | null;
  usedQuestionIds: string[];
  lastCodeError: string | null;
  result: GameResult | null;
  teacherUnlocked: boolean;
};

export type GameAction =
  | { type: 'UNLOCK_TEACHER' }
  | { type: 'LOCK_TEACHER' }
  | {
      type: 'SETUP_GAME';
      payload: {
        config: GameConfig;
        secretCodes: SecretCodeMap;
        firstQuestion: Question;
      };
    }
  | { type: 'CONFIRM_FIRST_GROUP'; payload: { groupId: GroupId } }
  | { type: 'START_READY_QUESTION' }
  | { type: 'NORMAL_ANSWER_CORRECT' }
  | {
      type: 'NORMAL_ANSWER_WRONG_OR_TIMEOUT';
      payload: { nextQuestion: Question | null };
    }
  | { type: 'CLEAR_CODE_ERROR' }
  | {
      type: 'CONTINUE_AFTER_DIGIT_REVEAL';
      payload: { nextQuestion: Question | null };
    }
  | { type: 'CODE_FAIL'; payload: { message: string; nextQuestion: Question | null } }
  | { type: 'CONFIRM_CODE_HANDOFF' }
  | { type: 'CODE_SUCCESS'; payload: { finalQuestion: Question } }
  | { type: 'FINAL_ANSWER_CORRECT' }
  | { type: 'FINAL_ANSWER_WRONG_OR_TIMEOUT' }
  | { type: 'RESET_GAME' };
