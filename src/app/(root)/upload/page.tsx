'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Camera, Loader2, ArrowLeft } from 'lucide-react';

export default function UploadRecipePage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let imageUrl = null;

      // Upload image to Cloudinary if provided
      if (image) {
        try {
          const uploadFormData = new FormData();
          uploadFormData.append('file', image);
          uploadFormData.append('folder', 'recipes');

          const uploadResponse = await fetch('/api/upload/image', {
            method: 'POST',
            body: uploadFormData,
          });

          const uploadData = await uploadResponse.json();
          
          if (uploadData.success) {
            imageUrl = uploadData.imageUrl;
          } else {
            throw new Error(uploadData.error || 'Failed to upload image');
          }
        } catch (error) {
          console.error('Error uploading image:', error);
          setError('Failed to upload image');
          setLoading(false);
          return;
        }
      }

      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('ingredients', ingredients);
      formData.append('instructions', instructions);
      formData.append('prepTime', prepTime);
      formData.append('cookTime', cookTime);
      formData.append('servings', servings);
      if (imageUrl) {
        formData.append('imageUrl', imageUrl);
      }

      const response = await fetch('/api/recipes/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Recipe uploaded successfully!');
        // Reset form
        setTitle('');
        setDescription('');
        setIngredients('');
        setInstructions('');
        setPrepTime('');
        setCookTime('');
        setServings('');
        setImage(null);
        setImagePreview(null);
        
        // Redirect to recipes page after 2 seconds
        setTimeout(() => {
          router.push('/recipes');
        }, 2000);
      } else {
        setError(data.error || 'Failed to upload recipe');
      }
    } catch (error) {
      setError('An error occurred while uploading the recipe');
    } finally {
      setLoading(false);
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
            <h1 className="text-lg font-bold">Upload Recipe</h1>
            <p className="text-muted-foreground text-xs">Share your delicious recipe with the community</p>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="max-w-2xl mx-auto h-full">
            <div className="h-full overflow-y-auto">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Recipe Details</CardTitle>
                  <CardDescription className="text-xs">
                    Fill in the details of your recipe. All fields are required.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
            {error && (
              <Alert variant="destructive" className="mb-2 py-1">
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="mb-2 py-1">
                <AlertDescription className="text-xs">{success}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="title" className="text-xs">Recipe Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter recipe title"
                  required
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="description" className="text-xs">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of your recipe"
                  rows={2}
                  required
                  className="text-xs resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="prepTime" className="text-xs">Prep (min)</Label>
                  <Input
                    id="prepTime"
                    type="number"
                    value={prepTime}
                    onChange={(e) => setPrepTime(e.target.value)}
                    placeholder="30"
                    required
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cookTime" className="text-xs">Cook (min)</Label>
                  <Input
                    id="cookTime"
                    type="number"
                    value={cookTime}
                    onChange={(e) => setCookTime(e.target.value)}
                    placeholder="45"
                    required
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="servings" className="text-xs">Servings</Label>
                  <Input
                    id="servings"
                    type="number"
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                    placeholder="4"
                    required
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="ingredients" className="text-xs">Ingredients</Label>
                <Textarea
                  id="ingredients"
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  placeholder="List each ingredient on a new line&#10;2 cups flour&#10;1 cup sugar&#10;3 eggs"
                  rows={4}
                  required
                  className="text-xs resize-none"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="instructions" className="text-xs">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Step-by-step instructions&#10;1. Preheat oven to 350°F&#10;2. Mix dry ingredients&#10;3. Add wet ingredients"
                  rows={5}
                  required
                  className="text-xs resize-none"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="image" className="text-xs">Recipe Image</Label>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="image"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer bg-muted/10 hover:bg-muted/20 transition-colors"
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center py-2">
                        <Camera className="w-6 h-6 mb-2 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground text-center">
                          <span className="font-semibold">Click to upload</span><br />
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                    )}
                    <input
                      id="image"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              </div>

              <Button type="submit" className="w-full h-8" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-3 w-3" />
                    Upload Recipe
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
        </div>
      </div>
    </div>
  );
}
