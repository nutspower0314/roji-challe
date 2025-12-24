export type Difficulty = 1 | 2 | 3;

export type Condition =
  | {
      id: string;
      type: 'equals';
      entity: string;
      attribute: string;
      label: string;
    }
  | {
      id: string;
      type: 'notEquals';
      entity: string;
      attribute: string;
      label: string;
    }
  | {
      id: string;
      type: 'ifThen';
      if: Condition;
      then: Condition;
      label: string;
    };

export type Choice = {
  id: string;
  mapping: Record<string, string>;
  label: string;
};

export type ConditionProblem = {
  id: string;
  type: 'condition';
  difficulty: Difficulty;
  entities: string[];
  attributes: string[];
  question: string;
  conditions: Condition[];
  choices: Choice[];
  correctChoiceId: string;
};

export type EliminationProblem = {
  id: string;
  type: 'elimination';
  difficulty: Difficulty;
  entities: string[];
  attributes: string[];
  question: string;
  conditions: Condition[];
  choices: Choice[];
  correctChoiceId: string;
  invalidChoiceIds: string[];
};

export type OrderingProblem = {
  id: string;
  type: 'ordering';
  difficulty: Difficulty;
  entities: string[];
  attributes: string[];
  conditions: Condition[];
  question: string;
  choices: Choice[];
  correctChoiceId: string;
};

export type HypothesisOption = {
  id: string;
  label: string;
  condition: Condition;
};

export type HypothesisProblem = {
  id: string;
  type: 'hypothesis';
  difficulty: Difficulty;
  entities: string[];
  attributes: string[];
  conditions: Condition[];
  question: string;
  hypotheses: HypothesisOption[];
  correctChoiceId: string;
};

export type Problem =
  | ConditionProblem
  | EliminationProblem
  | OrderingProblem
  | HypothesisProblem;

const ENTITIES = ['A', 'B', 'C'] as const;
const ATTRIBUTES = ['赤', '青', '緑'] as const;

type Theme = {
  id: string;
  subject: string;
  attributes: string[];
};

const THEMES: Theme[] = [
  { id: 'hat', subject: '帽子', attributes: ['赤', '青', '緑'] },
  { id: 'drink', subject: '飲み物', attributes: ['コーヒー', '紅茶', '水'] },
  { id: 'pet', subject: 'ペット', attributes: ['犬', '猫', '鳥'] },
  { id: 'fruit', subject: '果物', attributes: ['りんご', 'バナナ', 'ぶどう'] },
];

const buildConditionQuestion = (theme: Theme) =>
  `【条件パズル】A・B・C の${theme.subject}は、それぞれ ${theme.attributes.join(
    '・',
  )} のいずれかです。次の条件をすべて満たす組み合わせを1つ選んでください。`;

const buildEliminationQuestion = (theme: Theme) =>
  `【消去チェック】A・B・C の${theme.subject}は、それぞれ ${theme.attributes.join(
    '・',
  )} のいずれかです。次の条件から、成立しない選択肢を消していく問題です。`;

const buildOrderingQuestion = (theme: Theme) =>
  `A・B・C の${theme.subject}の順位が 1位〜3位 に並びます。次の条件を満たす並び順はどれでしょう？`;

const buildHypothesisQuestion = (theme: Theme) =>
  `A・B・C の${theme.subject}の順位について、次の仮説のうち成り立たないものはどれでしょう？`;

const QUESTION_TEXT = buildConditionQuestion(THEMES[0]);
const ELIMINATION_QUESTION_TEXT = buildEliminationQuestion(THEMES[0]);
const ORDERING_ATTRIBUTES = ['1位', '2位', '3位'] as const;
const ORDERING_QUESTION_TEXT = buildOrderingQuestion(THEMES[0]);
const HYPOTHESIS_QUESTION_TEXT = buildHypothesisQuestion(THEMES[0]);

