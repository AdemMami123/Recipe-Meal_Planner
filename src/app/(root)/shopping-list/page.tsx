'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Plus, Trash2, ArrowLeft, Check, X } from 'lucide-react';

interface ShoppingListItem {
  id: string;
  name: string;
  quantity: string;
  checked: boolean;
  category: string;
  recipeId?: string;
  recipeName?: string;
}

export default function ShoppingListPage() {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const categories = ['Produce', 'Dairy', 'Meat', 'Pantry', 'Frozen', 'Other'];

  useEffect(() => {
    generateShoppingList();
  }, []);

  const generateShoppingList = async () => {
    try {
      // Get meal plans for current week
      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);

      const response = await fetch(`/api/meal-plans?start=${startOfWeek.toISOString()}&end=${endOfWeek.toISOString()}`);
      const data = await response.json();

      console.log('Shopping list fetch response:', { status: response.status, data });

      if (response.ok && data.success) {
        // Extract ingredients from meal plans
        const ingredients: ShoppingListItem[] = [];
        
        data.mealPlans.forEach((plan: any) => {
          if (plan.recipe && plan.recipe.ingredients) {
            // Handle both string and array ingredients
            let recipeIngredients: string[] = [];
            if (Array.isArray(plan.recipe.ingredients)) {
              recipeIngredients = plan.recipe.ingredients.filter((ing: string) => ing.trim());
            } else if (typeof plan.recipe.ingredients === 'string') {
              recipeIngredients = plan.recipe.ingredients.split('\n').filter((ing: string) => ing.trim());
            }
            
            recipeIngredients.forEach((ingredient: string, index: number) => {
              ingredients.push({
                id: `${plan.id}-${index}`,
                name: ingredient.trim(),
                quantity: '1',
                checked: false,
                category: 'Other',
                recipeId: plan.recipe.id,
                recipeName: plan.recipe.title
              });
            });
          }
        });

        setItems(ingredients);
      } else {
        console.error('Failed to fetch meal plans:', data);
        setError(data.error || 'Failed to generate shopping list');
      }
    } catch (error) {
      console.error('Error generating shopping list:', error);
      setError('An error occurred while generating shopping list');
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    if (newItem.trim()) {
      const item: ShoppingListItem = {
        id: Date.now().toString(),
        name: newItem.trim(),
        quantity: '1',
        checked: false,
        category: 'Other'
      };
      
      setItems([...items, item]);
      setNewItem('');
    }
  };

  const toggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const clearChecked = () => {
    setItems(items.filter(item => !item.checked));
  };

  const groupedItems = categories.reduce((acc, category) => {
    acc[category] = items.filter(item => item.category === category);
    return acc;
  }, {} as Record<string, ShoppingListItem[]>);

  const checkedCount = items.filter(item => item.checked).length;
  const totalCount = items.length;

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Generating shopping list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="container mx-auto px-4 py-2 flex-1 flex flex-col overflow-hidden">
        {/* Header - Compact */}
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
              <ShoppingCart className="h-4 w-4 text-primary" />
              Shopping List
            </h1>
            <p className="text-muted-foreground text-xs">
              {totalCount > 0 ? `${checkedCount}/${totalCount} items checked` : 'Add items to your shopping list'}
            </p>
          </div>
          {checkedCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearChecked}
              className="h-7 text-xs px-2"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive flex-shrink-0">
            {error}
          </div>
        )}

        {/* Add Item - Compact */}
        <div className="flex gap-2 mb-3 flex-shrink-0">
          <Input
            placeholder="Add item..."
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addItem()}
            className="h-8 text-xs"
          />
          <Button onClick={addItem} size="sm" className="h-8 px-3">
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        {/* Shopping List - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {totalCount === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No items in your shopping list</h3>
              <p className="text-muted-foreground mb-4">
                Add items manually or create meal plans to generate your shopping list
              </p>
              <Button onClick={() => router.push('/meal-planner')}>
                Create Meal Plan
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map(category => {
                const categoryItems = groupedItems[category];
                if (categoryItems.length === 0) return null;

                return (
                  <Card key={category}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center justify-between">
                        <span>{category}</span>
                        <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
                          {categoryItems.length}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 pb-3">
                      {categoryItems.map(item => (
                        <div key={item.id} className="flex items-center gap-2 p-2 rounded border">
                          <Checkbox
                            checked={item.checked}
                            onCheckedChange={() => toggleItem(item.id)}
                            className="h-4 w-4"
                          />
                          <div className="flex-1">
                            <p className={`text-sm ${item.checked ? 'line-through text-muted-foreground' : ''}`}>
                              {item.name}
                            </p>
                            {item.recipeName && (
                              <p className="text-xs text-muted-foreground">
                                From: {item.recipeName}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
