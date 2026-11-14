import { Food, Recipe, MealPlan, PantryItem, Transaction } from './schema';

export const INITIAL_FOODS: Food[] = [
  { id: 'f-1', name: 'Thịt heo xay', category: 'meat', defaultUnit: 'g', estimatedPricePerUnit: 140 }, // 140k/kg
  { id: 'f-2', name: 'Trứng gà', category: 'meat', defaultUnit: 'quả', estimatedPricePerUnit: 3500 },
  { id: 'f-3', name: 'Bí đao', category: 'vegetable', defaultUnit: 'g', estimatedPricePerUnit: 35 },
  { id: 'f-4', name: 'Rau cải ngọt', category: 'vegetable', defaultUnit: 'bó', estimatedPricePerUnit: 8000 },
  { id: 'f-5', name: 'Đậu hũ trắng', category: 'staple', defaultUnit: 'miếng', estimatedPricePerUnit: 5000 },
  { id: 'f-6', name: 'Gạo thơm', category: 'staple', defaultUnit: 'kg', estimatedPricePerUnit: 22000 },
  { id: 'f-7', name: 'Hành lá & mùi', category: 'spice', defaultUnit: 'mớ', estimatedPricePerUnit: 5000 },
  { id: 'f-8', name: 'Cà chua', category: 'vegetable', defaultUnit: 'g', estimatedPricePerUnit: 30 }
];

export const INITIAL_RECIPES: Recipe[] = [
  {
    id: 'r-1',
    name: 'Thịt băm rang cháy cạnh',
    category: 'main',
    servings: 2,
    prepTimeMinutes: 20,
    instructions: 'Ướp thịt với nước mắm, tiêu, hành củ băm. Đảo đều lửa to cho thịt săn xém cạnh.',
    ingredients: [
      { foodId: 'f-1', foodName: 'Thịt heo xay', quantity: 200, unit: 'g', estimatedPrice: 28000 },
      { foodId: 'f-7', foodName: 'Hành lá & mùi', quantity: 1, unit: 'mớ', estimatedPrice: 5000 }
    ],
    estimatedTotalCost: 33000
  },
  {
    id: 'r-2',
    name: 'Canh bí nấu tôm thịt',
    category: 'soup',
    servings: 2,
    prepTimeMinutes: 15,
    instructions: 'Phi thơm hành, xào bí, cho nước sôi vào đun chín tới rồi rắc hành ngò.',
    ingredients: [
      { foodId: 'f-3', foodName: 'Bí đao', quantity: 300, unit: 'g', estimatedPrice: 10500 },
      { foodId: 'f-1', foodName: 'Thịt heo xay', quantity: 50, unit: 'g', estimatedPrice: 7000 }
    ],
    estimatedTotalCost: 17500
  },
  {
    id: 'r-3',
    name: 'Đậu hũ sốt cà chua',
    category: 'main',
    servings: 2,
    prepTimeMinutes: 15,
    instructions: 'Rán vàng đậu hũ, sốt cà chua nhuyễn cùng mắm đường rồi cho đậu vào rim nhỏ lửa.',
    ingredients: [
      { foodId: 'f-5', foodName: 'Đậu hũ trắng', quantity: 3, unit: 'miếng', estimatedPrice: 15000 },
      { foodId: 'f-8', foodName: 'Cà chua', quantity: 200, unit: 'g', estimatedPrice: 6000 }
    ],
    estimatedTotalCost: 21000
  },
  {
    id: 'r-4',
    name: 'Cải ngọt luộc chấm trứng dầm tương',
    category: 'side',
    servings: 2,
    prepTimeMinutes: 10,
    instructions: 'Luộc rau nước sôi to lửa, luộc 1 quả trứng lòng đào dầm xì dầu ớt.',
    ingredients: [
      { foodId: 'f-4', foodName: 'Rau cải ngọt', quantity: 1, unit: 'bó', estimatedPrice: 8000 },
      { foodId: 'f-2', foodName: 'Trứng gà', quantity: 2, unit: 'quả', estimatedPrice: 7000 }
    ],
    estimatedTotalCost: 15000
  }
];

export const INITIAL_PANTRY: PantryItem[] = [
  { id: 'p-1', foodId: 'f-6', name: 'Gạo thơm', currentQty: 2.5, unit: 'kg', minThreshold: 1, lastUpdated: Date.now() },
  { id: 'p-2', foodId: 'f-2', name: 'Trứng gà', currentQty: 4, unit: 'quả', minThreshold: 4, lastUpdated: Date.now() },
  { id: 'p-3', foodId: 'f-1', name: 'Thịt heo xay', currentQty: 150, unit: 'g', minThreshold: 200, lastUpdated: Date.now() },
  { id: 'p-4', foodId: 'f-4', name: 'Rau cải ngọt', currentQty: 0, unit: 'bó', minThreshold: 1, lastUpdated: Date.now() }
];

export function getInitialMealPlans(): MealPlan[] {
  const today = new Date().toISOString().split('T')[0];
  return [
    {
      id: 'mp-1',
      date: today,
      mealType: 'lunch',
      recipeId: 'r-1',
      recipeName: 'Thịt băm rang cháy cạnh',
      estimatedCost: 33000,
      isCooked: true
    },
    {
      id: 'mp-2',
      date: today,
      mealType: 'lunch',
      recipeId: 'r-2',
      recipeName: 'Canh bí nấu tôm thịt',
      estimatedCost: 17500,
      isCooked: true
    },
    {
      id: 'mp-3',
      date: today,
      mealType: 'dinner',
      recipeId: 'r-3',
      recipeName: 'Đậu hũ sốt cà chua',
      estimatedCost: 21000,
      isCooked: false
    }
  ];
}

export function getInitialTransactions(): Transaction[] {
  const today = new Date().toISOString().split('T')[0];
  return [
    {
      id: 'tx-1',
      date: today,
      amount: 85000,
      type: 'expense',
      category: 'food',
      note: 'Đi chợ sáng (Thịt heo, bí đao, rau cải)',
      createdAt: Date.now() - 3600000 * 4
    },
    {
      id: 'tx-2',
      date: today,
      amount: 25000,
      type: 'expense',
      category: 'drink',
      note: 'Cà phê sáng',
      createdAt: Date.now() - 3600000 * 6
    }
  ];
}
