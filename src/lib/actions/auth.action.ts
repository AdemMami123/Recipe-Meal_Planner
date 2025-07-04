"use server";

import { db, auth } from "@/firebase/admin"
import { cookies } from "next/headers";
import { SignUpParams, SignInParams } from "@/types";

export async function signUp(params: SignUpParams) {
    try {
        const { name, email, password } = params;
        
        // Create user in Firebase Auth
        const userRecord = await auth.createUser({
            email,
            password,
            displayName: name,
        });

        // Save user data to Firestore
        await db.collection("users").doc(userRecord.uid).set({
            id: userRecord.uid,
            name,
            email,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        return {
            success: true,
            user: {
                id: userRecord.uid,
                name,
                email,
            }
        };
    } catch (error) {
        console.error("Sign up error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}

export async function saveUserData(uid: string, name: string, email: string) {
    try {
        // Save user data to Firestore
        await db.collection("users").doc(uid).set({
            id: uid,
            name,
            email,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        return {
            success: true,
            user: {
                id: uid,
                name,
                email,
            }
        };
    } catch (error) {
        console.error("Save user data error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}

export async function setSessionCookie(idToken: string) {
    try {
        const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
        const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
        
        const cookieStore = await cookies();
        cookieStore.set("session", sessionCookie, {
            maxAge: expiresIn,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        return { success: true };
    } catch (error) {
        console.error("Session cookie error:", error);
        return { success: false, error: "Failed to create session" };
    }
}

export async function signIn(params: SignInParams) {
    try {
        const { email, password } = params;
        
        // You'll need to handle sign-in on the client side with Firebase Auth
        // This is just for reference - actual sign-in happens client-side
        return { success: true };
    } catch (error) {
        console.error("Sign in error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}

export async function getCurrentUser() {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get("session");
        
        if (!sessionCookie?.value) {
            return null;
        }

        const decodedClaims = await auth.verifySessionCookie(sessionCookie.value, true);
        
        // Get user data from Firestore
        const userDoc = await db.collection("users").doc(decodedClaims.uid).get();
        
        if (!userDoc.exists) {
            return null;
        }

        const userData = userDoc.data();
        
        return {
            id: decodedClaims.uid,
            name: userData?.name || '',
            email: userData?.email || decodedClaims.email || '',
            createdAt: userData?.createdAt || '',
            updatedAt: userData?.updatedAt || ''
        };
    } catch (error) {
        console.error("Get current user error:", error);
        return null;
    }
}

export async function isAuthenticated() {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get("session");
        
        if (!sessionCookie?.value) {
            return false;
        }

        await auth.verifySessionCookie(sessionCookie.value, true);
        return true;
    } catch (error) {
        return false;
    }
}

export async function logout() {
    try {
        const cookieStore = await cookies();
        cookieStore.delete("session");
        return { success: true };
    } catch (error) {
        console.error("Logout error:", error);
        return { success: false };
    }
}
