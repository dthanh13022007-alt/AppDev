import { db } from '../db';

export async function exportDatabaseToJSON(): Promise<void> {
  const settings = await db.settings.toArray();
  const foods = await db.foods.toArray();
  const recipes = await db.recipes.toArray();
  const mealPlans = await db.mealPlans.toArray();
  const shoppingItems = await db.shoppingItems.toArray();
  const pantry = await db.pantry.toArray();
  const transactions = await db.transactions.toArray();

  const exportData = {
    appName: 'MyMeal',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    data: {
      settings,
      foods,
      recipes,
      mealPlans,
      shoppingItems,
      pantry,
      transactions
    }
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const dateStr = new Date().toISOString().split('T')[0];
  const a = document.createElement('a');
  a.href = url;
  a.download = `mymeal_backup_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importDatabaseFromJSON(file: File): Promise<{ success: boolean; message: string }> {
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);

    if (!parsed || parsed.appName !== 'MyMeal' || !parsed.data) {
      return { success: false, message: 'Tệp JSON không hợp lệ hoặc không phải bản sao lưu của MyMeal.' };
    }

    const { settings, foods, recipes, mealPlans, shoppingItems, pantry, transactions } = parsed.data;

    await db.transaction('rw', [db.settings, db.foods, db.recipes, db.mealPlans, db.shoppingItems, db.pantry, db.transactions], async () => {
      if (settings && Array.isArray(settings)) {
        await db.settings.clear();
        await db.settings.bulkPut(settings);
      }
      if (foods && Array.isArray(foods)) {
        await db.foods.clear();
        await db.foods.bulkPut(foods);
      }
      if (recipes && Array.isArray(recipes)) {
        await db.recipes.clear();
        await db.recipes.bulkPut(recipes);
      }
      if (mealPlans && Array.isArray(mealPlans)) {
        await db.mealPlans.clear();
        await db.mealPlans.bulkPut(mealPlans);
      }
      if (shoppingItems && Array.isArray(shoppingItems)) {
        await db.shoppingItems.clear();
        await db.shoppingItems.bulkPut(shoppingItems);
      }
      if (pantry && Array.isArray(pantry)) {
        await db.pantry.clear();
        await db.pantry.bulkPut(pantry);
      }
      if (transactions && Array.isArray(transactions)) {
        await db.transactions.clear();
        await db.transactions.bulkPut(transactions);
      }
    });

    return { success: true, message: 'Đã khôi phục dữ liệu thành công!' };
  } catch (error) {
    console.error('Lỗi khôi phục dữ liệu:', error);
    return { success: false, message: 'Không thể đọc tệp sao lưu. Vui lòng thử lại.' };
  }
}
