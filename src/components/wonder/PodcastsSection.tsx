import { useState } from 'react';
import { motion } from 'framer-motion';
import { wonderResources, type WonderResource } from '@/lib/wonderResources';
import ResourceCard from './ResourceCard';
import ResourceDetailSheet from './ResourceDetailSheet';

const podcastTopics = [
  { key: 'all', label: 'All' },
  { key: 'mindset', label: 'Mindset' },
  { key: 'finance', label: 'Finance' },
  { key: 'creativity', label: 'Creativity' },
  { key: 'spirituality', label: 'Spirituality' },
  { key: 'wellness', label: 'Wellness' },
] as const;

type TopicKey = (typeof podcastTopics)[number]['key'];

const topicTagMap: Record<Exclude<TopicKey, 'all'>, string[]> = {
  mindset: ['mindset', 'growth', 'motivation', 'habits', 'confidence', 'greatness', 'success'],
  finance: ['finance', 'budgeting', 'independence', 'investing', 'wealth', 'ambition'],
  creativity: ['creativity', 'art', 'productivity', 'ideas'],
  spirituality: ['spirituality', 'purpose', 'mindfulness', 'wisdom', 'astrology', 'self-discovery'],
  wellness: ['vulnerability', 'healing', 'identity', 'mental health', 'lifestyle', 'beauty', 'wellness'],
};

export default function PodcastsSection() {
  const [activeTopic, setActiveTopic] = useState<TopicKey>('all');
  const [selectedResource, setSelectedResource] = useState<WonderResource | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const allPodcasts = wonderResources.filter((r) => r.category === 'podcasts');

  const filtered = activeTopic === 'all'
    ? allPodcasts
    : allPodcasts.filter((p) =>
        p.tags.some((t) => topicTagMap[activeTopic].includes(t))
      );

  const handleSelect = (r: WonderResource) => {
    setSelectedResource(r);
    setSheetOpen(true);
  };

  return (
    <div className="space-y-3">
      {/* Sub-tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {podcastTopics.map((topic) => (
          <button
            key={topic.key}
            onClick={() => setActiveTopic(topic.key)}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-colors ${
              activeTopic === topic.key
                ? 'bg-primary/15 text-foreground ring-1 ring-primary/50'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted'
            }`}
          >
            {topic.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3">
        {filtered.map((resource, i) => (
          <motion.div
            key={resource.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.03, 0.2) }}
          >
            <ResourceCard
              resource={resource}
              onTap={() => handleSelect(resource)}
              compact
            />
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">No podcasts in this topic yet.</p>
      )}

      <ResourceDetailSheet
        resource={selectedResource}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
