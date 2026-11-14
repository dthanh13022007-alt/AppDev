/**
 * MyMeal - Database Types & Models (IndexedDB)
 */

export interface Setting {
  key: string;
  value: any;
}

export interface Food {
  id: string;
  name: string;
  category: 'meat' | 'vegetable' | 'seafood' | 'spice' | 'staple' | 'fruit' | 'other';
  defaultUnit: string;
  estimatedPricePerUnit: number; // VND per unit (e.g. 100,000 VND / kg)
}

export interface RecipeIngredient {
  foodId: string;
  foodName: string;
  quantity: number;
  unit: string;
  estimatedPrice: number;
}

export interface Recipe {
  id: string;
  name: string;
  category: 'main' | 'soup' | 'stirfry' | 'side' | 'snack';
  servings: number;
  prepTimeMinutes: number;
  instructions?: string;
  ingredients: RecipeIngredient[];
  estimatedTotalCost: number;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealPlan {
  id: string;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  recipeId: string;
  recipeName: string;
  estimatedCost: number;
  isCooked: boolean;
}

export interface ShoppingItem {
  id: string;
  foodId?: string;
  name: string;
  plannedQty: number;
  actualQty?: number;
  unit: string;
  estimatedPrice: number;
  actualPrice?: number;
  isBought: boolean;
  category: string;
  addedAt: number;
}

export interface PantryItem {
  id: string;
  foodId?: string;
  name: string;
  currentQty: number;
  unit: string;
  minThreshold: number; // Cảnh báo khi còn dưới ngưỡng này
  lastUpdated: number;
}

export type ExpenseCategory = 'food' | 'drink' | 'spice' | 'living' | 'study' | 'other';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  type: 'expense' | 'income';
  category: ExpenseCategory;
  note: string;
  shoppingListId?: string;
  createdAt: number;
}
