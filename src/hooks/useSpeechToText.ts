import { useCallback, useEffect, useRef, useState } from 'react';

// Minimal typing for the browser SpeechRecognition API.
type AnySpeechRecognition = any;

function getRecognitionCtor(): AnySpeechRecognition | null {
  if (typeof window === 'undefined') return null;
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export interface UseSpeechToTextOptions {
  /** Called every time the transcript changes (interim + final). */
  onTranscriptChange?: (transcript: string) => void;
  /** Called once when recognition stops, with the final accumulated transcript. */
  onFinal?: (finalTranscript: string) => void;
  /** BCP-47 language tag. Defaults to browser language or 'en-US'. */
  lang?: string;
}

export function useSpeechToText(options: UseSpeechToTextOptions = {}) {
  const { onTranscriptChange, onFinal, lang } = options;
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<AnySpeechRecognition | null>(null);
  const finalTranscriptRef = useRef<string>('');
  // Keep callback refs so we don't recreate the recognition instance on every render.
  const onTranscriptChangeRef = useRef(onTranscriptChange);
  const onFinalRef = useRef(onFinal);

  useEffect(() => { onTranscriptChangeRef.current = onTranscriptChange; }, [onTranscriptChange]);
  useEffect(() => { onFinalRef.current = onFinal; }, [onFinal]);

  const isSupported = !!getRecognitionCtor();

  const stop = useCallback(() => {
    const rec = recognitionRef.current;
    if (rec) {
      try { rec.stop(); } catch { /* ignore */ }
    }
  }, []);

  const start = useCallback(() => {
    setError(null);
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setError('Voice input is not supported in this browser. Try Chrome, Edge, or Safari.');
      return;
    }
    // If already listening, stop instead (toggle behaviour from the caller's side).
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }

    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = lang || (typeof navigator !== 'undefined' && navigator.language) || 'en-US';
    finalTranscriptRef.current = '';

    rec.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0]?.transcript ?? '';
        if (result.isFinal) {
          finalTranscriptRef.current += transcript;
        } else {
          interim += transcript;
        }
      }
      const combined = (finalTranscriptRef.current + interim).trim();
      onTranscriptChangeRef.current?.(combined);
    };

    rec.onerror = (event: any) => {
      const err = event?.error || 'unknown';
      if (err === 'no-speech') {
        // Benign — just stop quietly.
      } else if (err === 'not-allowed' || err === 'service-not-allowed') {
        setError('Microphone access was blocked. Allow microphone access in your browser settings.');
      } else if (err === 'audio-capture') {
        setError('No microphone found. Check your device microphone.');
      } else if (err === 'network') {
        setError('Voice input needs an internet connection. Check your connection and try again.');
      } else {
        setError('Could not capture audio. Try again.');
      }
    };

    rec.onend = () => {
      setIsListening(false);
      const finalText = finalTranscriptRef.current.trim();
      if (finalText) onFinalRef.current?.(finalText);
      recognitionRef.current = null;
    };

    try {
      rec.start();
      recognitionRef.current = rec;
      setIsListening(true);
    } catch (e) {
      setError('Could not start voice input. Try again.');
      recognitionRef.current = null;
    }
  }, [lang]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const rec = recognitionRef.current;
      if (rec) {
        try { rec.stop(); } catch { /* ignore */ }
      }
    };
  }, []);

  return { isListening, isSupported, error, start, stop };
}
