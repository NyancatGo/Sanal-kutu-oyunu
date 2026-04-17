import React, { createContext, useContext, useReducer, useMemo } from 'react';
import type { GameAction, GameState } from '@/types/game';
import { INITIAL_STATE, newRoundState } from '@/utils/resetGame';

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SETUP_GAME':
      return {
        ...INITIAL_STATE,
        config: action.payload,
        phase: 'code',
        activePlayer: 1,
      };

    case 'START_CODE_ENTRY':
      return { ...state, phase: 'code', lastCodeError: null };

    case 'CODE_FAIL':
      return {
        ...state,
        lockUntil: action.payload.lockUntil,
        lastCodeError: action.payload.message,
      };

    case 'CLEAR_CODE_ERROR':
      return { ...state, lastCodeError: null };

    case 'CODE_SUCCESS':
      if (state.phase !== 'code') return state;
      return {
        ...state,
        phase: 'reveal',
        currentQuestion: action.payload.question,
        usedQuestionIds: [...state.usedQuestionIds, action.payload.question.id],
        lastCodeError: null,
      };

    case 'START_QUESTION':
      if (state.phase !== 'reveal') return state;
      return { ...state, phase: 'question' };

    case 'ANSWER_CORRECT':
      if (state.phase !== 'question') return state;
      return {
        ...state,
        phase: 'result',
        result: state.activePlayer === 1 ? 'p1' : 'p2',
      };

    case 'ANSWER_WRONG_OR_TIMEOUT':
      if (state.phase !== 'question') return state;
      if (state.firstAttempterFailed) {
        return { ...state, phase: 'result', result: 'none' };
      }
      return {
        ...state,
        phase: 'handoff',
        firstAttempterFailed: true,
      };

    case 'CONTINUE_HANDOFF':
      if (state.phase !== 'handoff') return state;
      return {
        ...state,
        phase: 'question',
        activePlayer: state.activePlayer === 1 ? 2 : 1,
      };

    case 'NEW_ROUND':
      return newRoundState(state);

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
