import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/actions/auth.action';
import { db } from '@/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated'
      }, { status: 401 });
    }

    const recipeData = await request.json();

    if (!recipeData.title || !recipeData.ingredients || !recipeData.instructions) {
      return NextResponse.json({
        success: false,
        error: 'Recipe data is incomplete'
      }, { status: 400 });
    }

    // Create recipe document
    const recipe = {
      title: recipeData.title,
      description: recipeData.description || '',
      ingredients: recipeData.ingredients,
      instructions: recipeData.instructions,
      prepTime: recipeData.prepTime || 0,
      cookTime: recipeData.cookTime || 0,
      servings: recipeData.servings || 1,
      imageUrl: null,
      authorId: user.id,
      authorName: user.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likes: 0,
      bookmarks: 0,
      tags: recipeData.tags || [],
      difficulty: recipeData.difficulty || 'medium',
      nutrition: recipeData.nutrition || null,
      isAIGenerated: true
    };

    const docRef = await db.collection('recipes').add(recipe);

    return NextResponse.json({
      success: true,
      recipeId: docRef.id,
      message: 'Recipe saved successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error saving recipe:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to save recipe'
    }, { status: 500 });
  }
}