const findThemeByAttributes = (attributes: string[]): Theme => {
  const key = attributes.join('|');
  return THEMES.find((theme) => theme.attributes.join('|') === key) ?? THEMES[0];
};

const FALLBACK_PROBLEM: ConditionProblem = {
  id: 'fallback-problem',
  type: 'condition',
  difficulty: 2,
  entities: [...ENTITIES],
  attributes: [...ATTRIBUTES],
  question: QUESTION_TEXT,
  conditions: [
    {
      id: 'fallback-cond-1',
      type: 'notEquals',
      entity: 'A',
      attribute: '赤',
      label: 'Aは赤ではない',
    },
    {
      id: 'fallback-cond-2',
      type: 'notEquals',
      entity: 'B',
      attribute: '青',
      label: '青をかぶっている人はBではない',
    },
    {
      id: 'fallback-cond-3',
      type: 'ifThen',
      if: {
        id: 'fallback-cond-3-if',
        type: 'equals',
        entity: 'C',
        attribute: '緑',
        label: 'Cが緑である',
      },
      then: {
        id: 'fallback-cond-3-then',
        type: 'equals',
        entity: 'A',
        attribute: '青',
        label: 'Aは青である',
      },
      label: 'もしCが緑なら、Aは青である',
    },
  ],
  choices: [
    {
      id: 'A',
      label: 'A=青 / B=赤 / C=緑',
      mapping: { A: '青', B: '赤', C: '緑' },
    },
    {
      id: 'B',
      label: 'A=緑 / B=赤 / C=青',
      mapping: { A: '緑', B: '赤', C: '青' },
    },
    {
      id: 'C',
      label: 'A=青 / B=緑 / C=赤',
      mapping: { A: '青', B: '緑', C: '赤' },
    },
    {
      id: 'D',
      label: 'A=赤 / B=青 / C=緑',
      mapping: { A: '赤', B: '青', C: '緑' },
    },
  ],
  correctChoiceId: 'A',
};

const ELIMINATION_FALLBACK: EliminationProblem = {
  id: 'elimination-fallback',
  type: 'elimination',
  difficulty: 1,
  entities: [...ENTITIES],
  attributes: [...ATTRIBUTES],
  question: ELIMINATION_QUESTION_TEXT,
  conditions: [
    {
      id: 'elim-cond-1',
      type: 'equals',
      entity: 'B',
      attribute: '赤',
      label: 'Bは赤である',
    },
  ],
  choices: [...FALLBACK_PROBLEM.choices],
  correctChoiceId: 'A',
  invalidChoiceIds: ['C', 'D'],
};

const ORDERING_FALLBACK: OrderingProblem = {
  id: 'ordering-fallback',
  type: 'ordering',
  difficulty: 2,
  entities: [...ENTITIES],
  attributes: [...ORDERING_ATTRIBUTES],
  question: ORDERING_QUESTION_TEXT,
  conditions: [
    {
      id: 'ordering-cond-1',
      type: 'notEquals',
      entity: 'A',
      attribute: '1位',
      label: 'Aは1位ではない',
    },
    {
      id: 'ordering-cond-2',
      type: 'notEquals',
      entity: 'B',
      attribute: '3位',
      label: 'Bは3位ではない',
    },
    {
      id: 'ordering-cond-3',
      type: 'ifThen',
      if: {
        id: 'ordering-cond-3-if',
        type: 'equals',
        entity: 'C',
        attribute: '1位',
        label: 'Cが1位である',
      },
      then: {
        id: 'ordering-cond-3-then',
        type: 'equals',
        entity: 'A',
        attribute: '2位',
        label: 'Aは2位である',
      },
      label: 'もしCが1位なら、Aは2位である',
    },
  ],
  choices: [
    {
      id: 'A',
      label: 'A=2位 / B=1位 / C=3位',
      mapping: { A: '2位', B: '1位', C: '3位' },
    },
    {
      id: 'B',
      label: 'A=3位 / B=1位 / C=2位',
      mapping: { A: '3位', B: '1位', C: '2位' },
    },
    {
      id: 'C',
      label: 'A=2位 / B=3位 / C=1位',
      mapping: { A: '2位', B: '3位', C: '1位' },
    },
    {
      id: 'D',
      label: 'A=1位 / B=2位 / C=3位',
      mapping: { A: '1位', B: '2位', C: '3位' },
    },
  ],
  correctChoiceId: 'A',
};

