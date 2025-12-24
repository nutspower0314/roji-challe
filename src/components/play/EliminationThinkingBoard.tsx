import type { Condition } from '../../domain/conditionProblems';

type EliminationThinkingBoardProps = {
  conditions: Condition[];
  choiceIds: string[];
  selectedChoiceIds: Array<string | null>;
  choiceLabels?: Record<string, string>;
  onToggle: (choiceId: string) => void;
};

export function EliminationThinkingBoard({
  conditions,
  choiceIds,
  selectedChoiceIds,
  choiceLabels,
  onToggle,
}: EliminationThinkingBoardProps) {
  return (
    <section className="thinking-board">
      <div className="thinking-board__subsection">
        <div className="thinking-board__subheading">条件</div>
        <ul className="thinking-board__list">
          {conditions.map((condition, index) => (
            <li key={condition.id}>
              {index + 1}. {condition.label}
            </li>
          ))}
        </ul>
      </div>
      <div className="thinking-board__header">除外リスト</div>
      <ul className="thinking-board__list elimination-list">
        {choiceIds.map((choiceId) => {
          const checked = selectedChoiceIds.includes(choiceId);
          const label = choiceLabels?.[choiceId];
          return (
            <li key={choiceId}>
              <label className="thinking-board__item elimination-item">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(choiceId)}
                />
                <span>
                  {choiceId}を除外する
                  {label ? (
                    <span className="elimination-choice-label">（{label}）</span>
                  ) : null}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
