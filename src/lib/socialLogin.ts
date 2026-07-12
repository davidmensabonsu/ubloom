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
// itself when none is supplied), and Supabase verifies it by comparing the
// token's nonce claim against the SHA-256 hash of the nonce passed to
// signInWithIdToken. So the native SDK must receive the HASHED nonce (which
// lands in the token) while Supabase receives the RAW one.
function makeNonce(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export interface NativeSignInResult {
  idToken: string;
  nonce: string;
}

export async function nativeGoogleSignIn(): Promise<NativeSignInResult> {
  await ensureInitialized();
  const rawNonce = makeNonce();
  const { result } = await SocialLogin.login({
    provider: 'google',
    options: { scopes: ['email', 'profile'], nonce: await sha256Hex(rawNonce) },
  });
  const idToken = result && 'idToken' in result ? result.idToken : null;
  if (!idToken) throw new Error('Google did not return an ID token');
  return { idToken, nonce: rawNonce };
}

export async function nativeAppleSignIn(): Promise<NativeSignInResult> {
  await ensureInitialized();
  const rawNonce = makeNonce();
  const { result } = await SocialLogin.login({
    provider: 'apple',
    options: { scopes: ['email', 'name'], nonce: await sha256Hex(rawNonce) },
  });
  if (!result.idToken) throw new Error('Apple did not return an ID token');
  return { idToken: result.idToken, nonce: rawNonce };
}
