import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, CreditCard, ArrowDownCircle, Check, ExternalLink, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { track } from '@/hooks/useAnalytics';

interface ManageSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscriptionEnd?: string | null;
  planLabel?: string;
}

export default function ManageSubscriptionDialog({
  open,
  onOpenChange,
  subscriptionEnd,
  planLabel = 'uBloom Premium',
}: ManageSubscriptionDialogProps) {
  const { toast } = useToast();
  const [pendingFlow, setPendingFlow] = useState<'manage' | 'cancel' | null>(null);

  const openPortal = async (flow: 'manage' | 'cancel') => {
    if (pendingFlow) return;
    setPendingFlow(flow);
    track('manage_subscription_action', {
      action: flow,
      source: 'profile',
      page: '/profile',
    });

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        body: flow === 'cancel' ? { flow: 'cancel' } : {},
      });

      if (data?.url) {
        window.open(data.url, '_blank', 'noopener,noreferrer');
        onOpenChange(false);
        return;
      }

      if (data?.error === 'no_customer') {
        toast({
          title: 'No billing record yet',
          description:
            data.message ?? 'Once your subscription is active, you can manage billing here.',
        });
        return;
      }

      if (error) throw error;

      toast({
        title: 'Billing unavailable',
        description: 'We couldn’t open billing right now. Please try again in a moment.',
        variant: 'destructive',
      });
    } catch (err) {
      toast({
        title: 'Billing unavailable',
        description: err instanceof Error ? err.message : 'Please try again in a moment.',
        variant: 'destructive',
      });
    } finally {
      setPendingFlow(null);
    }
  };

  const renewLabel = subscriptionEnd
    ? new Date(subscriptionEnd).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[400px] p-0 overflow-hidden border-0 bg-transparent shadow-none"
      >
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="glass-card rounded-3xl p-6 space-y-5"
        >
          <DialogHeader className="space-y-3 text-center">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Crown size={22} className="text-primary" />
            </div>
            <DialogTitle className="font-display text-xl text-foreground">
              Manage your subscription
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              You're currently on{' '}
              <span className="font-semibold text-foreground">{planLabel}</span>
              {renewLabel ? <> · renews {renewLabel}</> : null}.
            </DialogDescription>
          </DialogHeader>

          {/* Premium summary card */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Crown size={14} className="text-primary" />
              <p className="text-sm font-semibold text-foreground">Premium perks</p>
            </div>
            <ul className="space-y-1.5">
              {[
                'Unlimited Ubi conversations',
                'Mood trends & cycle insights',
                'All Wonder resources unlocked',
              ].map((perk) => (
                <li
                  key={perk}
                  className="flex items-start gap-2 text-xs text-foreground/80"
                >
                  <Check size={12} className="text-primary mt-0.5 shrink-0" />
                  <span>{perk}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={() => openPortal('manage')}
              disabled={!!pendingFlow}
              className="w-full flex items-center gap-3 rounded-2xl bg-primary text-primary-foreground px-4 py-3 text-sm font-medium shadow-sm hover:opacity-95 transition disabled:opacity-60"
            >
              <CreditCard size={16} />
              <div className="flex-1 text-left">
                <p className="font-semibold">Manage billing & plan</p>
                <p className="text-[11px] opacity-80">
                  Update card, switch monthly/yearly, view invoices
                </p>
              </div>
              {pendingFlow === 'manage' ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <ExternalLink size={14} className="opacity-80" />
              )}
            </button>

            <button
              onClick={() => openPortal('cancel')}
              disabled={!!pendingFlow}
              className="w-full flex items-center gap-3 rounded-2xl bg-muted/60 hover:bg-muted text-foreground px-4 py-3 text-sm transition disabled:opacity-60"
            >
              <ArrowDownCircle size={16} className="text-muted-foreground" />
              <div className="flex-1 text-left">
                <p className="font-semibold">Switch to free</p>
                <p className="text-[11px] text-muted-foreground">
                  Cancel renewal — keep premium until {renewLabel ?? 'period end'}
                </p>
              </div>
              {pendingFlow === 'cancel' ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <ExternalLink size={14} className="opacity-60" />
              )}
            </button>
          </div>

          <p className="text-[11px] text-center text-muted-foreground/80">
            Billing is securely handled by Stripe. Changes apply instantly.
          </p>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}