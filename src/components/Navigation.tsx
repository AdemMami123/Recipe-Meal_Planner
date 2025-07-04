'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { logout } from '@/lib/actions/auth.action';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { User, LogOut, ChefHat } from 'lucide-react';

export default function Navigation() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Sign out from Firebase Auth
      await signOut(auth);
      
      // Clear server session
      await logout();
      
      // Redirect to sign-in page
      router.push('/sign-in');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex">
          <a className="mr-6 flex items-center space-x-2" href="/">
            <ChefHat className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">
              Recipe Planner
            </span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search can be added here later */}
          </div>
          <nav className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/profile')}
            >
              <User className="h-4 w-4" />
              <span className="sr-only">Profile</span>
            </Button>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Logout</span>
            </Button>
          </nav>
        </div>
      </div>
    </nav>
  );
}