const HYPOTHESIS_FALLBACK: HypothesisProblem = {
  id: 'hypothesis-fallback',
  type: 'hypothesis',
  difficulty: 2,
  entities: [...ENTITIES],
  attributes: [...ORDERING_ATTRIBUTES],
  question: HYPOTHESIS_QUESTION_TEXT,
  conditions: ORDERING_FALLBACK.conditions,
  hypotheses: [
    {
      id: 'A',
      label: 'Aは2位である',
      condition: {
        id: 'hypo-a',
        type: 'equals',
        entity: 'A',
        attribute: '2位',
        label: 'Aは2位である',
      },
    },
    {
      id: 'B',
      label: 'Bは1位である',
      condition: {
        id: 'hypo-b',
        type: 'equals',
        entity: 'B',
        attribute: '1位',
        label: 'Bは1位である',
      },
    },
    {
      id: 'C',
      label: 'Cは3位である',
      condition: {
        id: 'hypo-c',
        type: 'equals',
        entity: 'C',
        attribute: '3位',
        label: 'Cは3位である',
      },
    },
    {
      id: 'D',
      label: 'Aは1位である',
      condition: {
        id: 'hypo-d',
        type: 'equals',
        entity: 'A',
        attribute: '1位',
        label: 'Aは1位である',
      },
    },
  ],
  correctChoiceId: 'D',
};

type Assignment = Record<string, string>;

type GeneratorConfig = {
  total: number;
  minIfThen: number;
};

const GENERATOR_CONFIG: Record<Difficulty, GeneratorConfig> = {
  1: { total: 3, minIfThen: 0 },
  2: { total: 4, minIfThen: 1 },
  3: { total: 5, minIfThen: 2 },
};

const MAX_GENERATION_ATTEMPTS = 8;
const MAX_ELIMINATION_ATTEMPTS = 20;

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

const buildAssignments = (attributes: readonly string[]): Assignment[] =>
  permute([...attributes]).map((perm) => {
    const mapping: Assignment = {};
    ENTITIES.forEach((entity, index) => {
      mapping[entity] = perm[index];
    });
    return mapping;
  });

const ORDERING_ASSIGNMENTS: Assignment[] = buildAssignments(ORDERING_ATTRIBUTES);

