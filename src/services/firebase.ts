import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getDatabase, type Database } from 'firebase/database';
import { getAuth, signInAnonymously, type Auth } from 'firebase/auth';

let app: FirebaseApp | null = null;
let db: Database | null = null;
let auth: Auth | null = null;

function getConfig() {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
  const databaseURL = import.meta.env.VITE_FIREBASE_DATABASE_URL;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

  if (!apiKey || !databaseURL) return null;

  return { apiKey, authDomain, databaseURL, projectId };
}

export function isFirebaseConfigured(): boolean {
  return getConfig() !== null;
}

export function getFirebaseDb(): Database | null {
  if (db) return db;
  const config = getConfig();
  if (!config) return null;
  app = initializeApp(config);
  db = getDatabase(app);
  auth = getAuth(app);
  return db;
}

export function getFirebaseAuth(): Auth | null {
  if (auth) return auth;
  getFirebaseDb();
  return auth;
}

export async function ensureAuth(): Promise<boolean> {
  const a = getFirebaseAuth();
  if (!a) return false;
  if (!a.currentUser) {
    try {
      await signInAnonymously(a);
    } catch {
      return false;
    }
  }
  return true;
}
