import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { FeedbackProvider } from './feedback';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename="/admin">
      <FeedbackProvider>
        <App />
      </FeedbackProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
