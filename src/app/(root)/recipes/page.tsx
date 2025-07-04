'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Heart, Bookmark, Clock, Users, ArrowLeft, Filter } from 'lucide-react';

interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
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
  const router = useRouter();

  useEffect(() => {
    fetchRecipes();
  }, []);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading recipes...</p>
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
            <h1 className="text-lg font-bold">Discover Recipes</h1>
            <p className="text-muted-foreground text-xs">Explore delicious recipes from our community</p>
          </div>
        </div>

        <div className="flex gap-2 mb-2 flex-shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              placeholder="Search recipes, ingredients, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <Filter className="h-3 w-3" />
          </Button>
        </div>

        {error && (
          <div className="mb-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive flex-shrink-0">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredRecipes.map((recipe) => (
              <Card key={recipe.id} className="group hover:shadow-lg transition-shadow cursor-pointer">
                <div 
                  onClick={() => router.push(`/recipes/${recipe.id}`)}
                  className="space-y-2"
                >
                  {recipe.imageUrl && (
                    <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                      <img
                        src={recipe.imageUrl}
                        alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-sm line-clamp-1">{recipe.title}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-1 text-xs">
                          {recipe.description}
                        </CardDescription>
                      </div>
                      {recipe.isAIGenerated && (
                        <Badge variant="secondary" className="ml-1 text-xs px-1 py-0 h-4">
                          AI
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {recipe.prepTime + recipe.cookTime} min
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {recipe.servings}
                      </div>
                      <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                        {recipe.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                </div>
                
                <CardContent className="pt-0 pb-2">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {recipe.tags.slice(0, 2).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs px-1 py-0 h-4">
                        {tag}
                      </Badge>
                    ))}
                    {recipe.tags.length > 2 && (
                      <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
                        +{recipe.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      <p>By {recipe.authorName}</p>
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
                        className="h-6 w-6 p-0"
                      >
                        <Heart className="h-3 w-3" />
                      </Button>
                      <span className="text-xs text-muted-foreground">{recipe.likes}</span>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookmark(recipe.id);
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <Bookmark className="h-3 w-3" />
                      </Button>
                      <span className="text-xs text-muted-foreground">{recipe.bookmarks}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredRecipes.length === 0 && !loading && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No recipes found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Try adjusting your search terms' : 'No recipes available yet'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
