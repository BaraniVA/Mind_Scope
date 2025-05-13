
// src/contexts/auth-user-context.tsx
"use client";

import type { User as FirebaseUser } from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import type { ReactNode } from 'react';

interface AuthUserContextType {
  authUser: FirebaseUser | null;
  isLoading: boolean;
}

const AuthUserContext = createContext<AuthUserContextType>({
  authUser: null,
  isLoading: true,
});

export function AuthUserProvider({ children }: { children: ReactNode }) {
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthUserContext.Provider value={{ authUser, isLoading }}>
      {children}
    </AuthUserContext.Provider>
  );
}

export const useAuth = () => useContext(AuthUserContext);
