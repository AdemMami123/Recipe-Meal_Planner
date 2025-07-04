'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import UploadRecipeModal from '@/components/UploadRecipeModal';
import { 
  Upload, 
  Bot, 
  Calendar, 
  Search, 
  BookOpen, 
  User,
  Sparkles,
  ChefHat,
  Clock,
  Users as UsersIcon,
  Utensils
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface Recipe {
  id: string;
  title: string;
  description: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  imageUrl?: string;
  createdAt: string;
  authorName: string;
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentRecipes, setRecentRecipes] = useState<Recipe[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/user');
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchRecentRecipes = async () => {
      try {
        const response = await fetch('/api/recipes/list?limit=6');
        const data = await response.json();
        if (data.success) {
          setRecentRecipes(data.recipes);
        }
      } catch (error) {
        console.error('Error fetching recent recipes:', error);
      }
    };

    fetchUser();
    fetchRecentRecipes();
  }, []);

  const handleUploadSuccess = () => {
    // Refresh recent recipes after successful upload
    const fetchRecentRecipes = async () => {
      try {
        const response = await fetch('/api/recipes/list?limit=6');
        const data = await response.json();
        if (data.success) {
          setRecentRecipes(data.recipes);
        }
      } catch (error) {
        console.error('Error fetching recent recipes:', error);
      }
    };
    fetchRecentRecipes();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-emerald-400/10 rounded-full blur-xl animate-pulse"></div>
            <div className="relative p-4 bg-gradient-to-r from-primary/80 to-emerald-400/80 rounded-full shadow-md">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/80 border-t-transparent"></div>
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-2">Welcome to Recipe Planner</h2>
          <p className="text-muted-foreground">Preparing your culinary experience...</p>
        </div>
      </div>
    );
  }

  const features = [
    {
      title: "Upload Recipe",
      description: "Share your favorite recipes with the community",
      icon: Upload,
      action: "Upload Recipe",
      variant: "default" as const,
      onClick: () => setShowUploadModal(true)
    },
    {
      title: "AI Recipe Generator",
      description: "Generate recipes based on your ingredients",
      icon: Bot,
      action: "Generate Recipe",
      variant: "default" as const,
      onClick: () => router.push('/ai-generator')
    },
    {
      title: "Meal Planner",
      description: "Plan your weekly meals with drag & drop",
      icon: Calendar,
      action: "Plan Meals",
      variant: "default" as const,
      onClick: () => router.push('/meal-planner')
    },
    {
      title: "Discover Recipes",
      description: "Browse and search through shared recipes",
      icon: Search,
      action: "Explore Recipes",
      variant: "default" as const,
      onClick: () => router.push('/recipes')
    },
    {
      title: "Saved Recipes",
      description: "Access your bookmarked favorite recipes",
      icon: BookOpen,
      action: "View Saved",
      variant: "default" as const,
      onClick: () => router.push('/saved')
    },
    {
      title: "Profile",
      description: "Manage your account and preferences",
      icon: User,
      action: "Edit Profile",
      variant: "secondary" as const,
      onClick: () => router.push('/profile')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-6">
        {/* Compact Hero Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-emerald-400/10 rounded-full blur-xl animate-pulse"></div>
              <div className="relative p-3 bg-gradient-to-r from-primary/80 to-emerald-400/80 rounded-full shadow-lg">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
            Recipe Planner
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
            Transform your cooking with <span className="text-primary font-semibold">AI-powered recipes</span> and smart meal planning
          </p>
          {user && (
            <div className="inline-flex items-center gap-2 bg-primary/5 dark:bg-primary/10 px-4 py-2 rounded-full mb-4 border border-primary/20">
              <User className="h-4 w-4 text-primary" />
              <span className="text-sm">
                Welcome back, <span className="font-semibold text-primary">{user.name}</span>!
              </span>
            </div>
          )}
          
          {/* Quick Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-6">
            <Button 
              size="default" 
              className="bg-gradient-to-r from-primary/90 to-emerald-500/90 hover:from-primary hover:to-emerald-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              onClick={() => setShowUploadModal(true)}
            >
              <Upload className="mr-2 h-4 w-4" />
              Share Recipe
            </Button>
            <Button 
              size="default" 
              variant="outline"
              className="border-2 border-primary/20 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-300"
              onClick={() => router.push('/ai-generator')}
            >
              <Bot className="mr-2 h-4 w-4" />
              AI Generator
            </Button>
          </div>
        </div>

        {/* Compact Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={feature.title} 
                className={`group relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer bg-gradient-to-br from-background to-muted/10 hover:from-background hover:to-primary/5 dark:hover:to-primary/10 ${
                  index === 0 ? 'ring-2 ring-primary/20' : ''
                }`}
                onClick={feature.onClick}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/3 to-emerald-400/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="pb-3 relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg transition-all duration-300 ${
                      index === 0 
                        ? 'bg-gradient-to-r from-primary/80 to-emerald-500/80 text-white' 
                        : 'bg-primary/10 text-primary group-hover:bg-primary/15'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    {index === 0 && (
                      <div className="bg-gradient-to-r from-primary/80 to-emerald-500/80 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Popular
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-lg font-bold mb-1">{feature.title}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 relative">
                  <Button 
                    variant={index === 0 ? "default" : "outline"}
                    className={`w-full transition-all duration-300 h-8 text-xs ${
                      index === 0 
                        ? 'bg-gradient-to-r from-primary/90 to-emerald-500/90 hover:from-primary hover:to-emerald-500 text-white' 
                        : 'group-hover:bg-primary/5 dark:group-hover:bg-primary/10'
                    }`}
                    size="sm"
                  >
                    {feature.action}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Recipes - Compact */}
        {recentRecipes.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Latest Recipes</h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/recipes')}
                className="text-xs"
              >
                View All
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentRecipes.slice(0, 3).map((recipe) => (
                <Card 
                  key={recipe.id} 
                  className="overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-background to-muted/5 hover:scale-105"
                  onClick={() => router.push(`/recipes/${recipe.id}`)}
                >
                  {recipe.imageUrl && (
                    <div className="relative h-32 overflow-hidden">
                      <img 
                        src={recipe.imageUrl} 
                        alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2 text-white">
                        <h3 className="font-semibold text-sm line-clamp-1 mb-1">
                          {recipe.title}
                        </h3>
                      </div>
                    </div>
                  )}
                  <CardContent className="p-3">
                    {!recipe.imageUrl && (
                      <h3 className="font-semibold text-sm line-clamp-1 mb-2">
                        {recipe.title}
                      </h3>
                    )}
                    <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                      {recipe.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{recipe.prepTime + recipe.cookTime}min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <UsersIcon className="h-3 w-3" />
                          <span>{recipe.servings}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <ChefHat className="h-3 w-3" />
                        <span className="font-medium truncate max-w-[80px]">{recipe.authorName}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Compact Stats Section */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="text-center border-0 bg-gradient-to-br from-primary/5 to-primary/8 hover:from-primary/8 hover:to-primary/12 transition-all duration-300">
            <CardContent className="p-4">
              <div className="w-10 h-10 bg-gradient-to-r from-primary/80 to-emerald-500/80 rounded-full flex items-center justify-center mx-auto mb-2">
                <ChefHat className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-primary mb-1">10K+</h3>
              <p className="text-xs text-muted-foreground">Recipes</p>
            </CardContent>
          </Card>
          <Card className="text-center border-0 bg-gradient-to-br from-emerald-500/5 to-emerald-500/8 hover:from-emerald-500/8 hover:to-emerald-500/12 transition-all duration-300">
            <CardContent className="p-4">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500/80 to-primary/80 rounded-full flex items-center justify-center mx-auto mb-2">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-emerald-600 mb-1">5K+</h3>
              <p className="text-xs text-muted-foreground">AI Generated</p>
            </CardContent>
          </Card>
          <Card className="text-center border-0 bg-gradient-to-br from-blue-500/5 to-blue-500/8 hover:from-blue-500/8 hover:to-blue-500/12 transition-all duration-300">
            <CardContent className="p-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500/80 to-cyan-500/80 rounded-full flex items-center justify-center mx-auto mb-2">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-blue-600 mb-1">2K+</h3>
              <p className="text-xs text-muted-foreground">Meals Planned</p>
            </CardContent>
          </Card>
        </div>

        {/* Compact Call to Action */}
        <div className="text-center">
          <div className="relative overflow-hidden bg-gradient-to-r from-primary/5 via-emerald-400/5 to-primary/5 dark:from-primary/10 dark:via-emerald-400/10 dark:to-primary/10 rounded-xl p-6 border border-primary/10">
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            <div className="relative">
              <div className="flex justify-center mb-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-emerald-500/30 rounded-full blur-lg opacity-50 animate-pulse"></div>
                  <div className="relative p-2 bg-gradient-to-r from-primary/80 to-emerald-500/80 rounded-full">
                    <Utensils className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
              <h2 className="text-xl font-bold mb-2">Ready to Start Cooking?</h2>
              <p className="text-muted-foreground text-sm mb-4 max-w-md mx-auto">
                Join thousands of home cooks discovering amazing recipes every day
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  size="default" 
                  className="bg-gradient-to-r from-primary/90 to-emerald-500/90 hover:from-primary hover:to-emerald-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  onClick={() => router.push('/ai-generator')}
                >
                  <Bot className="mr-2 h-4 w-4" />
                  Generate Recipe
                </Button>
                <Button 
                  variant="outline" 
                  size="default" 
                  className="border-2 border-primary/20 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-300"
                  onClick={() => router.push('/recipes')}
                >
                  <Search className="mr-2 h-4 w-4" />
                  Browse Recipes
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Recipe Modal */}
      <UploadRecipeModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
}
