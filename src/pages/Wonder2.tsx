import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Heart } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import ProfileButton from '@/components/ProfileButton';

import booksBanner from '@/assets/wonder2/books-banner.jpg';
import morningStretch from '@/assets/wonder2/morning-stretch.jpg';
import followAlong from '@/assets/wonder2/follow-along.jpg';
import skincare from '@/assets/wonder2/skincare.jpg';
import podcastImg from '@/assets/wonder2/podcast.jpg';

const circleCategories = [
  { label: 'Weight Loss', color: 'hsl(var(--primary) / 0.15)' },
  { label: 'Book Recs', color: 'hsl(var(--primary) / 0.12)' },
  { label: 'Hygiene Tips', color: 'hsl(var(--primary) / 0.1)' },
];

const circleCategories2 = [
  { label: 'Weight Tips' },
  { label: 'Wellness Routines' },
  { label: 'Book Recs' },
  { label: 'Hygiene Tips' },
];

type Tab = 'for-you' | 'popular';

export default function Wonder2() {
  const [tab, setTab] = useState<Tab>('for-you');
  const [saved, setSaved] = useState<Set<string>>(new Set());

  const toggleSave = (id: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'hsl(var(--background))' }}>
      {/* Search bar */}
      <div className="px-4 pt-12 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-3 rounded-full border border-border/40 bg-card/60 backdrop-blur-sm px-4 py-3">
            <Search size={18} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Search ideas...</span>
            <div className="ml-auto flex gap-1.5">
              <button
                onClick={() => setTab('for-you')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  tab === 'for-you'
                    ? 'bg-primary/15 text-foreground ring-1 ring-primary/40'
                    : 'text-muted-foreground'
                }`}
              >
                For you
              </button>
              <button
                onClick={() => setTab('popular')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  tab === 'popular'
                    ? 'bg-primary/15 text-foreground ring-1 ring-primary/40'
                    : 'text-muted-foreground'
                }`}
              >
                Popular
              </button>
            </div>
          </div>
          <ProfileButton />
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Books banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden bg-card border border-border/30"
        >
          <div className="flex items-center">
            <div className="flex-1 p-5 space-y-3">
              <h2 className="font-display text-xl font-bold text-foreground leading-tight">
                Books to Level Up Your Mindset
              </h2>
              <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border/50 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors">
                See all →
              </button>
            </div>
            <div className="w-40 h-32 shrink-0">
              <img src={booksBanner} alt="Books" className="w-full h-full object-cover rounded-r-2xl" />
            </div>
          </div>
        </motion.div>

        {/* Masonry grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Card: Morning Stretch — tall */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl overflow-hidden bg-card border border-border/30 relative"
          >
            <img src={morningStretch} alt="Morning stretches" className="w-full aspect-[3/4] object-cover" loading="lazy" />
            <div className="p-3 flex items-end justify-between">
              <p className="text-sm font-semibold text-foreground leading-tight">4 Good Morning Stretches</p>
              <button onClick={() => toggleSave('stretch')} className="shrink-0">
                <Heart
                  size={18}
                  className={saved.has('stretch') ? 'fill-primary text-primary' : 'text-primary/40'}
                />
              </button>
            </div>
          </motion.div>

          {/* Right column: Follow Along + circle categories */}
          <div className="space-y-3">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="rounded-2xl overflow-hidden bg-card border border-border/30 relative"
            >
              <div className="relative">
                <img src={followAlong} alt="Follow along" className="w-full aspect-square object-cover" loading="lazy" />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-card/70 backdrop-blur-sm text-xs font-medium text-foreground">
                  Follow Along
                </span>
                <button onClick={() => toggleSave('follow')} className="absolute top-3 right-3">
                  <Heart
                    size={16}
                    className={saved.has('follow') ? 'fill-primary text-primary' : 'text-primary/40'}
                  />
                </button>
              </div>
            </motion.div>

            {/* Small circle categories */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl bg-card border border-border/30 p-3"
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-2.5">
                  {circleCategories.map((c) => (
                    <div key={c.label} className="flex flex-col items-center gap-1.5">
                      <div
                        className="w-12 h-12 rounded-full"
                        style={{ backgroundColor: c.color }}
                      />
                      <span className="text-[10px] text-muted-foreground text-center leading-tight max-w-[48px]">
                        {c.label}
                      </span>
                    </div>
                  ))}
                </div>
                <Heart size={14} className="text-primary/40 mt-1" />
              </div>
            </motion.div>
          </div>

          {/* Circle categories card — left */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="rounded-2xl bg-card border border-border/30 p-3"
          >
            <div className="grid grid-cols-2 gap-2.5">
              {circleCategories2.map((c) => (
                <div key={c.label} className="flex flex-col items-center gap-1.5">
                  <div className="w-12 h-12 rounded-full bg-primary/10" />
                  <span className="text-[10px] text-muted-foreground text-center leading-tight">
                    {c.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Skincare card — right, tall */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="rounded-2xl overflow-hidden bg-card border border-border/30 row-span-2 relative"
          >
            <img src={skincare} alt="Skincare tips" className="w-full aspect-[3/4] object-cover" loading="lazy" />
            <div className="p-3 flex items-end justify-between">
              <p className="text-sm font-semibold text-foreground leading-tight">
                10 Skincare Tips to Get Glowing 🧴✨
              </p>
              <button onClick={() => toggleSave('skincare')} className="shrink-0">
                <Heart
                  size={18}
                  className={saved.has('skincare') ? 'fill-primary text-primary' : 'text-primary/40'}
                />
              </button>
            </div>
          </motion.div>

          {/* Podcast card — left */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="rounded-2xl overflow-hidden bg-card border border-border/30 relative"
          >
            <img src={podcastImg} alt="Podcasts" className="w-full aspect-square object-cover" loading="lazy" />
            <div className="p-3 flex items-end justify-between">
              <p className="text-sm font-semibold text-foreground leading-tight">
                Inspiring Podcast Episodes
              </p>
              <button onClick={() => toggleSave('podcast')} className="shrink-0">
                <Heart
                  size={18}
                  className={saved.has('podcast') ? 'fill-primary text-primary' : 'text-primary/40'}
                />
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
