import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, User, ArrowRight, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      const { error } = await signUp(email, password, displayName);
      if (error) {
        toast({ title: 'Sign up failed', description: error.message, variant: 'destructive' });
      } else {
        toast({
          title: 'Check your email ✨',
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

  return (
    <div className="min-h-screen gradient-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-24 h-24 rounded-full bg-primary/10 blur-3xl animate-pulse" />
      <div className="absolute bottom-32 right-8 w-32 h-32 rounded-full bg-glow-strong/20 blur-3xl animate-pulse" />

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          

          
          <h1 className="text-4xl font-display font-light tracking-tight text-foreground">
            ubloom
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isSignUp ? 'Create your space' : 'Welcome back, beautiful'}
          </p>
        </div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="glass-card rounded-2xl p-6 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}>
          
          {isSignUp &&
          <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
              type="text"
              placeholder="Display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
            
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

          <motion.button
            type="submit"
            disabled={loading}
            className="soft-button w-full flex items-center justify-center gap-2"
            whileTap={{ scale: 0.98 }}>
            
            {loading ?
            <span className="animate-pulse">...</span> :

            <>
                <Heart size={16} className="fill-current" />
                <span>{isSignUp ? 'Create account' : 'Sign in'}</span>
                <ArrowRight size={16} />
              </>
            }
          </motion.button>
        </motion.form>

        {/* Toggle */}
        <p className="text-center mt-6 text-sm text-muted-foreground">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-primary font-medium hover:underline">
            
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>);

}