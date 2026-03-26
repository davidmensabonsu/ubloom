import { useRef, useCallback, useState, useEffect } from 'react';

type SoundPreset = 'breathing' | 'bodyscan';

/**
 * Generates gentle ambient tones using the Web Audio API.
 * No external audio files needed.
 */
export function useAmbientSound(preset: SoundPreset = 'breathing') {
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<OscillatorNode[]>([]);
  const gainRef = useRef<GainNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const getContext = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    return ctxRef.current;
  }, []);

  const start = useCallback(() => {
    const ctx = getContext();
    if (ctx.state === 'suspended') ctx.resume();

    // Master gain
    const master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 2);
    master.connect(ctx.destination);
    gainRef.current = master;

    const oscillators: OscillatorNode[] = [];

    if (preset === 'breathing') {
      // Warm pad: layered sine waves with slow detuning
      const freqs = [174, 261, 349]; // F3, C4, F4 — soft F major
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(i === 0 ? 0.5 : 0.3, ctx.currentTime);

        // Gentle LFO for shimmer
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.15 + i * 0.05, ctx.currentTime);
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(2, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();

        osc.connect(oscGain);
        oscGain.connect(master);
        osc.start();
        oscillators.push(osc, lfo);
      });
    } else {
      // Body scan: deeper, more grounding drone
      const freqs = [110, 165, 220]; // A2, E3, A3 — open A
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(i === 0 ? 0.5 : 0.25, ctx.currentTime);

        // Very slow LFO
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.08 + i * 0.03, ctx.currentTime);
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(1.5, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();

        osc.connect(oscGain);
        oscGain.connect(master);
        osc.start();
        oscillators.push(osc, lfo);
      });
    }

    nodesRef.current = oscillators;
    setIsPlaying(true);
  }, [getContext, preset]);

  const stop = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx || !gainRef.current) return;

    // Fade out over 1.5s
    gainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);

    setTimeout(() => {
      nodesRef.current.forEach((n) => {
        try { n.stop(); } catch {}
      });
      nodesRef.current = [];
      setIsPlaying(false);
    }, 1600);
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) stop();
    else start();
  }, [isPlaying, start, stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      nodesRef.current.forEach((n) => {
        try { n.stop(); } catch {}
      });
      if (ctxRef.current) {
        ctxRef.current.close();
        ctxRef.current = null;
      }
    };
  }, []);

  return { isPlaying, start, stop, toggle };
}
