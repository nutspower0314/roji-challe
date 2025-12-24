import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  generateConditionProblem,
  generateEliminationProblem,
  generateHypothesisProblem,
  generateOrderingProblem,
  type Difficulty,
} from '../domain/conditionProblems';
import { useSessionStore } from '../store/sessionStore';

type DifficultyChoice = 'auto' | Difficulty;

export default function HomePage() {
  const navigate = useNavigate();
  const startSession = useSessionStore((state) => state.startSession);
  const status = useSessionStore((state) => state.status);
  const resumeSession = useSessionStore((state) => state.resumeSession);
  const reset = useSessionStore((state) => state.reset);
  const currentIndex = useSessionStore((state) => state.currentIndex);
  const total = useSessionStore((state) => state.total);
  const [difficultyChoice, setDifficultyChoice] =
    useState<DifficultyChoice>('auto');

  const handleStart = () => {
    const baseSeed = Date.now();
    const difficultyPool: Difficulty[] = [1, 2, 3];
    const typePool = [
      ...Array.from({ length: 4 }, () => 'condition'),
      ...Array.from({ length: 2 }, () => 'elimination'),
      ...Array.from({ length: 2 }, () => 'ordering'),
      ...Array.from({ length: 2 }, () => 'hypothesis'),
    ];
    for (let i = typePool.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [typePool[i], typePool[j]] = [typePool[j], typePool[i]];
    }
    const problems = Array.from({ length: 10 }, (_, index) => {
      const difficulty =
        difficultyChoice === 'auto'
          ? difficultyPool[Math.floor(Math.random() * difficultyPool.length)]
          : difficultyChoice;
      const seed = baseSeed + index;
      const type = typePool[index];
      if (type === 'ordering') return generateOrderingProblem(difficulty, seed);
      if (type === 'hypothesis') return generateHypothesisProblem(difficulty, seed);
      if (type === 'elimination') return generateEliminationProblem(difficulty, seed);
      return generateConditionProblem(difficulty, seed);
    });
    startSession(problems, difficultyChoice);
    navigate('/play');
  };

  const handleResume = () => {
    resumeSession();
    navigate('/play');
  };

  return (
    <main className="page-layout">
      <section className="panel">
        <h1 className="page-title">ロジック10問チャレンジ</h1>
        <p className="page-lead">
          条件整理の思考力を鍛えるミニセッションです。10問解ききると診断サマリーが表示されます。
        </p>
        <div className="difficulty-selector">
          <div className="difficulty-label">難易度</div>
          <div className="difficulty-options">
            {(
              [
                { value: 'auto', label: 'おまかせ' },
                { value: 1, label: '★1' },
                { value: 2, label: '★2' },
                { value: 3, label: '★3' },
              ] as { value: DifficultyChoice; label: string }[]
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                className={`difficulty-button ${
                  difficultyChoice === option.value
                    ? 'difficulty-button--active'
                    : ''
                }`}
                onClick={() => setDifficultyChoice(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        {status === 'paused' && (
          <div className="resume-card">
            <div>
              中断中のセッションがあります。メモや仮説も保持されています。
              <div className="resume-progress">
                進行状況：Q {Math.min(currentIndex + 1, total)}/{total}
              </div>
            </div>
            <div className="button-row">
              <button className="primary-button" onClick={handleResume}>
                再開する
              </button>
              <button
                className="secondary-button"
                onClick={() => {
                  reset();
                }}
              >
                破棄してリセット
              </button>
            </div>
          </div>
        )}
        <button
          className="primary-button start-button"
          onClick={handleStart}
          type="button"
        >
          10問チャレンジを開始
        </button>
      </section>
    </main>
  );
}
