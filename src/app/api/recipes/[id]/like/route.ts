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

    // Check if already liked
    const existingLike = await db.collection('likes')
      .where('userId', '==', user.id)
      .where('recipeId', '==', recipeId)
      .limit(1)
      .get();

    if (!existingLike.empty) {
      return NextResponse.json({
        success: false,
        error: 'Recipe already liked'
      }, { status: 400 });
    }

    const likeData = {
      userId: user.id,
      recipeId,
      createdAt: new Date().toISOString()
    };

    await db.collection('likes').add(likeData);

    // Update recipe like count
    const currentLikes = recipeDoc.data()?.likes || 0;
    await db.collection('recipes').doc(recipeId).update({
      likes: currentLikes + 1
    });

    return NextResponse.json({
      success: true,
      message: 'Recipe liked successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error liking recipe:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to like recipe'
    }, { status: 500 });
  }
}
