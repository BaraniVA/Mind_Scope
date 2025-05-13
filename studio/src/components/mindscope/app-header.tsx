
// src/components/mindscope/app-header.tsx
"use client";

import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/auth-user-context';
import { signOut } from '@/components/auth/auth-form';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from 'next/navigation';

export function AppHeader() {
  const { authUser, isLoading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <header className="py-5 px-4 sm:px-6 lg:px-8 bg-card shadow-xl rounded-xl"> {/* Adjusted padding and rounding */}
      <div className="flex flex-col sm:flex-row items-center justify-between">
        <div className="flex items-center space-x-3 mb-4 sm:mb-0">
          {/* GenZ style logo placeholder - a simple, clean geometric shape */}
          <div className="p-2 bg-primary rounded-lg shadow-md">
             <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary-foreground">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4ZM12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6Z" fill="currentColor" data-ai-hint="geometric logo"/>
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">Mind<span className="text-primary">Scope</span></h1>
        </div>
        <div className="flex items-center space-x-3">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading user...</div>
          ) : authUser ? (
            <>
              <Avatar className="h-9 w-9">
                <AvatarImage src={authUser.photoURL || undefined} alt={authUser.displayName || authUser.email || 'User'} data-ai-hint="user avatar" />
                <AvatarFallback>{authUser.displayName?.charAt(0).toUpperCase() || authUser.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground hidden md:inline">
                {authUser.displayName || authUser.email}
              </span>
              <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sign out" className="rounded-full hover:bg-muted">
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
             <Button variant="outline" size="sm" onClick={() => router.push('/login')}>
                Sign In
              </Button>
          )}
        </div>
      </div>
      <p className="text-sm text-muted-foreground text-center sm:text-left mt-2 sm:mt-1">
          Visual Task Scoper for Indie Devs
      </p>
    </header>
  );
}
