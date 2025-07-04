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
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              AI Recipe Generator
            </h1>
            <p className="text-muted-foreground text-xs">Let AI create a personalized recipe</p>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-3 h-full">
            <Card className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4" />
                  Recipe Parameters
                </CardTitle>
                <CardDescription className="text-xs">
                  Tell us what you have and what you'd like to cook
                </CardDescription>
              </CardHeader>
              <CardContent className="h-full overflow-y-auto pb-3">
                {error && (
                  <Alert variant="destructive" className="mb-2 py-1">
                    <AlertDescription className="text-xs">{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleGenerate} className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="ingredients" className="text-xs">Available Ingredients *</Label>
                    <Textarea
                      id="ingredients"
                      value={ingredients}
                      onChange={(e) => setIngredients(e.target.value)}
                      placeholder="List your available ingredients (e.g., chicken, tomatoes, onions, rice)"
                      rows={3}
                      required
                      className="text-xs resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="cuisine" className="text-xs">Cuisine Type</Label>
                    <Input
                      id="cuisine"
                      value={cuisine}
                      onChange={(e) => setCuisine(e.target.value)}
                      placeholder="e.g., Italian, Mexican, Asian"
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="dietaryRestrictions" className="text-xs">Dietary Restrictions</Label>
                    <Input
                      id="dietaryRestrictions"
                      value={dietaryRestrictions}
                      onChange={(e) => setDietaryRestrictions(e.target.value)}
                      placeholder="e.g., vegetarian, vegan, gluten-free"
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="cookingTime" className="text-xs">Cooking Time</Label>
                      <Input
                        id="cookingTime"
                        value={cookingTime}
                        onChange={(e) => setCookingTime(e.target.value)}
                        placeholder="e.g., 30 minutes"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="difficulty" className="text-xs">Difficulty Level</Label>
                      <Input
                        id="difficulty"
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        placeholder="e.g., easy, medium"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-8" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Bot className="mr-2 h-3 w-3" />
                        Generate Recipe
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ChefHat className="h-4 w-4" />
                  Generated Recipe
                </CardTitle>
                <CardDescription className="text-xs">
                  Your AI-generated recipe will appear here
                </CardDescription>
              </CardHeader>
              <CardContent className="h-full overflow-y-auto pb-3">
                {!generatedRecipe && !loading && (
                  <div className="text-center py-8">
                    <Bot className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground text-xs">
                      Fill in the form and click "Generate Recipe" to get your personalized recipe
                    </p>
                  </div>
                )}

                {loading && (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 text-primary mx-auto mb-2 animate-spin" />
                    <p className="text-muted-foreground text-xs">
                      AI is cooking up something delicious for you...
                    </p>
                  </div>
                )}

                {generatedRecipe && (
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-base font-semibold mb-1">{generatedRecipe.title}</h3>
                      <p className="text-muted-foreground text-xs">{generatedRecipe.description}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="font-medium">Prep:</span>
                        <p>{generatedRecipe.prepTime} min</p>
                      </div>
                      <div>
                        <span className="font-medium">Cook:</span>
                        <p>{generatedRecipe.cookTime} min</p>
                      </div>
                      <div>
                        <span className="font-medium">Servings:</span>
                        <p>{generatedRecipe.servings}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-1 text-xs">Ingredients:</h4>
                      <ul className="list-disc list-inside space-y-0.5 text-xs">
                        {generatedRecipe.ingredients?.map((ingredient: string, index: number) => (
                          <li key={index}>{ingredient}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-1 text-xs">Instructions:</h4>
                      <ol className="list-decimal list-inside space-y-1 text-xs">
                        {generatedRecipe.instructions?.map((instruction: string, index: number) => (
                          <li key={index}>{instruction}</li>
                        ))}
                      </ol>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button onClick={handleSaveRecipe} className="flex-1 h-8 text-xs">
                        Save Recipe
                      </Button>
                      <Button variant="outline" onClick={() => setGeneratedRecipe(null)} className="h-8 text-xs">
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
    </div>
  );
}
