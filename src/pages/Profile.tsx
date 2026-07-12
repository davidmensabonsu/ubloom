import { useState, useEffect, useRef, useMemo } from 'react';
import { getLocalDateStr } from '@/lib/dateUtils';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserStore } from '@/stores/userStore';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Check, Camera, LogOut, Trash2, Pencil, BookOpen, Target, Lock, KeyRound, Sparkles, Eye, EyeOff, Shield, Heart, Crown, AlertTriangle } from 'lucide-react';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import ubloomLogo from '@/assets/ubloom-flower.png';
import flameIcon from '@/assets/icons/flame.png';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

import BottomNav from '@/components/BottomNav';
import ManageSubscriptionDialog from '@/components/ManageSubscriptionDialog';
import { Capacitor } from '@capacitor/core';
import { openCustomerCenter } from '@/components/NativeCustomerCenter';

const aesthetics = [
  { id: 'rose', name: 'Warm Rose', preview: 'bg-gradient-to-br from-rose-100 to-pink-200', accent: 'bg-rose-300', gradient: 'linear-gradient(135deg, hsl(344 40% 57%), hsl(344 55% 78%))' },
  { id: 'sage', name: 'Sage', preview: 'bg-gradient-to-br from-green-50 to-emerald-100', accent: 'bg-emerald-300', gradient: 'linear-gradient(135deg, hsl(150 30% 35%), hsl(150 30% 63%))' },
  { id: 'sand', name: 'Sand', preview: 'bg-gradient-to-br from-amber-50 to-orange-100', accent: 'bg-amber-400', gradient: 'linear-gradient(135deg, hsl(25 55% 50%), hsl(25 55% 75%))' },
  { id: 'lavender', name: 'Lavender', preview: 'bg-gradient-to-br from-purple-50 to-violet-100', accent: 'bg-violet-300', gradient: 'linear-gradient(135deg, hsl(270 30% 48%), hsl(270 35% 73%))' },
  { id: 'arctic', name: 'Arctic', preview: 'bg-gradient-to-br from-sky-50 to-blue-100', accent: 'bg-sky-400', gradient: 'linear-gradient(135deg, hsl(210 35% 45%), hsl(210 35% 70%))' },
  { id: 'grey', name: 'Silver Mist', preview: 'bg-gradient-to-br from-gray-100 to-gray-200', accent: 'bg-gray-400', gradient: 'linear-gradient(135deg, hsl(0 0% 78%), hsl(36 9% 89%))' },
  { id: 'yellow', name: 'Golden Hour', preview: 'bg-gradient-to-br from-yellow-50 to-amber-100', accent: 'bg-amber-300', gradient: 'linear-gradient(135deg, hsl(40 100% 65%), hsl(44 100% 82%))' },
  { id: 'beige', name: 'Oat Milk', preview: 'bg-gradient-to-br from-stone-100 to-stone-200', accent: 'bg-stone-400', gradient: 'linear-gradient(135deg, hsl(33 27% 67%), hsl(37 46% 85%))' },
  { id: 'brown', name: 'Cocoa', preview: 'bg-gradient-to-br from-stone-200 to-stone-300', accent: 'bg-stone-500', gradient: 'linear-gradient(135deg, hsl(27 28% 52%), hsl(32 28% 72%))' },
  { id: 'cream', name: 'Cashmere', preview: 'bg-gradient-to-br from-orange-50 to-amber-100', accent: 'bg-amber-200', gradient: 'linear-gradient(135deg, hsl(33 49% 71%), hsl(31 63% 92%))' },
  { id: 'blue', name: 'Ocean Calm', preview: 'bg-gradient-to-br from-sky-50 to-blue-100', accent: 'bg-sky-400', gradient: 'linear-gradient(135deg, hsl(213 42% 30%), hsl(211 59% 78%))' },
  { id: 'purple', name: 'Moon Violet', preview: 'bg-gradient-to-br from-violet-50 to-purple-100', accent: 'bg-violet-400', gradient: 'linear-gradient(135deg, hsl(272 30% 55%), hsl(266 57% 87%))' },
  { id: 'green', name: 'Matcha', preview: 'bg-gradient-to-br from-green-50 to-emerald-100', accent: 'bg-emerald-400', gradient: 'linear-gradient(135deg, hsl(102 15% 51%), hsl(100 29% 86%))' },
  { id: 'pink', name: 'Ballet', preview: 'bg-gradient-to-br from-pink-50 to-rose-100', accent: 'bg-rose-300', gradient: 'linear-gradient(135deg, hsl(344 100% 78%), hsl(343 100% 92%))' },
  { id: 'orange', name: 'Apricot', preview: 'bg-gradient-to-br from-orange-50 to-orange-100', accent: 'bg-orange-400', gradient: 'linear-gradient(135deg, hsl(24 100% 62%), hsl(24 100% 85%))' },
];

