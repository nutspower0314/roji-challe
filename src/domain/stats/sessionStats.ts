import type { QuestionAttempt } from '../../store/sessionStore';
import type { Condition } from '../conditionProblems';

type TypeSummary = {
  total: number;
  correct: number;
  accuracyPercent: number;
};

export type SessionStats = {
  overall: {
    total: number;
    correct: number;
    accuracyPercent: number;
  };
  byType: Record<'condition' | 'elimination' | 'ordering' | 'hypothesis', TypeSummary>;
  conditionStats: {
    avgConditionCheckRate: number;
    missedFailedCount: number;
    ifThenFailedCount: number;
  };
  eliminationStats: {
    avgExcludedCount: number;
    missedCountTotal: number;
    falseExclusionTotal: number;
  };
  hypothesisStats: {
    wrongCount: number;
    avgConflictHintsShown: number;
    emptyConflictCount: number;
  };
};

const isIfThen = (condition: Condition | undefined): boolean =>
  condition?.type === 'ifThen';

export const computeSessionStats = (
  attempts: QuestionAttempt[],
): SessionStats => {
  const overallTotal = attempts.length;
  const overallCorrect = attempts.filter((attempt) => attempt.result.isCorrect).length;
  const overallAccuracyPercent =
    overallTotal === 0 ? 0 : Math.round((overallCorrect / overallTotal) * 100);

  const byType: SessionStats['byType'] = {
    condition: { total: 0, correct: 0, accuracyPercent: 0 },
    elimination: { total: 0, correct: 0, accuracyPercent: 0 },
    ordering: { total: 0, correct: 0, accuracyPercent: 0 },
    hypothesis: { total: 0, correct: 0, accuracyPercent: 0 },
  };

  let conditionAttemptCount = 0;
  let conditionCheckedSum = 0;
  let missedFailedCount = 0;
  let ifThenFailedCount = 0;

  let eliminationAttemptCount = 0;
  let excludedCountSum = 0;
  let missedCountTotal = 0;
  let falseExclusionTotal = 0;

  let hypothesisAttemptCount = 0;
  let hypothesisWrongCount = 0;
  let hypothesisConflictSum = 0;
  let hypothesisEmptyConflictCount = 0;

  attempts.forEach((attempt) => {
    byType[attempt.problemType].total += 1;
    if (attempt.result.isCorrect) {
      byType[attempt.problemType].correct += 1;
    }

    if (attempt.problemType === 'condition' || attempt.problemType === 'ordering') {
      conditionAttemptCount += 1;
      const condTotal = attempt.conditions.length || 1;
      const checked = attempt.draftAtSubmit.checkedConditionIds.length;
      conditionCheckedSum += Math.min(checked, condTotal) / condTotal;

      if (!attempt.result.isCorrect && 'failedConditionIds' in attempt.result) {
        const checkedSet = new Set(attempt.draftAtSubmit.checkedConditionIds);
        const failedConditions = attempt.result.failedConditionIds
          .map((id) => attempt.conditions.find((condition) => condition.id === id))
          .filter((condition): condition is Condition => Boolean(condition));

        if (failedConditions.length > 0) {
          if (failedConditions.some((condition) => !checkedSet.has(condition.id))) {
            missedFailedCount += 1;
          }
          if (failedConditions.some((condition) => isIfThen(condition))) {
            ifThenFailedCount += 1;
          }
        }
      }
    }

    if (attempt.problemType === 'elimination' && 'selectedChoiceIds' in attempt.result) {
      eliminationAttemptCount += 1;
      excludedCountSum += attempt.result.selectedChoiceIds.length;
      missedCountTotal += attempt.result.missedInvalidIds.length;
      falseExclusionTotal += attempt.result.wrongExcludedIds.length;
    }

    if (attempt.problemType === 'hypothesis') {
      hypothesisAttemptCount += 1;
      if (!attempt.result.isCorrect) hypothesisWrongCount += 1;
      if ('failedConditionIds' in attempt.result) {
        const count = attempt.result.failedConditionIds.length;
        hypothesisConflictSum += count;
        if (count === 0) hypothesisEmptyConflictCount += 1;
      }
    }
  });

  (Object.keys(byType) as Array<keyof SessionStats['byType']>).forEach((key) => {
    const bucket = byType[key];
    bucket.accuracyPercent =
      bucket.total === 0 ? 0 : Math.round((bucket.correct / bucket.total) * 100);
  });

  return {
    overall: {
      total: overallTotal,
      correct: overallCorrect,
      accuracyPercent: overallAccuracyPercent,
    },
    byType,
    conditionStats: {
      avgConditionCheckRate:
        conditionAttemptCount === 0 ? 0 : conditionCheckedSum / conditionAttemptCount,
      missedFailedCount,
      ifThenFailedCount,
    },
    eliminationStats: {
      avgExcludedCount:
        eliminationAttemptCount === 0 ? 0 : excludedCountSum / eliminationAttemptCount,
      missedCountTotal,
      falseExclusionTotal,
    },
    hypothesisStats: {
      wrongCount: hypothesisWrongCount,
      avgConflictHintsShown:
        hypothesisAttemptCount === 0
          ? 0
          : hypothesisConflictSum / hypothesisAttemptCount,
      emptyConflictCount: hypothesisEmptyConflictCount,
    },
  };
};
