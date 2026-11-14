import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { ShoppingItem } from '../../db/schema';
import { formatVND, getTodayDateString } from '../../utils/formatters';
import { Plus, Trash2, CheckCircle, ShoppingBag, X, Sparkles } from 'lucide-react';

export const ShoppingTab: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'bought'>('pending');
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [itemName, setItemName] = useState('');
  const [itemQty, setItemQty] = useState('1');
  const [itemUnit, setItemUnit] = useState('bó');
  const [itemEstPrice, setItemEstPrice] = useState('20000');

  // Query
  const items = useLiveQuery(() => db.shoppingItems.toArray());

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const allItems = items || [];
  const pendingItems = allItems.filter(i => !i.isBought);
  const boughtItems = allItems.filter(i => i.isBought);

  const displayedItems = filter === 'pending'
    ? pendingItems
    : filter === 'bought'
    ? boughtItems
    : allItems;

  // Totals
  const totalEstimated = allItems.reduce((sum, i) => sum + i.estimatedPrice, 0);
  const totalActual = boughtItems.reduce((sum, i) => sum + (i.actualPrice !== undefined ? i.actualPrice : i.estimatedPrice), 0);

  // Toggle item bought
  const handleToggleBought = async (item: ShoppingItem) => {
    const nextBought = !item.isBought;
    await db.shoppingItems.update(item.id, {
      isBought: nextBought,
      actualPrice: nextBought && item.actualPrice === undefined ? item.estimatedPrice : item.actualPrice
    });
  };

  // Update actual price
  const handleUpdatePrice = async (id: string, priceStr: string) => {
    const num = Number(priceStr);
    if (!isNaN(num) && num >= 0) {
      await db.shoppingItems.update(id, { actualPrice: num });
    }
  };

  // Delete item
  const handleDeleteItem = async (id: string) => {
    await db.shoppingItems.delete(id);
  };

  // Add Item Manually
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    await db.shoppingItems.add({
      id: `shop-${Date.now()}`,
      name: itemName.trim(),
      plannedQty: Number(itemQty) || 1,
      unit: itemUnit.trim() || 'phần',
      estimatedPrice: Number(itemEstPrice) || 0,
      isBought: false,
      category: 'Mua ngoài',
      addedAt: Date.now()
    });

    setItemName('');
    setIsAddItemModalOpen(false);
    showToast(`Đã thêm "${itemName.trim()}" vào giỏ hàng!`);
  };

  // Complete shopping trip
  const handleFinishShopping = async () => {
    if (boughtItems.length === 0) {
      showToast('Chưa có món hàng nào được đánh dấu đã mua.');
      return;
    }

    const todayStr = getTodayDateString();

    // 1. Create Transaction for expense
    await db.transactions.add({
      id: `tx-shop-${Date.now()}`,
      date: todayStr,
      amount: totalActual,
      type: 'expense',
      category: 'food',
      note: `Đi chợ (${boughtItems.length} món: ${boughtItems.map(b => b.name).slice(0, 3).join(', ')}...)`,
      createdAt: Date.now()
    });

    // 2. Synchronize to Pantry
    const pantryItems = await db.pantry.toArray();
    for (const item of boughtItems) {
      const match = pantryItems.find(p => p.name.trim().toLowerCase() === item.name.trim().toLowerCase());
      if (match) {
        await db.pantry.update(match.id, {
          currentQty: match.currentQty + item.plannedQty,
          lastUpdated: Date.now()
        });
      } else {
        await db.pantry.add({
          id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          name: item.name,
          currentQty: item.plannedQty,
          unit: item.unit,
          minThreshold: 1,
          lastUpdated: Date.now()
        });
      }
    }

    // 3. Remove bought items from list
    const boughtIds = boughtItems.map(i => i.id);
    await db.shoppingItems.bulkDelete(boughtIds);

    showToast(`🎉 Đã lưu chi tiêu ${formatVND(totalActual)} & tự động cộng vào kho thực phẩm!`);
  };

  return (
    <div className="space-y-4 pb-safe-nav">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-16 left-4 right-4 z-50 max-w-sm mx-auto bg-slate-900 text-white text-xs px-3.5 py-2.5 rounded-xl shadow-lg flex items-center gap-2">
          <Sparkles size={16} className="text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Bill Overview Card */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
            <ShoppingBag size={14} className="text-amber-600" />
            <span>Hóa đơn đi chợ</span>
          </span>
          <span className="text-xs font-semibold bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-full">
            {boughtItems.length} / {allItems.length} món đã mua
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
            <span className="text-[11px] text-stone-500 block">Ước tính tổng</span>
            <span className="text-base font-bold text-stone-800">{formatVND(totalEstimated)}</span>
          </div>
          <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100">
            <span className="text-[11px] text-emerald-700 block">Thực tế đã mua</span>
            <span className="text-base font-bold text-emerald-800">{formatVND(totalActual)}</span>
          </div>
        </div>

        {boughtItems.length > 0 && (
          <button
            onClick={handleFinishShopping}
            className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition active:scale-95 flex items-center justify-center gap-2"
          >
            <CheckCircle size={15} />
            <span>Xong đi chợ: Ghi nhận {formatVND(totalActual)} & Cập nhật kho</span>
          </button>
        )}
      </div>

      {/* Filter Tabs & Add Button */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex bg-stone-100 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded-lg transition ${
              filter === 'pending' ? 'bg-white text-stone-900 font-bold shadow-sm' : 'text-stone-500'
            }`}
          >
            Cần mua ({pendingItems.length})
          </button>
          <button
            onClick={() => setFilter('bought')}
            className={`px-3 py-1 rounded-lg transition ${
              filter === 'bought' ? 'bg-white text-stone-900 font-bold shadow-sm' : 'text-stone-500'
            }`}
          >
            Đã mua ({boughtItems.length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg transition ${
              filter === 'all' ? 'bg-white text-stone-900 font-bold shadow-sm' : 'text-stone-500'
            }`}
          >
            Tất cả ({allItems.length})
          </button>
        </div>

        <button
          onClick={() => setIsAddItemModalOpen(true)}
          className="p-2 rounded-xl bg-slate-900 text-white shadow hover:bg-slate-800 active:scale-95 transition"
          aria-label="Thêm thực phẩm"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Items List */}
      {displayedItems.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-2xl border border-stone-200/90 p-4">
          <p className="text-xs text-stone-500">Không có thực phẩm nào trong danh mục này.</p>
          <p className="text-[11px] text-stone-400 mt-1">Hãy tạo danh sách từ thực đơn tuần hoặc nhấn (+) để thêm món cần mua.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayedItems.map(item => (
            <div
              key={item.id}
              className={`p-3 rounded-2xl border transition-all ${
                item.isBought
                  ? 'bg-emerald-50/40 border-emerald-200/80 text-stone-500'
                  : 'bg-white border-stone-200/90 shadow-sm text-stone-900'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                {/* Checkbox & Name */}
                <div
                  onClick={() => handleToggleBought(item)}
                  className="flex items-center gap-2.5 flex-1 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={item.isBought}
                    onChange={() => {}}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className={`text-xs font-bold block ${item.isBought ? 'line-through text-stone-400' : 'text-stone-900'}`}>
                      {item.name}
                    </span>
                    <span className="text-[11px] text-stone-400">
                      Cần: <strong className="font-semibold text-stone-600">{item.plannedQty} {item.unit}</strong>
                    </span>
                  </div>
                </div>

                {/* Price input & delete */}
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="text-[10px] text-stone-400 block">Giá mua (₫)</span>
                    <input
                      type="number"
                      step="1000"
                      value={item.actualPrice !== undefined ? item.actualPrice : item.estimatedPrice}
                      onChange={e => handleUpdatePrice(item.id, e.target.value)}
                      className="w-20 text-xs font-bold text-right p-1 rounded-lg border border-stone-200 bg-white focus:outline-none focus:border-slate-900"
                    />
                  </div>

                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-stone-400 hover:text-rose-600 p-1.5 rounded-lg transition"
                    aria-label="Xoá thực phẩm"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Thêm món đi chợ thủ công */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-stone-900">Thêm thực phẩm cần mua</h3>
              <button onClick={() => setIsAddItemModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-stone-700 block mb-1">Tên thực phẩm *</label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={e => setItemName(e.target.value)}
                  placeholder="Ví dụ: Gạo, Dầu ăn, Hành khô..."
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-stone-700 block mb-1">Số lượng</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={itemQty}
                    onChange={e => setItemQty(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-700 block mb-1">Đơn vị (kg, bó, hộp...)</label>
                  <input
                    type="text"
                    required
                    value={itemUnit}
                    onChange={e => setItemUnit(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-stone-700 block mb-1">Giá dự tính (₫)</label>
                <input
                  type="number"
                  step="1000"
                  value={itemEstPrice}
                  onChange={e => setItemEstPrice(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-slate-900"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-slate-900 text-white text-xs font-bold shadow hover:bg-slate-800 transition"
              >
                Thêm vào danh sách đi chợ
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
