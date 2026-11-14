import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { PantryItem } from '../../db/schema';
import { Plus, Minus, Trash2, Refrigerator, AlertCircle, CheckCircle, X } from 'lucide-react';

export const PantryTab: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'low' | 'available'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [qty, setQty] = useState('1');
  const [unit, setUnit] = useState('kg');
  const [threshold, setThreshold] = useState('1');

  // Query
  const items = useLiveQuery(() => db.pantry.toArray());
  const allItems = items || [];

  // Categorize
  const lowItems = allItems.filter(i => i.currentQty <= i.minThreshold);
  const availableItems = allItems.filter(i => i.currentQty > i.minThreshold);

  const displayedItems = filter === 'low'
    ? lowItems
    : filter === 'available'
    ? availableItems
    : allItems;

  // Change Quantity (+ / -)
  const handleAdjustQty = async (item: PantryItem, delta: number) => {
    const nextQty = Math.max(0, Math.round((item.currentQty + delta) * 10) / 10);
    await db.pantry.update(item.id, {
      currentQty: nextQty,
      lastUpdated: Date.now()
    });
  };

  // Delete Item
  const handleDelete = async (id: string) => {
    await db.pantry.delete(id);
  };

  // Add Item
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await db.pantry.add({
      id: `p-${Date.now()}`,
      name: name.trim(),
      currentQty: Number(qty) || 0,
      unit: unit.trim() || 'phần',
      minThreshold: Number(threshold) || 1,
      lastUpdated: Date.now()
    });

    setName('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-4 pb-safe-nav">
      {/* Header Info Card */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Refrigerator size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900">Kho thực phẩm gia đình</h2>
              <p className="text-[11px] text-stone-500">Tự động tăng khi đi chợ & trừ khi nấu ăn</p>
            </div>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="p-2 rounded-xl bg-slate-900 text-white shadow-sm hover:bg-slate-800 active:scale-95 transition"
            aria-label="Thêm thực phẩm vào kho"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-700">
            <CheckCircle size={14} />
            <span>Còn tồn: <strong>{availableItems.length}</strong> loại</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-600">
            <AlertCircle size={14} />
            <span>Sắp hết / Hết: <strong>{lowItems.length}</strong> loại</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-stone-100 p-1 rounded-xl text-xs font-medium">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-1 rounded-lg transition ${
            filter === 'all' ? 'bg-white text-stone-900 font-bold shadow-sm' : 'text-stone-500'
          }`}
        >
          Tất cả ({allItems.length})
        </button>
        <button
          onClick={() => setFilter('low')}
          className={`flex-1 py-1 rounded-lg transition ${
            filter === 'low' ? 'bg-white text-rose-700 font-bold shadow-sm' : 'text-stone-500'
          }`}
        >
          Cần mua thêm ({lowItems.length})
        </button>
        <button
          onClick={() => setFilter('available')}
          className={`flex-1 py-1 rounded-lg transition ${
            filter === 'available' ? 'bg-white text-emerald-700 font-bold shadow-sm' : 'text-stone-500'
          }`}
        >
          Đang có sẵn ({availableItems.length})
        </button>
      </div>

      {/* Pantry Items List */}
      {displayedItems.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-2xl border border-stone-200 p-4">
          <p className="text-xs text-stone-500">Kho thực phẩm trống.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayedItems.map(item => {
            const isLow = item.currentQty <= item.minThreshold;
            const isOut = item.currentQty <= 0;

            return (
              <div
                key={item.id}
                className="bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-sm flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-stone-900">{item.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      isOut
                        ? 'bg-rose-100 text-rose-700'
                        : isLow
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {isOut ? 'Hết hàng' : isLow ? 'Sắp hết' : 'Đủ dùng'}
                    </span>
                  </div>
                  <span className="text-xs text-stone-500 mt-0.5 block">
                    Tồn: <strong className="text-stone-800">{item.currentQty} {item.unit}</strong> (ngưỡng báo động: {item.minThreshold} {item.unit})
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleAdjustQty(item, -1)}
                    className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition active:scale-95"
                    aria-label="Giảm 1"
                  >
                    <Minus size={14} />
                  </button>
                  <button
                    onClick={() => handleAdjustQty(item, 1)}
                    className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition active:scale-95"
                    aria-label="Tăng 1"
                  >
                    <Plus size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-stone-300 hover:text-rose-600 p-1.5 ml-1"
                    aria-label="Xoá thực phẩm"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Thêm món vào kho */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-stone-900">Thêm vào kho thực phẩm</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-stone-700 block mb-1">Tên thực phẩm *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ví dụ: Nước mắm, Trứng, Gạo..."
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-stone-700 block mb-1">Số lượng hiện có</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={qty}
                    onChange={e => setQty(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-700 block mb-1">Đơn vị (chai, kg, quả...)</label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-stone-700 block mb-1">Ngưỡng báo động khi còn dưới</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={threshold}
                  onChange={e => setThreshold(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-slate-900 text-white text-xs font-bold shadow hover:bg-slate-800 transition"
              >
                Lưu vào kho
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
