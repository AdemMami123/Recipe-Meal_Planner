import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/actions/auth.action';
import { generateRecipe } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated'
      }, { status: 401 });
    }

    const { ingredients, cuisine, dietaryRestrictions, cookingTime, difficulty } = await request.json();

    if (!ingredients) {
      return NextResponse.json({
        success: false,
        error: 'Ingredients are required'
      }, { status: 400 });
    }

    console.log('Generating recipe with params:', {
      ingredients,
      cuisine,
      dietaryRestrictions,
      cookingTime,
      difficulty
    });

    const recipe = await generateRecipe({
      ingredients,
      cuisine: cuisine || 'any',
      dietaryRestrictions: dietaryRestrictions || 'none',
      cookingTime: cookingTime || '30-60 minutes',
      difficulty: difficulty || 'medium'
    });

    console.log('Generated recipe:', recipe);

    return NextResponse.json({
      success: true,
      recipe
    }, { status: 200 });

  } catch (error) {
    console.error('Error generating recipe:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      return NextResponse.json({
        success: false,
        error: `Failed to generate recipe: ${error.message}`
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to generate recipe'
    }, { status: 500 });
  }
}
