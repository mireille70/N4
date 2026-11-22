import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { themeConfig } from '@/theme/themeConfig';
import { StoreProvider } from '@/store/StoreProvider';
import App from './App';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={themeConfig}>
      <StoreProvider>
        <App />
      </StoreProvider>
    </ThemeProvider>
  </StrictMode>,
);
