type HypothesisThinkingBoardProps = {
  selectedLabel: string | null;
  memo: string;
  onMemoChange: (value: string) => void;
};

export function HypothesisThinkingBoard({
  selectedLabel,
  memo,
  onMemoChange,
}: HypothesisThinkingBoardProps) {
  return (
    <section className="thinking-board">
      <div className="thinking-board__subsection">
        <div className="thinking-board__subheading">選択中の仮説</div>
        <div className="thinking-board__memo">
          {selectedLabel ?? '仮説を選んでください'}
        </div>
      </div>
      <div className="thinking-board__subsection">
        <div className="thinking-board__subheading">メモ</div>
        <textarea
          className="thinking-board__memo"
          value={memo}
          placeholder="気づきや途中経過をメモ"
          onChange={(event) => onMemoChange(event.target.value)}
        />
      </div>
    </section>
  );
}
