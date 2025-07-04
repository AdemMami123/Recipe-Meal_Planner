import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    
    const recipesRef = db.collection('recipes');
    const snapshot = await recipesRef
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .offset(offset)
      .get();

    const recipes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      success: true,
      recipes,
      total: snapshot.size
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch recipes'
    }, { status: 500 });
  }
}
