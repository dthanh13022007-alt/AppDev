import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { formatVND, getTodayDateString, getDayOfWeekName, formatDateVietnamese, getDaysInCurrentMonth, getDayOfMonth } from '../../utils/formatters';
import { TrendingUp, AlertTriangle, CheckCircle2, ChevronRight, PlusCircle, ArrowUpRight } from 'lucide-react';
import { TabKey } from '../layout/BottomNav';

interface DashboardTabProps {
  onNavigateTab: (tab: TabKey) => void;
  onOpenQuickExpense: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({ onNavigateTab, onOpenQuickExpense }) => {
  const todayStr = getTodayDateString();

  // Queries
  const settings = useLiveQuery(() => db.settings.toArray());
  const transactions = useLiveQuery(() => db.transactions.toArray());
  const todayMeals = useLiveQuery(() => db.mealPlans.where('date').equals(todayStr).toArray(), [todayStr]);
  const pantryItems = useLiveQuery(() => db.pantry.toArray());

  // Budget calculations
  const monthlyBudgetSetting = settings?.find(s => s.key === 'monthly_budget');
  const monthlyBudget = monthlyBudgetSetting ? Number(monthlyBudgetSetting.value) : 2000000;

  // Filter transactions in current month
  const currentYearMonth = todayStr.substring(0, 7);
  const thisMonthExpenses = (transactions || [])
    .filter(t => t.date.startsWith(currentYearMonth) && t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const remainingBudget = Math.max(0, monthlyBudget - thisMonthExpenses);
  const percentSpent = Math.min(100, Math.round((thisMonthExpenses / monthlyBudget) * 100)) || 0;

  // Average per day
  const daysInMonth = getDaysInCurrentMonth();
  const currentDay = getDayOfMonth();
  const avgPerDaySpent = currentDay > 0 ? Math.round(thisMonthExpenses / currentDay) : 0;
  const targetPerDay = Math.round(monthlyBudget / daysInMonth);

  // Low stock pantry items
  const lowStockItems = (pantryItems || []).filter(item => item.currentQty <= item.minThreshold);

  // Toggle meal cooked status
  const handleToggleMealCooked = async (id: string, currentStatus: boolean) => {
    await db.mealPlans.update(id, { isCooked: !currentStatus });
  };

  return (
    <div className="space-y-4 pb-safe-nav">
      {/* Date Header */}
      <div className="flex items-baseline justify-between px-1">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
            {getDayOfWeekName(todayStr)}
          </span>
          <h2 className="text-xl font-bold text-stone-900 tracking-tight">
            {formatDateVietnamese(todayStr)}
          </h2>
        </div>
        <button
          onClick={onOpenQuickExpense}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-sm hover:bg-slate-800 transition active:scale-95"
        >
          <PlusCircle size={14} />
          <span>Ghi chi tiêu</span>
        </button>
      </div>

      {/* Main Budget Card */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-stone-500">Ngân sách tháng này</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            percentSpent > 85 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-700'
          }`}>
            {percentSpent}% đã dùng
          </span>
        </div>

        <div>
          <div className="text-2xl font-bold tracking-tight text-stone-900">
            {formatVND(remainingBudget)}
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Còn lại trong tổng số {formatVND(monthlyBudget)}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              percentSpent > 90 ? 'bg-rose-500' : percentSpent > 75 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${percentSpent}%` }}
          />
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-100 text-xs">
          <div>
            <span className="text-stone-400 block text-[11px]">Đã chi tiêu</span>
            <span className="font-semibold text-stone-800">{formatVND(thisMonthExpenses)}</span>
          </div>
          <div>
            <span className="text-stone-400 block text-[11px]">Chi tiêu TB/ngày</span>
            <span className="font-semibold text-stone-800">{formatVND(avgPerDaySpent)} <span className="text-[10px] text-stone-400 font-normal">/ {formatVND(targetPerDay)}</span></span>
          </div>
        </div>

        {/* Warning if over daily target */}
        {avgPerDaySpent > targetPerDay && (
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-700 bg-amber-50/80 p-2 rounded-lg border border-amber-200/60">
            <AlertTriangle size={14} className="shrink-0 text-amber-600" />
            <span>Tốc độ chi tiêu đang vượt mức trung bình ngày dự kiến.</span>
          </div>
        )}
      </div>

      {/* Today's Meals Section */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <span>Thực đơn hôm nay</span>
            <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">
              {(todayMeals || []).length} món
            </span>
          </h3>
          <button
            onClick={() => onNavigateTab('meals')}
            className="text-xs font-semibold text-stone-500 hover:text-stone-900 flex items-center gap-0.5"
          >
            <span>Lên lịch tuần</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {(!todayMeals || todayMeals.length === 0) ? (
          <div className="text-center py-4 bg-stone-50 rounded-xl border border-dashed border-stone-200">
            <p className="text-xs text-stone-500">Chưa có món nào được lên lịch cho hôm nay.</p>
            <button
              onClick={() => onNavigateTab('meals')}
              className="mt-2 text-xs font-semibold text-amber-700 underline"
            >
              Chọn món ngay
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {todayMeals.map(meal => (
              <div
                key={meal.id}
                onClick={() => handleToggleMealCooked(meal.id, meal.isCooked)}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition cursor-pointer select-none ${
                  meal.isCooked
                    ? 'bg-emerald-50/50 border-emerald-200 text-stone-400'
                    : 'bg-white border-stone-200 hover:border-stone-300 text-stone-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                    meal.isCooked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-stone-300 bg-white'
                  }`}>
                    {meal.isCooked && <CheckCircle2 size={14} />}
                  </div>
                  <div>
                    <span className={`text-xs font-semibold block ${meal.isCooked ? 'line-through text-stone-400' : 'text-stone-800'}`}>
                      {meal.recipeName}
                    </span>
                    <span className="text-[10px] text-stone-400 uppercase font-medium">
                      Bữa {meal.mealType === 'breakfast' ? 'Sáng' : meal.mealType === 'lunch' ? 'Trưa' : meal.mealType === 'dinner' ? 'Tối' : 'Phụ'}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-medium text-stone-500">
                  {formatVND(meal.estimatedCost)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Low Stock Pantry Warning */}
      {lowStockItems.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-rose-200/80 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700">
              <AlertTriangle size={15} />
              <span>Nguyên liệu sắp hết ({lowStockItems.length})</span>
            </div>
            <button
              onClick={() => onNavigateTab('shopping')}
              className="text-xs font-semibold text-rose-600 hover:underline flex items-center"
            >
              <span>Thêm vào đi chợ</span>
              <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {lowStockItems.map(item => (
              <span
                key={item.id}
                className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-100 font-medium"
              >
                <span>{item.name}:</span>
                <strong className="font-bold">{item.currentQty} {item.unit}</strong>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent Expenses Preview */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
            <TrendingUp size={16} className="text-stone-600" />
            <span>Khoản chi gần đây</span>
          </h3>
          <button
            onClick={() => onNavigateTab('expenses')}
            className="text-xs font-semibold text-stone-500 hover:text-stone-900 flex items-center"
          >
            <span>Tất cả</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="space-y-2">
          {(!transactions || transactions.length === 0) ? (
            <p className="text-xs text-stone-400 text-center py-2">Chưa có giao dịch nào.</p>
          ) : (
            transactions.slice(0, 3).map(tx => (
              <div key={tx.id} className="flex items-center justify-between py-1.5 border-b border-stone-100 last:border-none">
                <div>
                  <span className="text-xs font-medium text-stone-800 block">{tx.note || 'Khoản chi tiêu'}</span>
                  <span className="text-[10px] text-stone-400">{formatDateVietnamese(tx.date)}</span>
                </div>
                <span className="text-xs font-bold text-stone-900">
                  -{formatVND(tx.amount)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
