import React, { createContext, useContext, useReducer, useMemo } from 'react';
import type { GameAction, GameState, GroupId, RevealedDigitsMap } from '@/types/game';
import type { Question } from '@/types/question';
import { INITIAL_STATE } from '@/utils/resetGame';

function otherGroup(groupId: GroupId): GroupId {
  return groupId === 1 ? 2 : 1;
}

function appendUsed(state: GameState, questionId: string): string[] {
  return state.usedQuestionIds.includes(questionId)
    ? state.usedQuestionIds
    : [...state.usedQuestionIds, questionId];
}

function nextTurnState(
  state: GameState,
  groupId: GroupId,
  nextQuestion: Question | null,
): GameState {
  const groupHasFullCode = state.revealedDigits[groupId].length >= 4;
  if (groupHasFullCode) {
    return {
      ...state,
      phase: 'code-entry',
      activeGroup: groupId,
      readyMode: null,
      currentQuestion: null,
      codeHandoff: null,
      lastCodeError: null,
    };
  }

  return {
    ...state,
    phase: 'ready',
    activeGroup: groupId,
    readyMode: 'normal',
    currentQuestion: nextQuestion,
    codeHandoff: null,
    lastCodeError: null,
    usedQuestionIds: nextQuestion
      ? appendUsed(state, nextQuestion.id)
      : state.usedQuestionIds,
  };
}

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'UNLOCK_TEACHER':
      return { ...state, teacherUnlocked: true };

    case 'LOCK_TEACHER':
      return { ...state, teacherUnlocked: false };

    case 'SETUP_GAME':
      return {
        ...INITIAL_STATE,
        config: action.payload.config,
        secretCodes: action.payload.secretCodes,
        phase: 'starter-selection',
        activeGroup: 1,
        readyMode: null,
        currentQuestion: action.payload.firstQuestion,
        codeHandoff: null,
        usedQuestionIds: [action.payload.firstQuestion.id],
      };

    case 'CONFIRM_FIRST_GROUP':
      if (state.phase !== 'starter-selection') return state;
      return {
        ...state,
        phase: 'ready',
        activeGroup: action.payload.groupId,
        readyMode: 'normal',
      };

    case 'START_READY_QUESTION':
      if (state.phase !== 'ready') return state;
      if (state.readyMode === 'normal' && state.currentQuestion) {
        return { ...state, phase: 'question', codeHandoff: null, lastCodeError: null };
      }
      if (state.readyMode === 'final' && state.finalQuestion) {
        return { ...state, phase: 'final-question', codeHandoff: null, lastCodeError: null };
      }
      return state;

    case 'NORMAL_ANSWER_CORRECT': {
      if (state.phase !== 'question') return state;
      const currentDigits = state.revealedDigits[state.activeGroup];
      if (currentDigits.length >= 4) {
        return {
          ...state,
          phase: 'code-entry',
          readyMode: null,
          currentQuestion: null,
          codeHandoff: null,
        };
      }
      const position = currentDigits.length;
      const digit = state.secretCodes[state.activeGroup][position];
      const revealedDigits: RevealedDigitsMap = {
        ...state.revealedDigits,
        [state.activeGroup]: [...currentDigits, digit],
      };
      return {
        ...state,
        phase: 'digit-reveal',
        readyMode: null,
        revealedDigits,
        lastDigitReveal: {
          groupId: state.activeGroup,
          digit,
          position,
        },
        codeHandoff: null,
        lastCodeError: null,
      };
    }

    case 'NORMAL_ANSWER_WRONG_OR_TIMEOUT':
      if (state.phase !== 'question') return state;
      return nextTurnState(state, otherGroup(state.activeGroup), action.payload.nextQuestion);

    case 'CLEAR_CODE_ERROR':
      return { ...state, lastCodeError: null };

    case 'CONTINUE_AFTER_DIGIT_REVEAL': {
      if (state.phase !== 'digit-reveal') return state;
      if (state.revealedDigits[state.activeGroup].length >= 4) {
        return {
          ...state,
          phase: 'code-entry',
          readyMode: null,
          currentQuestion: null,
          codeHandoff: null,
          lastCodeError: null,
        };
      }
      return nextTurnState(state, otherGroup(state.activeGroup), action.payload.nextQuestion);
    }

    case 'CODE_FAIL':
      if (state.phase !== 'code-entry') return state;
      return {
        ...state,
        phase: 'code-handoff',
        readyMode: null,
        currentQuestion: null,
        codeHandoff: {
          fromGroup: state.activeGroup,
          toGroup: otherGroup(state.activeGroup),
          message: action.payload.message,
          nextQuestion: action.payload.nextQuestion,
        },
        lastCodeError: action.payload.message,
      };

    case 'CONFIRM_CODE_HANDOFF':
      if (state.phase !== 'code-handoff' || !state.codeHandoff) return state;
      return {
        ...nextTurnState(
          state,
          state.codeHandoff.toGroup,
          state.codeHandoff.nextQuestion,
        ),
        codeHandoff: null,
        lastCodeError: null,
      };

    case 'CODE_SUCCESS':
      if (state.phase !== 'code-entry') return state;
      return {
        ...state,
        phase: 'ready',
        readyMode: 'final',
        currentQuestion: null,
        finalQuestion: action.payload.finalQuestion,
        finalFailedGroup: null,
        codeHandoff: null,
        usedQuestionIds: appendUsed(state, action.payload.finalQuestion.id),
        lastCodeError: null,
      };

    case 'FINAL_ANSWER_CORRECT': {
      if (state.phase !== 'final-question') return state;
      const winner = state.activeGroup === 1 ? 'g1' : 'g2';
      return {
        ...state,
        phase: 'result',
        result: winner,
      };
    }

    case 'FINAL_ANSWER_WRONG_OR_TIMEOUT': {
      if (state.phase !== 'final-question') return state;
      if (state.finalFailedGroup !== null) {
        return { ...state, phase: 'result', result: 'none' };
      }
      return {
        ...state,
        phase: 'ready',
        activeGroup: otherGroup(state.activeGroup),
        readyMode: 'final',
        finalFailedGroup: state.activeGroup,
        codeHandoff: null,
      };
    }

    case 'RESET_GAME':
      return INITIAL_STATE;

    default:
      return state;
  }
}

type GameContextValue = {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
};

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
