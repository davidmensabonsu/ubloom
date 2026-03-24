import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { useUserStore } from '@/stores/userStore';
import { Sparkles, Feather, BookOpen, ChevronDown, Search, X, Calendar, Trash2, Infinity, Heart } from 'lucide-react';
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
  const { profile, addJournalEntry, removeJournalEntry } = useUserStore();
  const { futureSelfMessage, loading: messageLoading } = useHomeMessages();
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [journalText, setJournalText] = useState('');
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
      addJournalEntry({
        content: journalText,
        date: new Date().toISOString(),
      });
      setJournalText('');
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
          Daily Alignment
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

        {/* Journal History */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
            <CollapsibleTrigger className="w-full">
              <div className="glass-card rounded-3xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen size={18} className="text-primary" />
                  <span className="section-title text-sm">Journal History</span>
                </div>
                <motion.div animate={{ rotate: historyOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={18} className="text-muted-foreground" />
                </motion.div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <AnimatePresence>
                {historyOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-3 space-y-3"
                  >
                    {profile.journalEntries.length > 0 && (
                      <div className="glass-card rounded-2xl p-4 space-y-3">
                        <div className="relative">
                          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            type="text"
                            placeholder="Search entries..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-9 bg-background/50 border-primary/20 rounded-xl text-sm"
                          />
                          {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                              <X size={14} />
                            </button>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} className="text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">Filter by date</p>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {availableMonths.map((month) => (
                              <button
                                key={month.key}
                                onClick={() => {
                                  if (selectedMonth === month.key) { setSelectedMonth(null); setSelectedDate(null); }
                                  else { setSelectedMonth(month.key); setSelectedDate(null); }
                                }}
                                className={`px-2.5 py-1 rounded-full text-xs transition-all ${selectedMonth === month.key ? 'bg-primary text-primary-foreground' : 'bg-background/50 text-muted-foreground hover:bg-primary/10'}`}
                              >
                                {month.label}
                              </button>
                            ))}
                          </div>
                          {selectedMonth && availableDates.length > 0 && (
                            <div className="pt-2 space-y-1.5">
                              <p className="text-xs text-muted-foreground">Select a day</p>
                              <div className="flex flex-wrap gap-1.5">
                                {availableDates.map((date) => (
                                  <button
                                    key={date.key}
                                    onClick={() => setSelectedDate(selectedDate === date.key ? null : date.key)}
                                    className={`px-2.5 py-1 rounded-full text-xs transition-all ${selectedDate === date.key ? 'bg-primary text-primary-foreground' : 'bg-background/50 text-muted-foreground hover:bg-primary/10'}`}
                                  >
                                    {date.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        {hasActiveFilters && (
                          <button onClick={clearFilters} className="text-xs text-primary hover:underline flex items-center gap-1">
                            <X size={12} />
                            Clear filters
                          </button>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {filteredEntries.length} of {profile.journalEntries.length} entries
                        </p>
                      </div>
                    )}

                    {profile.journalEntries.length === 0 ? (
                      <div className="glass-card rounded-2xl p-4 text-center">
                        <p className="text-sm text-muted-foreground italic">Your past journal entries will appear here once you save your first alignment.</p>
                      </div>
                    ) : filteredEntries.length === 0 ? (
                      <div className="glass-card rounded-2xl p-4 text-center">
                        <p className="text-sm text-muted-foreground italic">No entries match your filters.</p>
                      </div>
                    ) : (
                      filteredEntries.map((entry, index) => (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="glass-card rounded-2xl p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-primary">{formatEntryDate(entry.date)}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">{formatEntryTime(entry.date)}</span>
                              {entryToDelete === entry.id ? (
                                <div className="flex items-center gap-1">
                                  <button onClick={() => { removeJournalEntry(entry.id); setEntryToDelete(null); }} className="text-xs px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground">Delete</button>
                                  <button onClick={() => setEntryToDelete(null)} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Cancel</button>
                                </div>
                              ) : (
                                <button onClick={() => setEntryToDelete(entry.id)} className="text-muted-foreground/50 hover:text-destructive transition-colors">
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                          {entry.mood && (
                            <div className="mt-2 pt-2 border-t border-primary/10">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                Mood:{' '}
                                {feelingIcons[entry.mood] && <img src={feelingIcons[entry.mood]} alt="" className="w-4 h-4 object-contain inline" style={{ filter: 'none' }} />}{' '}
                                {feelingOptions.find((f) => f.value === entry.mood)?.label}
                              </span>
                            </div>
                          )}
                        </motion.div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </CollapsibleContent>
          </Collapsible>
        </motion.div>

        {/* Save button */}
        <motion.button
          onClick={handleSave}
          disabled={!journalText.trim()}
          className={`soft-button w-full flex items-center justify-center gap-2 ${!journalText.trim() ? 'opacity-50' : ''}`}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
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
      </div>

      <BottomNav />
    </div>
  );
}
