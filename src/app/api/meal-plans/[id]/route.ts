import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/actions/auth.action';
import { db } from '@/firebase/admin';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated'
      }, { status: 401 });
    }

    const mealPlanId = params.id;
    
    // Check if meal plan exists and belongs to user
    const mealPlanDoc = await db.collection('mealPlans').doc(mealPlanId).get();
    
    if (!mealPlanDoc.exists) {
      return NextResponse.json({
        success: false,
        error: 'Meal plan not found'
      }, { status: 404 });
    }

    const mealPlanData = mealPlanDoc.data();
    
    if (mealPlanData?.userId !== user.id) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 403 });
    }

    await db.collection('mealPlans').doc(mealPlanId).delete();

    return NextResponse.json({
      success: true,
      message: 'Meal plan deleted successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Error deleting meal plan:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete meal plan'
    }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated'
      }, { status: 401 });
    }

    const mealPlanId = params.id;

    // Get meal plan
    const mealPlanDoc = await db.collection('mealPlans').doc(mealPlanId).get();
    
    if (!mealPlanDoc.exists) {
      return NextResponse.json({
        success: false,
        error: 'Meal plan not found'
      }, { status: 404 });
    }

    const mealPlanData = mealPlanDoc.data();
    
    if (mealPlanData?.userId !== user.id) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 403 });
    }

    // Get recipe details
    const recipeDoc = await db.collection('recipes').doc(mealPlanData.recipeId).get();
    const recipe = recipeDoc.exists ? { id: recipeDoc.id, ...recipeDoc.data() } : null;

    return NextResponse.json({
      success: true,
      mealPlan: {
        id: mealPlanDoc.id,
        ...mealPlanData,
        recipe
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching meal plan:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch meal plan'
    }, { status: 500 });
  }
}
