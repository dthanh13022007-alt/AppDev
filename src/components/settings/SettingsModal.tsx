import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { exportDatabaseToJSON, importDatabaseFromJSON } from '../../utils/backup';
import { formatVND } from '../../utils/formatters';
import { X, Download, Upload, RotateCcw, Smartphone, ShieldCheck, Check } from 'lucide-react';
import {
  INITIAL_FOODS,
  INITIAL_RECIPES,
  INITIAL_PANTRY,
  getInitialMealPlans,
  getInitialTransactions
} from '../../db/seedData';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [budgetInput, setBudgetInput] = useState('2000000');
  const [toast, setToast] = useState<string | null>(null);

  const settings = useLiveQuery(() => db.settings.toArray());

  useEffect(() => {
    if (settings) {
      const budget = settings.find(s => s.key === 'monthly_budget');
      if (budget) {
        setBudgetInput(String(budget.value));
      }
    }
  }, [settings]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Save Budget
  const handleSaveBudget = async () => {
    const val = Number(budgetInput);
    if (!isNaN(val) && val > 0) {
      await db.settings.put({ key: 'monthly_budget', value: val });
      showToast('Đã cập nhật ngân sách tháng thành công!');
    }
  };

  // Export JSON
  const handleExport = async () => {
    try {
      await exportDatabaseToJSON();
      showToast('Đã tải xuống tệp sao lưu JSON!');
    } catch (err) {
      showToast('Không thể xuất dữ liệu sao lưu.');
    }
  };

  // Import JSON
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const res = await importDatabaseFromJSON(file);
    showToast(res.message);
    if (res.success) {
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  // Reset to default sample
  const handleResetData = async () => {
    if (window.confirm('Bạn có chắc chắn muốn đặt lại dữ liệu về ban đầu?')) {
      await db.transaction('rw', [db.settings, db.foods, db.recipes, db.mealPlans, db.shoppingItems, db.pantry, db.transactions], async () => {
        await db.settings.clear();
        await db.foods.clear();
        await db.recipes.clear();
        await db.mealPlans.clear();
        await db.shoppingItems.clear();
        await db.pantry.clear();
        await db.transactions.clear();

        await db.settings.bulkPut([
          { key: 'monthly_budget', value: 2000000 },
          { key: 'warning_threshold', value: 0.8 },
          { key: 'user_name', value: 'Bạn' }
        ]);
        await db.foods.bulkPut(INITIAL_FOODS);
        await db.recipes.bulkPut(INITIAL_RECIPES);
        await db.pantry.bulkPut(INITIAL_PANTRY);
        await db.mealPlans.bulkPut(getInitialMealPlans());
        await db.transactions.bulkPut(getInitialTransactions());
      });
      showToast('Đã nạp lại dữ liệu mẫu thành công!');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 space-y-4 max-h-[88vh] overflow-y-auto">
        {/* Toast */}
        {toast && (
          <div className="bg-slate-900 text-white text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-2">
            <Check size={16} className="text-emerald-400" />
            <span>{toast}</span>
          </div>
        )}

        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="font-bold text-base text-stone-900">Cài đặt & Sao lưu</h3>
            <p className="text-[11px] text-stone-500">MyMeal PWA (Local-first & 100% Offline)</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 p-1">
            <X size={20} />
          </button>
        </div>

        {/* Budget Setting */}
        <div className="space-y-2 bg-stone-50 p-3.5 rounded-2xl border border-stone-200/80">
          <label className="text-xs font-bold text-stone-800 block">Ngân sách ăn uống mỗi tháng</label>
          <div className="flex gap-2">
            <input
              type="number"
              step="100000"
              value={budgetInput}
              onChange={e => setBudgetInput(e.target.value)}
              className="flex-1 text-sm font-bold p-2.5 rounded-xl border border-stone-200 bg-white"
            />
            <button
              onClick={handleSaveBudget}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
            >
              Lưu
            </button>
          </div>
          <span className="text-[11px] text-stone-500 block">
            Hiện tại: <strong>{formatVND(Number(budgetInput) || 0)}</strong>
          </span>
        </div>

        {/* Data Backup & Restore */}
        <div className="space-y-2.5 bg-stone-50 p-3.5 rounded-2xl border border-stone-200/80">
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span>Sao lưu dữ liệu cá nhân</span>
          </div>
          <p className="text-[11px] text-stone-500">
            Dữ liệu của bạn được lưu an toàn trực tiếp trong trình duyệt (IndexedDB). Hãy tải tệp sao lưu JSON thường xuyên để không bị mất khi xóa bộ nhớ duyệt web.
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-stone-800 hover:bg-stone-100 transition shadow-sm"
            >
              <Download size={14} />
              <span>Tải bản sao lưu JSON</span>
            </button>

            <label className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-stone-800 hover:bg-stone-100 transition cursor-pointer shadow-sm">
              <Upload size={14} />
              <span>Khôi phục JSON</span>
              <input type="file" accept=".json" onChange={handleFileChange} className="hidden" />
            </label>
          </div>
        </div>

        {/* iOS PWA Install Guide */}
        <div className="space-y-1.5 bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200/70 text-xs text-amber-900">
          <div className="flex items-center gap-1.5 font-bold">
            <Smartphone size={15} className="text-amber-700" />
            <span>Cài đặt lên iPhone 14 (Thêm vào MH chính)</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-[11px] text-amber-800/90 pl-1">
            <li>Mở đường link ứng dụng trên trình duyệt Safari.</li>
            <li>Nhấn vào biểu tượng <strong>Chia sẻ (Share)</strong> ở thanh dưới.</li>
            <li>Chọn <strong>Thêm vào Màn hình chính (Add to Home Screen)</strong>.</li>
            <li>Nhấn <strong>Thêm</strong> để có icon MyMeal hoạt động như ứng dụng thật.</li>
          </ol>
        </div>

        {/* Reset Data */}
        <div className="pt-2 border-t flex justify-between items-center text-xs">
          <button
            onClick={handleResetData}
            className="flex items-center gap-1 text-stone-400 hover:text-rose-600 transition"
          >
            <RotateCcw size={13} />
            <span>Đặt lại dữ liệu mẫu</span>
          </button>

          <span className="text-[10px] text-stone-400">MyMeal v1.0.0</span>
        </div>
      </div>
    </div>
  );
};
