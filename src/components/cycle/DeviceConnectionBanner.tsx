import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const DEVICES = ['Apple Watch', 'Oura Ring', 'Whoop', 'Fitbit'];

export default function DeviceConnectionBanner() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="dark-accent-card p-5 rounded-2xl"
      >
        <h3 className="font-display text-white text-xl mb-1">Connect your devices</h3>
        <p className="text-sm text-white/70 mb-4">
          Let Ubi bring in the full picture — no manual logging
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {DEVICES.map((device) => (
            <button
              key={device}
              onClick={() => setOpen(true)}
              className="bg-white/15 hover:bg-white/25 transition-colors text-white text-sm rounded-full px-4 py-1.5"
            >
              {device}
            </button>
          ))}
        </div>

        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 text-white text-sm border border-white/30 rounded-full px-4 py-2 hover:bg-white/10 transition-colors"
        >
          <Plus size={14} />
          Connect a device
        </button>
      </motion.div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Coming soon</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed pt-2">
              Device integrations are coming soon. We're working on connecting Apple Watch, Oura Ring, Whoop, and Fitbit to give Ubi the full picture. Stay tuned.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setOpen(false)} className="rounded-full mt-2">
            Got it
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
