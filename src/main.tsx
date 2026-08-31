import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { NoxFlowProvider } from './contexts/NoxFlowContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NoxFlowProvider>
      <App />
    </NoxFlowProvider>
  </StrictMode>,
);

// Global error handler for chunk load failures
window.addEventListener('error', (event) => {
  const isChunkLoadFailed = /Loading chunk [\d]+ failed/.test(event.message) || 
                            /Loading CSS chunk [\d]+ failed/.test(event.message);
  
  if (isChunkLoadFailed) {
    console.log('Chunk load failed, forcing reload...');
    window.location.reload();
  }
}, true);

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      },
      (err) => {
        console.log('ServiceWorker registration failed: ', err);
      }
    );
  });
}
