'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Toast } from '@/components/ui/toast';
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  Heart, 
  Bookmark, 
  ChefHat,
  Share2,
  Star,
  Trash2,
  MoreVertical
} from 'lucide-react';

interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  authorId: string;
  authorName: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: string;
  ingredients: string;
  instructions: string;
  tags: string[];
  likes: number;
  bookmarks: number;
  createdAt: string;
  isAIGenerated?: boolean;
}

export default function RecipeDetailPage() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState<'default' | 'destructive' | 'success'>('default');
  const router = useRouter();
  const params = useParams();
  const recipeId = params.id as string;

  useEffect(() => {
    if (recipeId) {
      fetchRecipe();
      fetchCurrentUser();
    }
  }, [recipeId]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/user');
      const data = await response.json();
      if (data.success) {
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchRecipe = async () => {
    try {
      const response = await fetch(`/api/recipes/${recipeId}`);
      const data = await response.json();
      
      if (data.success) {
        setRecipe(data.recipe);
      } else {
        setError(data.error || 'Failed to fetch recipe');
      }
    } catch (error) {
      setError('An error occurred while fetching the recipe');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/recipes/${recipeId}/like`, {
        method: 'POST',
      });
      
      if (response.ok) {
        setIsLiked(!isLiked);
        setRecipe(prev => prev ? { 
          ...prev, 
          likes: isLiked ? prev.likes - 1 : prev.likes + 1 
        } : null);
      }
    } catch (error) {
      console.error('Error liking recipe:', error);
    }
  };

  const handleBookmark = async () => {
    try {
      const response = await fetch(`/api/recipes/${recipeId}/bookmark`, {
        method: 'POST',
      });
      
      if (response.ok) {
        setIsBookmarked(!isBookmarked);
        setRecipe(prev => prev ? { 
          ...prev, 
          bookmarks: isBookmarked ? prev.bookmarks - 1 : prev.bookmarks + 1 
        } : null);
      }
    } catch (error) {
      console.error('Error bookmarking recipe:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/recipes/${recipeId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setToastMessage('Recipe deleted successfully!');
        setToastVariant('success');
        setShowToast(true);
        setTimeout(() => {
          router.push('/recipes');
        }, 1500);
      } else {
        const data = await response.json();
        setToastMessage(data.error || 'Failed to delete recipe');
        setToastVariant('destructive');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Error deleting recipe:', error);
      setToastMessage('An error occurred while deleting the recipe');
      setToastVariant('destructive');
      setShowToast(true);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const parseIngredients = (ingredients: string | string[] | undefined) => {
    if (!ingredients) return [];
    if (Array.isArray(ingredients)) return ingredients.filter(ingredient => ingredient.trim());
    if (typeof ingredients === 'string') {
      return ingredients.split('\n').filter(ingredient => ingredient.trim());
    }
    return [];
  };

  const parseInstructions = (instructions: string | string[] | undefined) => {
    if (!instructions) return [];
    if (Array.isArray(instructions)) return instructions.filter(instruction => instruction.trim());
    if (typeof instructions === 'string') {
      return instructions.split('\n').filter(instruction => instruction.trim());
    }
    return [];
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/3">
        <div className="text-center">
          <div className="relative mb-3">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-emerald-400/20 rounded-full blur-lg animate-pulse"></div>
            <div className="relative p-2 bg-gradient-to-r from-primary/70 to-emerald-400/70 rounded-full shadow-sm">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/70 border-t-transparent"></div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="h-screen flex items-center justify-center p-4">
        <Alert variant="destructive">
          <AlertDescription>{error || 'Recipe not found'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/3">
      <div className="container mx-auto px-4 py-2 flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8 hover:bg-primary/10 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold line-clamp-1">{recipe.title}</h1>
            <p className="text-muted-foreground text-xs">
              By {recipe.authorName} • {formatDate(recipe.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors ${isLiked ? 'text-red-500' : ''}`}
            >
              <Heart className="h-4 w-4" fill={isLiked ? 'currentColor' : 'none'} />
            </Button>
            <span className="text-xs">{recipe.likes}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmark}
              className={`h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors ${isBookmarked ? 'text-blue-500' : ''}`}
            >
              <Bookmark className="h-4 w-4" fill={isBookmarked ? 'currentColor' : 'none'} />
            </Button>
            <span className="text-xs">{recipe.bookmarks}</span>
            {currentUser && currentUser.id === recipe.authorId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-red-500 ml-2"
              >
                {isDeleting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-500 border-t-transparent"></div>
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="grid lg:grid-cols-3 gap-3 h-full">
            {/* Recipe Image and Info */}
            <div className="lg:col-span-1 space-y-2">
              {recipe.imageUrl && (
                <div className="aspect-square bg-gradient-to-br from-primary/5 to-emerald-400/5 rounded-lg overflow-hidden">
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <Card className="bg-gradient-to-br from-background to-muted/5 border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Recipe Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pb-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-primary/70" />
                      <span>Prep: {recipe.prepTime}m</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-primary/70" />
                      <span>Cook: {recipe.cookTime}m</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-primary/70" />
                      <span>{recipe.servings} servings</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-primary/70" />
                      <span>{recipe.difficulty}</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Description:</p>
                    <p className="text-xs">{recipe.description}</p>
                  </div>

                  {recipe.tags.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Tags:</p>
                      <div className="flex flex-wrap gap-1">
                        {recipe.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs px-1 py-0 h-4 bg-primary/10">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {recipe.isAIGenerated && (
                    <div className="flex items-center gap-1 text-xs text-primary/80">
                      <ChefHat className="h-3 w-3" />
                      <span>AI Generated Recipe</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Ingredients and Instructions */}
            <div className="lg:col-span-2 space-y-3 overflow-y-auto">
              <Card className="bg-gradient-to-br from-background to-muted/5 border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Ingredients</CardTitle>
                </CardHeader>
                <CardContent className="pb-3">
                  <ul className="space-y-1">
                    {parseIngredients(recipe.ingredients).map((ingredient, index) => (
                      <li key={index} className="text-xs flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary/70 mt-1.5 flex-shrink-0"></span>
                        <span>{ingredient}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-background to-muted/5 border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Instructions</CardTitle>
                </CardHeader>
                <CardContent className="pb-3">
                  <ol className="space-y-2">
                    {parseInstructions(recipe.instructions).map((instruction, index) => (
                      <li key={index} className="text-xs flex gap-2">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r from-primary/70 to-emerald-400/70 text-white flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </span>
                        <span className="pt-0.5">{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      {/* Toast Notification */}
      {showToast && (
        <Toast
          variant={toastVariant}
          onClose={() => setShowToast(false)}
        >
          {toastMessage}
        </Toast>
      )}
    </div>
  );
}
