import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThinkingBoard } from '../components/play/ThinkingBoard';
import { ReviewModal } from '../components/play/ReviewModal';
import { OrderingDndBoard } from '../components/order/OrderingDndBoard';
import { useSessionStore } from '../store/sessionStore';

export default function PlayPage() {
  const navigate = useNavigate();
  const {
    status,
    problems,
    currentIndex,
    selectedChoiceIds,
    thinkingDraft,
    selectChoice,
    toggleChoice,
    setOrderingOrder,
    toggleConditionCheck,
    updateMemo,
    addHypothesis,
    removeHypothesis,
    submitAnswer,
    isReviewOpen,
    validationResult,
    draftAtSubmit,
    next,
    pauseSession,
  } = useSessionStore();
  const problem = problems[currentIndex];
  const selectedHypothesisId =
    problem?.type === 'hypothesis' && selectedChoiceIds[0]
      ? selectedChoiceIds[0]
      : null;

  useEffect(() => {
    if (status === 'idle') {
      navigate('/');
    }
  }, [status, navigate]);

  if (!problem) {
    return null;
  }

  const handleAbort = () => {
    if (
      window.confirm(
        '進行中のチャレンジを中断しますか？メモや仮説も保持され、後から再開できます。',
      )
    ) {
      pauseSession();
      navigate('/');
    }
  };

  const handleSubmit = () => {
    submitAnswer();
  };

  const handleNext = () => {
    const { finished } = next();
    if (finished) {
      navigate('/processing', { replace: true });
    }
  };

  return (
    <main className="page-layout">
      <section className="panel play-panel">
        <header className="play-header">
          <div>
            Q {currentIndex + 1}/{problems.length}
          </div>
          <button className="text-button" onClick={handleAbort}>
            中断
          </button>
        </header>
        <div className="play-layout">
          <article className="problem-block">
            <h2 className="problem-question">{problem.question}</h2>
            {problem.type === 'elimination' && (
              <div className="problem-hint">不成立の選択肢をすべて選んでください。</div>
            )}
            {problem.type === 'ordering' && (
              <div className="problem-hint">
                正しい並び順になるよう、1位〜3位にドラッグして配置してください。
              </div>
            )}
            {problem.type === 'condition' && (
              <div className="problem-hint">正解は1つです。</div>
            )}
            {problem.type === 'hypothesis' && (
              <div className="problem-hint">
                成り立たない仮説を1つ選んでください。
              </div>
            )}
            {problem.type === 'hypothesis' ? (
              <div className="problem-section">
                <div className="problem-section-title">仮説</div>
                <div className="choices-grid">
                  {problem.hypotheses.map((hypothesis) => {
                    const checked = selectedChoiceIds.includes(hypothesis.id);
                    return (
                      <label
                        key={hypothesis.id}
                        className={`choice-card ${checked ? 'choice-card--active' : ''}`}
                      >
                        <input
                          type="radio"
                          name="hypothesis"
                          value={hypothesis.id}
                          checked={checked}
                          onChange={() => selectChoice(hypothesis.id)}
                        />
                        <div className="choice-card__header">
                          <span className="choice-card__label">{hypothesis.id}</span>
                        </div>
                        <span>{hypothesis.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ) : problem.type !== 'ordering' ? (
              <div className="problem-section">
                <div className="problem-section-title">選択肢</div>
                <div className="choices-grid">
                  {problem.choices.map((choice) => {
                    const checked = selectedChoiceIds.includes(choice.id);
                    const excluded =
                      problem.type === 'elimination' && checked;
                    return (
                      <label
                        key={choice.id}
                        className={`choice-card ${checked ? 'choice-card--active' : ''} ${
                          excluded ? 'choice-card--excluded' : ''
                        }`}
                      >
                        <input
                          type={problem.type === 'elimination' ? 'checkbox' : 'radio'}
                          name="choice"
                          value={choice.id}
                          checked={checked}
                          onChange={() =>
                            problem.type === 'elimination'
                              ? toggleChoice(choice.id)
                              : selectChoice(choice.id)
                          }
                        />
                        <div className="choice-card__header">
                          <span className="choice-card__label">{choice.id}</span>
                          <span
                            className={`choice-card__excluded ${
                              excluded ? 'choice-card__excluded--show' : ''
                            }`}
                          >
                            除外済み
                          </span>
                        </div>
                        <span>{choice.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ) : (
              <OrderingDndBoard
                order={
                  selectedChoiceIds.length === 3
                    ? selectedChoiceIds
                    : [null, null, null]
                }
                onChange={setOrderingOrder}
              />
            )}
          </article>
          <div className="thinking-column">
            {problem.type === 'condition' ? (
              <ThinkingBoard
                problemType="condition"
                conditions={problem.conditions}
                checkedConditionIds={thinkingDraft.checkedConditionIds}
                onToggle={toggleConditionCheck}
                memo={thinkingDraft.memo}
                hypotheses={thinkingDraft.hypotheses}
                onMemoChange={updateMemo}
                onAddHypothesis={addHypothesis}
                onRemoveHypothesis={removeHypothesis}
              />
            ) : problem.type === 'elimination' ? (
              <ThinkingBoard
                problemType="elimination"
                conditions={problem.conditions}
                choiceIds={problem.choices.map((choice) => choice.id)}
                choiceLabels={Object.fromEntries(
                  problem.choices.map((choice) => [choice.id, choice.label]),
                )}
                selectedChoiceIds={selectedChoiceIds}
                onToggleChoice={toggleChoice}
              />
            ) : problem.type === 'ordering' ? (
              <ThinkingBoard
                problemType="ordering"
                conditions={problem.conditions}
                memo={thinkingDraft.memo}
                hypotheses={thinkingDraft.hypotheses}
                onMemoChange={updateMemo}
                onAddHypothesis={addHypothesis}
                onRemoveHypothesis={removeHypothesis}
              />
            ) : (
              <ThinkingBoard
                problemType="hypothesis"
                selectedLabel={
                  problem.hypotheses.find(
                    (hypothesis) => hypothesis.id === selectedHypothesisId,
                  )?.label ?? null
                }
                memo={thinkingDraft.memo}
                onMemoChange={updateMemo}
              />
            )}
          </div>
        </div>
        <button
          className="primary-button"
          onClick={handleSubmit}
          disabled={
            problem.type === 'ordering'
              ? selectedChoiceIds.length !== 3 ||
                selectedChoiceIds.some((value) => value === null)
              : selectedChoiceIds.length === 0
          }
        >
          判定する
        </button>
      </section>
      <ReviewModal
        open={isReviewOpen}
        problem={problem}
        result={validationResult}
        draft={draftAtSubmit}
        onNext={handleNext}
      />
    </main>
  );
}
