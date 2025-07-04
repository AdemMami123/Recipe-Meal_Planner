'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Upload, 
  Bot, 
  Calendar, 
  Search, 
  BookOpen, 
  User,
  Sparkles
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
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

    fetchUser();
  }, []);

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
      title: "Upload Recipes",
      description: "Share your favorite recipes with the community",
      icon: Upload,
      action: "Upload Recipe",
      variant: "default" as const
    },
    {
      title: "AI Recipe Generator",
      description: "Generate recipes based on your ingredients",
      icon: Bot,
      action: "Generate Recipe",
      variant: "default" as const
    },
    {
      title: "Meal Planner",
      description: "Plan your weekly meals with drag & drop",
      icon: Calendar,
      action: "Plan Meals",
      variant: "default" as const
    },
    {
      title: "Discover Recipes",
      description: "Browse and search through shared recipes",
      icon: Search,
      action: "Explore Recipes",
      variant: "default" as const
    },
    {
      title: "Saved Recipes",
      description: "Access your bookmarked favorite recipes",
      icon: BookOpen,
      action: "View Saved",
      variant: "default" as const
    },
    {
      title: "Profile",
      description: "Manage your account and preferences",
      icon: User,
      action: "Edit Profile",
      variant: "secondary" as const
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <Sparkles className="h-12 w-12 text-primary" />
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title} className="group hover:shadow-lg transition-shadow">
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
                  onClick={() => {
                    if (feature.title === 'Upload Recipes') {
                      router.push('/upload');
                    } else if (feature.title === 'AI Recipe Generator') {
                      router.push('/ai-generator');
                    } else if (feature.title === 'Meal Planner') {
                      router.push('/meal-planner');
                    } else if (feature.title === 'Discover Recipes') {
                      router.push('/recipes');
                    } else if (feature.title === 'Saved Recipes') {
                      router.push('/saved');
                    } else if (feature.title === 'Profile') {
                      router.push('/profile');
                    }
                  }}
                >
                  {feature.action}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-16 text-center">
        <div className="bg-muted/50 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Get Started</h2>
          <p className="text-muted-foreground mb-6">
            Ready to explore delicious recipes and plan your meals?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Try AI Generator
            </Button>
            <Button variant="outline" size="lg" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Browse Recipes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
