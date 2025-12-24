import { useNavigate } from 'react-router-dom';
import { computeSessionStats } from '../domain/stats/sessionStats';
import { useSessionStore } from '../store/sessionStore';

export default function ResultPage() {
  const navigate = useNavigate();
  const { attempts, status, reset, settings } = useSessionStore();

  const hasSession = attempts.length > 0 && status === 'finished';

  if (!hasSession) {
    return (
      <main className="page-layout">
        <section className="panel">
          <h1 className="page-title">結果</h1>
          <p className="page-lead">セッションがありません。ホームから開始してください。</p>
          <button className="primary-button" onClick={() => navigate('/')}>
            ホームへ戻る
          </button>
        </section>
      </main>
    );
  }

  const stats = computeSessionStats(attempts);
  const avgCheckedPercent = Math.round(stats.conditionStats.avgConditionCheckRate * 100);
  const avgExcludedCount = stats.eliminationStats.avgExcludedCount.toFixed(1);

  const trendMessages: string[] = [];
  if (stats.conditionStats.missedFailedCount > 0) {
    trendMessages.push(
      '未チェックの条件が残りがちです。全条件を一度通すと安定します。',
    );
  }
  if (stats.eliminationStats.falseExclusionTotal > 0) {
    trendMessages.push(
      '除外を急ぎがちかも。条件を1つずつ当ててから外すと安定します。',
    );
  }
  if (stats.hypothesisStats.wrongCount > 0) {
    trendMessages.push(
      '矛盾の出発点を1つ決めて検証すると見つけやすいです。',
    );
  }
  const finalTrends = trendMessages.slice(0, 2);

  const recommendDifficulty = () => {
    const base =
      settings.currentDifficulty === 'auto'
        ? 2
        : Number(settings.currentDifficulty);
    let next = base;
    if (stats.overall.accuracyPercent >= 80) next += 1;
    if (stats.overall.accuracyPercent <= 40) next -= 1;
    next = Math.max(1, Math.min(3, next));
    return `★${next}`;
  };

  const handleRetry = () => {
    reset();
    navigate('/');
  };

  return (
    <main className="page-layout">
      <section className="panel">
        <h1 className="page-title">結果</h1>
        <div className="result-card">
          <div className="result-label">正解率</div>
          <div className="result-value">
            {stats.overall.accuracyPercent}%{' '}
            <span className="result-sub">
              ({stats.overall.correct}/{stats.overall.total})
            </span>
          </div>
        </div>
        <div className="result-card">
          <div className="result-label">出題内訳</div>
          <div className="result-type-grid">
            {stats.byType.condition.total > 0 && (
              <div className="result-type-card">
                <div className="result-type-title">条件パズル</div>
                <div className="result-type-value">
                  {stats.byType.condition.accuracyPercent}%{' '}
                  <span className="result-sub">
                    ({stats.byType.condition.correct}/{stats.byType.condition.total})
                  </span>
                </div>
              </div>
            )}
            {stats.byType.elimination.total > 0 && (
              <div className="result-type-card">
                <div className="result-type-title">消去チェック</div>
                <div className="result-type-value">
                  {stats.byType.elimination.accuracyPercent}%{' '}
                  <span className="result-sub">
                    ({stats.byType.elimination.correct}/{stats.byType.elimination.total})
                  </span>
                </div>
              </div>
            )}
            {stats.byType.ordering.total > 0 && (
              <div className="result-type-card">
                <div className="result-type-title">順位入れ替え</div>
                <div className="result-type-value">
                  {stats.byType.ordering.accuracyPercent}%{' '}
                  <span className="result-sub">
                    ({stats.byType.ordering.correct}/{stats.byType.ordering.total})
                  </span>
                </div>
              </div>
            )}
            {stats.byType.hypothesis.total > 0 && (
              <div className="result-type-card">
                <div className="result-type-title">矛盾さがし</div>
                <div className="result-type-value">
                  {stats.byType.hypothesis.accuracyPercent}%{' '}
                  <span className="result-sub">
                    ({stats.byType.hypothesis.correct}/{stats.byType.hypothesis.total})
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="result-grid">
          {(stats.byType.condition.total > 0 || stats.byType.ordering.total > 0) && (
            <div className="result-metric">
              <div className="result-metric__label">条件パズル/順位入れ替え</div>
              <div className="result-metric__value">{avgCheckedPercent}%</div>
              <div className="result-metric__sub">
                条件を1つずつ確認できた割合です（高いほど安定します）
              </div>
              <div className="result-metric__sub">
                未チェック落ち: {stats.conditionStats.missedFailedCount}（確認していない条件が原因で不正解になった回数です）
              </div>
              <div className="result-metric__sub">
                ifThen落ち: {stats.conditionStats.ifThenFailedCount}（「もし〜なら」条件の見落としによる失敗です）
              </div>
            </div>
          )}
          {stats.byType.elimination.total > 0 && (
            <div className="result-metric">
              <div className="result-metric__label">消去チェック</div>
              <div className="result-metric__value">{avgExcludedCount}/4</div>
              <div className="result-metric__sub">
                1問あたりに除外した選択肢の数です
              </div>
              <div className="result-metric__sub">
                見逃し: {stats.eliminationStats.missedCountTotal}（除外すべき選択肢を残してしまった回数です）
              </div>
              <div className="result-metric__sub">
                誤除外: {stats.eliminationStats.falseExclusionTotal}（成立する可能性がある選択肢を除外した回数です）
              </div>
            </div>
          )}
          {stats.byType.hypothesis.total > 0 && (
            <div className="result-metric">
              <div className="result-metric__label">矛盾さがし</div>
              <div className="result-metric__value">
                {stats.hypothesisStats.wrongCount}
              </div>
              <div className="result-metric__sub">
                矛盾の特定に失敗した回数です
              </div>
              <div className="result-metric__sub">
                矛盾ポイント提示が空: {stats.hypothesisStats.emptyConflictCount}
              </div>
            </div>
          )}
        </div>
        {finalTrends.length > 0 && (
          <div className="result-trends">
            {finalTrends.map((message, index) => (
              <div key={index}>{message}</div>
            ))}
          </div>
        )}
        <div className="result-recommendation">
          次回おすすめ難易度：{recommendDifficulty()}
        </div>
        <button className="primary-button" onClick={handleRetry}>
          もう一度チャレンジ
        </button>
      </section>
    </main>
  );
}
