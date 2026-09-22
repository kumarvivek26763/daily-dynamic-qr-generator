import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import {registerSW} from 'virtual:pwa-register';

// Register service worker immediately for offline capability
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('New PWA version available, auto-updating...');
  },
  onOfflineReady() {
    console.log('App ready to work completely offline!');
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
