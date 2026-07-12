import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Heart, Check, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Capacitor } from '@capacitor/core';
import { nativeGoogleSignIn, nativeAppleSignIn } from '@/lib/socialLogin';

const USERNAME_REGEX = /^[A-Za-z0-9._]{3,30}$/;
function validateUsernameFormat(value: string): string | null {
  if (!value) return 'Username is required';
  if (!USERNAME_REGEX.test(value)) return '3–30 chars: letters, numbers, . or _';
  if (value.startsWith('.') || value.endsWith('.')) return "Can't start or end with a period";
  if (value.includes('..')) return "Can't contain consecutive periods";
  return null;
}

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const isNative = Capacitor.isNativePlatform();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { signIn, signUp, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/home', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Debounced username availability check
  useEffect(() => {
    if (!isSignUp || isForgot) return;
    const value = username.trim().toLowerCase();
    if (!value) {
      setUsernameStatus('idle');
      setUsernameError(null);
      return;
    }
    const formatError = validateUsernameFormat(value);
    if (formatError) {
      setUsernameStatus('invalid');
      setUsernameError(formatError);
      return;
    }
    setUsernameStatus('checking');
    setUsernameError(null);
    const handle = window.setTimeout(async () => {
      const { data, error } = await supabase.rpc('username_available', { _username: value });
      if (error) {
        setUsernameStatus('idle');
        return;
      }
      if (data === true) {
        setUsernameStatus('available');
        setUsernameError(null);
      } else {
        setUsernameStatus('taken');
        setUsernameError('That username is taken');
      }
    }, 400);
    return () => window.clearTimeout(handle);
  }, [username, isSignUp, isForgot]);

  const signUpDisabled = useMemo(() => {
    if (!isSignUp) return false;
    return !agreedToTerms || usernameStatus !== 'available';
  }, [isSignUp, agreedToTerms, usernameStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isForgot) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (error) {
        toast({ title: 'Could not send reset email', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Check your email', description: 'We sent you a link to reset your password.' });
      }
      setLoading(false);
      return;
    }

    if (isSignUp) {
      if (usernameStatus !== 'available') {
        toast({ title: 'Pick an available username', description: usernameError || 'Choose a username before signing up.', variant: 'destructive' });
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, username.trim().toLowerCase());
      if (error) {
        const msg = /username/i.test(error.message)
          ? 'That username was just taken — try another.'
          : error.message;
        toast({ title: 'Sign up failed', description: msg, variant: 'destructive' });
      } else {
        toast({
          title: 'Check your email',
          description: 'We sent you a confirmation link to verify your account.'
        });
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: 'Sign in failed', description: error.message, variant: 'destructive' });
      } else {
        navigate('/home');
      }
    }

    setLoading(false);
  };

  const handleNativeGoogleSignIn = async () => {
    setLoading(true);
    try {
      const idToken = await nativeGoogleSignIn();
      const { error } = await supabase.auth.signInWithIdToken({ provider: 'google', token: idToken });
      if (error) throw error;
      navigate('/home');
    } catch (err) {
      toast({
        title: 'Google sign-in failed',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNativeAppleSignIn = async () => {
    setLoading(true);
    try {
      const idToken = await nativeAppleSignIn();
      const { error } = await supabase.auth.signInWithIdToken({ provider: 'apple', token: idToken });
      if (error) throw error;
      navigate('/home');
    } catch (err) {
      toast({
        title: 'Apple sign-in failed',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-24 h-24 rounded-full bg-primary/10 blur-3xl animate-pulse" />
      <div className="absolute bottom-32 right-8 w-32 h-32 rounded-full bg-glow-strong/20 blur-3xl animate-pulse" />

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <img alt="uBloom logo" className="w-[160px] h-[160px] mx-auto mb-2 drop-shadow-lg object-contain clay-icon" src={logo} />
          <h1 className="text-4xl font-display tracking-tight text-foreground font-extrabold">
            uBloom
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isForgot ? 'Reset your password' : isSignUp ? 'Create your space' : 'Welcome back, beautiful'}
          </p>
        </div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="glass-card rounded-2xl p-6 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}>
          
          {isSignUp && !isForgot &&
          <div>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <span className="absolute left-9 top-1/2 -translate-y-1/2 text-sm text-muted-foreground select-none">@</span>
                <input
                  type="text"
                  placeholder="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/\s+/g, '').toLowerCase())}
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  maxLength={30}
                  required
                  className="w-full rounded-xl border border-border bg-background pl-14 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  {usernameStatus === 'checking' && <Loader2 size={16} className="animate-spin text-muted-foreground" />}
                  {usernameStatus === 'available' && <Check size={16} className="text-emerald-500" />}
                  {(usernameStatus === 'taken' || usernameStatus === 'invalid') && <X size={16} className="text-rose-500" />}
                </span>
              </div>
              {usernameError && username && (
                <p className="text-xs text-rose-500 mt-1.5 ml-1">{usernameError}</p>
              )}
              {usernameStatus === 'available' && (
                <p className="text-xs text-emerald-600 mt-1.5 ml-1">@{username.trim().toLowerCase()} is available</p>
              )}
            </div>
          }

          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
          </div>

          {!isForgot &&
          <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
            </div>
          }

          <motion.button
            type="submit"
            disabled={loading || signUpDisabled}
            className="soft-button w-full flex items-center justify-center gap-2"
            whileTap={{ scale: 0.98 }}>
            
            {loading ?
            <span className="animate-pulse">...</span> :

            <>
                <Heart size={16} className="fill-current" />
                <span>{isForgot ? 'Send reset link' : isSignUp ? 'Create account' : 'Sign in'}</span>
                <ArrowRight size={16} />
              </>
            }
          </motion.button>
        </motion.form>

        {/* Google sign-in */}
        {!isForgot && (
        <div className="mt-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            {isNative ? (
              <div className="space-y-2">
                <motion.button
                  type="button"
                  disabled={loading || (isSignUp && !agreedToTerms)}
                  onClick={handleNativeGoogleSignIn}
                  className="w-full glass-card rounded-xl p-3 flex items-center justify-center gap-3 text-sm font-medium text-foreground transition-all active:scale-[0.98] hover:bg-muted/50 disabled:opacity-50 disabled:pointer-events-none"
                  whileTap={{ scale: 0.98 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span>Continue with Google</span>
                </motion.button>
                <motion.button
                  type="button"
                  disabled={loading || (isSignUp && !agreedToTerms)}
                  onClick={handleNativeAppleSignIn}
                  className="w-full glass-card rounded-xl p-3 flex items-center justify-center gap-3 text-sm font-medium text-foreground transition-all active:scale-[0.98] hover:bg-muted/50 disabled:opacity-50 disabled:pointer-events-none"
                  whileTap={{ scale: 0.98 }}>
                  <svg width="16" height="18" viewBox="0 0 384 512" fill="currentColor">
                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                  </svg>
                  <span>Continue with Apple</span>
                </motion.button>
              </div>
            ) : (
              <motion.button
              type="button"
              disabled={isSignUp && !agreedToTerms}
              onClick={async () => {
                const { error } = await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: {
                    redirectTo: window.location.origin
                  }
                });

                if (error) {
                  toast({ title: 'Google sign-in failed', description: String(error), variant: 'destructive' });
                }
              }}
              className="w-full glass-card rounded-xl p-3 flex items-center justify-center gap-3 text-sm font-medium text-foreground transition-all active:scale-[0.98] hover:bg-muted/50 disabled:opacity-50 disabled:pointer-events-none"
              whileTap={{ scale: 0.98 }}>

                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span>Continue with Google</span>
              </motion.button>
            )}
          </div>
        )}

        {/* Consent checkbox — only required for sign-up */}
        {isSignUp && (
          <label className="flex items-start gap-2 cursor-pointer mt-4">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border accent-primary"
            />
            <span className="text-xs text-muted-foreground leading-snug">
              I agree to the{' '}
              <Link to="/terms" className="text-primary hover:underline">Terms &amp; Conditions</Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            </span>
          </label>
        )}

        {/* Sign-in reminder text */}
        {!isSignUp && !isForgot && (
          <p className="text-center mt-4 text-xs text-muted-foreground">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="text-primary hover:underline">Terms</Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
          </p>
        )}

        {/* Forgot password link */}
        {!isSignUp && !isForgot &&
        <p className="text-center mt-4">
            <button
            onClick={() => setIsForgot(true)}
            className="text-sm text-primary font-medium hover:underline transition-colors">
            
              Forgot your password?
            </button>
          </p>
        }

        {/* Legal links */}
        <div className="flex justify-center gap-3 mt-4 text-xs text-muted-foreground">
          <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          <span>·</span>
          <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
        </div>

        {/* Toggle */}
        <p className="text-center mt-3 text-sm text-muted-foreground">
          {isForgot ?
          <>
              <button
              onClick={() => setIsForgot(false)}
              className="text-primary font-medium hover:underline">
              
                Back to sign in
              </button>
            </> :

          <>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary font-medium hover:underline">
              
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </>
          }
        </p>
      </div>
    </div>);

}