const createRng = (seed = Date.now()) => {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const shuffle = <T>(array: T[], rng: () => number) => {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const checkCondition = (condition: Condition, mapping: Assignment): boolean => {
  if (condition.type === 'equals') {
    return mapping[condition.entity] === condition.attribute;
  }
  if (condition.type === 'notEquals') {
    return mapping[condition.entity] !== condition.attribute;
  }
  const premiseOk = checkCondition(condition.if, mapping);
  if (!premiseOk) return true;
  return checkCondition(condition.then, mapping);
};

const filterAssignments = (
  conditions: Condition[],
  assignments: Assignment[],
): Assignment[] =>
  assignments.filter((assignment) =>
    conditions.every((condition) => checkCondition(condition, assignment)),
  );

const formatMappingLabel = (mapping: Assignment): string =>
  ENTITIES.map((entity) => `${entity}=${mapping[entity]}`).join(' / ');

const matchesTarget = (assignment: Assignment, target: Assignment): boolean =>
  ENTITIES.every((entity) => assignment[entity] === target[entity]);

const tryBuildConditionProblem = (
  difficulty: Difficulty,
  seed: number,
  theme: Theme,
): ConditionProblem | null => {
  const rng = createRng(seed);
  const attributes = theme.attributes;
  const assignments = buildAssignments(attributes);
  const targetIndex = Math.floor(rng() * assignments.length);
  const targetMapping = { ...assignments[targetIndex] };
  const config = GENERATOR_CONFIG[difficulty];

  let condCounter = 1;
  const nextCondId = () => `cond-${seed}-${condCounter++}`;

  const equalsCandidates: Condition[] = ENTITIES.map((entity) => {
    const attribute = targetMapping[entity];
    return {
      id: nextCondId(),
      type: 'equals',
      entity,
      attribute,
      label: `${entity}は${attribute}`,
    };
  });

  const notEqualsCandidates: Condition[] = ENTITIES.flatMap((entity) =>
    attributes.filter((attribute) => attribute !== targetMapping[entity]).map(
      (attribute) => ({
        id: nextCondId(),
        type: 'notEquals',
        entity,
        attribute,
        label: `${entity}は${attribute}ではない`,
      }),
    ),
  );

  const ifThenCandidates: Condition[] = [];
  ENTITIES.forEach((entity) => {
    const attribute = targetMapping[entity];
    ENTITIES.forEach((other) => {
      if (entity === other) return;
      const otherAttr = targetMapping[other];
      const id = nextCondId();
      ifThenCandidates.push({
        id,
        type: 'ifThen',
        if: {
          id: `${id}-if`,
          type: 'equals',
          entity,
          attribute,
          label: `${entity}が${attribute}`,
        },
        then: {
          id: `${id}-then`,
          type: 'equals',
          entity: other,
          attribute: otherAttr,
          label: `${other}は${otherAttr}`,
        },
        label: `もし${entity}が${attribute}なら、${other}は${otherAttr}`,
      });
    });
  });

  const candidatePool: Condition[] = [
    ...shuffle([...notEqualsCandidates], rng),
    ...shuffle([...ifThenCandidates], rng),
    ...shuffle([...equalsCandidates], rng),
  ];

  const selectedConditions: Condition[] = [];
  let usedIfThen = 0;
  let remaining = [...assignments];
  let poolIndex = 0;

  const needsMore =
    () =>
      remaining.length !== 1 ||
      selectedConditions.length < config.total ||
      usedIfThen < config.minIfThen;

  while (poolIndex < candidatePool.length && needsMore()) {
    const candidate = candidatePool[poolIndex++];
    const tentative = [...selectedConditions, candidate];
    const filtered = filterAssignments(tentative, assignments);
    if (
      filtered.length === 0 ||
      !filtered.some((assignment) => matchesTarget(assignment, targetMapping))
    ) {
      continue;
    }
    selectedConditions.push(candidate);
    if (candidate.type === 'ifThen') usedIfThen += 1;
    remaining = filtered;
  }

  const solutions = filterAssignments(selectedConditions, assignments);
  if (solutions.length !== 1) return null;
  const solution = solutions[0];
  if (!matchesTarget(solution, targetMapping)) return null;

  const incorrectAssignments = shuffle(
    assignments.filter(
      (assignment) => !matchesTarget(assignment, solution),
    ),
    rng,
  ).slice(0, 3);

  if (incorrectAssignments.length < 3) return null;

  const choicePool = shuffle(
    [
      { mapping: { ...solution }, isCorrect: true },
      ...incorrectAssignments.map((assignment) => ({
        mapping: { ...assignment },
        isCorrect: false,
      })),
    ],
    rng,
  );

  const choiceItems = choicePool.slice(0, 4).map((item, index) => {
    const id = String.fromCharCode(65 + index);
    return {
      id,
      mapping: item.mapping,
      label: formatMappingLabel(item.mapping),
      isCorrect: item.isCorrect,
    };
  });

  const choiceIds = new Set(choiceItems.map((choice) => choice.id));
  if (choiceIds.size !== choiceItems.length) return null;

  const correctChoice = choiceItems.find((choice) => choice.isCorrect);
  if (!correctChoice) return null;

  const choices: Choice[] = choiceItems.map(({ isCorrect, ...rest }) => rest);

  return {
    id: `generated-${difficulty}-${seed}-${Math.floor(rng() * 100000)}`,
    type: 'condition',
    difficulty,
    entities: [...ENTITIES],
    attributes: [...attributes],
    question: buildConditionQuestion(theme),
    conditions: selectedConditions,
    choices,
    correctChoiceId: correctChoice.id,
  };
};

export const generateConditionProblem = (
  difficulty: Difficulty,
  seed = Date.now(),
): ConditionProblem => {
  const rng = createRng(seed);
  const theme = THEMES[Math.floor(rng() * THEMES.length)];
  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
    const attemptSeed = seed + attempt * 9973;
    const problem = tryBuildConditionProblem(difficulty, attemptSeed, theme);
    if (problem) return problem;
  }
  return {
    ...FALLBACK_PROBLEM,
    id: `fallback-${difficulty}-${seed}`,
    difficulty,
    question: buildConditionQuestion(theme),
    attributes: [...theme.attributes],
  };
};

const tryBuildOrderingProblem = (
  difficulty: Difficulty,
  seed: number,
): OrderingProblem | null => {
  const rng = createRng(seed);
  const theme = THEMES[Math.floor(rng() * THEMES.length)];
  const targetIndex = Math.floor(rng() * ORDERING_ASSIGNMENTS.length);
  const targetMapping = { ...ORDERING_ASSIGNMENTS[targetIndex] };
  const config = GENERATOR_CONFIG[difficulty];

  let condCounter = 1;
  const nextCondId = () => `ordering-cond-${seed}-${condCounter++}`;

  const equalsCandidates: Condition[] = ENTITIES.map((entity) => {
    const attribute = targetMapping[entity];
    return {
      id: nextCondId(),
      type: 'equals',
      entity,
      attribute,
      label: `${entity}は${attribute}`,
    };
  });

  const notEqualsCandidates: Condition[] = ENTITIES.flatMap((entity) =>
    ORDERING_ATTRIBUTES.filter(
      (attribute) => attribute !== targetMapping[entity],
    ).map((attribute) => ({
      id: nextCondId(),
      type: 'notEquals',
      entity,
      attribute,
      label: `${entity}は${attribute}ではない`,
    })),
  );

  const ifThenCandidates: Condition[] = [];
  ENTITIES.forEach((entity) => {
    const attribute = targetMapping[entity];
    ENTITIES.forEach((other) => {
      if (entity === other) return;
      const otherAttr = targetMapping[other];
      const id = nextCondId();
      ifThenCandidates.push({
        id,
        type: 'ifThen',
        if: {
          id: `${id}-if`,
          type: 'equals',
          entity,
          attribute,
          label: `${entity}が${attribute}`,
        },
        then: {
          id: `${id}-then`,
          type: 'equals',
          entity: other,
          attribute: otherAttr,
          label: `${other}は${otherAttr}`,
        },
        label: `もし${entity}が${attribute}なら、${other}は${otherAttr}`,
      });
    });
  });

  const candidatePool: Condition[] = [
    ...shuffle([...notEqualsCandidates], rng),
    ...shuffle([...ifThenCandidates], rng),
    ...shuffle([...equalsCandidates], rng),
  ];

  const selectedConditions: Condition[] = [];
  let usedIfThen = 0;
  let remaining = [...ORDERING_ASSIGNMENTS];
  let poolIndex = 0;

  const needsMore =
    () =>
      remaining.length !== 1 ||
      selectedConditions.length < config.total ||
      usedIfThen < config.minIfThen;

  while (poolIndex < candidatePool.length && needsMore()) {
    const candidate = candidatePool[poolIndex++];
    const tentative = [...selectedConditions, candidate];
    const filtered = filterAssignments(tentative, ORDERING_ASSIGNMENTS);
    if (
      filtered.length === 0 ||
      !filtered.some((assignment) => matchesTarget(assignment, targetMapping))
    ) {
      continue;
    }
    selectedConditions.push(candidate);
    if (candidate.type === 'ifThen') usedIfThen += 1;
    remaining = filtered;
  }

  const solutions = filterAssignments(selectedConditions, ORDERING_ASSIGNMENTS);
  if (solutions.length !== 1) return null;
  const solution = solutions[0];
  if (!matchesTarget(solution, targetMapping)) return null;

  const incorrectAssignments = shuffle(
    ORDERING_ASSIGNMENTS.filter(
      (assignment) => !matchesTarget(assignment, solution),
    ),
    rng,
  ).slice(0, 3);

  if (incorrectAssignments.length < 3) return null;

  const choicePool = shuffle(
    [
      { mapping: { ...solution }, isCorrect: true },
      ...incorrectAssignments.map((assignment) => ({
        mapping: { ...assignment },
        isCorrect: false,
      })),
    ],
    rng,
  );

  const choiceItems = choicePool.slice(0, 4).map((item, index) => {
    const id = String.fromCharCode(65 + index);
    return {
      id,
      mapping: item.mapping,
      label: formatMappingLabel(item.mapping),
      isCorrect: item.isCorrect,
    };
  });

  const choiceIds = new Set(choiceItems.map((choice) => choice.id));
  if (choiceIds.size !== choiceItems.length) return null;

  const correctChoice = choiceItems.find((choice) => choice.isCorrect);
  if (!correctChoice) return null;

  const choices: Choice[] = choiceItems.map(({ isCorrect, ...rest }) => rest);

  return {
    id: `ordering-${difficulty}-${seed}-${Math.floor(rng() * 100000)}`,
    type: 'ordering',
    difficulty,
    entities: [...ENTITIES],
    attributes: [...ORDERING_ATTRIBUTES],
    question: buildOrderingQuestion(theme),
    conditions: selectedConditions,
    choices,
    correctChoiceId: correctChoice.id,
  };
};

export const generateOrderingProblem = (
  difficulty: Difficulty,
  seed = Date.now(),
): OrderingProblem => {
  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
    const attemptSeed = seed + attempt * 9973;
    const problem = tryBuildOrderingProblem(difficulty, attemptSeed);
    if (problem) return problem;
  }
  return {
    ...ORDERING_FALLBACK,
    id: `ordering-fallback-${difficulty}-${seed}`,
    difficulty,
  };
};

