import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, FileText, Cookie, ArrowRight } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import logo from '@/assets/logo.png';

const SECTIONS = [
  {
    icon: FileText,
    title: 'Terms & Conditions',
    summary: 'The ground rules for using uBloom — your rights, our responsibilities, and how the service works.',
    link: '/terms',
  },
  {
    icon: Cookie,
    title: 'Cookie Policy',
    summary: 'How we use local storage to keep you logged in — and what we don\'t track (spoiler: nothing).',
    link: '/cookie-policy',
  },
  {
    icon: Shield,
    title: 'Privacy Policy',
    summary: 'What personal data we collect, why we collect it, and how we keep it safe. You are always in control.',
    link: '/privacy',
  },
];

export default function LegalConsent() {
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();
  const updateProfile = useUserStore((s) => s.updateProfile);

  const handleAccept = () => {
    updateProfile({ legalConsentDate: new Date().toISOString() });
    navigate('/onboarding', { replace: true });
  };

  return (
    <div className="min-h-screen gradient-background flex flex-col items-center px-5 py-10 pb-24 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-24 h-24 rounded-full bg-primary/10 blur-3xl animate-pulse" />
      <div className="absolute bottom-32 right-8 w-32 h-32 rounded-full bg-glow-strong/20 blur-3xl animate-pulse" />

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <img alt="uBloom logo" className="w-16 h-16 mx-auto mb-3 drop-shadow-lg object-contain clay-icon" src={logo} />
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">Before you begin</h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
            Your trust matters to us. Please take a moment to review how we look after you and your data.
          </p>
        </div>

        {/* Policy cards */}
        <div className="space-y-3 mb-8">
          {SECTIONS.map(({ icon: Icon, title, summary, link }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to={link}
                className="glass-card rounded-2xl p-4 flex items-start gap-3 group hover:bg-muted/30 transition-colors block"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon size={18} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {title}
                    <span className="text-primary ml-1 text-xs">→</span>
                  </h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">{summary}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Consent checkbox */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <label className="flex items-start gap-3 cursor-pointer mb-6 px-1">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border accent-primary flex-shrink-0"
            />
            <span className="text-sm text-muted-foreground leading-snug">
              I have read and agree to the{' '}
              <Link to="/terms" className="text-primary hover:underline">Terms & Conditions</Link>,{' '}
              <Link to="/cookie-policy" className="text-primary hover:underline">Cookie Policy</Link>, and{' '}
              <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
            </span>
          </label>

          <motion.button
            onClick={handleAccept}
            disabled={!agreed}
            className="soft-button w-full flex items-center justify-center gap-2 text-base disabled:opacity-40 disabled:pointer-events-none"
            whileTap={{ scale: 0.98 }}
          >
            <span>Continue</span>
            <ArrowRight size={18} />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}