# Şifre Kutusu (Virtual Box Game) - Project Context & Deep Analysis

This document provides a comprehensive and deep architectural analysis of the **Şifre Kutusu** project. It is designed to give AI assistants (like Claude) a complete mental model of the application's structure, state management, and business logic without needing to read every file individually, thereby saving tokens and improving response accuracy.

## 1. Project Overview & Tech Stack

**Şifre Kutusu** is a hybrid educational classroom game built for mobile devices. Two groups of students compete to unlock a "virtual combination lock." They earn digits for their group's secret code by answering questions correctly. Once a 4-digit code is collected, they enter it into a mechanical-style lock UI to access the final question and win the game. 
The game operates entirely offline on a single device, typically controlled by a teacher.

**Core Tech Stack:**
- **Framework:** React Native with Expo (SDK 54)
- **Language:** TypeScript (Strict mode enabled)
- **Routing:** Expo Router (File-based routing in the `app/` directory)
- **State Management:** React Context API + `useReducer` (Centralized state machine)
- **Styling:** React Native `StyleSheet` with a centralized theme system (`constants/theme.ts`)
- **Animations:** React Native `Animated` API and `PanResponder` (for the lock wheel mechanism)
- **Feedback:** `expo-haptics` for tactile feedback during interactions.

---

## 2. Directory Structure

```text
Sanal-kutu-oyunu/
├── app/                  # Expo Router screens (Navigation)
│   ├── _layout.tsx       # Root layout, providers (GameProvider, SafeArea)
│   ├── index.tsx         # Home/Landing screen
│   ├── setup.tsx         # Teacher setup (Group names, categories, difficulty)
│   ├── starter-select.tsx# Selects which group starts the game
│   ├── question.tsx      # Handles normal digit questions & final questions
│   ├── reveal.tsx        # Success screen showing the earned digit
│   ├── code-entry.tsx    # The mechanical combination lock screen
│   ├── code-handoff.tsx  # Shown when a group fails the lock, passing turn
│   └── result.tsx        # Game over screen (Winner or Draw)
├── components/           # Reusable UI components
│   ├── CombinationLock.tsx # The 4-digit lock UI logic and animations
│   ├── LockWheel.tsx     # Individual scrollable wheel for the lock
│   ├── Timer.tsx         # Countdown timer for questions
│   ├── QuestionCard.tsx  # UI for displaying questions
│   ├── HoldButton.tsx    # A button that requires long-press (Teacher controls)
│   └── ...
├── context/              # Global state management
│   └── GameContext.tsx   # Core reducer and context provider
├── types/                # TypeScript type definitions
│   ├── game.ts           # Game state, phases, and actions
│   └── question.ts       # Question schemas, categories, difficulties
├── utils/                # Helper functions
│   ├── generateSecretCode.ts # RNG for lock codes
│   ├── getRandomQuestion.ts  # Fetches questions from local JSON
│   └── resetGame.ts      # Initial state generator
├── data/
│   └── questions.json    # Local database of all game questions
└── constants/
    └── theme.ts          # Centralized colors, fonts, spacing, shadows
```

---

## 3. Core State Machine & Game Logic

The entire application state is managed by a single `useReducer` inside `GameContext.tsx`. The game progresses through distinct **Phases**.

### 3.1 State Interface (`GameState`)
```typescript
type GameState = {
  phase: Phase;               // Current screen/state of the game
  config: GameConfig;         // Group names, selected categories, difficulties, timers
  activeGroup: GroupId;       // 1 or 2 (Whose turn is it?)
  secretCodes: Record<GroupId, string>; // The target 4-digit code for each group
  revealedDigits: Record<GroupId, string[]>; // Digits earned so far
  readyMode: 'normal' | 'final' | null;
  currentQuestion: Question | null;
  finalQuestion: Question | null;
  finalFailedGroup: GroupId | null; // Tracks if a group failed the final question
  lastDigitReveal: DigitReveal | null; // Data for the reveal screen
  codeHandoff: CodeHandoff | null; // Data for turn-passing after lock failure
  usedQuestionIds: string[];  // Prevents duplicate questions
  lastCodeError: string | null;
  result: 'g1' | 'g2' | 'none' | null; // Winner
  teacherUnlocked: boolean;   // Guard for teacher-only screens
};
```

