import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/actions/auth.action';
import { db } from '@/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated'
      }, { status: 401 });
    }

    const bookmarksRef = db.collection('bookmarks');
    const query = bookmarksRef.where('userId', '==', user.id).orderBy('createdAt', 'desc');
    
    const snapshot = await query.get();
    
    const bookmarks = [];
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      // Get recipe details
      const recipeDoc = await db.collection('recipes').doc(data.recipeId).get();
      const recipe = recipeDoc.exists ? { id: recipeDoc.id, ...recipeDoc.data() } : null;
      
      if (recipe) {
        bookmarks.push({
          id: doc.id,
          recipe,
          bookmarkedAt: data.createdAt
        });
      }
    }

    return NextResponse.json({
      success: true,
      bookmarks
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch bookmarks'
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

    const { recipeId } = await request.json();

    if (!recipeId) {
      return NextResponse.json({
        success: false,
        error: 'Recipe ID is required'
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

    // Check if already bookmarked
    const existingBookmark = await db.collection('bookmarks')
      .where('userId', '==', user.id)
      .where('recipeId', '==', recipeId)
      .limit(1)
      .get();

    if (!existingBookmark.empty) {
      return NextResponse.json({
        success: false,
        error: 'Recipe already bookmarked'
      }, { status: 400 });
    }

    const bookmarkData = {
      userId: user.id,
      recipeId,
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('bookmarks').add(bookmarkData);

    // Update recipe bookmark count
    await db.collection('recipes').doc(recipeId).update({
      bookmarks: (recipeDoc.data()?.bookmarks || 0) + 1
    });

    return NextResponse.json({
      success: true,
      bookmarkId: docRef.id,
      message: 'Recipe bookmarked successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating bookmark:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to bookmark recipe'
    }, { status: 500 });
  }
}
