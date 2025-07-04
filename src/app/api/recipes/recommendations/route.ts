import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/actions/auth.action';
import { db } from '@/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    // Get recommended recipes - for now, just return popular ones
    // In a real app, this would use ML/AI to provide personalized recommendations
    const recipesRef = db.collection('recipes');
    const snapshot = await recipesRef
      .orderBy('likes', 'desc')
      .limit(limit)
      .get();

    const recipes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      success: true,
      recipes
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching recommended recipes:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch recommended recipes'
    }, { status: 500 });
  }
}