### 3.2 Game Phases (`Phase`)
The application is strictly driven by the `phase` state. Screens often check this state and redirect if the user is on the wrong screen for the current phase.
1. `setup`: Teacher configures the game.
2. `starter-selection`: Deciding if Group 1 or Group 2 starts.
3. `ready`: A staging screen ("Are you ready?") before a question starts.
4. `question`: Active timer, displaying a digit-earning question.
5. `digit-reveal`: Group answered correctly and sees their new digit.
6. `code-entry`: A group has 4 digits and is attempting to unlock the mechanical lock.
7. `code-handoff`: A group entered the wrong code; the device is handed to the other group.
8. `final-question`: The group that unlocked the padlock attempts the win-condition question.
9. `result`: Game over.

### 3.3 Core Reducer Actions
- `SETUP_GAME`: Initializes config, generates two distinct 4-digit secret codes.
- `NORMAL_ANSWER_CORRECT`: Appends a digit to `revealedDigits`. If 4 digits are reached, shifts phase to `code-entry`.
- `NORMAL_ANSWER_WRONG_OR_TIMEOUT`: Shifts turn to the `otherGroup`.
- `CODE_SUCCESS`: Shifts phase to `ready` (final mode).
- `CODE_FAIL`: Shifts phase to `code-handoff` to pass the device.
- `FINAL_ANSWER_CORRECT` / `FINAL_ANSWER_WRONG_OR_TIMEOUT`: Dictates the `result` of the game.

---

## 4. Key UI & UX Mechanics

### 4.1 Teacher Controls (`HoldButton`)
To prevent students from accidentally (or intentionally) accessing settings or revealing answers, critical actions require a **Long Press**.
- Implemented via `components/HoldButton.tsx` and custom `Pressable` logic.
- Used for entering setup, showing answer keys during a question, and resetting the game.

### 4.2 The Combination Lock (`CombinationLock.tsx` & `LockWheel.tsx`)
A highly polished, skeuomorphic mechanical padlock UI.
- Built using `react-native` `Animated` and `PanResponder`.
- Users swipe up/down on individual wheels (`LockWheel`) to change numbers (0-9).
- Includes physical constraints (snapping to numbers), visual feedback (shaking on error, lifting shackle on success), and haptic feedback via `expo-haptics`.

### 4.3 Data Layer
- **Questions** are entirely local (`data/questions.json`).
- Handled by `utils/getRandomQuestion.ts`, which filters by Category, Difficulty, and ensures `usedQuestionIds` are excluded so questions don't repeat in a single session.

---

## 5. Typical Game Flow

1. **Start**: App boots to `app/index.tsx`. User long-presses "Oyunu Kur" (Setup).
2. **Setup**: Teacher enters `app/setup.tsx`. Sets names, question parameters. Submits.
3. **Turn Loop**: 
   - `app/question.tsx` opens. Timer starts.
   - If Correct: Go to `app/reveal.tsx` -> Show digit -> Return to `ready` for next group.
   - If Wrong/Timeout: Instantly swap to other group's turn.
4. **Lock Phase**: Once Group X gets 4 digits, `app/code-entry.tsx` opens.
   - They enter the code.
   - **Fail**: Code is wrong. Device is handed to the other group (`app/code-handoff.tsx`), who immediately gets a question to earn their own digits or try their own code.
   - **Success**: Padlock animates open. Moves to Final phase.
5. **Final Phase**: Group X faces the final question.
   - Correct: Group X wins (`app/result.tsx`).
   - Wrong: Final question is passed to Group Y. If Group Y also fails, the game is a draw.

## 6. Development & Styling Standards
- **Styling**: Relies heavily on the `constants/theme.ts` file which exports `Colors`, `Spacing`, `Radius`, `Font`, and `Shadow`. Inline magic numbers for styling should be avoided.
- **Routing**: Handled by Expo Router `router.push()` and `router.replace()`. Screens often have `useEffect` hooks that check the Context `phase` and force a redirect if the user manually navigated to an invalid state.
- **Icons**: Uses `@expo/vector-icons/Ionicons` exclusively.

## Summary for LLM Agents
When modifying this project:
1. **State changes** MUST happen in `context/GameContext.tsx` via new or modified Actions. Do not mutate state locally in components.
2. **UI changes** should respect the `theme.ts` design tokens.
3. **Routing** relies on the phase machine. If you add a new screen, ensure it's represented in the `Phase` type and handled in the reducer.
4. **Teacher Gates**: Keep the `HoldButton` pattern for destructive or cheat-sensitive actions.
