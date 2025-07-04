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

    const bookmarkId = params.id;
    
    // Check if bookmark exists and belongs to user
    const bookmarkDoc = await db.collection('bookmarks').doc(bookmarkId).get();
    
    if (!bookmarkDoc.exists) {
      return NextResponse.json({
        success: false,
        error: 'Bookmark not found'
      }, { status: 404 });
    }

    const bookmarkData = bookmarkDoc.data();
    
    if (bookmarkData?.userId !== user.id) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 403 });
    }

    // Delete bookmark
    await db.collection('bookmarks').doc(bookmarkId).delete();

    // Update recipe bookmark count
    if (bookmarkData?.recipeId) {
      const recipeDoc = await db.collection('recipes').doc(bookmarkData.recipeId).get();
      if (recipeDoc.exists) {
        await db.collection('recipes').doc(bookmarkData.recipeId).update({
          bookmarks: Math.max((recipeDoc.data()?.bookmarks || 0) - 1, 0)
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Bookmark removed successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Error deleting bookmark:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to remove bookmark'
    }, { status: 500 });
  }
}
