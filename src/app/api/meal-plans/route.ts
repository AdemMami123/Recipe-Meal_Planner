import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/actions/auth.action';
import { db } from '@/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      console.error('User not authenticated in meal plans GET');
      return NextResponse.json({
        success: false,
        error: 'Not authenticated'
      }, { status: 401 });
    }

    console.log('Fetching meal plans for user:', user.id);

    const url = new URL(request.url);
    const start = url.searchParams.get('start');
    const end = url.searchParams.get('end');

    console.log('Date range:', { start, end });

    if (!start || !end) {
      return NextResponse.json({
        success: false,
        error: 'Start and end dates are required'
      }, { status: 400 });
    }

    const mealPlansRef = db.collection('mealPlans');
    const query = mealPlansRef
      .where('userId', '==', user.id)
      .where('plannedFor', '>=', start)
      .where('plannedFor', '<=', end);

    console.log('Executing query for meal plans...');
    const snapshot = await query.get();
    console.log('Found meal plans:', snapshot.size);
    
    const mealPlans = [];
    for (const doc of snapshot.docs) {
      const data = doc.data();
      console.log('Processing meal plan:', doc.id, data);
      
      // Get recipe details
      const recipeDoc = await db.collection('recipes').doc(data.recipeId).get();
      const recipe = recipeDoc.exists ? { id: recipeDoc.id, ...recipeDoc.data() } : null;
      
      if (recipe) {
        mealPlans.push({
          id: doc.id,
          ...data,
          recipe
        });
      } else {
        console.warn('Recipe not found for meal plan:', doc.id, 'recipeId:', data.recipeId);
      }
    }

    console.log('Returning meal plans:', mealPlans.length);

    return NextResponse.json({
      success: true,
      mealPlans
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching meal plans:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch meal plans'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated'
      }, { status: 401 });
    }

    const { day, mealType, recipeId, plannedFor } = await request.json();

    if (!day || !mealType || !recipeId || !plannedFor) {
      return NextResponse.json({
        success: false,
        error: 'All fields are required'
      }, { status: 400 });
    }

    // Check if recipe exists
    const recipeDoc = await db.collection('recipes').doc(recipeId).get();
    if (!recipeDoc.exists) {
      return NextResponse.json({
        success: false,
        error: 'Recipe not found'
      }, { status: 404 });
    }

    const mealPlanData = {
      userId: user.id,
      day,
      mealType,
      recipeId,
      plannedFor,
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('mealPlans').add(mealPlanData);

    return NextResponse.json({
      success: true,
      mealPlanId: docRef.id,
      message: 'Meal plan created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating meal plan:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create meal plan'
    }, { status: 500 });
  }
}
