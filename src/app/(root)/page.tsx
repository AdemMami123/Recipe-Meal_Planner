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
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Welcome to Recipe Planner
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover, create, and plan your meals with AI-powered recipes
          </p>
          {user && (
            <p className="mt-4 text-lg">
              Welcome back, <span className="font-semibold text-primary">{user.name}</span>!
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button 
                    variant={feature.variant} 
                    className="w-full"
                    size="sm"
                    onClick={feature.onClick}
                  >
                    {feature.action}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Recipes */}
        {recentRecipes.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Recent Recipes</h2>
              <Button variant="outline" onClick={() => router.push('/recipes')}>
                View All
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentRecipes.map((recipe) => (
                <Card key={recipe.id} className="overflow-hidden group hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer"
                      onClick={() => router.push(`/recipes/${recipe.id}`)}>
                  {recipe.imageUrl && (
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={recipe.imageUrl} 
                        alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="font-semibold text-white text-lg line-clamp-2">{recipe.title}</h3>
                      </div>
                    </div>
                  )}
                  <CardContent className="p-4">
                    {!recipe.imageUrl && (
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{recipe.title}</h3>
                    )}
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{recipe.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {recipe.prepTime + recipe.cookTime}m
                        </div>
                        <div className="flex items-center gap-1">
                          <UsersIcon className="h-3 w-3" />
                          {recipe.servings}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <ChefHat className="h-3 w-3" />
                        {recipe.authorName}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Quick Start Section */}
        <div className="text-center">
          <div className="bg-muted/50 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Get Started</h2>
            <p className="text-muted-foreground mb-6">
              Ready to explore delicious recipes and plan your meals?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="flex items-center gap-2" onClick={() => router.push('/ai-generator')}>
                <Bot className="h-4 w-4" />
                Try AI Generator
              </Button>
              <Button variant="outline" size="lg" className="flex items-center gap-2" onClick={() => router.push('/recipes')}>
                <Search className="h-4 w-4" />
                Browse Recipes
              </Button>
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
