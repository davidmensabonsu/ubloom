import { SocialLogin } from '@capgo/capacitor-social-login';

// Public OAuth client identifiers (not secrets - safe to embed in the app bundle).
const GOOGLE_IOS_CLIENT_ID = '187233693364-2si1ejf5n9i9ra863b1r0k5ic1ritil6.apps.googleusercontent.com';
const GOOGLE_WEB_CLIENT_ID = '187233693364-lunasuis4fammb3bop87tir8974sd5m2.apps.googleusercontent.com';

let initPromise: Promise<void> | null = null;

function ensureInitialized(): Promise<void> {
  if (!initPromise) {
    initPromise = SocialLogin.initialize({
      google: {
        iOSClientId: GOOGLE_IOS_CLIENT_ID,
        iOSServerClientId: GOOGLE_WEB_CLIENT_ID,
        mode: 'online',
      },
      apple: {
        clientId: 'com.despia.ubloom',
      },
    });
  }
  return initPromise;
}

// The native SDKs embed a nonce in the ID token (Google's SDK generates one
// itself when none is supplied), and Supabase rejects the token unless the
// same nonce is passed to signInWithIdToken. Generate our own so both sides
// agree.
function makeNonce(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export interface NativeSignInResult {
  idToken: string;
  nonce: string;
}

export async function nativeGoogleSignIn(): Promise<NativeSignInResult> {
  await ensureInitialized();
  const nonce = makeNonce();
  const { result } = await SocialLogin.login({
    provider: 'google',
    options: { scopes: ['email', 'profile'], nonce },
  });
  const idToken = result && 'idToken' in result ? result.idToken : null;
  if (!idToken) throw new Error('Google did not return an ID token');
  return { idToken, nonce };
}

export async function nativeAppleSignIn(): Promise<NativeSignInResult> {
  await ensureInitialized();
  const nonce = makeNonce();
  const { result } = await SocialLogin.login({
    provider: 'apple',
    options: { scopes: ['email', 'name'], nonce },
  });
  if (!result.idToken) throw new Error('Apple did not return an ID token');
  return { idToken: result.idToken, nonce };
}
