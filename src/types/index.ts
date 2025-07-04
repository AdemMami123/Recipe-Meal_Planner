export interface SignUpParams {
  name: string;
  email: string;
  password: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  imageUrl?: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  servings: number;
  prepTime: string;
  cookTime: string;
  nutrition?: NutritionInfo;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  isAIGenerated?: boolean;
  likes: number;
  bookmarks: number;
}

export interface Ingredient {
  item: string;
  amount: string;
  unit: string;
}

export interface NutritionInfo {
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
}

export interface MealPlan {
  id: string;
  userId: string;
  weekStart: string;
  meals: {
    [day: string]: {
      breakfast?: Recipe;
      lunch?: Recipe;
      dinner?: Recipe;
      snack?: Recipe;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface BookmarkedRecipe {
  id: string;
  userId: string;
  recipeId: string;
  createdAt: string;
}
