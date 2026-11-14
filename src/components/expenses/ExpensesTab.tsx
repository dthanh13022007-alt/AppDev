import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { ExpenseCategory, Transaction } from '../../db/schema';
import { formatVND, formatDateVietnamese, getTodayDateString, getDayOfWeekName } from '../../utils/formatters';
import { Plus, Trash2, PieChart, TrendingDown, X, Tag } from 'lucide-react';

interface ExpensesTabProps {
  isQuickAddOpen: boolean;
  onCloseQuickAdd: () => void;
  onOpenQuickAdd: () => void;
}

export const ExpensesTab: React.FC<ExpensesTabProps> = ({
  isQuickAddOpen,
  onCloseQuickAdd,
  onOpenQuickAdd
}) => {
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Form State
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(getTodayDateString());

  // Queries
  const transactions = useLiveQuery(() => db.transactions.reverse().sortBy('createdAt'));
  const settings = useLiveQuery(() => db.settings.toArray());

  const monthlyBudgetSetting = settings?.find(s => s.key === 'monthly_budget');
  const monthlyBudget = monthlyBudgetSetting ? Number(monthlyBudgetSetting.value) : 2000000;

  const allTx = transactions || [];
  const currentMonthStr = getTodayDateString().substring(0, 7);

  // Month Expenses
  const monthTx = allTx.filter(t => t.date.startsWith(currentMonthStr) && t.type === 'expense');
  const totalMonthSpent = monthTx.reduce((sum, t) => sum + t.amount, 0);

  // Categories config
  const categoryConfig: Record<ExpenseCategory, { label: string; color: string; bg: string }> = {
    food: { label: 'Thực phẩm', color: 'text-amber-700', bg: 'bg-amber-500' },
    drink: { label: 'Đồ uống', color: 'text-sky-700', bg: 'bg-sky-500' },
    spice: { label: 'Gia vị', color: 'text-orange-700', bg: 'bg-orange-500' },
    living: { label: 'Sinh hoạt', color: 'text-emerald-700', bg: 'bg-emerald-500' },
    study: { label: 'Học tập', color: 'text-indigo-700', bg: 'bg-indigo-500' },
    other: { label: 'Khác', color: 'text-stone-700', bg: 'bg-stone-500' }
  };

  // Group by Category
  const categoryTotals: Record<string, number> = {};
  monthTx.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  // Last 7 days data for SVG Bar Chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dStr = d.toISOString().split('T')[0];
    const dayTotal = allTx
      .filter(t => t.date === dStr && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      dateStr: dStr,
      label: i === 6 ? 'Hôm nay' : getDayOfWeekName(dStr).replace('Thứ ', 'T'),
      amount: dayTotal
    };
  });

  const maxDailyAmount = Math.max(50000, ...last7Days.map(d => d.amount));

  // Add Transaction
  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(amount);
    if (isNaN(val) || val <= 0) return;

    await db.transactions.add({
      id: `tx-${Date.now()}`,
      date: date || getTodayDateString(),
      amount: val,
      type: 'expense',
      category,
      note: note.trim() || categoryConfig[category].label,
      createdAt: Date.now()
    });

    setAmount('');
    setNote('');
    onCloseQuickAdd();
  };

  // Delete Transaction
  const handleDeleteTx = async (id: string) => {
    await db.transactions.delete(id);
  };

  // Filtered List
  const displayedTx = selectedCategoryFilter === 'all'
    ? allTx
    : allTx.filter(t => t.category === selectedCategoryFilter);

  return (
    <div className="space-y-4 pb-safe-nav">
      {/* Monthly Budget Summary */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingDown size={14} className="text-rose-500" />
            <span>Tổng chi tiêu tháng {new Date().getMonth() + 1}</span>
          </span>
          <button
            onClick={onOpenQuickAdd}
            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-900 text-white shadow-sm hover:bg-slate-800 active:scale-95 transition"
          >
            <Plus size={13} />
            <span>Thêm chi tiêu</span>
          </button>
        </div>

        <div>
          <div className="text-2xl font-bold tracking-tight text-stone-900">
            {formatVND(totalMonthSpent)}
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Ngân sách tháng: <strong className="font-semibold text-stone-700">{formatVND(monthlyBudget)}</strong>
          </p>
        </div>
      </div>

      {/* SVG Bar Chart: 7-Day Trend */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
            <PieChart size={14} className="text-stone-500" />
            <span>Chi tiêu 7 ngày qua</span>
          </h3>
          <span className="text-[11px] text-stone-400 font-medium">Đơn vị: VNĐ</span>
        </div>

        {/* Responsive Minimalist SVG Bar Chart */}
        <div className="pt-2">
          <div className="h-28 flex items-end justify-between gap-2 px-1">
            {last7Days.map((item, idx) => {
              const heightPercent = maxDailyAmount > 0
                ? Math.min(100, Math.max(8, Math.round((item.amount / maxDailyAmount) * 100)))
                : 8;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className="text-[9px] font-semibold text-stone-500 opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                    {item.amount > 0 ? `${Math.round(item.amount / 1000)}k` : '0'}
                  </span>
                  <div
                    className={`w-full rounded-t-lg transition-all duration-300 ${
                      idx === 6 ? 'bg-amber-500' : 'bg-slate-800/80 group-hover:bg-slate-900'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                    title={`${item.label}: ${formatVND(item.amount)}`}
                  />
                  <span className="text-[10px] font-medium text-stone-500 text-center truncate w-full">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
          <Tag size={14} className="text-stone-500" />
          <span>Cơ cấu chi tiêu tháng</span>
        </h3>

        <div className="space-y-2.5">
          {Object.entries(categoryConfig).map(([catKey, cfg]) => {
            const catSpent = categoryTotals[catKey] || 0;
            const percent = totalMonthSpent > 0 ? Math.round((catSpent / totalMonthSpent) * 100) : 0;

            if (catSpent === 0 && totalMonthSpent > 0) return null;

            return (
              <div key={catKey} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-700">{cfg.label}</span>
                  <span className="font-bold text-stone-900">
                    {formatVND(catSpent)} <span className="text-stone-400 font-normal">({percent}%)</span>
                  </span>
                </div>
                <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${cfg.bg}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transaction History */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-stone-600 uppercase tracking-wider">
            Lịch sử giao dịch ({displayedTx.length})
          </h3>
          <select
            value={selectedCategoryFilter}
            onChange={e => setSelectedCategoryFilter(e.target.value)}
            className="text-[11px] font-medium bg-stone-100 text-stone-700 p-1 rounded-lg border-none"
          >
            <option value="all">Tất cả danh mục</option>
            <option value="food">Thực phẩm</option>
            <option value="drink">Đồ uống</option>
            <option value="spice">Gia vị</option>
            <option value="living">Sinh hoạt</option>
            <option value="study">Học tập</option>
            <option value="other">Khác</option>
          </select>
        </div>

        {displayedTx.length === 0 ? (
          <div className="text-center py-6 bg-white rounded-2xl border border-stone-200 p-4">
            <p className="text-xs text-stone-400">Chưa có bản ghi chi tiêu nào.</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {displayedTx.map(tx => {
              const cfg = categoryConfig[tx.category] || categoryConfig.other;
              return (
                <div
                  key={tx.id}
                  className="bg-white p-3 rounded-2xl border border-stone-200/90 shadow-sm flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${cfg.color} bg-stone-100`}>
                      {cfg.label.charAt(0)}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-stone-900 block">{tx.note}</span>
                      <span className="text-[10px] text-stone-400">{formatDateVietnamese(tx.date)} • {cfg.label}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-900">
                      -{formatVND(tx.amount)}
                    </span>
                    <button
                      onClick={() => handleDeleteTx(tx.id)}
                      className="text-stone-300 hover:text-rose-600 p-1"
                      aria-label="Xoá giao dịch"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Thêm chi tiêu nhanh */}
      {isQuickAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-stone-900">Ghi nhận khoản chi tiêu</h3>
              <button onClick={onCloseQuickAdd} className="text-stone-400 hover:text-stone-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-stone-700 block mb-1">Số tiền (₫) *</label>
                <input
                  type="number"
                  step="1000"
                  required
                  autoFocus
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="Ví dụ: 50000"
                  className="w-full text-base font-bold p-3 rounded-xl border border-stone-200 focus:outline-none focus:border-slate-900 text-stone-900"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-stone-700 block mb-1">Ghi chú / Tên khoản chi</label>
                <input
                  type="text"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Ví dụ: Cà phê, Ăn trưa, Bánh mì..."
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-stone-700 block mb-1">Danh mục</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white"
                  >
                    <option value="food">Thực phẩm</option>
                    <option value="drink">Đồ uống</option>
                    <option value="spice">Gia vị</option>
                    <option value="living">Sinh hoạt</option>
                    <option value="study">Học tập</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-700 block mb-1">Ngày chi</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-slate-900 text-white text-xs font-bold shadow hover:bg-slate-800 transition"
              >
                Lưu khoản chi
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
