import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pen, Mic, Video, Square, Play, Pause, RefreshCw, Sparkles, Loader2, Lock, RotateCcw } from 'lucide-react';
import { useUbiJournalPrompt } from '@/hooks/useUbiJournalPrompt';
import { useUserStore } from '@/stores/userStore';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { track } from '@/hooks/useAnalytics';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';
import { useSubscription } from '@/hooks/useSubscription';
import UpgradeModal from '@/components/UpgradeModal';
import { useNavigate } from 'react-router-dom';

const FREE_JOURNAL_MONTHLY_CAP = 10;

type Mode = 'write' | 'voice' | 'video';

function formatDuration(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function JournalModes() {
  const addJournalEntry = useUserStore((s) => s.addJournalEntry);
  const journalEntries = useUserStore((s) => s.profile.journalEntries) || [];
  const { prompt, loading, refresh, context } = useUbiJournalPrompt();
  const { isPremium } = useSubscription();
  const navigate = useNavigate();
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  // Count entries created in the current calendar month
  const monthlyCount = (() => {
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return journalEntries.filter((e) => (e.date || '').startsWith(ym)).length;
  })();
  const reachedFreeJournalCap = !isPremium && monthlyCount >= FREE_JOURNAL_MONTHLY_CAP;

  const [mode, setMode] = useState<Mode>('write');
  const [text, setText] = useState('');
  const [savedFlash, setSavedFlash] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

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

  // Video
  const [videoRecording, setVideoRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoSavedFlash, setVideoSavedFlash] = useState(false);
  const videoMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const videoPlaybackRef = useRef<HTMLVideoElement | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const videoStartTimeRef = useRef<number>(0);
  const videoTickRef = useRef<number | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');

  useEffect(() => {
    return () => {
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
      if (tickRef.current) window.clearInterval(tickRef.current);
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
      if (videoTickRef.current) window.clearInterval(videoTickRef.current);
      videoStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [recordedUrl, videoPreviewUrl]);

  const handleSaveWrite = () => {
    if (!text.trim()) return;
    addJournalEntry({ content: text, date: new Date().toISOString() });
    track('journal_created', { mode: 'write', wordCount: text.trim().split(/\s+/).length, source: 'journal_modes' });
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

  // --- Video helpers ---
  const startVideoPreview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraFacing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      videoStreamRef.current = stream;
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play().catch(() => {});
      }
    } catch (e) {
      console.error('Could not access camera:', e);
      toast.error('Camera and microphone access is needed for video journaling.');
    }
  };

  const stopVideoPreview = () => {
    videoStreamRef.current?.getTracks().forEach((t) => t.stop());
    videoStreamRef.current = null;
    if (videoPreviewRef.current) videoPreviewRef.current.srcObject = null;
  };

  const startVideoRecording = () => {
    const stream = videoStreamRef.current;
    if (!stream) return;
    const recorder = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'video/webm;codecs=vp9,opus' : 'video/webm' });
    videoMediaRecorderRef.current = recorder;
    videoChunksRef.current = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) videoChunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(videoChunksRef.current, { type: 'video/webm' });
      setVideoBlob(blob);
      const url = URL.createObjectURL(blob);
      setVideoPreviewUrl(url);
      stopVideoPreview();
    };
    recorder.start(1000);
    videoStartTimeRef.current = Date.now();
    setVideoDuration(0);
    videoTickRef.current = window.setInterval(() => {
      setVideoDuration((Date.now() - videoStartTimeRef.current) / 1000);
    }, 250);
    setVideoRecording(true);
  };

  const stopVideoRecording = () => {
    videoMediaRecorderRef.current?.stop();
    if (videoTickRef.current) window.clearInterval(videoTickRef.current);
    setVideoRecording(false);
  };

  const resetVideo = () => {
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoBlob(null);
    setVideoPreviewUrl(null);
    setVideoDuration(0);
    setVideoPlaying(false);
    // Restart preview
    startVideoPreview();
  };

  const handleSaveVideo = async () => {
    if (!videoBlob || !user) {
      if (!user) toast.error('Please sign in to save your video journal.');
      return;
    }
    setVideoUploading(true);
    try {
      const fileName = `${Date.now()}.webm`;
      const path = `${user.id}/${fileName}`;
      const { error } = await supabase.storage
        .from('video-journals')
        .upload(path, videoBlob, { contentType: 'video/webm', upsert: false });
      if (error) throw error;

      const tag = `🎬 Video journal · ${formatDuration(videoDuration)}`;
      const note = prompt ? `${tag}\nPrompt: ${prompt}` : tag;
      addJournalEntry({
        content: note,
        date: new Date().toISOString(),
        videoPath: path,
        videoDurationSec: Math.round(videoDuration),
      });
      track('journal_created', { mode: 'video', durationSec: Math.round(videoDuration), source: 'journal_modes' });
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
      setVideoBlob(null);
      setVideoPreviewUrl(null);
      setVideoDuration(0);
      setVideoSavedFlash(true);
      setTimeout(() => setVideoSavedFlash(false), 2400);
    } catch (e) {
      console.error('Video upload failed:', e);
      toast.error('Could not save your video. Please try again.');
    } finally {
      setVideoUploading(false);
    }
  };

  // Start/stop camera when switching to/from video mode
  useEffect(() => {
    if (mode === 'video' && !videoBlob) {
      startVideoPreview();
    } else if (mode !== 'video') {
      stopVideoPreview();
    }
    return () => {
      if (mode !== 'video') return;
      // cleanup handled by top-level cleanup
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, cameraFacing]);

  const handleSaveVoice = async () => {
    if (!recordedBlob) return;
    if (!user) {
      toast.error('Please sign in to save your voice journal.');
      return;
    }
    setUploading(true);
    try {
      const ext = recordedBlob.type.includes('mp4') ? 'mp4' : 'webm';
      const fileName = `${Date.now()}.${ext}`;
      const path = `${user.id}/${fileName}`;
      const { error } = await supabase.storage
        .from('voice-journals')
        .upload(path, recordedBlob, {
          contentType: recordedBlob.type || 'audio/webm',
          upsert: false,
        });
      if (error) throw error;

      const tag = `🎙️ Voice memo · ${formatDuration(duration)}`;
      const note = prompt ? `${tag}\nPrompt: ${prompt}` : tag;
      addJournalEntry({
        content: note,
        date: new Date().toISOString(),
        audioPath: path,
        audioDurationSec: Math.round(duration),
      });
      track('journal_created', { mode: 'voice', durationSec: Math.round(duration), source: 'journal_modes' });
      resetVoice();
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2400);
    } catch (e) {
      console.error('Voice upload failed:', e);
      toast.error('Could not save your recording. Please try again.');
    } finally {
      setUploading(false);
    }
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
          const locked = !isPremium && (value === 'voice' || value === 'video');
          return (
            <button
              key={value}
              onClick={() => {
                if (locked) {
                  setUpgradeOpen(true);
                  return;
                }
                setMode(value);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                active
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-background/60 text-muted-foreground hover:bg-primary/10'
              }`}
            >
              <Icon size={14} />
              {label}
              {locked && (
                <span className="ml-0.5 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-primary/15 text-primary text-[8px] font-semibold uppercase tracking-wider">
                  <Lock size={8} />
                  Premium
                </span>
              )}
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
                disabled={!text.trim() || reachedFreeJournalCap}
                className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 transition-all hover:shadow-md"
              >
                {savedFlash ? 'Saved ✓' : 'Save entry'}
              </button>
            </div>
            {reachedFreeJournalCap && (
              <div className="mt-3 rounded-2xl bg-primary/8 border border-primary/15 p-3">
                <p className="text-xs text-foreground/80 leading-relaxed">
                  You've reached the free journal limit. Upgrade to Premium for unlimited entries.
                </p>
                <button
                  onClick={() => navigate('/upgrade')}
                  className="mt-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  Upgrade to Premium →
                </button>
              </div>
            )}
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
                disabled={!recordedBlob || uploading}
                className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 transition-all hover:shadow-md inline-flex items-center gap-1.5"
              >
                {uploading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Saving…
                  </>
                ) : savedFlash ? 'Saved ✓' : 'Save entry'}
              </button>
            </div>
          </motion.div>
        )}

        {mode === 'video' && (
          <motion.div key="video" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {PromptCard}
            <div className="flex flex-col items-center">
              {!videoBlob ? (
                <>
                  <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-black mb-4">
                    <video
                      ref={videoPreviewRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                      style={{ transform: cameraFacing === 'user' ? 'scaleX(-1)' : undefined }}
                    />
                    {videoRecording && (
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-destructive/90 text-white px-2.5 py-1 rounded-full text-xs font-medium">
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        {formatDuration(videoDuration)}
                      </div>
                    )}
                    {/* Flip camera */}
                    {!videoRecording && (
                      <button
                        onClick={() => {
                          stopVideoPreview();
                          setCameraFacing((f) => f === 'user' ? 'environment' : 'user');
                        }}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur flex items-center justify-center text-white"
                        aria-label="Flip camera"
                      >
                        <RotateCcw size={14} />
                      </button>
                    )}
                  </div>
                  <motion.button
                    onClick={videoRecording ? stopVideoRecording : startVideoRecording}
                    whileTap={{ scale: 0.95 }}
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-primary-foreground shadow-lg transition-colors ${
                      videoRecording ? 'bg-destructive' : 'bg-primary'
                    }`}
                  >
                    {videoRecording ? <Square size={24} fill="currentColor" /> : <Video size={28} />}
                  </motion.button>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {videoRecording ? 'Recording…' : 'Tap to record'}
                  </p>
                </>
              ) : (
                <div className="w-full">
                  <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-black mb-3">
                    <video
                      ref={videoPlaybackRef}
                      src={videoPreviewUrl || undefined}
                      playsInline
                      className="w-full h-full object-cover"
                      style={{ transform: cameraFacing === 'user' ? 'scaleX(-1)' : undefined }}
                      onEnded={() => setVideoPlaying(false)}
                    />
                    <button
                      onClick={() => {
                        if (!videoPlaybackRef.current) return;
                        if (videoPlaying) {
                          videoPlaybackRef.current.pause();
                          setVideoPlaying(false);
                        } else {
                          videoPlaybackRef.current.play();
                          setVideoPlaying(true);
                        }
                      }}
                      className="absolute inset-0 flex items-center justify-center bg-black/20"
                    >
                      {!videoPlaying && (
                        <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center text-primary-foreground">
                          <Play size={24} className="ml-1" />
                        </div>
                      )}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={resetVideo}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                    >
                      <RotateCcw size={12} />
                      Re-record
                    </button>
                    <span className="text-xs text-muted-foreground tabular-nums">{formatDuration(videoDuration)}</span>
                    <button
                      onClick={handleSaveVideo}
                      disabled={videoUploading}
                      className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 transition-all hover:shadow-md inline-flex items-center gap-1.5"
                    >
                      {videoUploading ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Saving…
                        </>
                      ) : videoSavedFlash ? 'Saved ✓' : 'Save entry'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        source="journal_locked_mode"
      />
    </motion.div>
  );
}
