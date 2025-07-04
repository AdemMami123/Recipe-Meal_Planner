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

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const ingredients = formData.get('ingredients') as string;
    const instructions = formData.get('instructions') as string;
    const prepTime = parseInt(formData.get('prepTime') as string);
    const cookTime = parseInt(formData.get('cookTime') as string);
    const servings = parseInt(formData.get('servings') as string);
    const imageUrl = formData.get('imageUrl') as string; // Image will be uploaded client-side first

    // Validate required fields
    if (!title || !description || !ingredients || !instructions || !prepTime || !cookTime || !servings) {
      return NextResponse.json({
        success: false,
        error: 'All fields are required'
      }, { status: 400 });
    }

    // Create recipe document
    const recipeData = {
      title,
      description,
      ingredients: ingredients.split('\n').filter(ingredient => ingredient.trim()),
      instructions: instructions.split('\n').filter(instruction => instruction.trim()),
      prepTime,
      cookTime,
      servings,
      imageUrl: imageUrl || null,
      authorId: user.id,
      authorName: user.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likes: 0,
      bookmarks: 0,
      tags: []
    };

    const docRef = await db.collection('recipes').add(recipeData);

    return NextResponse.json({
      success: true,
      recipeId: docRef.id,
      message: 'Recipe uploaded successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error uploading recipe:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to upload recipe'
    }, { status: 500 });
  }
}
