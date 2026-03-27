import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/stores/userStore';
import { Sparkles, Feather, BookOpen, ChevronDown, Search, X, Calendar, Trash2, Infinity, Heart, MessageCircle } from 'lucide-react';
import ProfileButton from '@/components/ProfileButton';
import BottomNav from '@/components/BottomNav';
import MoodTrendsChart from '@/components/alignment/MoodTrendsChart';
import MoodStreak from '@/components/alignment/MoodStreak';
import { useHomeMessages } from '@/hooks/useHomeMessages';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { feelingIcons } from '@/lib/moodIcons';

const feelingOptions = [
  { value: 'calm', label: 'Calm' },
  { value: 'energized', label: 'Energized' },
  { value: 'grateful', label: 'Grateful' },
  { value: 'creative', label: 'Creative' },
  { value: 'peaceful', label: 'Peaceful' },
  { value: 'confident', label: 'Confident' },
  { value: 'grounded', label: 'Grounded' },
  { value: 'joyful', label: 'Joyful' },
  { value: 'anxious', label: 'Anxious' },
  { value: 'sad', label: 'Sad' },
  { value: 'overwhelmed', label: 'Overwhelmed' },
  { value: 'frustrated', label: 'Frustrated' },
  { value: 'tired', label: 'Tired' },
  { value: 'lonely', label: 'Lonely' },
  { value: 'numb', label: 'Numb' },
  { value: 'hopeful', label: 'Hopeful' },
];

export default function Alignment() {
  const navigate = useNavigate();
  const { profile, addJournalEntry, removeJournalEntry } = useUserStore();
  const { futureSelfMessage, loading: messageLoading } = useHomeMessages();
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [journalText, setJournalText] = useState('');
  const [savedText, setSavedText] = useState('');
  const [saved, setSaved] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const availableMonths = useMemo(() => {
    const months = new Map<string, Date>();
    profile.journalEntries.forEach((entry) => {
      const date = new Date(entry.date);
      const monthKey = format(date, 'yyyy-MM');
      if (!months.has(monthKey)) months.set(monthKey, date);
    });
    return Array.from(months.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([key, date]) => ({ key, label: format(date, 'MMMM yyyy'), date }));
  }, [profile.journalEntries]);

  const availableDates = useMemo(() => {
    if (!selectedMonth) return [];
    const dates = new Map<string, Date>();
    profile.journalEntries.forEach((entry) => {
      const date = new Date(entry.date);
      if (format(date, 'yyyy-MM') === selectedMonth) {
        const dateKey = format(date, 'yyyy-MM-dd');
        if (!dates.has(dateKey)) dates.set(dateKey, date);
      }
    });
    return Array.from(dates.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([key, date]) => ({ key, label: format(date, 'EEE, MMM d'), date }));
  }, [profile.journalEntries, selectedMonth]);

  const filteredEntries = useMemo(() => {
    return profile.journalEntries.filter((entry) => {
      const entryDate = new Date(entry.date);
      const matchesSearch = searchQuery.trim() === '' || entry.content.toLowerCase().includes(searchQuery.toLowerCase());
      let matchesDate = true;
      if (selectedDate) {
        matchesDate = format(entryDate, 'yyyy-MM-dd') === selectedDate;
      } else if (selectedMonth) {
        matchesDate = format(entryDate, 'yyyy-MM') === selectedMonth;
      }
      return matchesSearch && matchesDate;
    });
  }, [profile.journalEntries, searchQuery, selectedMonth, selectedDate]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedMonth(null);
    setSelectedDate(null);
  };

  const hasActiveFilters = searchQuery.trim() !== '' || selectedMonth !== null;

  const handleSave = () => {
    if (journalText.trim()) {
      setSavedText(journalText);
      addJournalEntry({
        content: journalText,
        date: new Date().toISOString(),
      });
      setJournalText('');
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
  };

  const handleTalkToUbi = () => {
    navigate('/ubi', { state: { journalEntry: savedText } });
  };

  const formatEntryDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatEntryTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const todayFormatted = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen gradient-background pb-24">
      <div className="px-5 pt-12 pb-6">
        <div className="flex items-center justify-between mb-1">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-muted-foreground">
            {todayFormatted}
          </motion.p>
          <ProfileButton />
        </div>
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="page-title">
          Daily Reflect
        </motion.h1>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex items-center justify-between">
          <p className="subtle-text">A quiet moment before your day unfolds</p>
          <MoodStreak moodHistory={profile.moodHistory} />
        </motion.div>
      </div>

      <div className="px-5 space-y-6">
        {/* Future Self Message */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-3xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={18} className="text-primary" />
            <h2 className="section-title">From your future self</h2>
          </div>
          <p className="font-display text-lg leading-relaxed text-foreground/90 italic">
            {messageLoading ? (
              <span className="animate-pulse text-muted-foreground">Listening to your future self...</span>
            ) : (
              `"${futureSelfMessage}"`
            )}
          </p>
        </motion.div>

        {/* Mood Trends Chart */}
        <MoodTrendsChart moodHistory={profile.moodHistory} />

        {/* Journal */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-3xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Feather size={18} className="text-primary" />
            <h2 className="section-title">Private Journal</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">What's on your heart right now?</p>
          <textarea
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
            placeholder="Write freely, this is just for you..."
            className="journal-input"
            rows={5}
          />
        </motion.div>

        {/* Save button + Talk to Ubi */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <motion.button
            onClick={handleSave}
            disabled={!journalText.trim()}
            className={`soft-button w-full flex items-center justify-center gap-2 ${!journalText.trim() ? 'opacity-50' : ''}`}
            whileTap={{ scale: 0.98 }}
          >
            {saved ? (
              <>
                <span>Saved</span>
                <Heart size={18} className="fill-current" />
              </>
            ) : (
              <>
                <span>Save journal entry</span>
                <Infinity size={18} />
              </>
            )}
          </motion.button>

          <AnimatePresence>
            {saved && savedText && (
              <motion.button
                onClick={handleTalkToUbi}
                className="soft-button w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary/15 to-accent/15 border-2 border-primary/30 text-primary font-medium shadow-sm"
                initial={{ opacity: 0, y: 10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.3 }}
                whileTap={{ scale: 0.98 }}
              >
                <MessageCircle size={18} />
                <span>Talk to Ubi about this</span>
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Journal History */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
      </div>

      <BottomNav />
    </div>
  );
}
