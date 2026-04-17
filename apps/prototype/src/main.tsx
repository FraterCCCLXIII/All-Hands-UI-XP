import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import App from './App';
import { PageTransitionsProvider } from './contexts/PageTransitionsContext';
import './index.css';

const Router =
  typeof window !== 'undefined' && window.electronAPI ? HashRouter : BrowserRouter;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <PageTransitionsProvider>
        <App />
      </PageTransitionsProvider>
    </Router>
  </React.StrictMode>
);
