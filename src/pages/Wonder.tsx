import { useState } from 'react';
import { motion } from 'framer-motion';
import ProfileButton from '@/components/ProfileButton';
import BottomNav from '@/components/BottomNav';
import RecommendedSection from '@/components/wonder/RecommendedSection';
import ResourceCard from '@/components/wonder/ResourceCard';
import ResourceDetailSheet from '@/components/wonder/ResourceDetailSheet';
import { wonderResources, wonderCategories, type WonderResource, type WonderCategory } from '@/lib/wonderResources';

export default function Wonder() {
  const [selectedResource, setSelectedResource] = useState<WonderResource | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<WonderCategory | 'all'>('all');

  const handleSelectResource = (resource: WonderResource) => {
    setSelectedResource(resource);
    setSheetOpen(true);
  };

  const filteredResources = activeCategory === 'all'
    ? wonderResources
    : wonderResources.filter((r) => r.category === activeCategory);

  return (
    <div className="min-h-screen gradient-background pb-24">
      {/* Header */}
      <div className="px-5 pt-12 pb-6">
        <div className="flex items-center justify-between">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="page-title"
          >
            Wonder
          </motion.h1>
          <ProfileButton />
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="subtle-text mt-1"
        >
          Everything you need to become her
        </motion.p>
      </div>

      <div className="px-5 space-y-6">
        {/* Recommended Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card rounded-3xl p-5"
        >
          <RecommendedSection onSelectResource={handleSelectResource} />
        </motion.div>

        {/* Explore Library */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-4"
        >
          <h2 className="section-title">Explore All Resources</h2>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            <button
              onClick={() => setActiveCategory('all')}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeCategory === 'all'
                  ? 'bg-primary/15 text-foreground ring-1 ring-primary/50'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted'
              }`}
            >
              All
            </button>
            {wonderCategories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${
                  activeCategory === cat.key
                    ? 'bg-primary/15 text-foreground ring-1 ring-primary/50'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                }`}
              >
                <span>{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Resource Grid */}
          <div className="space-y-2">
            {filteredResources.map((resource, i) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
              >
                <ResourceCard resource={resource} onTap={() => handleSelectResource(resource)} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <ResourceDetailSheet
        resource={selectedResource}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />

      <BottomNav />
    </div>
  );
}
