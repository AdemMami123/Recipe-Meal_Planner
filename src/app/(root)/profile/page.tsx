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
  X
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

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
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
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="h-screen flex items-center justify-center p-4">
        <Alert variant="destructive">
          <AlertDescription>Unable to load profile</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="container mx-auto px-4 py-2 flex-1 flex flex-col overflow-hidden">
        {/* Header - Compact */}
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
              <User className="h-4 w-4 text-primary" />
              My Profile
            </h1>
            <p className="text-muted-foreground text-xs">Manage account & view stats</p>
          </div>
        </div>

        {/* Alerts - Compact */}
        {error && (
          <Alert variant="destructive" className="mb-2 flex-shrink-0 py-1">
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-2 flex-shrink-0 py-1">
            <AlertDescription className="text-xs">{success}</AlertDescription>
          </Alert>
        )}

        {/* Main Content - Fit to viewport */}
        <div className="flex-1 overflow-hidden">
          <div className="grid lg:grid-cols-3 gap-2 h-full">
            {/* Profile Information */}
            <div className="lg:col-span-2 overflow-y-auto">
              <Card className="h-fit">
                <CardHeader className="flex flex-row items-center justify-between py-2">
                  <div>
                    <CardTitle className="text-sm">Profile Information</CardTitle>
                    <CardDescription className="text-xs">
                      Your personal details
                    </CardDescription>
                  </div>
                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="h-6 text-xs px-2"
                    >
                      <Edit className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-2 pb-3">
                  <div className="space-y-1">
                    <Label htmlFor="name" className="text-xs">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        className="h-7 text-xs"
                      />
                    ) : (
                      <p className="p-1.5 bg-muted rounded text-xs">{profile.name}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="email" className="text-xs">Email Address</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="h-7 text-xs"
                      />
                    ) : (
                      <p className="p-1.5 bg-muted rounded flex items-center gap-1 text-xs">
                        <Mail className="h-3 w-3" />
                        {profile.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Member Since</Label>
                    <p className="p-1.5 bg-muted rounded flex items-center gap-1 text-xs">
                      <Calendar className="h-3 w-3" />
                      {formatDate(profile.createdAt)}
                    </p>
                  </div>

                  {isEditing && (
                    <div className="flex gap-1 pt-1">
                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        size="sm"
                        className="h-6 text-xs px-2"
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-2 w-2 border-b-2 border-white mr-1"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-1 h-3 w-3" />
                            Save
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        size="sm"
                        className="h-6 text-xs px-2"
                      >
                        <X className="mr-1 h-3 w-3" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Statistics & Actions */}
            <div className="space-y-2 overflow-y-auto">
              <Card>
                <CardHeader className="py-2">
                  <CardTitle className="text-sm">Recipe Statistics</CardTitle>
                  <CardDescription className="text-xs">
                    Your activity summary
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-1.5 pb-3">
                  <div className="flex items-center justify-between p-1.5 bg-muted rounded">
                    <div className="flex items-center gap-1">
                      <ChefHat className="h-3 w-3 text-primary" />
                      <span className="text-xs">Uploaded</span>
                    </div>
                    <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
                      {stats?.recipesUploaded || 0}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-1.5 bg-muted rounded">
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3 text-red-500" />
                      <span className="text-xs">Likes</span>
                    </div>
                    <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
                      {stats?.totalLikes || 0}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-1.5 bg-muted rounded">
                    <div className="flex items-center gap-1">
                      <Bookmark className="h-3 w-3 text-blue-500" />
                      <span className="text-xs">Bookmarks</span>
                    </div>
                    <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
                      {stats?.totalBookmarks || 0}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-1.5 bg-muted rounded">
                    <div className="flex items-center gap-1">
                      <ChefHat className="h-3 w-3 text-purple-500" />
                      <span className="text-xs">AI Recipes</span>
                    </div>
                    <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
                      {stats?.aiRecipesGenerated || 0}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="py-2">
                  <CardTitle className="text-sm">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 pb-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start h-6 text-xs px-2"
                    onClick={() => router.push('/upload')}
                  >
                    <ChefHat className="mr-1 h-3 w-3" />
                    Upload Recipe
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start h-6 text-xs px-2"
                    onClick={() => router.push('/ai-generator')}
                  >
                    <ChefHat className="mr-1 h-3 w-3" />
                    Generate AI Recipe
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start h-6 text-xs px-2"
                    onClick={() => router.push('/saved')}
                  >
                    <Bookmark className="mr-1 h-3 w-3" />
                    View Saved Recipes
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
