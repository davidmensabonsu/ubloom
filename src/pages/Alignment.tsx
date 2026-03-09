import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { useUserStore } from '@/stores/userStore';
import { Sparkles, Heart, Feather, BookOpen, ChevronDown, Search, X, Calendar } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import MoodTrendsChart from '@/components/alignment/MoodTrendsChart';
import { useHomeMessages } from '@/hooks/useHomeMessages';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { format, isSameMonth, isSameDay } from 'date-fns';

const feelingOptions = [
{ value: 'calm', label: 'Calm', emoji: '🌿' },
{ value: 'energized', label: 'Energized', emoji: '⚡' },
{ value: 'grateful', label: 'Grateful', emoji: '💕' },
{ value: 'creative', label: 'Creative', emoji: '🎨' },
{ value: 'peaceful', label: 'Peaceful', emoji: '🕊️' },
{ value: 'confident', label: 'Confident', emoji: '👑' },
{ value: 'grounded', label: 'Grounded', emoji: '🌱' },
{ value: 'joyful', label: 'Joyful', emoji: '✨' },
{ value: 'anxious', label: 'Anxious', emoji: '😰' },
{ value: 'sad', label: 'Sad', emoji: '💧' },
{ value: 'overwhelmed', label: 'Overwhelmed', emoji: '🌊' },
{ value: 'frustrated', label: 'Frustrated', emoji: '😤' },
{ value: 'tired', label: 'Tired', emoji: '😴' },
{ value: 'lonely', label: 'Lonely', emoji: '🥀' },
{ value: 'numb', label: 'Numb', emoji: '🫥' },
{ value: 'hopeful', label: 'Hopeful', emoji: '🌅' }];


