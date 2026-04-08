import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { track } from '@/hooks/useAnalytics';
import { Plus, Image, Quote, Loader2 } from 'lucide-react';
import ProfileButton from '@/components/ProfileButton';
import { toast } from 'sonner';
import BottomNav from '@/components/BottomNav';
import AddQuoteDialog from '@/components/moodboard/AddQuoteDialog';
import MoodboardGrid from '@/components/moodboard/MoodboardGrid';
import { useUserStore, MoodboardItem } from '@/stores/userStore';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const BOARDS = [
  'Soft Life',
  'Travel Dreams',
  'Body Goals',
  'Love & Romance',
  'Career Vision',
  'Home Sanctuary',
];

export default function Moodboard() {
  const { user } = useAuth();
  const { profile, addMoodboardItem, removeMoodboardItem, reorderMoodboardItems } = useUserStore();
  const items = profile.moodboardItems || [];

  const [selectedBoard, setSelectedBoard] = useState<string>('All');
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteBoard, setQuoteBoard] = useState(BOARDS[0]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredItems =
    selectedBoard === 'All'
      ? items
      : items.filter((i) => i.board === selectedBoard);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${user.id}/moodboard/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('vision-images')
        .upload(path, file);

      if (uploadError) throw uploadError;

      const { data: signedData } = await supabase.storage
        .from('vision-images')
        .createSignedUrl(path, 31536000); // 1 year

      const signedUrl = signedData?.signedUrl;
      if (!signedUrl) throw new Error('Failed to get signed URL');

      addMoodboardItem({
        type: 'image',
        content: signedUrl,
        board: selectedBoard === 'All' ? BOARDS[0] : selectedBoard,
      });

      toast.success('Image added!');
    } catch (err: any) {
      console.error(err);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = async (item: MoodboardItem) => {
    removeMoodboardItem(item.id);

    if (item.type === 'image' && item.content.includes('vision-images') && user) {
      try {
        const url = new URL(item.content);
        const pathParts = url.pathname.split('/vision-images/');
        if (pathParts[1]) {
          await supabase.storage
            .from('vision-images')
            .remove([decodeURIComponent(pathParts[1])]);
        }
      } catch {
        // best-effort delete
      }
    }
  };

  const handleAddQuote = (text: string) => {
    addMoodboardItem({ type: 'quote', content: text, board: quoteBoard });
    toast.success('Quote added!');
  };

  return (
    <div className="min-h-screen gradient-background pb-24">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="page-title"
          >
            Your Moodboard
          </motion.h1>
          <ProfileButton />
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="subtle-text mt-1"
        >
          A visual space to manifest your dreams
        </motion.p>
      </div>

      {/* Board filter chips */}
      <div className="px-5 mb-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2">
          {['All', ...BOARDS].map((b) => (
            <button
              key={b}
              onClick={() => setSelectedBoard(b)}
              className={`text-xs whitespace-nowrap px-3 py-1.5 rounded-full border transition-colors ${
                selectedBoard === b
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-primary/20 text-muted-foreground hover:bg-muted'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-5">
        {filteredItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-3xl p-8 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-glow flex items-center justify-center mx-auto mb-4">
              <Image size={28} className="text-primary" />
            </div>
            <h2 className="section-title mb-2">Start Your Moodboard</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
              Collect images, quotes, and inspiration that represent the life you're creating
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="soft-button flex items-center justify-center gap-2"
              >
                {uploading ? <Loader2 size={18} className="animate-spin" /> : <Image size={18} />}
                <span>{uploading ? 'Uploading…' : 'Add Image'}</span>
              </button>
              <button
                onClick={() => setQuoteOpen(true)}
                className="w-full py-3 px-6 rounded-full border border-primary/30 text-primary font-medium flex items-center justify-center gap-2 transition-colors hover:bg-glow"
              >
                <Quote size={18} />
                <span>Add Quote</span>
              </button>
            </div>
          </motion.div>
        ) : (
          <MoodboardGrid items={filteredItems} onRemove={handleRemove} onReorder={reorderMoodboardItems} />
        )}
      </div>

      {/* FAB */}
      {filteredItems.length > 0 && (
        <div className="fixed bottom-28 right-5 flex flex-col gap-2 z-30">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center"
          >
            {uploading ? <Loader2 size={20} className="animate-spin" /> : <Image size={20} />}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setQuoteOpen(true)}
            className="w-12 h-12 rounded-full bg-muted border border-primary/20 text-primary shadow-lg flex items-center justify-center"
          >
            <Quote size={20} />
          </motion.button>
        </div>
      )}

      <AddQuoteDialog
        open={quoteOpen}
        onOpenChange={setQuoteOpen}
        onAdd={handleAddQuote}
        boards={BOARDS}
        selectedBoard={quoteBoard}
        onBoardChange={setQuoteBoard}
      />

      <BottomNav />
    </div>
  );
}
