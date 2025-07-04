import { getCurrentUser } from '@/lib/actions/auth.action';
import { db } from '@/firebase/admin';

export async function GET(request: Request) {
    try {
        const user = await getCurrentUser();
        
        if (!user) {
            return Response.json({
                success: false,
                error: 'Not authenticated'
            }, { status: 401 });
        }

        // Get user profile from database
        const userDoc = await db.collection("users").doc(user.id).get();
        
        if (!userDoc.exists) {
            return Response.json({
                success: false,
                error: 'User profile not found'
            }, { status: 404 });
        }

        const userData = userDoc.data();
        
        return Response.json({
            success: true,
            profile: {
                id: user.id,
                name: userData?.name || user.name || 'Unknown User',
                email: userData?.email || user.email || '',
                createdAt: userData?.createdAt || new Date().toISOString(),
                recipesCount: 0,
                likesCount: 0,
                bookmarksCount: 0,
                totalRecipeViews: 0
            }
        }, { status: 200 });

    } catch (error) {
        console.error('Error fetching profile:', error);
        return Response.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const user = await getCurrentUser();
        
        if (!user) {
            return Response.json({
                success: false,
                error: 'Not authenticated'
            }, { status: 401 });
        }

        const { name, email } = await request.json();

        if (!name || !email) {
            return Response.json({
                success: false,
                error: 'Name and email are required'
            }, { status: 400 });
        }

        // Update user in database
        await db.collection("users").doc(user.id).update({
            name,
            email,
            updatedAt: new Date().toISOString()
        });

        return Response.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user.id,
                name,
                email
            }
        }, { status: 200 });

    } catch (error) {
        console.error('Error updating profile:', error);
        return Response.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
