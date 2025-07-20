
// src/lib/firebase/config.ts
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getDatabase, Database } from 'firebase/database';
import { logger } from '@/lib/logger';

// Firebase configuration initialization

const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const firebaseAuthDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const firebaseDatabaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const firebaseStorageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const firebaseMessagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const firebaseAppId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

// Load environment variables


const missingVars: string[] = [];
if (!firebaseApiKey) missingVars.push('NEXT_PUBLIC_FIREBASE_API_KEY');
if (!firebaseAuthDomain) missingVars.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
if (!firebaseDatabaseURL) missingVars.push('NEXT_PUBLIC_FIREBASE_DATABASE_URL'); 
if (!firebaseProjectId) missingVars.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
if (!firebaseStorageBucket) missingVars.push('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
if (!firebaseMessagingSenderId) missingVars.push('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
if (!firebaseAppId) missingVars.push('NEXT_PUBLIC_FIREBASE_APP_ID');

if (missingVars.length > 0) {
  const errorMessage = `Firebase configuration is incomplete. Missing variables: ${missingVars.join(', ')}`;
  logger.error(errorMessage);
  if (typeof window === 'undefined') {
    throw new Error("Firebase configuration variables are missing.");
  }
}

// Validate configuration values
if (firebaseApiKey && (firebaseApiKey === 'YOUR_API_KEY' || firebaseApiKey.includes('YOUR_API_KEY') || firebaseApiKey.length < 10)) {
    const msg = "Firebase API key appears to be invalid or placeholder.";
    logger.error(msg);
    if (typeof window === 'undefined') throw new Error(msg);
}
if (firebaseAuthDomain && (firebaseAuthDomain.includes('YOUR_PROJECT_ID') || !firebaseAuthDomain.includes('.firebaseapp.com'))) {
    const msg = `Firebase auth domain appears to be invalid: ${firebaseAuthDomain}`;
    logger.error(msg);
    if (typeof window === 'undefined') throw new Error(msg);
}
if (firebaseDatabaseURL && (firebaseDatabaseURL.includes('YOUR_PROJECT_ID') || 
    (!firebaseDatabaseURL.includes('.firebaseio.com') && !firebaseDatabaseURL.includes('firebasedatabase.app')) ||
    !firebaseDatabaseURL.startsWith('https://'))) {
    const msg = `Firebase database URL appears to be invalid: ${firebaseDatabaseURL}`;
    logger.error(msg);
    if (typeof window === 'undefined') throw new Error(msg);
}
if (firebaseProjectId && (firebaseProjectId === 'YOUR_PROJECT_ID' || firebaseProjectId.includes('YOUR_PROJECT_ID') || firebaseProjectId.length < 4)) {
    const msg = "Firebase project ID appears to be invalid or placeholder.";
    logger.error(msg);
    if (typeof window === 'undefined') throw new Error(msg);
}


const firebaseConfig = {
  apiKey: firebaseApiKey!,
  authDomain: firebaseAuthDomain!,
  databaseURL: firebaseDatabaseURL!,
  projectId: firebaseProjectId!,
  storageBucket: firebaseStorageBucket!,
  messagingSenderId: firebaseMessagingSenderId!,
  appId: firebaseAppId!,
};

// Validate environment variables


let app: FirebaseApp;
let auth: Auth;
let database: Database;

// Check if all required config values are present before initializing
const allConfigValuesPresent = firebaseApiKey && firebaseAuthDomain && firebaseDatabaseURL && firebaseProjectId && firebaseStorageBucket && firebaseMessagingSenderId && firebaseAppId;

if (!allConfigValuesPresent) {
    const criticalErrorMsg = "Cannot initialize Firebase due to missing configuration.";
    logger.error(criticalErrorMsg);
    // @ts-ignore
    app = null; 
    // @ts-ignore
    auth = null;
    // @ts-ignore
    database = null;
} else {
    if (!getApps().length) {
      try {
        app = initializeApp(firebaseConfig);
      } catch (error: any) {
        logger.error('Error initializing Firebase app:', error);
        if (typeof window === 'undefined') {
          throw new Error("Firebase initialization failed. Check configuration.");
        }
        // @ts-ignore
        app = null;
      }
    } else {
      app = getApps()[0];
    }

    if (app) {
        try {
          auth = getAuth(app);
        } catch (error: any) {
            logger.error('Error initializing Firebase Auth:', error);
            // @ts-ignore
            auth = null;
        }

        try {
          database = getDatabase(app);
        } catch (error: any) {
            logger.error('Error initializing Firebase Database:', error);
            // @ts-ignore
            database = null;
        }
    } else {
         // @ts-ignore
        auth = null;
         // @ts-ignore
        database = null;
    }
}


export { app, auth, database };
    


    
