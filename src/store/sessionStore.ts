import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Problem,
  Condition,
  Difficulty,
} from '../domain/conditionProblems';
import type {
  ValidationResult,
} from '../domain/validator/conditionValidator';
import {
  validateConditionProblem,
  validateEliminationProblem,
  validateHypothesisProblem,
  validateOrderingProblem,
} from '../domain/validator/conditionValidator';

export type ThinkingDraft = {
  checkedConditionIds: string[];
  memo: string;
  hypotheses: string[];
};

export type QuestionAttempt = {
  problemId: string;
  problemType: 'condition' | 'elimination' | 'ordering' | 'hypothesis';
  conditions: Condition[];
  result: ValidationResult;
  draftAtSubmit: ThinkingDraft;
};

export type SessionStatus = 'idle' | 'playing' | 'paused' | 'finished';

type SessionState = {
  status: SessionStatus;
  problems: Problem[];
  total: number;
  currentIndex: number;
  selectedChoiceIds: Array<string | null>;
  thinkingDraft: ThinkingDraft;
  settings: {
    currentDifficulty: Difficulty | 'auto';
  };
  isReviewOpen: boolean;
  validationResult: ValidationResult | null;
  draftAtSubmit: ThinkingDraft | null;
  attempts: QuestionAttempt[];
  startSession: (problems: Problem[], difficulty: Difficulty | 'auto') => void;
  selectChoice: (choiceId: string) => void;
  toggleChoice: (choiceId: string) => void;
  toggleConditionCheck: (conditionId: string) => void;
  updateMemo: (memo: string) => void;
  addHypothesis: (label: string) => void;
  removeHypothesis: (label: string) => void;
  submitAnswer: () => void;
  setOrderingOrder: (order: Array<string | null>) => void;
  next: () => { finished: boolean };
  reset: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
};

const emptyDraft = (): ThinkingDraft => ({
  checkedConditionIds: [],
  memo: '',
  hypotheses: [],
});

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      status: 'idle',
      problems: [],
      total: 10,
      currentIndex: 0,
      selectedChoiceIds: [],
      thinkingDraft: emptyDraft(),
      settings: {
        currentDifficulty: 'auto',
      },
      isReviewOpen: false,
      validationResult: null,
      draftAtSubmit: null,
      attempts: [],
      startSession: (problems, difficulty) =>
        set({
          status: 'playing',
          problems,
          total: problems.length,
          currentIndex: 0,
          selectedChoiceIds: [],
          thinkingDraft: emptyDraft(),
          settings: {
            currentDifficulty: difficulty,
          },
          isReviewOpen: false,
          validationResult: null,
          draftAtSubmit: null,
          attempts: [],
        }),
      selectChoice: (choiceId) => set({ selectedChoiceIds: [choiceId] }),
      toggleChoice: (choiceId) =>
        set((state) => {
          const exists = state.selectedChoiceIds.includes(choiceId);
          return {
            selectedChoiceIds: exists
              ? state.selectedChoiceIds.filter((id) => id !== choiceId)
              : [...state.selectedChoiceIds.filter(Boolean), choiceId],
          };
        }),
      toggleConditionCheck: (conditionId) =>
        set((state) => {
          const exists = state.thinkingDraft.checkedConditionIds.includes(conditionId);
          const nextIds = exists
            ? state.thinkingDraft.checkedConditionIds.filter((id) => id !== conditionId)
            : [...state.thinkingDraft.checkedConditionIds, conditionId];
          return {
            thinkingDraft: {
              ...state.thinkingDraft,
              checkedConditionIds: nextIds,
            },
          };
        }),
      updateMemo: (memo) =>
        set((state) => ({
          thinkingDraft: {
            ...state.thinkingDraft,
            memo,
          },
        })),
      addHypothesis: (label) => {
        const trimmed = label.trim();
        if (!trimmed) return;
        set((state) => ({
          thinkingDraft: {
            ...state.thinkingDraft,
            hypotheses: [...state.thinkingDraft.hypotheses, trimmed],
          },
        }));
      },
      removeHypothesis: (label) =>
        set((state) => ({
          thinkingDraft: {
            ...state.thinkingDraft,
            hypotheses: state.thinkingDraft.hypotheses.filter((item) => item !== label),
          },
        })),
      setOrderingOrder: (order) => set({ selectedChoiceIds: order }),
      submitAnswer: () => {
        const { problems, currentIndex, selectedChoiceIds, thinkingDraft } = get();
        const problem = problems[currentIndex];
        if (!problem) return;
        if (problem.type !== 'ordering' && selectedChoiceIds.length === 0) return;
        if (
          problem.type === 'ordering' &&
          (selectedChoiceIds.length !== 3 ||
            selectedChoiceIds.some((value) => value === null))
        ) {
          return;
        }
        const result =
          problem.type === 'condition'
            ? validateConditionProblem(problem, selectedChoiceIds[0] as string)
            : problem.type === 'ordering'
              ? validateOrderingProblem(problem, selectedChoiceIds)
              : problem.type === 'hypothesis'
                ? validateHypothesisProblem(problem, selectedChoiceIds[0] as string)
                : validateEliminationProblem(problem, selectedChoiceIds as string[]);
        set({
          isReviewOpen: true,
          validationResult: result,
          draftAtSubmit: {
            checkedConditionIds: [...thinkingDraft.checkedConditionIds],
            memo: thinkingDraft.memo,
            hypotheses: [...thinkingDraft.hypotheses],
          },
        });
      },
      next: () => {
        const {
          validationResult,
          draftAtSubmit,
          currentIndex,
          problems,
          attempts,
        } = get();
        if (!validationResult || !draftAtSubmit) {
          return { finished: false };
        }
        const problem = problems[currentIndex];
        if (!problem) return { finished: false };

        const nextAttempts: QuestionAttempt[] = [
          ...attempts,
          {
            problemId: problem.id,
            problemType: problem.type,
            conditions: problem.conditions,
            result: validationResult,
            draftAtSubmit,
          },
        ];
        const nextIndex = currentIndex + 1;
        const finished = nextIndex >= problems.length;

        set({
          attempts: nextAttempts,
          currentIndex: finished ? currentIndex : nextIndex,
          selectedChoiceIds: [],
          thinkingDraft: emptyDraft(),
          isReviewOpen: false,
          validationResult: null,
          draftAtSubmit: null,
          status: finished ? 'finished' : 'playing',
        });
        return { finished };
      },
      reset: () =>
        set({
          status: 'idle',
          problems: [],
          total: 10,
          currentIndex: 0,
          selectedChoiceIds: [],
          thinkingDraft: emptyDraft(),
          settings: {
            currentDifficulty: 'auto',
          },
          isReviewOpen: false,
          validationResult: null,
          draftAtSubmit: null,
          attempts: [],
        }),
      pauseSession: () => set({ status: 'paused', isReviewOpen: false }),
      resumeSession: () =>
        set((state) =>
          state.status === 'paused'
            ? { status: 'playing', isReviewOpen: false, validationResult: null, draftAtSubmit: null }
            : state,
        ),
    }),
    {
      name: 'roji_challe_session',
      partialize: (state) => ({
        status: state.status,
        problems: state.problems,
        total: state.total,
        currentIndex: state.currentIndex,
        selectedChoiceIds: state.selectedChoiceIds,
        thinkingDraft: state.thinkingDraft,
        settings: state.settings,
        attempts: state.attempts,
      }),
    },
  ),
);
