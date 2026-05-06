import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { PageTransitionsProvider } from './contexts/PageTransitionsContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <PageTransitionsProvider>
        <App />
      </PageTransitionsProvider>
    </BrowserRouter>
  </React.StrictMode>
);