const buildHypothesisOptions = (
  solution: Assignment,
  rng: () => number,
): { hypotheses: HypothesisOption[]; correctChoiceId: string } => {
  const trueOptions: HypothesisOption[] = ENTITIES.map((entity) => {
    const attribute = solution[entity];
    return {
      id: '',
      label: `${entity}は${attribute}である`,
      condition: {
        id: `hypo-${entity}-${attribute}`,
        type: 'equals',
        entity,
        attribute,
        label: `${entity}は${attribute}である`,
      },
    };
  });

  const falseCandidates: HypothesisOption[] = ENTITIES.flatMap((entity) =>
    ORDERING_ATTRIBUTES.filter((attribute) => attribute !== solution[entity]).map(
      (attribute) => ({
        id: '',
        label: `${entity}は${attribute}である`,
        condition: {
          id: `hypo-${entity}-${attribute}`,
          type: 'equals',
          entity,
          attribute,
          label: `${entity}は${attribute}である`,
        },
      }),
    ),
  );

  const falsePick = shuffle([...falseCandidates], rng)[0];
  const allOptions = shuffle([...trueOptions, falsePick], rng).map(
    (option, index) => ({
      ...option,
      id: String.fromCharCode(65 + index),
    }),
  );

  const correctChoiceId = allOptions.find((option) =>
    option.label === falsePick.label,
  )?.id;

  return {
    hypotheses: allOptions,
    correctChoiceId: correctChoiceId ?? allOptions[0].id,
  };
};

