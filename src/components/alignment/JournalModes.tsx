import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pen, Mic, Video, Square, Play, Pause, RefreshCw, Sparkles, Loader2 } from 'lucide-react';
import { useUbiJournalPrompt } from '@/hooks/useUbiJournalPrompt';
import { useUserStore } from '@/stores/userStore';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { track } from '@/hooks/useAnalytics';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';

type Mode = 'write' | 'voice' | 'video';

function formatDuration(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function JournalModes() {
  const addJournalEntry = useUserStore((s) => s.addJournalEntry);
  const { prompt, loading, refresh, context } = useUbiJournalPrompt();

  const [mode, setMode] = useState<Mode>('write');
  const [text, setText] = useState('');
  const [savedFlash, setSavedFlash] = useState(false);

  // Voice
  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startTimeRef = useRef<number>(0);
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, [recordedUrl]);

  const handleSaveWrite = () => {
    if (!text.trim()) return;
    addJournalEntry({ content: text, date: new Date().toISOString() });
    track('journal_created', { mode: 'write', wordCount: text.trim().split(/\s+/).length });
    setText('');
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2400);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(blob);
        setRecordedUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      startTimeRef.current = Date.now();
      setDuration(0);
      tickRef.current = window.setInterval(() => {
        setDuration((Date.now() - startTimeRef.current) / 1000);
      }, 250);
      setRecording(true);
    } catch (e) {
      console.error('Could not start recording:', e);
      alert('Microphone access is needed to record a voice note.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    if (tickRef.current) window.clearInterval(tickRef.current);
    setRecording(false);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  const resetVoice = () => {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedBlob(null);
    setRecordedUrl(null);
    setDuration(0);
    setPlaying(false);
  };

  const handleSaveVoice = () => {
    if (!recordedBlob) return;
    const tag = `🎙️ Voice memo · ${formatDuration(duration)}`;
    const note = prompt ? `${tag}\nPrompt: ${prompt}` : tag;
    addJournalEntry({ content: note, date: new Date().toISOString() });
    track('journal_created', { mode: 'voice', durationSec: Math.round(duration) });
    resetVoice();
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2400);
  };

  const tabs: { value: Mode; label: string; Icon: typeof Pen }[] = [
    { value: 'write', label: 'Write', Icon: Pen },
    { value: 'voice', label: 'Voice', Icon: Mic },
    { value: 'video', label: 'Video', Icon: Video },
  ];

  // Ubi cycle prompt card
  const PromptCard = (
    <div className="rounded-2xl p-4 mb-4 bg-primary/15 border border-primary/20">
      <div className="flex items-center gap-2 mb-2">
        <img src={logo} alt="Ubi" className="w-5 h-5 object-contain" />
        <span className="text-xs font-medium text-foreground/80">Ubi — based on your cycle + mood</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {context.cycleDay != null && context.cyclePhase && (
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-background/60 text-foreground/70">
            Day {context.cycleDay} · {context.cyclePhase}
          </span>
        )}
        {context.mood && (
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-background/60 text-foreground/70">
            {context.mood}
          </span>
        )}
      </div>
      {loading ? (
        <div className="h-6 rounded bg-foreground/10 animate-pulse" />
      ) : (
        <p className="font-display italic text-base leading-snug text-foreground">
          {prompt || 'Take a breath. What feels true for you right now?'}
        </p>
      )}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card rounded-3xl p-5"
    >
      {/* Mode tabs */}
      <div className="flex gap-1.5 mb-4">
        {tabs.map(({ value, label, Icon }) => {
          const active = mode === value;
          return (
            <button
              key={value}
              onClick={() => setMode(value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                active
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-background/60 text-muted-foreground hover:bg-primary/10'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {mode === 'write' && (
          <motion.div key="write" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {PromptCard}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write freely, this is just for you..."
              className="journal-input"
              rows={4}
            />
            <div className="flex items-center justify-between mt-3">
              <button
                onClick={refresh}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors disabled:opacity-40"
              >
                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                New prompt
              </button>
              <button
                onClick={handleSaveWrite}
                disabled={!text.trim()}
                className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 transition-all hover:shadow-md"
              >
                {savedFlash ? 'Saved ✓' : 'Save entry'}
              </button>
            </div>
          </motion.div>
        )}

        {mode === 'voice' && (
          <motion.div key="voice" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {PromptCard}
            <div className="flex flex-col items-center py-4">
              {!recordedBlob ? (
                <>
                  <motion.button
                    onClick={recording ? stopRecording : startRecording}
                    whileTap={{ scale: 0.95 }}
                    animate={recording ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                    transition={recording ? { duration: 1.4, repeat: Infinity } : undefined}
                    className={`w-20 h-20 rounded-full flex items-center justify-center text-primary-foreground shadow-lg transition-colors ${
                      recording ? 'bg-destructive' : 'bg-primary'
                    }`}
                  >
                    {recording ? <Square size={28} fill="currentColor" /> : <Mic size={32} />}
                  </motion.button>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {recording ? `Recording · ${formatDuration(duration)}` : 'Tap to record'}
                  </p>
                </>
              ) : (
                <div className="w-full">
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted">
                    <button
                      onClick={togglePlay}
                      className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                    >
                      {playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                    </button>
                    <div className="flex-1">
                      <div className="h-1.5 rounded-full bg-background overflow-hidden">
                        <div className="h-full bg-primary/60" style={{ width: '100%' }} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{formatDuration(duration)}</p>
                    </div>
                    <button
                      onClick={resetVoice}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Re-record
                    </button>
                  </div>
                  {recordedUrl && (
                    <audio
                      ref={audioRef}
                      src={recordedUrl}
                      onEnded={() => setPlaying(false)}
                      className="hidden"
                    />
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center justify-end mt-2">
              <button
                onClick={handleSaveVoice}
                disabled={!recordedBlob}
                className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 transition-all hover:shadow-md"
              >
                {savedFlash ? 'Saved ✓' : 'Save entry'}
              </button>
            </div>
          </motion.div>
        )}

        {mode === 'video' && (
          <motion.div key="video" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="rounded-2xl bg-muted/50 border border-dashed border-border p-8 flex flex-col items-center text-center opacity-70">
              <Video size={32} className="text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Video journalling coming soon</p>
              <p className="text-xs text-muted-foreground/70 mt-1">We're cooking it gently — your face will be safe here.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
