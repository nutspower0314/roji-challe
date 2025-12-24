import { useState } from 'react';
import type { Condition } from '../../domain/conditionProblems';

type OrderingThinkingBoardProps = {
  conditions: Condition[];
  memo: string;
  hypotheses: string[];
  onMemoChange: (value: string) => void;
  onAddHypothesis: (label: string) => void;
  onRemoveHypothesis: (label: string) => void;
};

export function OrderingThinkingBoard({
  conditions,
  memo,
  hypotheses,
  onMemoChange,
  onAddHypothesis,
  onRemoveHypothesis,
}: OrderingThinkingBoardProps) {
  const [hypothesisInput, setHypothesisInput] = useState('');

  const handleAddHypothesis = () => {
    const trimmed = hypothesisInput.trim();
    if (!trimmed) return;
    onAddHypothesis(trimmed);
    setHypothesisInput('');
  };

  return (
    <section className="thinking-board">
      <div className="thinking-board__subsection">
        <div className="thinking-board__subheading">条件</div>
        <ol className="thinking-board__list">
          {conditions.map((condition, index) => (
            <li key={condition.id}>
              {index + 1}. {condition.label}
            </li>
          ))}
        </ol>
      </div>
      <div className="thinking-board__header">メモ</div>
      <textarea
        className="thinking-board__memo"
        value={memo}
        placeholder="気づきや途中経過をメモ"
        onChange={(event) => onMemoChange(event.target.value)}
      />
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
