
// src/lib/firebase/config.ts
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getDatabase, Database } from 'firebase/database';

console.log(`
------------------------------------------------------------------------------------------
[Firebase Config] IMPORTANT: MindScope Firebase Setup Check
------------------------------------------------------------------------------------------
If you are encountering Firebase authentication or database errors (e.g., 'auth/invalid-api-key', 
'auth/configuration-not-found', 'permission-denied'), please meticulously verify the following:

1.  **Correct .env.local File**:
    *   Ensure you have a file named EXACTLY '.env.local' in the ROOT of your project.
    *   This file MUST contain all the 'NEXT_PUBLIC_FIREBASE_*' variables.

2.  **Accurate Environment Variables in .env.local**:
    *   Double-check EACH 'NEXT_PUBLIC_FIREBASE_*' variable against your Firebase project settings.
        *   Project Overview (click the gear icon) > Project settings > General tab.
        *   Scroll down to "Your apps", select your web app, and find the SDK setup and configuration.
    *   Common mistakes include typos, extra spaces, or missing characters.
    *   Ensure variables are not placeholder values like "YOUR_API_KEY_HERE".

3.  **Firebase Console Configuration (CRITICAL FOR AUTHENTICATION ERRORS)**:
    *   **Authentication -> Sign-in method (tab)**:
        *   At least ONE sign-in provider (e.g., "Email/Password", "Google") MUST be ENABLED. This is a very common cause for 'auth/configuration-not-found'.
    *   **Authentication -> Settings (tab) -> Authorized domains**:
        *   The domain(s) your app runs on (e.g., 'localhost' for local dev, and your deployed app's domain like '*.cloudworkstations.dev' or the specific one) MUST be listed. Add them if missing. This is another common cause.

4.  **Google Cloud Console API Key Restrictions (If applicable)**:
    *   If you've restricted your API key in Google Cloud Console, ensure it allows:
        *   "Identity Toolkit API" (for Firebase Authentication).
        *   "Firebase Realtime Database API".
        *   Appropriate HTTP referrers (matching your "Authorized domains").

5.  **Restart Your Development Server**:
    *   After ANY change to '.env.local' or Firebase console settings, you MUST restart your Next.js server (e.g., stop and re-run 'npm run dev').

Detailed logs about the specific variables being loaded will follow.
------------------------------------------------------------------------------------------
`);

console.log('[Firebase Config] Attempting to load Firebase environment variables.');

const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const firebaseAuthDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const firebaseDatabaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const firebaseStorageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const firebaseMessagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const firebaseAppId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

// Log individual raw values from .env.local
console.log(`[Firebase Config] NEXT_PUBLIC_FIREBASE_API_KEY: ${firebaseApiKey ? 'Loaded ('+firebaseApiKey.substring(0,5)+'...)': 'MISSING or EMPTY'}`);
console.log(`[Firebase Config] NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${firebaseAuthDomain ? 'Loaded ('+firebaseAuthDomain+')' : 'MISSING or EMPTY'}`);
console.log(`[Firebase Config] NEXT_PUBLIC_FIREBASE_DATABASE_URL: ${firebaseDatabaseURL ? 'Loaded ('+firebaseDatabaseURL+')' : 'MISSING or EMPTY'}`);
console.log(`[Firebase Config] NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${firebaseProjectId ? 'Loaded ('+firebaseProjectId+')' : 'MISSING or EMPTY'}`);
console.log(`[Firebase Config] NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: ${firebaseStorageBucket ? 'Loaded ('+firebaseStorageBucket+')' : 'MISSING or EMPTY'}`);
console.log(`[Firebase Config] NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: ${firebaseMessagingSenderId ? 'Loaded ('+firebaseMessagingSenderId+')' : 'MISSING or EMPTY'}`);
console.log(`[Firebase Config] NEXT_PUBLIC_FIREBASE_APP_ID: ${firebaseAppId ? 'Loaded ('+firebaseAppId.substring(0,10)+'...)': 'MISSING or EMPTY'}`);