export const generateHypothesisProblem = (
  difficulty: Difficulty,
  seed = Date.now(),
): HypothesisProblem => {
  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
    const attemptSeed = seed + attempt * 9137;
    const baseProblem = generateOrderingProblem(difficulty, attemptSeed);
    const solutions = filterAssignments(
      baseProblem.conditions,
      ORDERING_ASSIGNMENTS,
    );
    if (solutions.length !== 1) continue;
    const solution = solutions[0];
    const rng = createRng(attemptSeed + 7);
    const theme = THEMES[Math.floor(rng() * THEMES.length)];
    const { hypotheses, correctChoiceId } = buildHypothesisOptions(
      solution,
      rng,
    );

    return {
      id: `hypothesis-${difficulty}-${attemptSeed}`,
      type: 'hypothesis',
      difficulty,
      entities: [...ENTITIES],
      attributes: [...ORDERING_ATTRIBUTES],
      question: buildHypothesisQuestion(theme),
      conditions: baseProblem.conditions,
      hypotheses,
      correctChoiceId,
    };
  }

  return {
    ...HYPOTHESIS_FALLBACK,
    id: `hypothesis-fallback-${difficulty}-${seed}`,
    difficulty,
  };
};

const evaluateChoiceValid = (
  problem: ConditionProblem,
  choice: Choice,
): boolean =>
  problem.conditions.every((condition) =>
    checkCondition(condition, choice.mapping),
  );

