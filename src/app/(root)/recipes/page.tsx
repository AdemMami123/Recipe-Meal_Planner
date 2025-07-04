'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import FloatingUploadButton from '@/components/FloatingUploadButton';
import { Toast } from '@/components/ui/toast';
import { Search, Heart, Bookmark, Clock, Users, ArrowLeft, Filter, ChefHat, Sparkles, Trash2, MoreVertical } from 'lucide-react';

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
  tags: string[];
  likes: number;
  bookmarks: number;
  createdAt: string;
  isAIGenerated?: boolean;
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState<'default' | 'destructive' | 'success'>('default');
  const router = useRouter();

  useEffect(() => {
    fetchRecipes();
    fetchCurrentUser();
  }, []);

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

  useEffect(() => {
    filterRecipes();
  }, [searchTerm, recipes]);

  const fetchRecipes = async () => {
    try {
      const response = await fetch('/api/recipes/list');
      const data = await response.json();
      
      if (data.success) {
        setRecipes(data.recipes);
        setFilteredRecipes(data.recipes);
      } else {
        setError(data.error || 'Failed to fetch recipes');
      }
    } catch (error) {
      setError('An error occurred while fetching recipes');
    } finally {
      setLoading(false);
    }
  };

  const filterRecipes = () => {
    if (!searchTerm) {
      setFilteredRecipes(recipes);
      return;
    }

    const filtered = recipes.filter(recipe =>
      recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredRecipes(filtered);
  };

  const handleLike = async (recipeId: string) => {
    try {
      const response = await fetch(`/api/recipes/${recipeId}/like`, {
        method: 'POST',
      });
      
      if (response.ok) {
        setRecipes(prev => prev.map(recipe => 
          recipe.id === recipeId 
            ? { ...recipe, likes: recipe.likes + 1 }
            : recipe
        ));
      }
    } catch (error) {
      console.error('Error liking recipe:', error);
    }
  };

  const handleBookmark = async (recipeId: string) => {
    try {
      const response = await fetch(`/api/recipes/${recipeId}/bookmark`, {
        method: 'POST',
      });
      
      if (response.ok) {
        setRecipes(prev => prev.map(recipe => 
          recipe.id === recipeId 
            ? { ...recipe, bookmarks: recipe.bookmarks + 1 }
            : recipe
        ));
      }
    } catch (error) {
      console.error('Error bookmarking recipe:', error);
    }
  };

  const handleDelete = async (recipeId: string, recipeTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${recipeTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/recipes/${recipeId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Remove the recipe from the local state
        setRecipes(prev => prev.filter(recipe => recipe.id !== recipeId));
        setFilteredRecipes(prev => prev.filter(recipe => recipe.id !== recipeId));
        setToastMessage(`"${recipeTitle}" deleted successfully!`);
        setToastVariant('success');
        setShowToast(true);
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
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleUploadSuccess = () => {
    // Refresh recipes when a new one is uploaded
    fetchRecipes();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/3">
        <div className="text-center">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-emerald-400/20 rounded-full blur-lg animate-pulse"></div>
            <div className="relative p-2 bg-gradient-to-r from-primary/70 to-emerald-400/70 rounded-full shadow-sm">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/70 border-t-transparent"></div>
            </div>
          </div>
          <h2 className="text-base font-semibold mb-1">Discovering Recipes</h2>
          <p className="text-sm text-muted-foreground">Loading delicious recipes for you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/3">
      <div className="container mx-auto px-4 py-4">
        {/* Header Section */}
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8 rounded-full hover:bg-primary/10 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-emerald-400/20 rounded-full blur-md"></div>
                <div className="relative p-1.5 bg-gradient-to-r from-primary/70 to-emerald-400/70 rounded-full">
                  <ChefHat className="h-4 w-4 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
                  Discover Recipes
                </h1>
                <p className="text-xs text-muted-foreground">{filteredRecipes.length} delicious recipes from our community</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search recipes, ingredients, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9 bg-background/60 border-primary/20 focus:border-primary/40 transition-colors"
            />
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9 px-3 border-primary/20 hover:bg-primary/5 dark:hover:bg-primary/10"
          >
            <Filter className="h-4 w-4 mr-1" />
            Filter
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-destructive/5 border border-destructive/20 rounded-lg text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Recipe Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRecipes.map((recipe) => (
            <Card 
              key={recipe.id} 
              className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-background to-muted/5 hover:scale-[1.02] overflow-hidden"
              onClick={() => router.push(`/recipes/${recipe.id}`)}
            >
              {recipe.imageUrl ? (
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <div className="absolute top-2 right-2 flex gap-1">
                    {recipe.isAIGenerated && (
                      <Badge className="bg-gradient-to-r from-primary/80 to-emerald-500/80 text-white text-xs px-2 py-0.5">
                        <Sparkles className="h-3 w-3 mr-1" />
                        AI
                      </Badge>
                    )}
                  </div>
                  <div className="absolute bottom-2 left-2 right-2">
                    <h3 className="font-semibold text-white text-sm line-clamp-2 mb-1">
                      {recipe.title}
                    </h3>
                    <div className="flex items-center gap-3 text-white/90 text-xs">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{recipe.prepTime + recipe.cookTime}min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{recipe.servings}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative h-40 bg-gradient-to-br from-primary/5 to-emerald-400/5 flex items-center justify-center">
                  <div className="text-center">
                    <ChefHat className="h-8 w-8 text-primary/40 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">No image</p>
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1">
                    {recipe.isAIGenerated && (
                      <Badge className="bg-gradient-to-r from-primary/80 to-emerald-500/80 text-white text-xs px-2 py-0.5">
                        <Sparkles className="h-3 w-3 mr-1" />
                        AI
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              
              <CardContent className="p-3">
                {!recipe.imageUrl && (
                  <div className="mb-2">
                    <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                      {recipe.title}
                    </h3>
                    <div className="flex items-center gap-3 text-muted-foreground text-xs mb-1">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{recipe.prepTime + recipe.cookTime}min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{recipe.servings}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {recipe.description}
                </p>
                
                <div className="flex flex-wrap gap-1 mb-2">
                  <Badge variant="outline" className="text-xs bg-primary/5 border-primary/20">
                    {recipe.difficulty}
                  </Badge>
                  {recipe.tags.slice(0, 2).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-muted/50">
                      {tag}
                    </Badge>
                  ))}
                  {recipe.tags.length > 2 && (
                    <Badge variant="secondary" className="text-xs bg-muted/50">
                      +{recipe.tags.length - 2}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <div className="text-xs text-muted-foreground">
                    <p className="font-medium">By {recipe.authorName}</p>
                    <p>{formatDate(recipe.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(recipe.id);
                      }}
                      className="h-7 w-7 p-0 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                    >
                      <Heart className="h-3 w-3 text-red-500" />
                    </Button>
                    <span className="text-xs text-muted-foreground min-w-[16px]">{recipe.likes}</span>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookmark(recipe.id);
                      }}
                      className="h-7 w-7 p-0 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors"
                    >
                      <Bookmark className="h-3 w-3 text-blue-500" />
                    </Button>
                    <span className="text-xs text-muted-foreground min-w-[16px]">{recipe.bookmarks}</span>
                    
                    {currentUser && currentUser.id === recipe.authorId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(recipe.id, recipe.title);
                        }}
                        className="h-7 w-7 p-0 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-red-500 ml-1"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredRecipes.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-emerald-400/20 rounded-full blur-lg"></div>
              <div className="relative p-4 bg-gradient-to-r from-primary/5 to-emerald-400/5 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                <Search className="h-8 w-8 text-primary/40" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">No recipes found</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto text-sm">
              {searchTerm 
                ? `No recipes match "${searchTerm}". Try different keywords or browse all recipes.` 
                : 'No recipes available yet. Be the first to share a delicious recipe!'
              }
            </p>
            {searchTerm && (
              <Button 
                onClick={() => setSearchTerm('')}
                variant="outline"
                size="sm"
                className="border-primary/20 hover:bg-primary/5 dark:hover:bg-primary/10"
              >
                Clear search
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Floating Upload Button */}
      <FloatingUploadButton onUploadSuccess={handleUploadSuccess} />
      
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