export default function Alignment() {
  const { profile, addJournalEntry, addMoodEntry } = useUserStore();
  const { futureSelfMessage, loading: messageLoading } = useHomeMessages();
  const [selectedFeelings, setSelectedFeelings] = useState<string[]>([]);
  const [feelingsExpanded, setFeelingsExpanded] = useState(false);
  const [journalText, setJournalText] = useState('');
  const [saved, setSaved] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Get unique months from journal entries
  const availableMonths = useMemo(() => {
    const months = new Map<string, Date>();
    profile.journalEntries.forEach((entry) => {
      const date = new Date(entry.date);
      const monthKey = format(date, 'yyyy-MM');
      if (!months.has(monthKey)) {
        months.set(monthKey, date);
      }
    });
    return Array.from(months.entries()).
    sort((a, b) => b[0].localeCompare(a[0])) // Most recent first
    .map(([key, date]) => ({
      key,
      label: format(date, 'MMMM yyyy'),
      date
    }));
  }, [profile.journalEntries]);

  // Get unique dates within selected month
  const availableDates = useMemo(() => {
    if (!selectedMonth) return [];
    const dates = new Map<string, Date>();
    profile.journalEntries.forEach((entry) => {
      const date = new Date(entry.date);
      const monthKey = format(date, 'yyyy-MM');
      if (monthKey === selectedMonth) {
        const dateKey = format(date, 'yyyy-MM-dd');
        if (!dates.has(dateKey)) {
          dates.set(dateKey, date);
        }
      }
    });
    return Array.from(dates.entries()).
    sort((a, b) => b[0].localeCompare(a[0])) // Most recent first
    .map(([key, date]) => ({
      key,
      label: format(date, 'EEE, MMM d'),
      date
    }));
  }, [profile.journalEntries, selectedMonth]);

  // Filter journal entries based on search and date
  const filteredEntries = useMemo(() => {
    return profile.journalEntries.filter((entry) => {
      const entryDate = new Date(entry.date);
      const matchesSearch = searchQuery.trim() === '' ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase());

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

  const toggleFeeling = (value: string) => {
    if (selectedFeelings.includes(value)) {
      setSelectedFeelings(selectedFeelings.filter((f) => f !== value));
    } else if (selectedFeelings.length < 3) {
      setSelectedFeelings([...selectedFeelings, value]);
    }
  };

  const handleSave = () => {
    if (selectedFeelings.length > 0) {
      addMoodEntry(selectedFeelings);
    }
    if (journalText.trim()) {
      addJournalEntry({
        content: journalText,
        date: new Date().toISOString(),
        mood: selectedFeelings[0]
      });
      setJournalText(''); // Clear the input after saving
    }
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setSelectedFeelings([]); // Reset feelings after save
    }, 2000);
  };

  const formatEntryDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatEntryTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen gradient-background pb-24">
      {/* Header */}
      <div className="px-5 pt-12 pb-6">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-muted-foreground mb-1">
          
          {todayFormatted}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="page-title">
          
          Daily Alignment
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="subtle-text mt-1">
          
          A quiet moment before your day unfolds
        </motion.p>
      </div>

      {/* Content */}
      <div className="px-5 space-y-6">
        {/* How do you want to feel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-3xl p-5">
          
          <div className="flex items-center gap-2 mb-4">
            <Heart size={18} className="text-primary" />
            <h2 className="section-title">How did you  feel today?</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Choose up to 3</p>
          <div className="flex flex-wrap gap-2">
            {feelingOptions.slice(0, 8).map((feeling) =>
            <motion.button
              key={feeling.value}
              onClick={() => toggleFeeling(feeling.value)}
              className={`mood-pill ${
              selectedFeelings.includes(feeling.value) ? 'selected' : ''}`
              }
              whileTap={{ scale: 0.95 }}>
                <span>{feeling.emoji}</span>
                <span>{feeling.label}</span>
              </motion.button>
            )}
            <AnimatePresence>
              {(feelingsExpanded || selectedFeelings.some(f => feelingOptions.slice(8).map(o => o.value).includes(f))) &&
                feelingOptions.slice(8).map((feeling) =>
                <motion.button
                  key={feeling.value}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => toggleFeeling(feeling.value)}
                  className={`mood-pill ${
                  selectedFeelings.includes(feeling.value) ? 'selected' : ''}`
                  }
                  whileTap={{ scale: 0.95 }}>
                    <span>{feeling.emoji}</span>
                    <span>{feeling.label}</span>
                  </motion.button>
                )
              }
            </AnimatePresence>
          </div>
          <button
            onClick={() => setFeelingsExpanded(!feelingsExpanded)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mt-2">
            <motion.div animate={{ rotate: feelingsExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={14} />
            </motion.div>
            {feelingsExpanded ? 'Show less' : 'Show more'}
          </button>
        </motion.div>

        {/* Future Self Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-3xl p-5">
          
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-3xl p-5">
          
          <div className="flex items-center gap-2 mb-4">
            <Feather size={18} className="text-primary" />
            <h2 className="section-title">Private Journal</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            What's on your heart right now?
          </p>
          <textarea
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
            placeholder="Write freely, this is just for you..."
            className="journal-input"
            rows={5} />
          
        </motion.div>

        {/* Journal History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}>
          
          <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
            <CollapsibleTrigger className="w-full">
              <div className="glass-card rounded-3xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen size={18} className="text-primary" />
                  <span className="section-title text-sm">Journal History</span>
                </div>
                <motion.div
                  animate={{ rotate: historyOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}>
                  
                  <ChevronDown size={18} className="text-muted-foreground" />
                </motion.div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <AnimatePresence>
                {historyOpen &&
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-3 space-y-3">
                  
                    {/* Search and Filters */}
                    {profile.journalEntries.length > 0 &&
                  <div className="glass-card rounded-2xl p-4 space-y-3">
                        {/* Search Input */}
                        <div className="relative">
                          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <Input
                        type="text"
                        placeholder="Search entries..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-9 bg-background/50 border-primary/20 rounded-xl text-sm" />
                      
                          {searchQuery &&
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        
                              <X size={14} />
                            </button>
                      }
                        </div>

                        {/* Date Filter */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} className="text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">Filter by date</p>
                          </div>
                          
                          {/* Month Pills */}
                          <div className="flex flex-wrap gap-1.5">
                            {availableMonths.map((month) =>
                        <button
                          key={month.key}
                          onClick={() => {
                            if (selectedMonth === month.key) {
                              setSelectedMonth(null);
                              setSelectedDate(null);
                            } else {
                              setSelectedMonth(month.key);
                              setSelectedDate(null);
                            }
                          }}
                          className={`px-2.5 py-1 rounded-full text-xs transition-all ${
                          selectedMonth === month.key ?
                          'bg-primary text-primary-foreground' :
                          'bg-background/50 text-muted-foreground hover:bg-primary/10'}`
                          }>
                          
                                {month.label}
                              </button>
                        )}
                          </div>

                          {/* Date Pills (shown when month is selected) */}
                          {selectedMonth && availableDates.length > 0 &&
                      <div className="pt-2 space-y-1.5">
                              <p className="text-xs text-muted-foreground">Select a day</p>
                              <div className="flex flex-wrap gap-1.5">
                                {availableDates.map((date) =>
                          <button
                            key={date.key}
                            onClick={() => setSelectedDate(selectedDate === date.key ? null : date.key)}
                            className={`px-2.5 py-1 rounded-full text-xs transition-all ${
                            selectedDate === date.key ?
                            'bg-primary text-primary-foreground' :
                            'bg-background/50 text-muted-foreground hover:bg-primary/10'}`
                            }>
                            
                                    {date.label}
                                  </button>
                          )}
                              </div>
                            </div>
                      }
                        </div>

                        {/* Clear Filters */}
                        {hasActiveFilters &&
                    <button
                      onClick={clearFilters}
                      className="text-xs text-primary hover:underline flex items-center gap-1">
                      
                            <X size={12} />
                            Clear filters
                          </button>
                    }

                        {/* Results Count */}
                        <p className="text-xs text-muted-foreground">
                          {filteredEntries.length} of {profile.journalEntries.length} entries
                        </p>
                      </div>
                  }

                    {/* Empty State */}
                    {profile.journalEntries.length === 0 ?
                  <div className="glass-card rounded-2xl p-4 text-center">
                        <p className="text-sm text-muted-foreground italic">
                          Your past journal entries will appear here once you save your first alignment.
                        </p>
                      </div> :
                  filteredEntries.length === 0 ?
                  <div className="glass-card rounded-2xl p-4 text-center">
                        <p className="text-sm text-muted-foreground italic">
                          No entries match your filters.
                        </p>
                      </div> :

                  filteredEntries.map((entry, index) =>
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass-card rounded-2xl p-4">
                    
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-primary">
                              {formatEntryDate(entry.date)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatEntryTime(entry.date)}
                            </span>
                          </div>
                          <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                            {entry.content}
                          </p>
                          {entry.mood &&
                    <div className="mt-2 pt-2 border-t border-primary/10">
                              <span className="text-xs text-muted-foreground">
                                Mood: {feelingOptions.find((f) => f.value === entry.mood)?.emoji}{' '}
                                {feelingOptions.find((f) => f.value === entry.mood)?.label}
                              </span>
                            </div>
                    }
                        </motion.div>
                  )
                  }
                  </motion.div>
                }
              </AnimatePresence>
            </CollapsibleContent>
          </Collapsible>
        </motion.div>

        {/* Save button */}
        <motion.button
          onClick={handleSave}
          disabled={selectedFeelings.length === 0 && !journalText.trim()}
          className={`soft-button w-full flex items-center justify-center gap-2 ${
          selectedFeelings.length === 0 && !journalText.trim() ? 'opacity-50' : ''}`
          }
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}>
          
          {saved ?
          <>
              <span>Saved</span>
              <Heart size={18} className="fill-current" />
            </> :

          <>
              <span>Save & align</span>
              <Sparkles size={18} />
            </>
          }
        </motion.button>
      </div>

      <BottomNav />
    </div>);

}