import type {
  Condition,
  ConditionProblem,
  EliminationProblem,
  HypothesisProblem,
  OrderingProblem,
} from '../conditionProblems';

export type ConditionValidationResult = {
  isCorrect: boolean;
  failedConditionIds: string[];
  selectedChoiceId: string;
};

export type EliminationValidationResult = {
  isCorrect: boolean;
  selectedChoiceIds: string[];
  missedInvalidIds: string[];
  wrongExcludedIds: string[];
};

export type ValidationResult =
  | ConditionValidationResult
  | EliminationValidationResult;

const checkCondition = (
  condition: Condition,
  mapping: Record<string, string>,
): boolean => {
  if (condition.type === 'equals') {
    return mapping[condition.entity] === condition.attribute;
  }

  if (condition.type === 'notEquals') {
    return mapping[condition.entity] !== condition.attribute;
  }

  // ifThen: 前提が成立した場合のみ then 条件をチェックする
  const premiseOk = checkCondition(condition.if, mapping);
  if (!premiseOk) return true;
  return checkCondition(condition.then, mapping);
};

const permute = (arr: string[]): string[][] => {
  if (arr.length <= 1) return [arr];
  const result: string[][] = [];
  arr.forEach((item, index) => {
    const rest = [...arr.slice(0, index), ...arr.slice(index + 1)];
    const restPermutations = permute(rest);
    restPermutations.forEach((perm) => {
      result.push([item, ...perm]);
    });
  });
  return result;
};

const buildAssignments = (
  entities: string[],
  attributes: string[],
): Array<Record<string, string>> =>
  permute([...attributes]).map((perm) => {
    const mapping: Record<string, string> = {};
    entities.forEach((entity, index) => {
      mapping[entity] = perm[index];
    });
    return mapping;
  });

const filterAssignments = (
  conditions: Condition[],
  assignments: Array<Record<string, string>>,
): Array<Record<string, string>> =>
  assignments.filter((assignment) =>
    conditions.every((condition) => checkCondition(condition, assignment)),
  );

const findHypothesisConflicts = (
  baseConditions: Condition[],
  hypothesis: Condition,
  assignments: Array<Record<string, string>>,
): string[] => {
  const combined = filterAssignments(
    [...baseConditions, hypothesis],
    assignments,
  );
  if (combined.length > 0) return [];

  const conflicts = baseConditions
    .filter((condition) => {
      const reduced = baseConditions.filter((item) => item.id !== condition.id);
      const reducedSolutions = filterAssignments(
        [...reduced, hypothesis],
        assignments,
      );
      return reducedSolutions.length > 0;
    })
    .map((condition) => condition.id);

  return conflicts.length > 0 ? conflicts : baseConditions.map((c) => c.id);
};

export const validateConditionProblem = (
  problem: ConditionProblem | OrderingProblem,
  selectedChoiceId: string,
): ConditionValidationResult => {
  const choice = problem.choices.find((c) => c.id === selectedChoiceId);
  if (!choice) {
    throw new Error('Choice not found');
  }

  const failedConditionIds = problem.conditions
    .filter((condition) => !checkCondition(condition, choice.mapping))
    .map((condition) => condition.id);

  return {
    selectedChoiceId,
    isCorrect: failedConditionIds.length === 0,
    failedConditionIds,
  };
};

export const validateOrderingProblem = (
  problem: OrderingProblem,
  order: Array<string | null>,
): ConditionValidationResult => {
  const expectedLength = problem.entities.length;
  if (
    order.length !== expectedLength ||
    order.some((value) => value === null)
  ) {
    return {
      selectedChoiceId: order.join(''),
      isCorrect: false,
      failedConditionIds: problem.conditions.map((condition) => condition.id),
    };
  }

  const filledOrder = order.filter(
    (value): value is string => value !== null,
  );
  const uniqueCount = new Set(filledOrder).size;
  if (uniqueCount !== expectedLength) {
    return {
      selectedChoiceId: filledOrder.join(''),
      isCorrect: false,
      failedConditionIds: problem.conditions.map((condition) => condition.id),
    };
  }

  const mapping: Record<string, string> = {};
  filledOrder.forEach((entity, index) => {
    mapping[entity] = problem.attributes[index];
  });

  const failedConditionIds = problem.conditions
    .filter((condition) => !checkCondition(condition, mapping))
    .map((condition) => condition.id);

  return {
    selectedChoiceId: filledOrder.join(''),
    isCorrect: failedConditionIds.length === 0,
    failedConditionIds,
  };
};

export const validateHypothesisProblem = (
  problem: HypothesisProblem,
  selectedChoiceId: string,
): ConditionValidationResult => {
  const hypothesis = problem.hypotheses.find(
    (option) => option.id === selectedChoiceId,
  );
  if (!hypothesis) {
    throw new Error('Hypothesis not found');
  }

  const assignments = buildAssignments(problem.entities, problem.attributes);
  const failedConditionIds = findHypothesisConflicts(
    problem.conditions,
    hypothesis.condition,
    assignments,
  );

  return {
    selectedChoiceId,
    isCorrect: selectedChoiceId === problem.correctChoiceId,
    failedConditionIds,
  };
};

export const getHypothesisConflicts = (
  problem: HypothesisProblem,
  selectedChoiceId: string,
): string[] => {
  const hypothesis = problem.hypotheses.find(
    (option) => option.id === selectedChoiceId,
  );
  if (!hypothesis) return [];
  const assignments = buildAssignments(problem.entities, problem.attributes);
  return findHypothesisConflicts(
    problem.conditions,
    hypothesis.condition,
    assignments,
  );
};

export const validateEliminationProblem = (
  problem: EliminationProblem,
  selectedChoiceIds: string[],
): EliminationValidationResult => {
  const selectedSet = new Set(selectedChoiceIds);
  const invalidSet = new Set(problem.invalidChoiceIds);

  const missedInvalidIds = problem.invalidChoiceIds.filter(
    (id) => !selectedSet.has(id),
  );
  const wrongExcludedIds = selectedChoiceIds.filter(
    (id) => !invalidSet.has(id),
  );

  return {
    isCorrect: missedInvalidIds.length === 0 && wrongExcludedIds.length === 0,
    selectedChoiceIds: [...selectedSet],
    missedInvalidIds,
    wrongExcludedIds,
  };
};
