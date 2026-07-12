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

export async function nativeGoogleSignIn(): Promise<string> {
  await ensureInitialized();
  const { result } = await SocialLogin.login({
    provider: 'google',
    options: { scopes: ['email', 'profile'] },
  });
  const idToken = result && 'idToken' in result ? result.idToken : null;
  if (!idToken) throw new Error('Google did not return an ID token');
  return idToken;
}

export async function nativeAppleSignIn(): Promise<string> {
  await ensureInitialized();
  const { result } = await SocialLogin.login({
    provider: 'apple',
    options: { scopes: ['email', 'name'] },
  });
  if (!result.idToken) throw new Error('Apple did not return an ID token');
  return result.idToken;
}
