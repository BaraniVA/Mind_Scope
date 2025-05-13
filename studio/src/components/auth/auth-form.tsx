
// src/components/auth/auth-form.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { Chrome, Loader2 } from 'lucide-react'; 

export function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleAuth = async (action: 'signUp' | 'signIn') => {
    setIsSubmitting(true);
    try {
      if (action === 'signUp') {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({ title: "Account Created", description: "Welcome aboard! Your account is ready." });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Signed In", description: "Welcome back!" });
      }
      router.push('/'); 
    } catch (error: any) {
      console.error(`${action} error:`, error);
      toast({ title: "Authentication Error", description: error.message, variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({ title: "Signed In with Google", description: "Successfully connected your Google account!" });
      router.push('/');
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      toast({ title: "Google Sign-In Error", description: error.message, variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen p-4 md:p-8">
      <Card className="w-full max-w-md shadow-2xl bg-card/80 backdrop-blur-md border-none">
        <CardHeader className="text-center pt-8 pb-4">
          <CardTitle className="text-5xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-foreground to-primary">
            MindScope
          </CardTitle>
          <CardDescription className="text-md text-muted-foreground pt-2">
            Unlock Your Project's Potential.
          </CardDescription>
        </CardHeader>
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50 mx-auto h-13 max-w-[90%]">
            <TabsTrigger value="signin" className="text-sm py-2.5 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-md">Sign In</TabsTrigger>
            <TabsTrigger value="signup" className="text-sm py-2.5 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-md">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <CardContent className="space-y-6 px-6">
              <div className="space-y-1.5">
                <Label htmlFor="email-signin" className="text-xs font-medium text-muted-foreground">Email</Label>
                <Input id="email-signin" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="py-3 text-base"/>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password-signin" className="text-xs font-medium text-muted-foreground">Password</Label>
                <Input id="password-signin" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="py-3 text-base"/>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pt-6 px-6 pb-6">
              <Button onClick={() => handleAuth('signIn')} className="w-full py-3 text-base font-semibold" disabled={isSubmitting}>
                {isSubmitting && action === 'signIn' ? <Loader2 className="animate-spin mr-2" /> : null}
                Sign In
              </Button>
            </CardFooter>
          </TabsContent>
          <TabsContent value="signup">
            <CardContent className="space-y-6 px-6">
              <div className="space-y-1.5">
                <Label htmlFor="email-signup" className="text-xs font-medium text-muted-foreground">Email</Label>
                <Input id="email-signup" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="py-3 text-base"/>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password-signup" className="text-xs font-medium text-muted-foreground">Password (min. 6 characters)</Label>
                <Input id="password-signup" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="py-3 text-base"/>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pt-6 px-6 pb-6">
              <Button onClick={() => handleAuth('signUp')} className="w-full py-3 text-base font-semibold" disabled={isSubmitting}>
                {isSubmitting && action === 'signUp' ? <Loader2 className="animate-spin mr-2" /> : null}
                Create Account
              </Button>
            </CardFooter>
          </TabsContent>
        </Tabs>
        <CardContent className="px-6 pb-8">
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card/80 px-2 text-muted-foreground"> {/* Match card background */}
                  Or continue with
                </span>
              </div>
            </div>
            <Button variant="outline" className="w-full py-3 text-base font-medium border-2 border-muted hover:bg-muted/70" onClick={handleGoogleSignIn} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <Chrome className="mr-2 h-5 w-5" /> }
              Continue with Google
            </Button>
        </CardContent>
      </Card>
      <p className="text-center text-xs text-background/60 mt-8">
        Powering clarity for innovative minds. © MindScope {new Date().getFullYear()}
      </p>
    </div>
  );
}

// For showing loader based on action type
let action: 'signIn' | 'signUp' | null = null; 
// This is a bit of a hack to share the action type for loader display. 
// A more robust solution might involve separate loading states for each button if they could be clicked simultaneously.
// For this form, it's unlikely.
const originalHandleAuth = AuthForm.prototype.handleAuth;
AuthForm.prototype.handleAuth = async function(currentAction: 'signIn' | 'signUp') {
  action = currentAction;
  // @ts-ignore
  await originalHandleAuth.call(this, currentAction);
  action = null;
}


export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Sign out error", error);
  }
};
