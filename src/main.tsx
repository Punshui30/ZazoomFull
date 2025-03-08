import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Make sure App.tsx exists

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
