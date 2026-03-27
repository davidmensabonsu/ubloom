import { useState } from 'react';
import { motion } from 'framer-motion';
import { wonderResources, type WonderResource } from '@/lib/wonderResources';
import ResourceCard from './ResourceCard';
import ResourceDetailSheet from './ResourceDetailSheet';

const hygieneTopics = [
  { key: 'all', label: 'All' },
  { key: 'body', label: 'Body' },
  { key: 'skin', label: 'Skin & Face' },
  { key: 'hair', label: 'Hair' },
  { key: 'oral', label: 'Oral & Lips' },
  { key: 'fragrance', label: 'Fragrance' },
  { key: 'hands-feet', label: 'Hands & Feet' },
] as const;

type TopicKey = (typeof hygieneTopics)[number]['key'];

const topicTagMap: Record<Exclude<TopicKey, 'all'>, string[]> = {
  body: ['morning', 'shower', 'freshness', 'confidence', 'daily', 'intimate care', 'body', 'exfoliation', 'shaving', 'bedtime'],
  skin: ['skincare', 'glow', 'facial'],
  hair: ['hair', 'beauty'],
  'oral': ['dental', 'smile', 'health', 'lips'],
  fragrance: ['fragrance'],
  'hands-feet': ['nails', 'hands', 'grooming', 'feet', 'self-care'],
};

export default function HygieneSection() {
  const [activeTopic, setActiveTopic] = useState<TopicKey>('all');
  const [selectedResource, setSelectedResource] = useState<WonderResource | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const allHygiene = wonderResources.filter((r) => r.category === 'hygiene');

  const filtered = activeTopic === 'all'
    ? allHygiene
    : allHygiene.filter((r) =>
        r.tags.some((t) => topicTagMap[activeTopic].includes(t))
      );

  const handleSelect = (r: WonderResource) => {
    setSelectedResource(r);
    setSheetOpen(true);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {hygieneTopics.map((topic) => (
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
        <p className="text-sm text-muted-foreground text-center py-6">No tips in this category yet.</p>
      )}

      <ResourceDetailSheet
        resource={selectedResource}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
