// Complete stub replacing @lovable.dev/cloud-auth-js
export function createLovableAuth() {
  return {
    signInWithOAuth: async () => ({ error: new Error('Not supported in native app'), redirected: false }),
  };
}

export function Tpe() {
  return createLovableAuth();
}

export const Ppe = createLovableAuth();

export const Epe = {
  auth: {
    signInWithOAuth: async () => ({ error: new Error('Not supported in native app'), redirected: false }),
  },
};
