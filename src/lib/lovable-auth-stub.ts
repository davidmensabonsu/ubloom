// Stub to replace @lovable.dev/cloud-auth-js in native builds
export function createLovableAuth() {
  return {
    signInWithOAuth: async () => ({ error: new Error('Not supported in native app') }),
  };
}
