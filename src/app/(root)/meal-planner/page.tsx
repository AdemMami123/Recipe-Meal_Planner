'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Plus, 
  ArrowLeft, 
  Clock, 
  Users, 
  Trash2, 
  ChefHat,
  Coffee,
  Utensils,
  Cookie,
  ShoppingCart,
  CalendarDays,
  Search,
  X
} from 'lucide-react';

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
  const [selectedSlot, setSelectedSlot] = useState<{ day: string; mealType: string } | null>(null);
  const [recipeSearch, setRecipeSearch] = useState('');
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const router = useRouter();

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const mealTypes = [
    { key: 'breakfast', label: 'Breakfast', icon: Coffee, color: 'bg-orange-100 text-orange-800' },
    { key: 'lunch', label: 'Lunch', icon: Utensils, color: 'bg-blue-100 text-blue-800' },
    { key: 'dinner', label: 'Dinner', icon: ChefHat, color: 'bg-purple-100 text-purple-800' },
    { key: 'snack', label: 'Snack', icon: Cookie, color: 'bg-green-100 text-green-800' }
  ] as const;

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
      
      console.log('Meal planner fetch response:', { status: response.status, data });
      
      if (response.ok && data.success) {
        setMealPlans(data.mealPlans);
      } else {
        console.error('Failed to fetch meal plans:', data);
        setError(data.error || 'Failed to fetch meal plans');
      }
    } catch (error) {
      console.error('Error fetching meal plans:', error);
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
        setSelectedSlot(null);
        setShowRecipeModal(false);
        setRecipeSearch('');
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

  const filteredRecipes = availableRecipes.filter(recipe =>
    recipe.title.toLowerCase().includes(recipeSearch.toLowerCase())
  );

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
    <div className="h-screen flex flex-col bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-3 flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              Meal Planner
            </h1>
            <p className="text-muted-foreground text-sm">Plan your weekly meals and stay organized</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => router.push('/shopping-list')} 
              size="sm" 
              variant="outline"
              className="h-8 text-xs px-3"
            >
              <ShoppingCart className="mr-1 h-3 w-3" />
              Shopping List
            </Button>
            <Button 
              onClick={() => router.push('/recipes')} 
              size="sm" 
              className="h-8 text-xs px-3"
            >
              <Plus className="mr-1 h-3 w-3" />
              Add Recipes
            </Button>
          </div>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-center gap-4 mb-4 flex-shrink-0">
          <Button 
            variant="outline" 
            onClick={goToPreviousWeek} 
            size="sm" 
            className="h-8 text-xs px-3"
          >
            ← Previous Week
          </Button>
          <div className="flex items-center gap-2 bg-background rounded-lg px-4 py-2 shadow-sm">
            <CalendarDays className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">{getCurrentWeekRange()}</span>
          </div>
          <Button 
            variant="outline" 
            onClick={goToNextWeek} 
            size="sm" 
            className="h-8 text-xs px-3"
          >
            Next Week →
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive flex-shrink-0">
            {error}
          </div>
        )}

        {/* Meal Planning Grid */}
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3 h-full">
            {daysOfWeek.map((day) => (
              <Card key={day} className="overflow-hidden bg-background/50 backdrop-blur-sm border-2 hover:border-primary/20 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-center text-sm font-semibold">{day}</CardTitle>
                  <div className="text-center text-xs text-muted-foreground">
                    {getDateForDay(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 pb-3 overflow-y-auto max-h-[calc(100vh-200px)]">
                  {mealTypes.map((mealType) => {
                    const mealPlan = getMealPlan(day, mealType.key);
                    const MealIcon = mealType.icon;
                    
                    return (
                      <div key={mealType.key} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Badge 
                            variant="secondary" 
                            className={`text-xs px-2 py-1 h-6 ${mealType.color}`}
                          >
                            <MealIcon className="h-3 w-3 mr-1" />
                            {mealType.label}
                          </Badge>
                        </div>
                        
                        {mealPlan ? (
                          <div className="p-3 bg-background rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-xs line-clamp-2 mb-1">
                                  {mealPlan.recipe.title}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {mealPlan.recipe.prepTime + mealPlan.recipe.cookTime}m
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {mealPlan.recipe.servings}
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeMealPlan(mealPlan.id)}
                                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div 
                            className="p-3 border-2 border-dashed border-muted-foreground/25 rounded-lg text-center hover:border-primary/50 hover:bg-muted/50 cursor-pointer transition-colors"
                            onClick={() => {
                              setSelectedSlot({ day, mealType: mealType.key });
                              setShowRecipeModal(true);
                            }}
                          >
                            <Plus className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                            <p className="text-xs text-muted-foreground">Add meal</p>
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
      </div>
      
      {/* Recipe Selection Modal */}
      {showRecipeModal && selectedSlot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                {(() => {
                  const mealType = mealTypes.find(m => m.key === selectedSlot.mealType);
                  const MealIcon = mealType?.icon || Plus;
                  return (
                    <>
                      <MealIcon className="h-5 w-5" />
                      <div>
                        <h3 className="font-semibold">Add {mealType?.label}</h3>
                        <p className="text-xs text-muted-foreground">{selectedSlot.day}</p>
                      </div>
                    </>
                  );
                })()}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setShowRecipeModal(false);
                  setSelectedSlot(null);
                  setRecipeSearch('');
                }}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search recipes..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
                  value={recipeSearch}
                  onChange={(e) => setRecipeSearch(e.target.value)}
                />
              </div>
              
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {filteredRecipes.map((recipe) => (
                  <div 
                    key={recipe.id}
                    className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => addMealPlan(selectedSlot.day, selectedSlot.mealType as any, recipe.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm line-clamp-1">
                          {recipe.title}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {recipe.prepTime + recipe.cookTime}m
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {recipe.servings}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {recipe.difficulty}
                          </Badge>
                        </div>
                      </div>
                      {recipe.imageUrl && (
                        <img 
                          src={recipe.imageUrl} 
                          alt={recipe.title}
                          className="w-12 h-12 rounded object-cover ml-3"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
