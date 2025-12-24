import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';
import './App.css';

export default function App() {
  return (
    <div className="app-shell">
      <RouterProvider router={router} />
    </div>
  );
}
