import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/actions/auth.action';
import { db } from '@/firebase/admin';

export async function POST(
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

    const recipeId = params.id;

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
    const currentBookmarks = recipeDoc.data()?.bookmarks || 0;
    await db.collection('recipes').doc(recipeId).update({
      bookmarks: currentBookmarks + 1
    });

    return NextResponse.json({
      success: true,
      bookmarkId: docRef.id,
      message: 'Recipe bookmarked successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error bookmarking recipe:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to bookmark recipe'
    }, { status: 500 });
  }
}