export default function Profile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile, setAesthetic, resetProfile, updateProfile } = useUserStore();
  const { isAdmin } = useAdminCheck();
  const { toast } = useToast();
  const { status, isTrial, isActive, isExpired, trialDaysLeft, subscriptionEnd } = useSubscription();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Username (for the upcoming social feature)
  const [username, setUsername] = useState<string | null>(null);
  const [claimUsername, setClaimUsername] = useState('');
  const [claimStatus, setClaimStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [claimError, setClaimError] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);

  // Change password state
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);

  // Delete account state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE' || !user) return;
    setIsDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('No session');

      const { data, error } = await supabase.functions.invoke('delete-account', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Clear local state
      resetProfile();
      await signOut();
      navigate('/');
      toast({ title: 'Account deleted', description: 'All your data has been permanently removed.' });
    } catch (err: any) {
      toast({ title: 'Could not delete account', description: err?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setIsDeleting(false);
      setDeleteOpen(false);
      setDeleteConfirm('');
    }
  };

  // Load profile data from Supabase
  useEffect(() => {
    if (!user) return;
    const loadProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('display_name, avatar_url, username')
        .eq('user_id', user.id)
        .single();
      if (data) {
        setDisplayName(data.display_name || user.email || '');
        setAvatarUrl(data.avatar_url);
        setUsername(data.username);
      } else {
        setDisplayName(user.email || '');
      }
    };
    loadProfile();
  }, [user]);

  // Live availability check for username claim (legacy accounts)
  useEffect(() => {
    if (username) return; // already claimed
    const value = claimUsername.trim().toLowerCase();
    if (!value) {
      setClaimStatus('idle');
      setClaimError(null);
      return;
    }
    const USERNAME_REGEX = /^[A-Za-z0-9._]{3,30}$/;
    let formatError: string | null = null;
    if (!USERNAME_REGEX.test(value)) formatError = '3–30 chars: letters, numbers, . or _';
    else if (value.startsWith('.') || value.endsWith('.')) formatError = "Can't start or end with a period";
    else if (value.includes('..')) formatError = "Can't contain consecutive periods";
    if (formatError) {
      setClaimStatus('invalid');
      setClaimError(formatError);
      return;
    }
    setClaimStatus('checking');
    setClaimError(null);
    const handle = window.setTimeout(async () => {
      const { data, error } = await supabase.rpc('username_available', { _username: value });
      if (error) { setClaimStatus('idle'); return; }
      if (data === true) { setClaimStatus('available'); setClaimError(null); }
      else { setClaimStatus('taken'); setClaimError('That username is taken'); }
    }, 400);
    return () => window.clearTimeout(handle);
  }, [claimUsername, username]);

  const handleClaimUsername = async () => {
    if (!user || claimStatus !== 'available') return;
    const value = claimUsername.trim().toLowerCase();
    setIsClaiming(true);
    const { error } = await supabase
      .from('profiles')
      .update({ username: value })
      .eq('user_id', user.id);
    setIsClaiming(false);
    if (error) {
      const msg = /unique|duplicate/i.test(error.message) ? 'That username was just taken — try another.' : error.message;
      toast({ title: 'Could not claim username', description: msg, variant: 'destructive' });
      setClaimStatus('taken');
    } else {
      setUsername(value);
      toast({ title: 'Username claimed ✨', description: `You're now @${value}` });
    }
  };

  // Journey stats
  const stats = useMemo(() => {
    const journalCount = profile.journalEntries?.length || 0;
    const habitsCompleted = (profile.habitCompletions || []).filter(c => c.completed).length;

    // Days on app: from earliest journal entry or mood entry
    const dates: string[] = [
      ...(profile.journalEntries || []).map(e => e.date),
      ...(profile.moodHistory || []).map(e => e.date),
    ];
    let daysOnApp = 0;
    if (dates.length > 0) {
      const earliest = new Date(Math.min(...dates.map(d => new Date(d).getTime())));
      daysOnApp = Math.max(1, Math.ceil((Date.now() - earliest.getTime()) / (1000 * 60 * 60 * 24)));
    }

    // Current streak: consecutive days (most recent first) with ≥50% habit completion
    let streak = 0;
    if ((profile.coreHabits || []).length > 0) {
      const totalHabits = profile.coreHabits.length;
      const completionsByDate: Record<string, number> = {};
      for (const c of profile.habitCompletions || []) {
        if (c.completed) {
          completionsByDate[c.date] = (completionsByDate[c.date] || 0) + 1;
        }
      }
      const today = new Date();
      for (let i = 0; i < 365; i++) {
         const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = getLocalDateStr(d);
        const done = completionsByDate[key] || 0;
        if (done / totalHabits >= 0.5) {
          streak++;
        } else {
          break;
        }
      }
    }

    return { journalCount, habitsCompleted, daysOnApp, streak };
  }, [profile.journalEntries, profile.moodHistory, profile.habitCompletions, profile.coreHabits]);

  const handleSaveName = async () => {
    if (!user) return;
    setIsSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName })
      .eq('user_id', user.id);
    setIsSaving(false);
    setIsEditingName(false);
    if (error) {
      toast({ title: 'Could not update name', variant: 'destructive' });
    } else {
      toast({ title: 'Name updated ✨' });
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('vision-images')
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast({ title: 'Upload failed', variant: 'destructive' });
      setIsUploading(false);
      return;
    }

    const { data: signedData } = await supabase.storage
      .from('vision-images')
      .createSignedUrl(path, 31536000); // 1 year

    const imageUrl = signedData?.signedUrl;
    if (!imageUrl) {
      toast({ title: 'Failed to get image URL', variant: 'destructive' });
      setIsUploading(false);
      return;
    }

    await supabase
      .from('profiles')
      .update({ avatar_url: imageUrl })
      .eq('user_id', user.id);

    setAvatarUrl(imageUrl);
    setIsUploading(false);
    toast({ title: 'Avatar updated ✨' });
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast({ title: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    setIsChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setIsChangingPassword(false);
    if (error) {
      toast({ title: 'Could not update password', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Password updated ✨' });
      setNewPassword('');
      setConfirmPassword('');
      setPasswordOpen(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleResetData = async () => {
    if (!user) return;
    resetProfile();
    await supabase.from('user_data').delete().eq('user_id', user.id);
    toast({ title: 'Data reset complete' });
    navigate('/');
  };


  const initials = (displayName || user?.email || '?')
    .split(/[\s@]/)
    .map(s => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const hasIdentity = profile.identityStatement || (profile.dreamSelfFeels && profile.dreamSelfFeels.length > 0);

  return (
    <div className="min-h-screen gradient-background safe-bottom">
      {/* Header */}
      <div className="px-5 pt-[max(3rem,calc(env(safe-area-inset-top)+0.75rem))] pb-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="page-title"
        >
          Profile
        </motion.h1>
      </div>

      <div className="px-5 space-y-6">
        {/* Avatar + Name Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-3xl p-6 flex flex-col items-center"
        >
          <div className="relative mb-4">
            <Avatar className="w-24 h-24">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt="Profile" />
              ) : null}
              <AvatarFallback className="text-xl font-medium bg-primary/20 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md"
              disabled={isUploading}
            >
              <Camera size={14} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>

          {isEditingName ? (
            <div className="flex items-center gap-2 w-full max-w-xs">
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="text-center"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
              />
              <button
                onClick={handleSaveName}
                disabled={isSaving}
                className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0"
              >
                <Check size={16} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={() => setIsEditingName(true)}
                className="flex items-center gap-2 group"
              >
                <span className="text-xl font-display font-medium text-foreground">
                  {displayName}
                </span>
                <Pencil size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              {/* Plan badge */}
              {status !== 'loading' && (
                isActive && !isTrial ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-semibold uppercase tracking-wider">
                    <Crown size={10} />
                    Premium
                  </span>
                ) : isTrial ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-semibold uppercase tracking-wider">
                    Trial — {trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''} left
                  </span>
                ) : (
                  <div className="inline-flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">
                      Free tier
                    </span>
                    <button
                      onClick={() => navigate('/upgrade')}
                      className="text-[10px] font-semibold text-primary hover:underline"
                    >
                      Upgrade →
                    </button>
                  </div>
                )
              )}
            </div>
          )}

          {username ? (
            <p className="text-sm text-primary font-medium mt-1">@{username}</p>
          ) : (
            <div className="w-full max-w-xs mt-3">
              <p className="text-xs text-muted-foreground text-center mb-2">
                Claim your unique username for the upcoming social feature
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground select-none">@</span>
                  <Input
                    value={claimUsername}
                    onChange={(e) => setClaimUsername(e.target.value.replace(/\s+/g, '').toLowerCase())}
                    placeholder="username"
                    maxLength={30}
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                    className="pl-7"
                  />
                </div>
                <button
                  onClick={handleClaimUsername}
                  disabled={claimStatus !== 'available' || isClaiming}
                  className="px-3 h-9 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 shrink-0"
                >
                  Claim
                </button>
              </div>
              {claimError && claimUsername && (
                <p className="text-xs text-rose-500 mt-1.5 text-center">{claimError}</p>
              )}
              {claimStatus === 'available' && (
                <p className="text-xs text-emerald-600 mt-1.5 text-center">@{claimUsername.trim().toLowerCase()} is available</p>
              )}
              {claimStatus === 'checking' && (
                <p className="text-xs text-muted-foreground mt-1.5 text-center">Checking…</p>
              )}
            </div>
          )}
          <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
        </motion.div>

        {/* Identity Statement */}
        {hasIdentity && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card rounded-3xl p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-primary" />
              <h2 className="section-title">Your Identity</h2>
            </div>
            {profile.identityStatement && (
              <p className="text-sm text-foreground/90 italic leading-relaxed">
                "{profile.identityStatement}"
              </p>
            )}
            {profile.dreamSelfFeels && profile.dreamSelfFeels.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {profile.dreamSelfFeels.map((feel) => (
                  <span
                    key={feel}
                    className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium"
                  >
                    {feel}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Interests Editor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.17 }}
        >
          <Collapsible>
            <CollapsibleTrigger asChild>
              <button className="w-full glass-card rounded-2xl p-4 flex items-center gap-3 text-left transition-all active:scale-[0.98]">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Heart size={18} className="text-primary" />
                </div>
                <div>
                  <span className="font-medium text-foreground">Interests</span>
                  <p className="text-xs text-muted-foreground">
                    {profile.interests?.length ? `${profile.interests.length} selected` : 'Tap to set'}
                  </p>
                </div>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="glass-card rounded-2xl p-4 mt-2">
                <p className="text-xs text-muted-foreground mb-3">Select your interests to personalise recommendations</p>
                <div className="flex flex-wrap gap-2">
                  {['pilates', 'gym', 'beauty', 'skincare', 'business', 'reading', 'travel', 'journaling', 'wellness'].map((interest) => {
                    const selected = (profile.interests || []).includes(interest);
                    return (
                      <button
                        key={interest}
                        onClick={() => {
                          const current = profile.interests || [];
                          const updated = selected
                            ? current.filter((i) => i !== interest)
                            : [...current, interest];
                          updateProfile({ interests: updated });
                        }}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          selected
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted/60 text-foreground/70'
                        }`}
                      >
                        {interest.charAt(0).toUpperCase() + interest.slice(1)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </motion.div>


        {/* Journey Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-3xl p-5"
        >
          <h2 className="section-title mb-4">Your Journey</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Days on app', value: stats.daysOnApp || '—', icon: Target, color: 'text-primary' },
              { label: 'Journal entries', value: stats.journalCount, icon: BookOpen, color: 'text-primary' },
              { label: 'To-dos done', value: stats.habitsCompleted, icon: Check, color: 'text-primary' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-muted/50 rounded-2xl p-4 text-center">
                <Icon size={18} className={`${color} mx-auto mb-1`} />
                <p className="text-lg font-semibold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
            <div className="bg-muted/50 rounded-2xl p-4 text-center">
              <img src={flameIcon} alt="" className="w-5 h-5 object-contain mx-auto mb-1" style={{ filter: 'none' }} />
              <p className="text-lg font-semibold text-foreground">{stats.streak || '—'}</p>
              <p className="text-xs text-muted-foreground">Current streak</p>
            </div>
          </div>
        </motion.div>

        {/* Subscription Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="glass-card rounded-3xl p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Crown size={16} className="text-primary" />
            <h2 className="section-title">Subscription</h2>
          </div>
          {status === 'loading' ? (
            <p className="text-sm text-muted-foreground">Checking...</p>
          ) : isActive && !isTrial ? (
            <div className="space-y-3">
              <p className="text-sm text-foreground/90">
                You're on <span className="font-semibold text-primary">uBloom Premium</span>
              </p>
              {subscriptionEnd && (
                <p className="text-xs text-muted-foreground">
                  Renews {new Date(subscriptionEnd).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              )}
              <button
                onClick={() => {
                  if (Capacitor.isNativePlatform()) {
                    openCustomerCenter();
                  } else {
                    setManageOpen(true);
                  }
                }}
                className="text-sm text-primary font-medium hover:underline"
              >
                Manage subscription →
              </button>
            </div>
          ) : isTrial ? (
            <div className="space-y-3">
              <p className="text-sm text-foreground/90">
                Free trial · <span className="font-semibold">{trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''} left</span>
              </p>
              <button
                onClick={() => navigate('/upgrade')}
                className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium"
              >
                Upgrade to Premium
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-foreground/90">Your free trial has ended</p>
              <button
                onClick={() => navigate('/upgrade')}
                className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium"
              >
                Upgrade to Premium
              </button>
            </div>
          )}
        </motion.div>

        {/* Theme Picker is next, Society follows after */}

        {/* Theme Picker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Collapsible>
            <CollapsibleTrigger asChild>
              <button className="w-full glass-card rounded-2xl p-4 flex items-center gap-3 text-left transition-all active:scale-[0.98]">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <div className={`w-5 h-5 rounded-full ${aesthetics.find(a => a.id === profile.aesthetic)?.accent || 'bg-primary'}`} />
                </div>
                <div>
                  <span className="font-medium text-foreground">Theme</span>
                  <p className="text-xs text-muted-foreground">{aesthetics.find(a => a.id === profile.aesthetic)?.name}</p>
                </div>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="glass-card rounded-2xl p-4 mt-2">
                <div className="grid grid-cols-5 gap-2">
                  {aesthetics.map((aesthetic) => (
                    <motion.button
                      key={aesthetic.id}
                      onClick={() => setAesthetic(aesthetic.id)}
                      className={`relative rounded-xl overflow-hidden aspect-[3/4] transition-all duration-300 ${
                        profile.aesthetic === aesthetic.id
                          ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                          : ''
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="absolute inset-0" style={{ background: aesthetic.gradient }} />
                      <div className="absolute inset-0 flex items-end justify-center p-1.5">
                        <span className="text-[10px] font-display font-medium text-white drop-shadow-md text-center leading-tight">
                          {aesthetic.name}
                        </span>
                      </div>
                      {profile.aesthetic === aesthetic.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center shadow-md"
                        >
                          <Check size={9} className="text-foreground" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </motion.div>

        {/* uBloom Society */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.27 }}
        >
          <button
            onClick={() => navigate('/society')}
            className="w-full rounded-2xl p-4 flex items-center gap-3 text-left transition-all active:scale-[0.98] bg-gradient-to-r from-primary/40 via-primary/20 to-primary/45 border border-primary/30 shadow-lg shadow-primary/20 ring-1 ring-primary/10"
          >
             <div className="w-10 h-10 rounded-full bg-background/70 flex items-center justify-center">
               <img src={ubloomLogo} alt="uBloom" className="w-7 h-7 object-contain drop-shadow-md" />
             </div>
            <div className="flex-1">
              <span className="font-medium text-foreground">uBloom Society</span>
              <p className="text-xs text-foreground/60">Connect · Grow · Bloom</p>
            </div>
            <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-background/50 text-primary backdrop-blur-sm">
              Coming Soon
            </span>
            <span className="ml-1 inline-flex items-center gap-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/20 text-primary backdrop-blur-sm uppercase tracking-wider">
              <Crown size={9} />
              Premium
            </span>
          </button>
        </motion.div>

        {/* Change Password */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Collapsible open={passwordOpen} onOpenChange={setPasswordOpen}>
            <CollapsibleTrigger asChild>
              <button className="w-full glass-card rounded-2xl p-4 flex items-center gap-3 text-left transition-all active:scale-[0.98]">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Lock size={18} className="text-muted-foreground" />
                </div>
                <span className="font-medium text-foreground">Change password</span>
                <KeyRound size={14} className="ml-auto text-muted-foreground" />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="glass-card rounded-2xl p-4 mt-2 space-y-3">
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleChangePassword()}
                />
                <button
                  onClick={handleChangePassword}
                  disabled={isChangingPassword || !newPassword}
                  className="w-full rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-medium disabled:opacity-50 transition-all active:scale-[0.98]"
                >
                  {isChangingPassword ? 'Updating…' : 'Update password'}
                </button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </motion.div>

        {/* Account Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          {/* Replay walkthrough */}
          <button
            onClick={() => { updateProfile({ walkthroughComplete: false }); navigate('/home'); }}
            className="w-full glass-card rounded-2xl p-4 flex items-center gap-3 text-left transition-all active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles size={18} className="text-primary" />
            </div>
            <span className="font-medium text-foreground">Replay walkthrough</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="w-full glass-card rounded-2xl p-4 flex items-center gap-3 text-left transition-all active:scale-[0.98]"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield size={18} className="text-primary" />
              </div>
              <div>
                <span className="font-medium text-foreground">Admin Dashboard</span>
                <p className="text-xs text-muted-foreground">Analytics & insights</p>
              </div>
            </button>
          )}


          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="w-full glass-card rounded-2xl p-4 flex items-center gap-3 text-left transition-all active:scale-[0.98]">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <LogOut size={18} className="text-muted-foreground" />
                </div>
                <span className="font-medium text-foreground">Sign out</span>
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-3xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Sign out?</AlertDialogTitle>
                <AlertDialogDescription>
                  You'll need to sign in again to access your space.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleSignOut} className="rounded-xl">
                  Sign out
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="w-full glass-card rounded-2xl p-4 flex items-center gap-3 text-left transition-all active:scale-[0.98] border border-destructive/20">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <Trash2 size={18} className="text-destructive" />
                </div>
                <div>
                  <span className="font-medium text-destructive">Reset all data</span>
                  <p className="text-xs text-muted-foreground">Erase everything and start fresh</p>
                </div>
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-3xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Reset all data?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently erase all your journal entries, habits, goals, moodboard, and settings. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleResetData}
                  className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Yes, reset everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Delete account */}
          <AlertDialog open={deleteOpen} onOpenChange={(open) => { setDeleteOpen(open); if (!open) setDeleteConfirm(''); }}>
            <AlertDialogTrigger asChild>
              <button className="w-full glass-card rounded-2xl p-4 flex items-center gap-3 text-left transition-all active:scale-[0.98] border border-destructive/30">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle size={18} className="text-destructive" />
                </div>
                <div>
                  <span className="font-medium text-destructive">Delete my account</span>
                  <p className="text-xs text-muted-foreground">Permanently remove all data and cancel subscription</p>
                </div>
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-3xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-destructive">Delete your account?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-3">
                  <p>This action is <strong>permanent and irreversible</strong>. The following will be deleted:</p>
                  <ul className="list-disc list-inside text-sm space-y-1 ml-1">
                    <li>All journal entries &amp; mood data</li>
                    <li>Habits, routines &amp; streaks</li>
                    <li>Vision board &amp; moodboard</li>
                    <li>AI conversation history &amp; memories</li>
                    <li>Health &amp; cycle data</li>
                    <li>Profile &amp; account information</li>
                  </ul>
                  <p>If you have an active subscription, it will be cancelled immediately.</p>
                  <div className="pt-2">
                    <label className="text-sm font-medium text-foreground">Type <span className="font-mono text-destructive">DELETE</span> to confirm</label>
                    <Input
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      placeholder="DELETE"
                      className="mt-1 rounded-xl"
                      autoComplete="off"
                    />
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl" disabled={isDeleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirm !== 'DELETE' || isDeleting}
                  className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? 'Deleting...' : 'Delete my account forever'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Legal links */}
          <div className="flex justify-center gap-4 pt-2 pb-4">
            <button onClick={() => navigate('/terms')} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms &amp; Conditions</button>
            <span className="text-xs text-muted-foreground">·</span>
            <button onClick={() => navigate('/privacy')} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</button>
          </div>
        </motion.div>
      </div>

      <BottomNav />

      <ManageSubscriptionDialog
        open={manageOpen}
        onOpenChange={setManageOpen}
        subscriptionEnd={subscriptionEnd}
        planLabel="uBloom Premium"
      />
    </div>
  );
}
