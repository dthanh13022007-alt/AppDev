import Dexie, { Table } from 'dexie';
import {
  Setting,
  Food,
  Recipe,
  MealPlan,
  ShoppingItem,
  PantryItem,
  Transaction
} from './schema';
import {
  INITIAL_FOODS,
  INITIAL_RECIPES,
  INITIAL_PANTRY,
  getInitialMealPlans,
  getInitialTransactions
} from './seedData';

export class MyMealDatabase extends Dexie {
  settings!: Table<Setting, string>;
  foods!: Table<Food, string>;
  recipes!: Table<Recipe, string>;
  mealPlans!: Table<MealPlan, string>;
  shoppingItems!: Table<ShoppingItem, string>;
  pantry!: Table<PantryItem, string>;
  transactions!: Table<Transaction, string>;

  constructor() {
    super('MyMealDatabase');

    this.version(1).stores({
      settings: '&key',
      foods: '&id, name, category',
      recipes: '&id, name, category',
      mealPlans: '&id, date, mealType, recipeId, isCooked',
      shoppingItems: '&id, foodId, name, isBought, category',
      pantry: '&id, foodId, name, status',
      transactions: '&id, date, category, type'
    });

    // Populate Initial Data on First Run
    this.on('populate', async () => {
      // Default monthly budget: 2,000,000 VND
      await this.settings.bulkPut([
        { key: 'monthly_budget', value: 2000000 },
        { key: 'warning_threshold', value: 0.8 }, // 80% warning
        { key: 'user_name', value: 'Bạn' }
      ]);

      await this.foods.bulkPut(INITIAL_FOODS);
      await this.recipes.bulkPut(INITIAL_RECIPES);
      await this.pantry.bulkPut(INITIAL_PANTRY);
      await this.mealPlans.bulkPut(getInitialMealPlans());
      await this.transactions.bulkPut(getInitialTransactions());
    });
  }
}

export const db = new MyMealDatabase();
