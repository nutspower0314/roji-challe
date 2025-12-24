import type { Problem } from '../../domain/conditionProblems';
import { getHypothesisConflicts } from '../../domain/validator/conditionValidator';
import type { ValidationResult } from '../../domain/validator/conditionValidator';
import type { ThinkingDraft } from '../../store/sessionStore';

type ReviewModalProps = {
  open: boolean;
  problem: Problem;
  result: ValidationResult | null;
  draft: ThinkingDraft | null;
  onNext: () => void;
};

export function ReviewModal({
  open,
  problem,
  result,
  draft,
  onNext,
}: ReviewModalProps) {
  if (!open || !result || !draft) return null;

  const totalConditions = problem.conditions.length || 1;
  const checkedCount = draft.checkedConditionIds.length;
  const failedConditions =
    (problem.type === 'condition' || problem.type === 'ordering') &&
    'failedConditionIds' in result
      ? problem.conditions.filter((condition) =>
          result.failedConditionIds.includes(condition.id),
        )
      : [];
  const missedFailed =
    problem.type === 'condition' || problem.type === 'ordering'
      ? failedConditions.filter(
          (condition) => !draft.checkedConditionIds.includes(condition.id),
        )
      : [];
  const hasMemo = draft.memo.trim().length > 0;
  const hypothesisCount = draft.hypotheses.length;

  return (
    <div className="review-modal">
      <div className="review-modal__backdrop" />
      <div className="review-modal__content">
        <div className="review-modal__status">
          {result.isCorrect ? '正解！' : '不正解'}
        </div>
        {!result.isCorrect &&
          (problem.type === 'condition' || problem.type === 'ordering') && (
          <div className="review-modal__section">
            <div className="review-modal__section-title">どこでズレた？</div>
            <ul className="review-modal__list">
              {failedConditions.map((condition) => (
                <li key={condition.id}>{condition.label}</li>
              ))}
            </ul>
            {missedFailed.length > 0 && (
              <div className="review-modal__hint">
                未チェックで落ちた条件: {missedFailed.map((c) => c.label).join(' / ')}
              </div>
            )}
          </div>
        )}
        {problem.type === 'hypothesis' && (
          <>
            {result.isCorrect ? (
              <div className="review-modal__log">
                矛盾点を正しく見抜けました。
              </div>
            ) : (
              <>
                <div className="review-modal__log">
                  あなたの選択:{' '}
                  {problem.hypotheses.find(
                    (hypothesis) =>
                      'selectedChoiceId' in result &&
                      hypothesis.id === result.selectedChoiceId,
                  )?.label ?? '不明'}
                </div>
                {problem.correctChoiceId ? (
                  <div className="review-modal__log">
                    正解の仮説:{' '}
                    {problem.hypotheses.find(
                      (hypothesis) => hypothesis.id === problem.correctChoiceId,
                    )?.label ?? '不明'}
                  </div>
                ) : (
                  <div className="review-modal__log">
                    正解の仮説を特定できませんでした。
                  </div>
                )}
                {problem.correctChoiceId ? (
                  (() => {
                    const conflictIds = getHypothesisConflicts(
                      problem,
                      problem.correctChoiceId,
                    );
                    const conflicts = problem.conditions.filter((condition) =>
                      conflictIds.includes(condition.id),
                    );
                    if (conflicts.length === 0) {
                      return (
                        <div className="review-modal__log">
                          この仮説は条件と両立しません。条件を1つずつ当てはめて確認してみよう。
                        </div>
                      );
                    }
                    return (
                      <div className="review-modal__section">
                        <div className="review-modal__section-title">
                          矛盾ポイント
                        </div>
                        <ul className="review-modal__list">
                          {conflicts.slice(0, 3).map((condition) => (
                            <li key={condition.id}>{condition.label}</li>
                          ))}
                        </ul>
                        <div className="review-modal__log">
                          矛盾した条件を確認して、どこで破綻したか見てみよう
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="review-modal__log">
                    この仮説は条件と両立しません。条件を1つずつ当てはめて確認してみよう。
                  </div>
                )}
              </>
            )}
          </>
        )}
        {problem.type === 'elimination' &&
          'selectedChoiceIds' in result &&
          'missedInvalidIds' in result && (
            <>
              <div className="review-modal__section">
                <div className="review-modal__section-title">除外した数</div>
                <div className="review-modal__rate">
                  {result.selectedChoiceIds.length}/{problem.choices.length}
                </div>
                <div className="review-modal__log">
                  {result.isCorrect
                    ? '丁寧に絞り込めています。この調子で続けましょう。'
                    : null}
                  {!result.isCorrect &&
                    result.missedInvalidIds.length > 0 &&
                    result.wrongExcludedIds.length > 0 &&
                    '見逃しと誤除外が混ざっています。条件を一つずつ当てはめて確認しましょう。'}
                  {!result.isCorrect &&
                    result.missedInvalidIds.length > 0 &&
                    result.wrongExcludedIds.length === 0 &&
                    '見逃しがあるようです。条件に合わない選択肢を先に外すと安定します。'}
                  {!result.isCorrect &&
                    result.missedInvalidIds.length === 0 &&
                    result.wrongExcludedIds.length > 0 &&
                    '誤除外があります。条件に当てはまる選択肢は残すよう意識してみてください。'}
                </div>
              </div>
              {!result.isCorrect && (
                <>
                  <div className="review-modal__section">
                    <div className="review-modal__section-title">
                      見逃し（本当は除外すべきだった選択肢）
                    </div>
                    <ul className="review-modal__list">
                      {result.missedInvalidIds.map((id) => {
                        const choice = problem.choices.find(
                          (item) => item.id === id,
                        );
                        return (
                          <li key={id}>
                            {id}
                            {choice ? `: ${choice.label}` : ''}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  <div className="review-modal__section">
                    <div className="review-modal__section-title">
                      誤除外（成立する可能性があった選択肢）
                    </div>
                    <ul className="review-modal__list">
                      {result.wrongExcludedIds.map((id) => {
                        const choice = problem.choices.find(
                          (item) => item.id === id,
                        );
                        return (
                          <li key={id}>
                            {id}
                            {choice ? `: ${choice.label}` : ''}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </>
              )}
            </>
          )}
        {(problem.type === 'condition' || problem.type === 'ordering') && (
          <div className="review-modal__section">
            <div className="review-modal__section-title">条件チェック率</div>
            <div className="review-modal__rate">
              {checkedCount}/{totalConditions}
            </div>
          </div>
        )}
        {(problem.type === 'condition' || problem.type === 'ordering') && (
          <div className="review-modal__section">
            <div className="review-modal__section-title">思考ログ</div>
            <div className="review-modal__log">メモ: {hasMemo ? 'あり' : 'なし'}</div>
            <div className="review-modal__log">仮説数: {hypothesisCount}</div>
          </div>
        )}
        <button className="primary-button" onClick={onNext}>
          次へ
        </button>
      </div>
    </div>
  );
}
