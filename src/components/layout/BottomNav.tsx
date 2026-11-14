import React from 'react';
import { LayoutDashboard, UtensilsCrossed, ShoppingBag, Wallet, Refrigerator } from 'lucide-react';

export type TabKey = 'dashboard' | 'meals' | 'shopping' | 'expenses' | 'pantry';

interface BottomNavProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  shoppingBadgeCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  shoppingBadgeCount = 0
}) => {
  const tabs = [
    { key: 'dashboard' as TabKey, label: 'Tổng quan', icon: LayoutDashboard },
    { key: 'meals' as TabKey, label: 'Thực đơn', icon: UtensilsCrossed },
    { key: 'shopping' as TabKey, label: 'Đi chợ', icon: ShoppingBag, badge: shoppingBadgeCount },
    { key: 'expenses' as TabKey, label: 'Chi tiêu', icon: Wallet },
    { key: 'pantry' as TabKey, label: 'Kho đồ', icon: Refrigerator }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 pb-safe">
      <div className="max-w-md mx-auto h-16 flex items-center justify-around px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              onClick={() => onSelectTab(tab.key)}
              className={`flex-1 flex flex-col items-center justify-center py-1 relative transition-all active:scale-95 ${
                isActive ? 'text-slate-900 font-semibold' : 'text-stone-400 hover:text-stone-600'
              }`}
              style={{ minHeight: '44px' }}
              aria-label={tab.label}
            >
              <div className="relative">
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2.5 bg-amber-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                ) : null}
              </div>
              <span className={`text-[10px] mt-1 tracking-tight ${isActive ? 'font-semibold text-slate-900' : 'font-normal'}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-slate-900" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
