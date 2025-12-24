import { createBrowserRouter } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import PlayPage from '../pages/PlayPage';
import ProcessingPage from '../pages/ProcessingPage';
import ResultPage from '../pages/ResultPage';

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/play', element: <PlayPage /> },
  { path: '/processing', element: <ProcessingPage /> },
  { path: '/result', element: <ResultPage /> },
]);
