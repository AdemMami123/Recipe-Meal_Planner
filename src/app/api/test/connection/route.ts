import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/actions/auth.action';
import { db } from '@/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    console.log('Test endpoint called');
    
    // Test database connection
    const testDoc = await db.collection('test').doc('connection').get();
    console.log('Database connection test:', testDoc.exists);
    
    // Test authentication
    const user = await getCurrentUser();
    console.log('Current user:', user ? user.id : 'Not authenticated');
    
    // Test meal plans collection
    const mealPlansSnapshot = await db.collection('mealPlans').limit(1).get();
    console.log('MealPlans collection accessible:', !mealPlansSnapshot.empty);
    
    return NextResponse.json({
      success: true,
      tests: {
        databaseConnection: true,
        userAuthenticated: !!user,
        mealPlansCollection: !mealPlansSnapshot.empty,
        user: user ? { id: user.id, name: user.name } : null
      }
    });
    
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
