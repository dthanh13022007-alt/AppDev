import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { Recipe, MealType } from '../../db/schema';
import { formatVND, getTodayDateString, getDayOfWeekName, formatDateVietnamese } from '../../utils/formatters';
import { Plus, Trash2, ShoppingCart, BookOpen, Calendar, Clock, Check, X } from 'lucide-react';

interface MealsTabProps {
  onGoToShopping: () => void;
}

export const MealsTab: React.FC<MealsTabProps> = ({ onGoToShopping }) => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [activeSubTab, setActiveSubTab] = useState<'planner' | 'recipes'>('planner');
  const [isAddMealModalOpen, setIsAddMealModalOpen] = useState(false);
  const [targetMealType, setTargetMealType] = useState<MealType>('lunch');
  const [isNewRecipeModalOpen, setIsNewRecipeModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Queries
  const recipes = useLiveQuery(() => db.recipes.toArray());
  const mealPlans = useLiveQuery(() => db.mealPlans.toArray());

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Generate 7 days list starting from today
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    return {
      dateStr,
      dayName: i === 0 ? 'Hôm nay' : getDayOfWeekName(dateStr).replace('Thứ ', 'T'),
      dayNumber: d.getDate()
    };
  });

  // Current day's meals
  const dayMeals = (mealPlans || []).filter(m => m.date === selectedDate);

  // Add meal to plan
  const handleAddMealToPlan = async (recipe: Recipe) => {
    await db.mealPlans.add({
      id: `mp-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      date: selectedDate,
      mealType: targetMealType,
      recipeId: recipe.id,
      recipeName: recipe.name,
      estimatedCost: recipe.estimatedTotalCost,
      isCooked: false
    });
    setIsAddMealModalOpen(false);
    showToast(`Đã thêm "${recipe.name}" vào thực đơn!`);
  };

  // Delete meal from plan
  const handleDeleteMeal = async (id: string) => {
    await db.mealPlans.delete(id);
  };

  // Toggle cooked
  const handleToggleCooked = async (id: string, current: boolean) => {
    await db.mealPlans.update(id, { isCooked: !current });
  };

  // Generate Shopping List from 7-day meal plan
  const handleGenerateShoppingList = async () => {
    if (!recipes || !mealPlans) return;

    // Filter meals for the upcoming 7 days
    const next7Days = weekDays.map(d => d.dateStr);
    const relevantMeals = mealPlans.filter(m => next7Days.includes(m.date));

    if (relevantMeals.length === 0) {
      showToast('Chưa có món ăn nào trong thực đơn 7 ngày tới.');
      return;
    }

    // Aggregate all ingredients
    const ingredientMap: Record<string, {
      name: string;
      quantity: number;
      unit: string;
      estimatedPrice: number;
    }> = {};

    for (const meal of relevantMeals) {
      const recipe = recipes.find(r => r.id === meal.recipeId);
      if (recipe && recipe.ingredients) {
        for (const ing of recipe.ingredients) {
          const key = `${ing.foodName.trim().toLowerCase()}_${ing.unit.trim().toLowerCase()}`;
          if (ingredientMap[key]) {
            ingredientMap[key].quantity += ing.quantity;
            ingredientMap[key].estimatedPrice += ing.estimatedPrice;
          } else {
            ingredientMap[key] = {
              name: ing.foodName,
              quantity: ing.quantity,
              unit: ing.unit,
              estimatedPrice: ing.estimatedPrice
            };
          }
        }
      }
    }

    const itemsToAdd = Object.values(ingredientMap).map(ing => ({
      id: `shop-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: ing.name,
      plannedQty: ing.quantity,
      unit: ing.unit,
      estimatedPrice: ing.estimatedPrice,
      isBought: false,
      category: 'Thực đơn tuần',
      addedAt: Date.now()
    }));

    if (itemsToAdd.length > 0) {
      await db.shoppingItems.bulkAdd(itemsToAdd);
      showToast(`Đã tổng hợp ${itemsToAdd.length} nguyên liệu vào danh sách đi chợ!`);
      setTimeout(() => onGoToShopping(), 1200);
    }
  };

  // New Recipe Form State
  const [newRecipeName, setNewRecipeName] = useState('');
  const [newRecipeCategory, setNewRecipeCategory] = useState<'main' | 'soup' | 'stirfry' | 'side' | 'snack'>('main');
  const [newRecipeServings, setNewRecipeServings] = useState(2);
  const [newRecipeCost, setNewRecipeCost] = useState(30000);
  const [newRecipeInstructions, setNewRecipeInstructions] = useState('');

  const handleCreateRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipeName.trim()) return;

    await db.recipes.add({
      id: `r-${Date.now()}`,
      name: newRecipeName.trim(),
      category: newRecipeCategory,
      servings: Number(newRecipeServings),
      prepTimeMinutes: 20,
      instructions: newRecipeInstructions.trim(),
      ingredients: [],
      estimatedTotalCost: Number(newRecipeCost)
    });

    setNewRecipeName('');
    setNewRecipeInstructions('');
    setIsNewRecipeModalOpen(false);
    showToast('Đã thêm món ăn mới vào thư viện!');
  };

  const mealSections: { type: MealType; label: string }[] = [
    { type: 'breakfast', label: 'Bữa Sáng' },
    { type: 'lunch', label: 'Bữa Trưa' },
    { type: 'dinner', label: 'Bữa Tối' },
    { type: 'snack', label: 'Bữa Phụ' }
  ];

  return (
    <div className="space-y-4 pb-safe-nav">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-4 right-4 z-50 max-w-sm mx-auto bg-slate-900 text-white text-xs px-3.5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-bounce">
          <Check size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sub Tabs: Lịch tuần vs Kho công thức */}
      <div className="flex bg-stone-100 p-1 rounded-xl">
        <button
          onClick={() => setActiveSubTab('planner')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
            activeSubTab === 'planner' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          <Calendar size={14} />
          <span>Thực đơn tuần</span>
        </button>
        <button
          onClick={() => setActiveSubTab('recipes')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
            activeSubTab === 'recipes' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          <BookOpen size={14} />
          <span>Kho món ăn ({(recipes || []).length})</span>
        </button>
      </div>

      {activeSubTab === 'planner' ? (
        <>
          {/* 7-Day Horizontal Scroller */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {weekDays.map(item => {
              const isSelected = item.dateStr === selectedDate;
              return (
                <button
                  key={item.dateStr}
                  onClick={() => setSelectedDate(item.dateStr)}
                  className={`flex flex-col items-center justify-center min-w-[50px] py-2 px-1 rounded-2xl border transition ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <span className="text-[10px] uppercase font-semibold">{item.dayName}</span>
                  <span className="text-base font-bold mt-0.5">{item.dayNumber}</span>
                </button>
              );
            })}
          </div>

          {/* Action: Tự tạo danh sách đi chợ */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-stone-500">
              {getDayOfWeekName(selectedDate)} ({formatDateVietnamese(selectedDate)})
            </span>
            <button
              onClick={handleGenerateShoppingList}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-semibold shadow-sm hover:bg-amber-700 active:scale-95 transition"
            >
              <ShoppingCart size={13} />
              <span>Tạo DS đi chợ 7 ngày</span>
            </button>
          </div>

          {/* Meal Plan Categories */}
          <div className="space-y-3">
            {mealSections.map(({ type, label }) => {
              const mealsOfType = dayMeals.filter(m => m.mealType === type);

              return (
                <div key={type} className="bg-white rounded-2xl p-3.5 border border-stone-200/90 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800">{label}</span>
                    <button
                      onClick={() => {
                        setTargetMealType(type);
                        setIsAddMealModalOpen(true);
                      }}
                      className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-0.5"
                    >
                      <Plus size={14} />
                      <span>Thêm món</span>
                    </button>
                  </div>

                  {mealsOfType.length === 0 ? (
                    <p className="text-[11px] text-stone-400 italic py-1">Chưa chọn món cho bữa này.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {mealsOfType.map(meal => (
                        <div
                          key={meal.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-stone-50 border border-stone-200/60"
                        >
                          <div
                            onClick={() => handleToggleCooked(meal.id, meal.isCooked)}
                            className="flex items-center gap-2 cursor-pointer select-none flex-1"
                          >
                            <input
                              type="checkbox"
                              checked={meal.isCooked}
                              onChange={() => {}}
                              className="rounded text-emerald-600 focus:ring-0 cursor-pointer"
                            />
                            <span className={`text-xs font-medium ${meal.isCooked ? 'line-through text-stone-400' : 'text-stone-800'}`}>
                              {meal.recipeName}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-stone-500">
                              {formatVND(meal.estimatedCost)}
                            </span>
                            <button
                              onClick={() => handleDeleteMeal(meal.id)}
                              className="text-stone-400 hover:text-rose-600 p-1 rounded"
                              aria-label="Xoá món"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* Recipes Library */
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-stone-500 font-medium">Danh sách món ăn & công thức</span>
            <button
              onClick={() => setIsNewRecipeModalOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-sm hover:bg-slate-800 active:scale-95 transition"
            >
              <Plus size={14} />
              <span>Thêm món mới</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {(recipes || []).map(recipe => (
              <div key={recipe.id} className="bg-white rounded-2xl p-3.5 border border-stone-200/90 shadow-sm space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-stone-900">{recipe.name}</h4>
                    <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {recipe.prepTimeMinutes} phút
                      </span>
                      <span>•</span>
                      <span>{recipe.servings} phần ăn</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/50">
                    {formatVND(recipe.estimatedTotalCost)}
                  </span>
                </div>

                {recipe.instructions && (
                  <p className="text-xs text-stone-600 bg-stone-50 p-2 rounded-lg italic">
                    {recipe.instructions}
                  </p>
                )}

                {recipe.ingredients && recipe.ingredients.length > 0 && (
                  <div className="pt-1 border-t border-stone-100 flex flex-wrap gap-1.5">
                    {recipe.ingredients.map((ing, idx) => (
                      <span key={idx} className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md">
                        {ing.foodName}: {ing.quantity} {ing.unit}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Chọn món vào bữa ăn */}
      {isAddMealModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-stone-900">
                Thêm món vào {mealSections.find(s => s.type === targetMealType)?.label}
              </h3>
              <button onClick={() => setIsAddMealModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-2">
              {(recipes || []).map(recipe => (
                <div
                  key={recipe.id}
                  onClick={() => handleAddMealToPlan(recipe)}
                  className="flex items-center justify-between p-3 rounded-xl border border-stone-200 hover:border-amber-500 hover:bg-amber-50/30 cursor-pointer transition"
                >
                  <div>
                    <span className="text-sm font-semibold text-stone-900 block">{recipe.name}</span>
                    <span className="text-xs text-stone-500">{recipe.servings} phần • {recipe.prepTimeMinutes} phút</span>
                  </div>
                  <span className="text-xs font-bold text-stone-800">{formatVND(recipe.estimatedTotalCost)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Tạo món ăn mới */}
      {isNewRecipeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-stone-900">Thêm món ăn mới</h3>
              <button onClick={() => setIsNewRecipeModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateRecipe} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-stone-700 block mb-1">Tên món ăn *</label>
                <input
                  type="text"
                  required
                  value={newRecipeName}
                  onChange={e => setNewRecipeName(e.target.value)}
                  placeholder="Ví dụ: Thịt kho tàu..."
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-stone-700 block mb-1">Loại món</label>
                  <select
                    value={newRecipeCategory}
                    onChange={e => setNewRecipeCategory(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white"
                  >
                    <option value="main">Món chính</option>
                    <option value="soup">Canh / Súp</option>
                    <option value="stirfry">Món xào</option>
                    <option value="side">Món phụ / Rau</option>
                    <option value="snack">Bữa phụ / Ăn vặt</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-700 block mb-1">Chi phí dự tính (₫)</label>
                  <input
                    type="number"
                    value={newRecipeCost}
                    onChange={e => setNewRecipeCost(Number(e.target.value))}
                    step="1000"
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-stone-700 block mb-1">Cách làm / Ghi chú</label>
                <textarea
                  rows={2}
                  value={newRecipeInstructions}
                  onChange={e => setNewRecipeInstructions(e.target.value)}
                  placeholder="Ghi chú nguyên liệu hoặc các bước nấu..."
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-slate-900"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-slate-900 text-white text-xs font-bold shadow hover:bg-slate-800 transition"
              >
                Lưu vào thư viện
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
