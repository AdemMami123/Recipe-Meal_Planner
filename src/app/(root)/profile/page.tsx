'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Calendar,
  ChefHat,
  Heart,
  Bookmark,
  Edit,
  Save,
  X,
  Sparkles,
  Trophy,
  TrendingUp,
  Upload
} from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  recipesCount: number;
  likesCount: number;
  bookmarksCount: number;
  totalRecipeViews: number;
}

interface UserStats {
  recipesUploaded: number;
  totalLikes: number;
  totalBookmarks: number;
  aiRecipesGenerated: number;
}

interface UserRecipe {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  likes: number;
  bookmarks: number;
  createdAt: string;
  isAIGenerated?: boolean;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [userRecipes, setUserRecipes] = useState<UserRecipe[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
    fetchStats();
    fetchUserRecipes();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/auth/profile');
      const data = await response.json();
      
      if (data.success) {
        setProfile(data.profile);
        setName(data.profile.name);
        setEmail(data.profile.email);
      } else {
        setError(data.error || 'Failed to fetch profile');
      }
    } catch (error) {
      setError('An error occurred while fetching profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/auth/profile/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUserRecipes = async () => {
    try {
      const response = await fetch('/api/recipes/list?userOnly=true&limit=6');
      const data = await response.json();
      
      if (data.success) {
        setUserRecipes(data.recipes || []);
      }
    } catch (error) {
      console.error('Error fetching user recipes:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      });

      const data = await response.json();

      if (data.success) {
        setProfile(prev => prev ? { ...prev, name, email } : null);
        setIsEditing(false);
        setSuccess('Profile updated successfully');
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (error) {
      setError('An error occurred while updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setName(profile.name);
      setEmail(profile.email);
    }
    setIsEditing(false);
    setError('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/3">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>Unable to load profile</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/3">
      <div className="container mx-auto px-4 py-3 flex-1 flex flex-col overflow-hidden">
        {/* Header - Enhanced */}
        <div className="flex items-center gap-3 mb-4 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8 hover:bg-primary/10 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-emerald-400/20 rounded-full blur-md"></div>
                <div className="relative p-1.5 bg-gradient-to-r from-primary/70 to-emerald-400/70 rounded-full">
                  <User className="h-4 w-4 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
                  My Profile
                </h1>
                <p className="text-xs text-muted-foreground">Welcome back, {profile.name}!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts - Enhanced */}
        {error && (
          <Alert variant="destructive" className="mb-3 flex-shrink-0 border-red-200 bg-red-50 dark:bg-red-950/20">
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-3 flex-shrink-0 border-green-200 bg-green-50 dark:bg-green-950/20">
            <AlertDescription className="text-xs text-green-800 dark:text-green-300">{success}</AlertDescription>
          </Alert>
        )}

        {/* Main Content - Enhanced Layout */}
        <div className="flex-1 overflow-hidden">
          <div className="grid lg:grid-cols-3 gap-3 h-full">
            {/* Profile Information & User Recipes - Enhanced */}
            <div className="lg:col-span-2 overflow-y-auto space-y-3">
              <Card className="bg-gradient-to-br from-background to-muted/5 border-primary/20 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between py-3">
                  <div>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-primary/70 to-emerald-400/70 rounded-full flex items-center justify-center">
                        <User className="h-3 w-3 text-white" />
                      </div>
                      Profile Information
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      Your personal details and account settings
                    </CardDescription>
                  </div>
                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="h-7 text-xs px-3 border-primary/20 hover:bg-primary/5 dark:hover:bg-primary/10"
                    >
                      <Edit className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-3 pb-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-medium text-muted-foreground">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        className="h-8 text-sm bg-background/50 border-primary/20 focus:border-primary/40"
                      />
                    ) : (
                      <div className="p-2.5 bg-gradient-to-r from-primary/5 to-emerald-400/5 rounded-lg border border-primary/10">
                        <p className="text-sm font-medium">{profile.name}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">Email Address</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="h-8 text-sm bg-background/50 border-primary/20 focus:border-primary/40"
                      />
                    ) : (
                      <div className="p-2.5 bg-gradient-to-r from-primary/5 to-emerald-400/5 rounded-lg border border-primary/10">
                        <p className="text-sm font-medium flex items-center gap-2">
                          <Mail className="h-4 w-4 text-primary/70" />
                          {profile.email}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Member Since</Label>
                    <div className="p-2.5 bg-gradient-to-r from-primary/5 to-emerald-400/5 rounded-lg border border-primary/10">
                      <p className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary/70" />
                        {formatDate(profile.createdAt)}
                      </p>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        size="sm"
                        className="h-8 text-xs px-4 bg-gradient-to-r from-primary/90 to-emerald-500/90 hover:from-primary hover:to-emerald-500 text-white"
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-2 border-white/70 border-t-transparent mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-1 h-3 w-3" />
                            Save Changes
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        size="sm"
                        className="h-8 text-xs px-4 border-primary/20 hover:bg-primary/5 dark:hover:bg-primary/10"
                      >
                        <X className="mr-1 h-3 w-3" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* My Recipes Section */}
              {userRecipes.length > 0 && (
                <Card className="bg-gradient-to-br from-background to-muted/5 border-primary/20 shadow-md">
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-primary/70 to-emerald-400/70 rounded-full flex items-center justify-center">
                            <ChefHat className="h-3 w-3 text-white" />
                          </div>
                          My Recipes
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">
                          Your latest recipe contributions
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/recipes?filter=mine')}
                        className="h-7 text-xs px-3 border-primary/20 hover:bg-primary/5 dark:hover:bg-primary/10"
                      >
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {userRecipes.slice(0, 4).map((recipe) => (
                        <Card 
                          key={recipe.id} 
                          className="overflow-hidden group hover:shadow-md transition-all duration-300 cursor-pointer border-primary/10 bg-gradient-to-br from-background to-primary/5 hover:scale-[1.02]"
                          onClick={() => router.push(`/recipes/${recipe.id}`)}
                        >
                          {recipe.imageUrl && (
                            <div className="relative h-24 overflow-hidden">
                              <img 
                                src={recipe.imageUrl} 
                                alt={recipe.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                              <div className="absolute top-1 right-1">
                                {recipe.isAIGenerated && (
                                  <Badge className="bg-gradient-to-r from-purple-500/80 to-purple-400/80 text-white text-xs px-1.5 py-0.5">
                                    <Sparkles className="h-2 w-2 mr-1" />
                                    AI
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                          <CardContent className="p-2.5">
                            <h3 className="font-medium text-sm line-clamp-1 mb-1">
                              {recipe.title}
                            </h3>
                            <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                              {recipe.description}
                            </p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <Heart className="h-3 w-3 text-red-500" />
                                  <span>{recipe.likes}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Bookmark className="h-3 w-3 text-blue-500" />
                                  <span>{recipe.bookmarks}</span>
                                </div>
                              </div>
                              <span>{new Date(recipe.createdAt).toLocaleDateString()}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Statistics & Actions - Enhanced */}
            <div className="space-y-3 overflow-y-auto">
              {/* Achievement Badge */}
              <Card className="bg-gradient-to-br from-primary/10 to-emerald-400/10 border-primary/30 shadow-md">
                <CardContent className="p-3 text-center">
                  <div className="relative mb-2">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-emerald-500/30 rounded-full blur-lg opacity-50 animate-pulse"></div>
                    <div className="relative w-12 h-12 bg-gradient-to-r from-primary/80 to-emerald-500/80 rounded-full flex items-center justify-center mx-auto">
                      <Trophy className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-primary">Recipe Master</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats?.recipesUploaded || 0} recipes shared with the community
                  </p>
                </CardContent>
              </Card>

              {/* Statistics */}
              <Card className="bg-gradient-to-br from-background to-muted/5 border-primary/20 shadow-md">
                <CardHeader className="py-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-primary/70 to-emerald-400/70 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-3 w-3 text-white" />
                    </div>
                    Your Stats
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Your culinary journey at a glance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2.5 pb-4">
                  <div className="group flex items-center justify-between p-3 bg-gradient-to-r from-primary/5 to-emerald-400/5 rounded-lg border border-primary/10 hover:border-primary/20 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-primary/70 to-emerald-400/70 rounded-full flex items-center justify-center">
                        <ChefHat className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <span className="text-sm font-medium">Recipes Uploaded</span>
                        <p className="text-xs text-muted-foreground">Shared with community</p>
                      </div>
                    </div>
                    <Badge className="bg-gradient-to-r from-primary/80 to-emerald-500/80 text-white text-sm px-3 py-1">
                      {stats?.recipesUploaded || 0}
                    </Badge>
                  </div>

                  <div className="group flex items-center justify-between p-3 bg-gradient-to-r from-red-500/5 to-red-400/5 rounded-lg border border-red-500/10 hover:border-red-500/20 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-red-500/70 to-red-400/70 rounded-full flex items-center justify-center">
                        <Heart className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <span className="text-sm font-medium">Total Likes</span>
                        <p className="text-xs text-muted-foreground">On your recipes</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 text-sm px-3 py-1">
                      {stats?.totalLikes || 0}
                    </Badge>
                  </div>

                  <div className="group flex items-center justify-between p-3 bg-gradient-to-r from-blue-500/5 to-blue-400/5 rounded-lg border border-blue-500/10 hover:border-blue-500/20 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500/70 to-blue-400/70 rounded-full flex items-center justify-center">
                        <Bookmark className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <span className="text-sm font-medium">Recipes Saved</span>
                        <p className="text-xs text-muted-foreground">In your collection</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 text-sm px-3 py-1">
                      {stats?.totalBookmarks || 0}
                    </Badge>
                  </div>

                  <div className="group flex items-center justify-between p-3 bg-gradient-to-r from-purple-500/5 to-purple-400/5 rounded-lg border border-purple-500/10 hover:border-purple-500/20 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500/70 to-purple-400/70 rounded-full flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <span className="text-sm font-medium">AI Recipes</span>
                        <p className="text-xs text-muted-foreground">Generated by AI</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300 text-sm px-3 py-1">
                      {stats?.aiRecipesGenerated || 0}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

             
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
