'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Sparkles, Loader2, ArrowLeft, ChefHat } from 'lucide-react';

export default function AIGeneratorPage() {
  const [ingredients, setIngredients] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [cookingTime, setCookingTime] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [generatedRecipe, setGeneratedRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setGeneratedRecipe(null);

    try {
      const response = await fetch('/api/ai/generate-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredients,
          cuisine,
          dietaryRestrictions,
          cookingTime,
          difficulty,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedRecipe(data.recipe);
      } else {
        setError(data.error || 'Failed to generate recipe');
      }
    } catch (error) {
      setError('An error occurred while generating the recipe');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRecipe = async () => {
    if (!generatedRecipe) return;

    try {
      const response = await fetch('/api/recipes/save-generated', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(generatedRecipe),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/recipes');
      } else {
        setError(data.error || 'Failed to save recipe');
      }
    } catch (error) {
      setError('An error occurred while saving the recipe');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Bot className="h-8 w-8 text-primary" />
              AI Recipe Generator
            </h1>
            <p className="text-muted-foreground">Let AI create a personalized recipe based on your preferences</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Recipe Parameters
              </CardTitle>
              <CardDescription>
                Tell us what you have and what you'd like to cook
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ingredients">Available Ingredients *</Label>
                  <Textarea
                    id="ingredients"
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    placeholder="List your available ingredients (e.g., chicken, tomatoes, onions, rice)"
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cuisine">Cuisine Type</Label>
                  <Input
                    id="cuisine"
                    value={cuisine}
                    onChange={(e) => setCuisine(e.target.value)}
                    placeholder="e.g., Italian, Mexican, Asian, Mediterranean"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dietaryRestrictions">Dietary Restrictions</Label>
                  <Input
                    id="dietaryRestrictions"
                    value={dietaryRestrictions}
                    onChange={(e) => setDietaryRestrictions(e.target.value)}
                    placeholder="e.g., vegetarian, vegan, gluten-free, dairy-free"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cookingTime">Cooking Time</Label>
                    <Input
                      id="cookingTime"
                      value={cookingTime}
                      onChange={(e) => setCookingTime(e.target.value)}
                      placeholder="e.g., 30 minutes, 1 hour"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty Level</Label>
                    <Input
                      id="difficulty"
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      placeholder="e.g., easy, medium, hard"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Recipe...
                    </>
                  ) : (
                    <>
                      <Bot className="mr-2 h-4 w-4" />
                      Generate Recipe
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="h-5 w-5" />
                Generated Recipe
              </CardTitle>
              <CardDescription>
                Your AI-generated recipe will appear here
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!generatedRecipe && !loading && (
                <div className="text-center py-12">
                  <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Fill in the form and click "Generate Recipe" to get your personalized recipe
                  </p>
                </div>
              )}

              {loading && (
                <div className="text-center py-12">
                  <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
                  <p className="text-muted-foreground">
                    AI is cooking up something delicious for you...
                  </p>
                </div>
              )}

              {generatedRecipe && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{generatedRecipe.title}</h3>
                    <p className="text-muted-foreground">{generatedRecipe.description}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Prep Time:</span>
                      <p>{generatedRecipe.prepTime} min</p>
                    </div>
                    <div>
                      <span className="font-medium">Cook Time:</span>
                      <p>{generatedRecipe.cookTime} min</p>
                    </div>
                    <div>
                      <span className="font-medium">Servings:</span>
                      <p>{generatedRecipe.servings}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Ingredients:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {generatedRecipe.ingredients?.map((ingredient: string, index: number) => (
                        <li key={index}>{ingredient}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Instructions:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      {generatedRecipe.instructions?.map((instruction: string, index: number) => (
                        <li key={index}>{instruction}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSaveRecipe} className="flex-1">
                      Save Recipe
                    </Button>
                    <Button variant="outline" onClick={() => setGeneratedRecipe(null)}>
                      Generate New
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
