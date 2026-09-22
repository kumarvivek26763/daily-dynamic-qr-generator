import React, { useState, useEffect } from 'react';
import { QrCode, Clock, Calendar, Sparkles } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { OfflineIndicator } from './OfflineIndicator';

interface HeaderProps {
  activeTab: 'today' | 'batch' | 'java';
  setActiveTab: (tab: 'today' | 'batch' | 'java') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const [currentDateTime, setCurrentDateTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = currentDateTime.toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="border-b border-stone-200 bg-white/95 backdrop-blur sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
        {/* Left: Branding & Intent */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center shadow-xs shrink-0">
              <QrCode className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">
                  Daily Dynamic QR Generator
                </h1>
                <span className="hidden xs:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200/80">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  Offline PWA
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Text & Date Loop QR Engine with Automatic Daily Rollover
              </p>
            </div>
          </div>

          {/* Mobile-only install & offline status placement */}
          <div className="flex items-center gap-1.5 md:hidden">
            <OfflineIndicator />
            <PWAInstallButton />
          </div>
        </div>

        {/* Center: Tabs */}
        <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs sm:text-sm font-medium overflow-x-auto scrollbar-none">
          <button
            type="button"
            id="tab-today-button"
            onClick={() => setActiveTab('today')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'today'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Today's Live QR
          </button>
          <button
            type="button"
            id="tab-batch-button"
            onClick={() => setActiveTab('batch')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'batch'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Batch Date Loop & Export
          </button>
          <button
            type="button"
            id="tab-java-button"
            onClick={() => setActiveTab('java')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'java'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Java Code & Daemon
          </button>
        </div>

        {/* Right: Actions & Live Clock (Desktop) */}
        <div className="hidden md:flex items-center gap-2.5">
          <OfflineIndicator />
          <PWAInstallButton />

          <div className="flex items-center gap-2 text-xs text-stone-600 bg-stone-50 border border-stone-200/70 px-3 py-1.5 rounded-lg">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              <span className="font-medium text-stone-800">{formattedDate}</span>
            </div>
            <span className="text-stone-300">|</span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span className="font-mono text-stone-800">{formattedTime}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
