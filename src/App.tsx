import React, { useState, useEffect } from 'react';
import { QRConfig } from './types';
import { Header } from './components/Header';
import { TemplateConfig } from './components/TemplateConfig';
import { SingleQRPreview } from './components/SingleQRPreview';
import { BatchLoopGenerator } from './components/BatchLoopGenerator';
import { JavaExportView } from './components/JavaExportView';
import { getCurrentLocalDate } from './utils/dateUtils';

const STORAGE_KEY = 'daily_qr_config_v1';

const DEFAULT_CONFIG: QRConfig = {
  prefix: '602062',
  suffix: 'student',
  separator: '/',
  dateFormat: 'YYYY-MM-DD',
  customTemplate: '{prefix}/{date}/{suffix}',
  useCustomTemplate: false,
  size: 350,
  fgColor: '#000000',
  bgColor: '#FFFFFF',
  errorCorrectionLevel: 'H',
  includeLabel: false,
  labelText: '',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'today' | 'batch' | 'java'>('today');

  // Initialize with the device's exact local date
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());

  // Initialize config with saved offline preferences in localStorage if available
  const [config, setConfig] = useState<QRConfig>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return { ...DEFAULT_CONFIG, ...parsed };
        }
      } catch (e) {
        console.warn('Failed to load saved QR config from localStorage:', e);
      }
    }
    return DEFAULT_CONFIG;
  });

  // Save config changes to localStorage for offline persistence
  const handleConfigChange = (updated: QRConfig) => {
    setConfig(updated);
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save QR config to localStorage:', e);
      }
    }
  };

  // Re-evaluate current local date whenever the app resumes from background or window gains focus
  useEffect(() => {
    const checkAndSyncDate = () => {
      const now = new Date();
      if (
        now.getDate() !== currentDate.getDate() ||
        now.getMonth() !== currentDate.getMonth() ||
        now.getFullYear() !== currentDate.getFullYear()
      ) {
        setCurrentDate(now);
      }
    };

    // Check periodically every 15 seconds
    const interval = setInterval(checkAndSyncDate, 15000);

    // Check when user unlocks device or focuses app window/tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAndSyncDate();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', checkAndSyncDate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', checkAndSyncDate);
    };
  }, [currentDate]);

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col font-sans antialiased selection:bg-amber-100 selection:text-amber-900">
      {/* Navigation Header with PWA Install & Offline status */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6">
        {/* Template & Pattern Config Section */}
        <TemplateConfig
          config={config}
          onChange={handleConfigChange}
          referenceDate={currentDate}
        />

        {/* View Switcher based on Active Tab */}
        {activeTab === 'today' && (
          <SingleQRPreview config={config} currentDate={currentDate} />
        )}

        {activeTab === 'batch' && (
          <BatchLoopGenerator config={config} currentDate={currentDate} />
        )}

        {activeTab === 'java' && (
          <JavaExportView config={config} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white/70 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-500">
          <div>
            Dynamic QR Engine &bull; Format:{' '}
            <code className="font-mono text-stone-700 bg-stone-100 px-1.5 py-0.5 rounded">
              {config.prefix}/{config.dateFormat}/{config.suffix}
            </code>{' '}
            ({getCurrentLocalDate(currentDate)})
          </div>
          <div className="flex items-center gap-2">
            <span>Offline-First PWA</span>
            <span>&bull;</span>
            <span>Auto Local Date Roll</span>
            <span>&bull;</span>
            <span>Batch Loop & Java</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
