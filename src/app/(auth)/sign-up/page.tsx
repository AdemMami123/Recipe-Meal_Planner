'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { saveUserData, setSessionCookie } from '@/lib/actions/auth.action';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Chrome, ChefHat } from 'lucide-react';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Create user with client-side Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's display name
      await updateProfile(userCredential.user, { displayName: name });
      
      // Create user document in Firestore and set session cookie
      const idToken = await userCredential.user.getIdToken();
      
      // Set session cookie first
      const sessionResult = await setSessionCookie(idToken);
      if (!sessionResult.success) {
        setError('Failed to create session');
        return;
      }
      
      // Save user data to Firestore
      const result = await saveUserData(userCredential.user.uid, name, email);
      
      if (result.success) {
        router.push('/');
      } else {
        setError(result.error || 'Failed to save user data');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      
      // Set session cookie first
      const sessionResult = await setSessionCookie(idToken);
      if (!sessionResult.success) {
        setError('Failed to create session');
        return;
      }
      
      // Save user data to Firestore
      const userDataResult = await saveUserData(
        result.user.uid, 
        result.user.displayName || 'Google User', 
        result.user.email!
      );
      
      if (userDataResult.success) {
        router.push('/');
      } else {
        setError('Failed to save user data');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during Google sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4">
        <div className="flex flex-col space-y-2 text-center">
          <div className="flex justify-center mb-2">
            <ChefHat className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground">
            Enter your details to create your Recipe Planner account
          </p>
        </div>

        <Card>
          <CardHeader className="space-y-1 pb-3">
            <CardTitle className="text-lg text-center">Sign Up</CardTitle>
            <CardDescription className="text-center text-sm">
              Create your account to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleEmailSignUp} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="name" className="text-sm">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Enter your full name"
                  disabled={loading}
                  className="h-9"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="email" className="text-sm">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  disabled={loading}
                  className="h-9"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="password" className="text-sm">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  disabled={loading}
                  className="h-9"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="confirmPassword" className="text-sm">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm your password"
                  disabled={loading}
                  className="h-9"
                />
              </div>

              <Button type="submit" className="w-full h-9" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full h-9"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <Chrome className="mr-2 h-4 w-4" />
              Sign up with Google
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/sign-in" className="underline underline-offset-4 hover:text-primary">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
