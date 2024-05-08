import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { CookiesProvider } from 'react-cookie';
import { QueryClient, QueryClientProvider } from 'react-query';
import ThemeProvider from './jsx/themeContext';
import AlarmProvider from './jsx/alarmContext';
import SoundProvider from './jsx/soundContext';

const queryClient = new QueryClient();

// 전역으로 쿠키를 사용할 수 있음!!!
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <CookiesProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <SoundProvider>
            <AlarmProvider>
              <App />
            </AlarmProvider>
          </SoundProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </CookiesProvider>
  </React.StrictMode>
);