const missingVars: string[] = [];
if (!firebaseApiKey) missingVars.push('NEXT_PUBLIC_FIREBASE_API_KEY');
if (!firebaseAuthDomain) missingVars.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
if (!firebaseDatabaseURL) missingVars.push('NEXT_PUBLIC_FIREBASE_DATABASE_URL'); 
if (!firebaseProjectId) missingVars.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
if (!firebaseStorageBucket) missingVars.push('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
if (!firebaseMessagingSenderId) missingVars.push('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
if (!firebaseAppId) missingVars.push('NEXT_PUBLIC_FIREBASE_APP_ID');

if (missingVars.length > 0) {
  const errorMessage = `
[Firebase Config] FATAL ERROR: Firebase configuration is incomplete.
The following environment variables are MISSING or EMPTY in your .env.local file:
${missingVars.map(v => `  - ${v}`).join('\n')}

Please ensure:
1. You have a .env.local file in the ROOT of your project directory.
2. This file contains all the required NEXT_PUBLIC_FIREBASE_* variables with their correct values from your Firebase project settings.
3. You have RESTARTED your Next.js development server (e.g., 'npm run dev') after creating or modifying the .env.local file.

Refer to your Firebase project settings (Project Overview > Project settings > General > Your apps > SDK setup and configuration) for these values.
The application cannot proceed without these variables.
`;
  console.error(errorMessage);
  // For client-side, this throw might not stop execution in the way it does server-side during build,
  // but the console error will be prominent.
  if (typeof window === 'undefined') {
    throw new Error("Firebase configuration variables are missing. Check server console for details and review the IMPORTANT setup check message at the top of this log.");
  } else {
    // For client-side, alert the user more directly if possible, or rely on console.
    alert("CRITICAL FIREBASE CONFIGURATION ERROR: Environment variables missing. Check browser console and server logs.");
  }
}

// Heuristic checks for common placeholder values or format issues
if (firebaseApiKey && (firebaseApiKey === 'YOUR_API_KEY' || firebaseApiKey.includes('YOUR_API_KEY') || firebaseApiKey.length < 10)) { // Added length check
    const msg = "[Firebase Config] FATAL ERROR: NEXT_PUBLIC_FIREBASE_API_KEY seems to be a placeholder, incorrect, or too short. Please replace it with your actual Firebase API Key from the Firebase console.";
    console.error(msg);
    if (typeof window === 'undefined') throw new Error(msg); else alert(msg);
}
if (firebaseAuthDomain && (firebaseAuthDomain.includes('YOUR_PROJECT_ID') || !firebaseAuthDomain.includes('.firebaseapp.com'))) {
    const msg = `[Firebase Config] FATAL ERROR: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ("${firebaseAuthDomain}") seems to be a placeholder or is incorrectly formatted. It should be 'your-project-id.firebaseapp.com'.`;
    console.error(msg);
    if (typeof window === 'undefined') throw new Error(msg); else alert(msg);
}
// Updated check for database URL to support various regional formats
if (firebaseDatabaseURL && (firebaseDatabaseURL.includes('YOUR_PROJECT_ID') || 
    (!firebaseDatabaseURL.includes('.firebaseio.com') && !firebaseDatabaseURL.includes('firebasedatabase.app')) ||
    !firebaseDatabaseURL.startsWith('https://'))) { // Added check for https
    const msg = `[Firebase Config] FATAL ERROR: NEXT_PUBLIC_FIREBASE_DATABASE_URL ("${firebaseDatabaseURL}") seems to be a placeholder or is incorrectly formatted. It must start with 'https://' and be like 'https://your-project-id-default-rtdb.firebaseio.com' or 'https://your-project-id-default-rtdb.region.firebasedatabase.app'.`;
    console.error(msg);
    if (typeof window === 'undefined') throw new Error(msg); else alert(msg);
}
if (firebaseProjectId && (firebaseProjectId === 'YOUR_PROJECT_ID' || firebaseProjectId.includes('YOUR_PROJECT_ID') || firebaseProjectId.length < 4)) { // Added length check
    const msg = "[Firebase Config] FATAL ERROR: NEXT_PUBLIC_FIREBASE_PROJECT_ID seems to be a placeholder, incorrect, or too short. Please replace it with your actual Firebase Project ID.";
    console.error(msg);
    if (typeof window === 'undefined') throw new Error(msg); else alert(msg);
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

console.log('[Firebase Config] Final Firebase config object to be used for initialization:', {
    apiKey: firebaseConfig.apiKey ? firebaseConfig.apiKey.substring(0,5) + '...' : 'NOT LOADED',
    authDomain: firebaseConfig.authDomain || 'NOT LOADED',
    databaseURL: firebaseConfig.databaseURL || 'NOT LOADED',
    projectId: firebaseConfig.projectId || 'NOT LOADED',
    storageBucket: firebaseConfig.storageBucket || 'NOT LOADED',
    messagingSenderId: firebaseConfig.messagingSenderId || 'NOT LOADED',
    appId: firebaseConfig.appId ? firebaseConfig.appId.substring(0,10) + '...' : 'NOT LOADED'
});


let app: FirebaseApp;
let auth: Auth;
let database: Database;

// Check if all required config values are present before initializing
const allConfigValuesPresent = firebaseApiKey && firebaseAuthDomain && firebaseDatabaseURL && firebaseProjectId && firebaseStorageBucket && firebaseMessagingSenderId && firebaseAppId;

if (!allConfigValuesPresent) {
    const criticalErrorMsg = "[Firebase Config] CRITICAL: Cannot initialize Firebase because one or more required environment variables are missing or invalid. Please check your .env.local file and console logs.";
    console.error(criticalErrorMsg);
    // Prevent further execution if config is bad
    // This is a client-side accessible file, so throwing here might be too disruptive if not handled carefully.
    // The earlier checks should ideally catch this.
    // For now, ensure auth and database are not assigned if config is bad.
    // @ts-ignore
    app = null; 
    // @ts-ignore
    auth = null;
    // @ts-ignore
    database = null;
} else {
    if (!getApps().length) {
      try {
        console.log('[Firebase Config] Initializing Firebase app...');
        app = initializeApp(firebaseConfig);
        console.log('[Firebase Config] Firebase app initialized successfully.');
      } catch (error: any) {
        console.error('[Firebase Config] CRITICAL ERROR initializing Firebase app:', error);
        let detailedMessage = `Firebase initialization failed: ${error.message || String(error)}. `;
        detailedMessage += 'This usually means the Firebase configuration object itself is malformed (e.g. due to incorrect environment variable values like API_KEY, AUTH_DOMAIN, PROJECT_ID), or there was a network issue reaching Firebase. ';
        detailedMessage += 'Please double-check all NEXT_PUBLIC_FIREBASE_* values in your .env.local file against your Firebase project settings. ';
        detailedMessage += 'REMEMBER TO RESTART your Next.js development server after any changes to .env.local.';
        console.error(detailedMessage);
        if (typeof window === 'undefined') throw new Error(detailedMessage); else alert(detailedMessage);
        // @ts-ignore
        app = null;
      }
    } else {
      app = getApps()[0];
      console.log('[Firebase Config] Using existing Firebase app instance.');
    }

    if (app) { // Only try to getAuth and getDatabase if app was initialized
        try {
          auth = getAuth(app);
          console.log('[Firebase Config] Firebase Auth initialized successfully.');
        } catch (error: any) {
            console.error('[Firebase Config] CRITICAL ERROR initializing Firebase Auth:', error);
            let authErrorMessage = `Firebase Auth initialization failed: ${error.message || String(error)}. Code: ${error.code || 'N/A'}. `;

            if (error.code === 'auth/invalid-api-key') {
                authErrorMessage += `\n[Firebase Debug] Specific error: "auth/invalid-api-key".
                POSSIBLE CAUSES & SOLUTIONS:
                1. **VERIFY API KEY**: Check NEXT_PUBLIC_FIREBASE_API_KEY in your .env.local file. It MUST EXACTLY match the "apiKey" from your Firebase project settings (Firebase Console -> Project settings -> General tab -> Your apps -> Web app config). Current key starts with: ${firebaseApiKey?.substring(0,5)}...
                2. **API KEY ENABLED**: Ensure the API key is enabled in Google Cloud Console (APIs & Services -> Credentials -> Your API Key) and has "Identity Toolkit API" enabled.
                3. **RESTART SERVER**: You MUST restart your Next.js development server after any changes to .env.local.`;
            } else if (error.code === 'auth/configuration-not-found') {
                authErrorMessage += `\n[Firebase Debug] Specific error: "auth/configuration-not-found". This is a VERY COMMON error. It means Firebase cannot find an authentication configuration for your project.
                >>>>>>>>> IMMEDIATE ACTIONS REQUIRED IN FIREBASE CONSOLE: <<<<<<<<<
                1.  **ENABLE SIGN-IN PROVIDERS**:
                    *   Go to Firebase Console -> Your Project (${firebaseProjectId || 'UNKNOWN PROJECT ID'}) -> Authentication.
                    *   Click on the "Sign-in method" tab.
                    *   **YOU MUST ENABLE AT LEAST ONE PROVIDER** (e.g., "Email/Password", "Google"). If all are disabled, Auth is not configured. THIS IS THE MOST LIKELY CAUSE.
                2.  **CHECK AUTHORIZED DOMAINS**:
                    *   Go to Firebase Console -> Your Project (${firebaseProjectId || 'UNKNOWN PROJECT ID'}) -> Authentication.
                    *   Click on the "Settings" tab, then "Authorized domains".
                    *   Ensure 'localhost' is added for local development. Add any other domains where your app is hosted.
                3.  **VERIFY .ENV.LOCAL VALUES**:
                    *   Auth Domain: Is NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ("${firebaseAuthDomain || 'NOT LOADED'}") correct? It should be "YOUR_PROJECT_ID.firebaseapp.com".
                    *   Project ID: Is NEXT_PUBLIC_FIREBASE_PROJECT_ID ("${firebaseProjectId || 'NOT LOADED'}") correct?
                4.  **RESTART SERVER**: You MUST restart your Next.js development server after any changes to .env.local or Firebase Console.
                
                If this error persists after checking all above points, your Firebase project setup might be incomplete or there's a fundamental mismatch in identifiers.`;
            } else {
                authErrorMessage += 'Please check your Firebase project settings and .env.local file thoroughly. Review the IMPORTANT setup check message at the top of the console logs. Restart your server after any changes.';
            }
            console.error(authErrorMessage);
            if (typeof window !== 'undefined') alert("Firebase Auth Error: " + (error.code || error.message) + ". Check console for details.");
            // @ts-ignore
            auth = null;
        }

        try {
          database = getDatabase(app);
          console.log('[Firebase Config] Firebase Database initialized successfully.');
        } catch (error: any) {
            console.error('[Firebase Config] CRITICAL ERROR initializing Firebase Database:', error);
            let dbErrorMessage = `Firebase Database initialization failed: ${error.message || String(error)}. `;
            dbErrorMessage += `Check your NEXT_PUBLIC_FIREBASE_DATABASE_URL in .env.local. It should look like "https://<YOUR_PROJECT_ID>-default-rtdb.firebaseio.com" or "https://<YOUR_PROJECT_ID>-default-rtdb.<REGION>.firebasedatabase.app". Current value: "${firebaseDatabaseURL || 'NOT LOADED'}". `;
            dbErrorMessage += 'REMEMBER TO RESTART your Next.js development server if you made any changes to .env.local.';
            console.error(dbErrorMessage);
            if (typeof window !== 'undefined') alert("Firebase Database Error. Check console.");
            // @ts-ignore
            database = null;
        }
    } else {
        console.error("[Firebase Config] Firebase app object is null. Auth and Database will not be initialized.");
         // @ts-ignore
        auth = null;
         // @ts-ignore
        database = null;
    }
}


export { app, auth, database };
    


    
