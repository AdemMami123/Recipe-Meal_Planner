'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { BookOpen, Search, Heart, Clock, Users, ArrowLeft, Trash2 } from 'lucide-react';

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

interface BookmarkedRecipe {
  id: string;
  recipe: Recipe;
  bookmarkedAt: string;
}

export default function SavedRecipesPage() {
  const [bookmarkedRecipes, setBookmarkedRecipes] = useState<BookmarkedRecipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<BookmarkedRecipe[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchBookmarkedRecipes();
  }, []);

  useEffect(() => {
    filterRecipes();
  }, [searchTerm, bookmarkedRecipes]);

  const fetchBookmarkedRecipes = async () => {
    try {
      const response = await fetch('/api/bookmarks');
      const data = await response.json();
      
      if (data.success) {
        setBookmarkedRecipes(data.bookmarks);
        setFilteredRecipes(data.bookmarks);
      } else {
        setError(data.error || 'Failed to fetch bookmarked recipes');
      }
    } catch (error) {
      setError('An error occurred while fetching bookmarked recipes');
    } finally {
      setLoading(false);
    }
  };

  const filterRecipes = () => {
    if (!searchTerm) {
      setFilteredRecipes(bookmarkedRecipes);
      return;
    }

    const filtered = bookmarkedRecipes.filter(bookmark =>
      bookmark.recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bookmark.recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bookmark.recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredRecipes(filtered);
  };

  const removeBookmark = async (bookmarkId: string) => {
    try {
      const response = await fetch(`/api/bookmarks/${bookmarkId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setBookmarkedRecipes(prev => prev.filter(bookmark => bookmark.id !== bookmarkId));
      }
    } catch (error) {
      console.error('Error removing bookmark:', error);
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
          <p className="mt-2 text-sm text-muted-foreground">Loading saved recipes...</p>
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
              <BookOpen className="h-5 w-5 text-primary" />
              Saved Recipes
            </h1>
            <p className="text-muted-foreground text-xs">Your bookmarked favorite recipes</p>
          </div>
        </div>

        <div className="flex gap-2 mb-2 flex-shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              placeholder="Search your saved recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
          <Button onClick={() => router.push('/recipes')} size="sm" className="h-8 text-xs px-2">
            Browse More
          </Button>
        </div>

        {error && (
          <div className="mb-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive flex-shrink-0">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredRecipes.map((bookmark) => (
              <Card key={bookmark.id} className="group hover:shadow-lg transition-shadow">
                <div 
                  onClick={() => router.push(`/recipes/${bookmark.recipe.id}`)}
                  className="cursor-pointer"
                >
                  {bookmark.recipe.imageUrl && (
                    <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                      <img
                        src={bookmark.recipe.imageUrl}
                        alt={bookmark.recipe.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-sm line-clamp-1">{bookmark.recipe.title}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-1 text-xs">
                          {bookmark.recipe.description}
                        </CardDescription>
                      </div>
                      {bookmark.recipe.isAIGenerated && (
                        <Badge variant="secondary" className="ml-1 text-xs px-1 py-0 h-4">
                          AI
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {bookmark.recipe.prepTime + bookmark.recipe.cookTime} min
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {bookmark.recipe.servings}
                      </div>
                      <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                        {bookmark.recipe.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                </div>
                
                <CardContent className="pt-0 pb-2">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {bookmark.recipe.tags.slice(0, 2).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs px-1 py-0 h-4">
                        {tag}
                      </Badge>
                    ))}
                    {bookmark.recipe.tags.length > 2 && (
                      <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
                        +{bookmark.recipe.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      <p>By {bookmark.recipe.authorName}</p>
                      <p>Saved {formatDate(bookmark.bookmarkedAt)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Heart className="h-3 w-3" />
                        {bookmark.recipe.likes}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeBookmark(bookmark.id);
                        }}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredRecipes.length === 0 && !loading && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No saved recipes found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Try adjusting your search terms' : 'Start bookmarking recipes to see them here'}
              </p>
              <Button onClick={() => router.push('/recipes')}>
                Browse Recipes
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
