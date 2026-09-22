import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { Wifi, WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
        isOnline
          ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
          : 'bg-amber-50 text-amber-900 border-amber-300 shadow-xs'
      }`}
      title={isOnline ? 'Online — Connected' : 'Offline Mode — Operating entirely from local device cache'}
    >
      {isOnline ? (
        <>
          <Wifi className="w-3 h-3 text-emerald-600" />
          <span className="hidden sm:inline">Online</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
          <span className="font-semibold">Offline</span>
        </>
      )}
    </div>
  );
};
