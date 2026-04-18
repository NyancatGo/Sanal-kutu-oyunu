import React, { createContext, useContext, useReducer, useMemo } from 'react';
import type { GameAction, GameState } from '@/types/game';
import { EMPTY_COOLDOWN, INITIAL_STATE, newRoundState } from '@/utils/resetGame';

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'UNLOCK_TEACHER':
      return { ...state, teacherUnlocked: true };

    case 'LOCK_TEACHER':
      return { ...state, teacherUnlocked: false };

    case 'SETUP_GAME':
      return {
        ...INITIAL_STATE,
        config: action.payload,
        phase: 'player-select',
        activePlayer: 1,
        playerCooldownUntil: { ...EMPTY_COOLDOWN },
      };

    case 'SELECT_PLAYER_FOR_CODE': {
      if (state.phase !== 'player-select') return state;
      if (state.currentQuestion !== null) return state;
      const cooldownUntil = state.playerCooldownUntil[action.payload.playerId] ?? 0;
      if (action.payload.now < cooldownUntil) return state;
      return {
        ...state,
        phase: 'code',
        activePlayer: action.payload.playerId,
        lastCodeError: null,
      };
    }

    case 'SELECT_PLAYER_FOR_QUESTION': {
      if (state.phase !== 'player-select') return state;
      if (!state.currentQuestion || state.failedQuestionPlayer === null) return state;
      if (state.failedQuestionPlayer === action.payload.playerId) return state;
      const cooldownUntil = state.playerCooldownUntil[action.payload.playerId] ?? 0;
      if (action.payload.now < cooldownUntil) return state;
      return {
        ...state,
        phase: 'question',
        activePlayer: action.payload.playerId,
      };
    }

    case 'CODE_FAIL':
      if (state.phase !== 'code') return state;
      if (action.payload.playerId !== state.activePlayer) return state;
      return {
        ...state,
        phase: 'player-select',
        playerCooldownUntil: {
          ...state.playerCooldownUntil,
          [action.payload.playerId]: action.payload.cooldownUntil,
        },
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

    case 'ANSWER_CORRECT': {
      if (state.phase !== 'question') return state;
      const winner: 'p1' | 'p2' = state.activePlayer === 1 ? 'p1' : 'p2';
      return {
        ...state,
        phase: 'result',
        result: winner,
        scores: {
          ...state.scores,
          [winner]: state.scores[winner] + 1,
        },
      };
    }

    case 'ANSWER_WRONG_OR_TIMEOUT': {
      if (state.phase !== 'question') return state;
      if (state.failedQuestionPlayer !== null) {
        return { ...state, phase: 'result', result: 'none' };
      }
      return {
        ...state,
        phase: 'player-select',
        failedQuestionPlayer: state.activePlayer,
        playerCooldownUntil: {
          ...state.playerCooldownUntil,
          [state.activePlayer]: action.payload.cooldownUntil,
        },
      };
    }

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
