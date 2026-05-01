import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const STORAGE_KEY = 'ubloom-cookie-consent';

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(STORAGE_KEY);
    if (!accepted) setVisible(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-0 inset-x-0 z-[100] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
        >
          <div className="max-w-lg mx-auto glass-card rounded-2xl p-4 shadow-lg border border-border/50">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground font-medium mb-1">We value your privacy</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  uBloom uses only <strong>strictly necessary local storage</strong> to keep you logged in and remember your preferences. We don't use tracking cookies, advertising cookies, or any third-party analytics.{' '}
                  <Link to="/cookie-policy" className="text-primary hover:underline">Cookie Policy</Link>
                  {' · '}
                  <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                </p>
              </div>
              <button
                onClick={handleAccept}
                className="flex-shrink-0 mt-0.5 p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
            <button
              onClick={handleAccept}
              className="soft-button w-full mt-3 text-sm py-2"
            >
              Got it
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}