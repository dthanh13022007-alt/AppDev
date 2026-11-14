import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';
import { Header } from './components/layout/Header';
import { BottomNav, TabKey } from './components/layout/BottomNav';
import { DashboardTab } from './components/dashboard/DashboardTab';
import { MealsTab } from './components/meals/MealsTab';
import { ShoppingTab } from './components/shopping/ShoppingTab';
import { ExpensesTab } from './components/expenses/ExpensesTab';
import { PantryTab } from './components/pantry/PantryTab';
import { SettingsModal } from './components/settings/SettingsModal';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQuickExpenseOpen, setIsQuickExpenseOpen] = useState(false);

  // Shopping badge count
  const shoppingItems = useLiveQuery(() => db.shoppingItems.toArray());
  const pendingShoppingCount = (shoppingItems || []).filter(i => !i.isBought).length;

  return (
    <div className="min-h-screen bg-stone-100 flex justify-center">
      {/* Mobile Frame Container: Maximum width 480px on desktop, full width on iPhone */}
      <div className="w-full max-w-[480px] min-h-screen bg-surface-canvas flex flex-col relative shadow-xl border-x border-stone-200/60">
        {/* Header */}
        <Header onOpenSettings={() => setIsSettingsOpen(true)} />

        {/* Tab Content */}
        <main className="flex-1 px-4 py-3 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardTab
              onNavigateTab={tab => setActiveTab(tab)}
              onOpenQuickExpense={() => {
                setActiveTab('expenses');
                setIsQuickExpenseOpen(true);
              }}
            />
          )}

          {activeTab === 'meals' && (
            <MealsTab onGoToShopping={() => setActiveTab('shopping')} />
          )}

          {activeTab === 'shopping' && (
            <ShoppingTab />
          )}

          {activeTab === 'expenses' && (
            <ExpensesTab
              isQuickAddOpen={isQuickExpenseOpen}
              onCloseQuickAdd={() => setIsQuickExpenseOpen(false)}
              onOpenQuickAdd={() => setIsQuickExpenseOpen(true)}
            />
          )}

          {activeTab === 'pantry' && (
            <PantryTab />
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          shoppingBadgeCount={pendingShoppingCount}
        />

        {/* Settings & Backup Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      </div>
    </div>
  );
};

export default App;
