import { useState } from 'react';
import type { Condition } from '../../domain/conditionProblems';

export type ConditionThinkingBoardProps = {
  conditions: Condition[];
  checkedConditionIds: string[];
  onToggle: (conditionId: string) => void;
  memo: string;
  hypotheses: string[];
  onMemoChange: (value: string) => void;
  onAddHypothesis: (label: string) => void;
  onRemoveHypothesis: (label: string) => void;
};

export function ConditionThinkingBoard({
  conditions,
  checkedConditionIds,
  onToggle,
  memo,
  hypotheses,
  onMemoChange,
  onAddHypothesis,
  onRemoveHypothesis,
}: ConditionThinkingBoardProps) {
  const [hypothesisInput, setHypothesisInput] = useState('');

  const handleAddHypothesis = () => {
    const trimmed = hypothesisInput.trim();
    if (!trimmed) return;
    onAddHypothesis(trimmed);
    setHypothesisInput('');
  };

  return (
    <section className="thinking-board">
      <div className="thinking-board__header">条件チェック</div>
      <ul className="thinking-board__list">
        {conditions.map((condition) => {
          const checked = checkedConditionIds.includes(condition.id);
          return (
            <li key={condition.id}>
              <label className="thinking-board__item">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(condition.id)}
                />
                <span>{condition.label}</span>
              </label>
            </li>
          );
        })}
      </ul>
      <div className="thinking-board__subsection">
        <div className="thinking-board__subheading">メモ</div>
        <textarea
          className="thinking-board__memo"
          value={memo}
          placeholder="気づきや途中経過をメモ"
          onChange={(event) => onMemoChange(event.target.value)}
        />
      </div>
      <div className="thinking-board__subsection">
        <div className="thinking-board__subheading">仮説</div>
        <div className="thinking-board__chips">
          {hypotheses.map((hypothesis) => (
            <button
              key={hypothesis}
              type="button"
              className="thinking-board__chip"
              onClick={() => onRemoveHypothesis(hypothesis)}
              title="クリックで削除"
            >
              {hypothesis} ×
            </button>
          ))}
        </div>
        <div className="thinking-board__hypothesis-input">
          <input
            type="text"
            value={hypothesisInput}
            placeholder="仮説を入力"
            onChange={(event) => setHypothesisInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleAddHypothesis();
              }
            }}
          />
          <button type="button" onClick={handleAddHypothesis}>
            + 追加
          </button>
        </div>
      </div>
    </section>
  );
}
