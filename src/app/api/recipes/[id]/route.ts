import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/actions/auth.action';
import { db } from '@/firebase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Recipe ID is required'
      }, { status: 400 });
    }

    // Get recipe from database
    const recipeDoc = await db.collection('recipes').doc(id).get();
    
    if (!recipeDoc.exists) {
      return NextResponse.json({
        success: false,
        error: 'Recipe not found'
      }, { status: 404 });
    }

    const recipeData = recipeDoc.data();
    
    // Get author information
    let authorName = 'Unknown User';
    if (recipeData?.authorId) {
      try {
        const authorDoc = await db.collection('users').doc(recipeData.authorId).get();
        if (authorDoc.exists) {
          authorName = authorDoc.data()?.name || 'Unknown User';
        }
      } catch (error) {
        console.error('Error fetching author:', error);
      }
    }

    const recipe = {
      id: recipeDoc.id,
      ...recipeData,
      authorName,
      likes: recipeData?.likes || 0,
      bookmarks: recipeData?.bookmarks || 0,
      tags: recipeData?.tags || [],
      createdAt: recipeData?.createdAt || new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      recipe
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching recipe:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(
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

    const { id } = params;
    const body = await request.json();
    
    // Check if user owns this recipe
    const recipeDoc = await db.collection('recipes').doc(id).get();
    
    if (!recipeDoc.exists) {
      return NextResponse.json({
        success: false,
        error: 'Recipe not found'
      }, { status: 404 });
    }

    const recipeData = recipeDoc.data();
    
    if (recipeData?.authorId !== user.id) {
      return NextResponse.json({
        success: false,
        error: 'Not authorized to edit this recipe'
      }, { status: 403 });
    }

    // Update recipe
    await db.collection('recipes').doc(id).update({
      ...body,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Recipe updated successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Error updating recipe:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

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

    const { id } = params;
    
    // Check if user owns this recipe
    const recipeDoc = await db.collection('recipes').doc(id).get();
    
    if (!recipeDoc.exists) {
      return NextResponse.json({
        success: false,
        error: 'Recipe not found'
      }, { status: 404 });
    }

    const recipeData = recipeDoc.data();
    
    if (recipeData?.authorId !== user.id) {
      return NextResponse.json({
        success: false,
        error: 'Not authorized to delete this recipe'
      }, { status: 403 });
    }

    // Delete recipe
    await db.collection('recipes').doc(id).delete();

    return NextResponse.json({
      success: true,
      message: 'Recipe deleted successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Error deleting recipe:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