const findEliminationVariant = (
  baseProblem: ConditionProblem,
  rng: () => number,
): { conditions: Condition[]; invalidChoiceIds: string[] } | null => {
  const totalConditions = baseProblem.conditions.length;
  const masks = Array.from(
    { length: (1 << totalConditions) - 1 },
    (_, index) => index + 1,
  );
  shuffle(masks, rng);

  for (const mask of masks) {
    const picked = baseProblem.conditions.filter(
      (_, idx) => (mask & (1 << idx)) !== 0,
    );
    const candidateProblem: ConditionProblem = {
      ...baseProblem,
      conditions: picked,
    };
    const invalidChoiceIds = candidateProblem.choices
      .filter((choice) => !evaluateChoiceValid(candidateProblem, choice))
      .map((choice) => choice.id);

    if (invalidChoiceIds.length === 2) {
      return { conditions: picked, invalidChoiceIds };
    }
  }

  return null;
};

export const generateEliminationProblem = (
  difficulty: Difficulty,
  seed = Date.now(),
): EliminationProblem => {
  for (let attempt = 0; attempt < MAX_ELIMINATION_ATTEMPTS; attempt += 1) {
    const attemptSeed = seed + attempt * 7919;
    const baseProblem = generateConditionProblem(difficulty, attemptSeed);
    const variant = findEliminationVariant(
      baseProblem,
      createRng(attemptSeed + 11),
    );
    if (!variant) continue;

    const theme = findThemeByAttributes(baseProblem.attributes);
    return {
      ...baseProblem,
      id: `elimination-${difficulty}-${attemptSeed}`,
      type: 'elimination',
      question: buildEliminationQuestion(theme),
      conditions: variant.conditions,
      invalidChoiceIds: variant.invalidChoiceIds,
    };
  }

  const fallbackVariant = findEliminationVariant(
    FALLBACK_PROBLEM,
    createRng(seed + 33),
  );
  if (fallbackVariant) {
    const theme = findThemeByAttributes(FALLBACK_PROBLEM.attributes);
    return {
      ...FALLBACK_PROBLEM,
      id: `elimination-fallback-${difficulty}-${seed}`,
      type: 'elimination',
      difficulty,
      question: buildEliminationQuestion(theme),
      conditions: fallbackVariant.conditions,
      invalidChoiceIds: fallbackVariant.invalidChoiceIds,
    };
  }

  return {
    ...ELIMINATION_FALLBACK,
    id: `elimination-fallback-${difficulty}-${seed}`,
    difficulty,
  };
};

export const sampleConditionProblem = FALLBACK_PROBLEM;
