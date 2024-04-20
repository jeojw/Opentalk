import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { CookiesProvider } from 'react-cookie';
import { TokenProvider } from './jsx/TokenContext';

// 전역으로 쿠키를 사용할 수 있음!!!
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <CookiesProvider>
      <TokenProvider>
        <App />
      </TokenProvider>
    </CookiesProvider>
  </React.StrictMode>
);
