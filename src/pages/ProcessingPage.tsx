import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../store/sessionStore';

export default function ProcessingPage() {
  const navigate = useNavigate();
  const attempts = useSessionStore((state) => state.attempts);
  const status = useSessionStore((state) => state.status);

  useEffect(() => {
    if (attempts.length === 0 || status !== 'finished') {
      navigate('/', { replace: true });
      return;
    }
    const timer = window.setTimeout(() => {
      navigate('/result', { replace: true });
    }, 2500);
    return () => window.clearTimeout(timer);
  }, [attempts.length, navigate, status]);

  return (
    <main className="page-layout">
      <section className="panel processing-card">
        <div className="processing-spinner" />
        <h1 className="page-title">集計中</h1>
        <p className="page-lead">集計中です…</p>
        <div className="processing-sub">
          まもなく診断サマリーを表示します
        </div>
      </section>
    </main>
  );
}
