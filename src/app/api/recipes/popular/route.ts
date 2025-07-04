import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    // Get popular recipes (ordered by likes/bookmarks)
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
    console.error('Error fetching popular recipes:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch popular recipes'
    }, { status: 500 });
  }
}