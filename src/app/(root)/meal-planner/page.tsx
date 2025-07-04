'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, ArrowLeft, Clock, Users, Trash2 } from 'lucide-react';

interface Recipe {
  id: string;
  title: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: string;
  imageUrl?: string;
}

interface MealPlan {
  id: string;
  day: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recipe: Recipe;
  plannedFor: string;
}

export default function MealPlannerPage() {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [availableRecipes, setAvailableRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const router = useRouter();

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

  useEffect(() => {
    fetchMealPlans();
    fetchAvailableRecipes();
  }, [selectedWeek]);

  const fetchMealPlans = async () => {
    try {
      const startDate = getMonday(selectedWeek);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      
      const response = await fetch(`/api/meal-plans?start=${startDate.toISOString()}&end=${endDate.toISOString()}`);
      const data = await response.json();
      
      if (data.success) {
        setMealPlans(data.mealPlans);
      } else {
        setError(data.error || 'Failed to fetch meal plans');
      }
    } catch (error) {
      setError('An error occurred while fetching meal plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableRecipes = async () => {
    try {
      const response = await fetch('/api/recipes/list?limit=50');
      const data = await response.json();
      
      if (data.success) {
        setAvailableRecipes(data.recipes);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  };

  const getMonday = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const getMealPlan = (day: string, mealType: string) => {
    return mealPlans.find(plan => plan.day === day && plan.mealType === mealType);
  };

  const addMealPlan = async (day: string, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack', recipeId: string) => {
    try {
      const recipe = availableRecipes.find(r => r.id === recipeId);
      if (!recipe) return;

      const plannedFor = getDateForDay(day);
      
      const response = await fetch('/api/meal-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          day,
          mealType,
          recipeId,
          plannedFor: plannedFor.toISOString(),
        }),
      });

      if (response.ok) {
        fetchMealPlans();
      }
    } catch (error) {
      console.error('Error adding meal plan:', error);
    }
  };

  const removeMealPlan = async (mealPlanId: string) => {
    try {
      const response = await fetch(`/api/meal-plans/${mealPlanId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchMealPlans();
      }
    } catch (error) {
      console.error('Error removing meal plan:', error);
    }
  };

  const getDateForDay = (dayName: string) => {
    const monday = getMonday(selectedWeek);
    const dayIndex = daysOfWeek.indexOf(dayName);
    const targetDate = new Date(monday);
    targetDate.setDate(targetDate.getDate() + dayIndex);
    return targetDate;
  };

  const goToPreviousWeek = () => {
    const prevWeek = new Date(selectedWeek);
    prevWeek.setDate(prevWeek.getDate() - 7);
    setSelectedWeek(prevWeek);
  };

  const goToNextWeek = () => {
    const nextWeek = new Date(selectedWeek);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setSelectedWeek(nextWeek);
  };

  const getCurrentWeekRange = () => {
    const monday = getMonday(selectedWeek);
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    
    return `${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading meal planner...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="container mx-auto px-4 py-2 flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 mb-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Meal Planner
            </h1>
            <p className="text-muted-foreground text-xs">Plan your weekly meals</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={goToPreviousWeek} size="sm" className="h-7 text-xs px-2">
              Previous
            </Button>
            <h2 className="text-sm font-semibold">{getCurrentWeekRange()}</h2>
            <Button variant="outline" onClick={goToNextWeek} size="sm" className="h-7 text-xs px-2">
              Next
            </Button>
          </div>
          <Button onClick={() => router.push('/recipes')} size="sm" className="h-7 text-xs px-2">
            <Plus className="mr-1 h-3 w-3" />
            Add Recipes
          </Button>
        </div>

        {error && (
          <div className="mb-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive flex-shrink-0">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-2 h-full">
            {daysOfWeek.map((day) => (
              <Card key={day} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-center">{day}</CardTitle>
                  <CardDescription className="text-center text-xs">
                    {getDateForDay(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 pb-2 overflow-y-auto">
                  {mealTypes.map((mealType) => {
                    const mealPlan = getMealPlan(day, mealType);
                    
                    return (
                      <div key={mealType} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs capitalize px-1 py-0 h-4">
                            {mealType}
                          </Badge>
                          {!mealPlan && (
                            <select
                              className="text-xs border rounded px-1 py-0.5 h-5 text-xs"
                              onChange={(e) => {
                                if (e.target.value) {
                                  addMealPlan(day, mealType, e.target.value);
                                  e.target.value = '';
                                }
                              }}
                            >
                              <option value="">Add...</option>
                              {availableRecipes.map((recipe) => (
                                <option key={recipe.id} value={recipe.id}>
                                  {recipe.title}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                        
                        {mealPlan ? (
                          <div className="p-1.5 bg-muted rounded">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-xs line-clamp-1">
                                  {mealPlan.recipe.title}
                                </p>
                                <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                                  <Clock className="h-2 w-2" />
                                  {mealPlan.recipe.prepTime + mealPlan.recipe.cookTime}m
                                  <Users className="h-2 w-2" />
                                  {mealPlan.recipe.servings}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeMealPlan(mealPlan.id)}
                                className="h-4 w-4 p-0"
                              >
                                <Trash2 className="h-2 w-2" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-1.5 border-2 border-dashed border-muted-foreground/25 rounded text-center">
                            <Plus className="h-3 w-3 mx-auto text-muted-foreground" />
                            <p className="text-xs text-muted-foreground mt-0.5">Add meal</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-2 text-center flex-shrink-0">
          <Button variant="outline" onClick={() => router.push('/shopping-list')} size="sm" className="h-7 text-xs px-2">
            Generate Shopping List
          </Button>
        </div>
      </div>
    </div>
  );
}
