import React, { useState, useEffect } from 'react';
import { Settings, Wifi, WifiOff } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-surface-canvas/90 backdrop-blur-md border-b border-stone-200/80 px-4 pt-safe">
      <div className="max-w-md mx-auto h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-500 flex items-center justify-center font-bold text-base shadow-sm">
            M
          </div>
          <div>
            <h1 className="text-base font-bold text-stone-900 leading-none tracking-tight">MyMeal</h1>
            <p className="text-[11px] text-stone-500 font-medium mt-0.5">Ăn uống & Chi tiêu</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Offline indicator badge */}
          {!isOnline ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
              <WifiOff size={12} />
              <span>Offline</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <Wifi size={12} />
              <span>Sẵn sàng</span>
            </span>
          )}

          <button
            onClick={onOpenSettings}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors active:scale-95"
            aria-label="Cài đặt & Sao lưu"
            title="Cài đặt & Sao lưu"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};
