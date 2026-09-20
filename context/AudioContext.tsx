'use client';

import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';

interface AudioContextType {
  isPlaying: boolean;
  isMuted: boolean;
  hasCurtainBeenSeen: boolean;
  enterMaison: () => void;
  toggleMute: () => void;
}

const AudioCtx = createContext<AudioContextType>({
  isPlaying: false,
  isMuted: false,
  hasCurtainBeenSeen: true,
  enterMaison: () => { },
  toggleMute: () => { },
});

export const useAudio = () => useContext(AudioCtx);

const STORAGE_KEYS = {
  MUTED: 'maison-glint-audio-muted',
  CURTAIN_SEEN: 'maison-glint-curtain-seen',
} as const;

const AMBIENT_VOLUME = 0.1;
const AUDIO_SRC = '/audio/ambient.mp3';

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasCurtainBeenSeen, setHasCurtainBeenSeen] = useState(true); // default true to prevent flash

  // Hydrate from localStorage on mount
  useEffect(() => {
    const curtainSeen = localStorage.getItem(STORAGE_KEYS.CURTAIN_SEEN) === 'true';
    const muted = localStorage.getItem(STORAGE_KEYS.MUTED) === 'true';

    setHasCurtainBeenSeen(curtainSeen);
    setIsMuted(muted);

    // If returning visitor who had audio on, create audio element ready to play
    // (but don't auto-play — browser will block without interaction)
    if (curtainSeen && !muted) {
      initAudio(muted);
    }
  }, []);

  const initAudio = useCallback((muted: boolean) => {
    if (audioRef.current) return;

    const audio = new Audio(AUDIO_SRC);
    audio.loop = true;
    audio.volume = AMBIENT_VOLUME;
    audio.muted = muted;
    audio.preload = 'auto';

    // Graceful degradation if file missing
    audio.addEventListener('error', () => {
      console.warn('[Maison Glint] Ambient audio file not found or failed to load.');
    });

    audioRef.current = audio;
  }, []);

  const enterMaison = useCallback(() => {
    localStorage.setItem(STORAGE_KEYS.CURTAIN_SEEN, 'true');
    setHasCurtainBeenSeen(true);

    const muted = localStorage.getItem(STORAGE_KEYS.MUTED) === 'true';
    initAudio(muted);

    if (audioRef.current && !muted) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // Autoplay blocked — user will need to use the floating control
        console.warn('[Maison Glint] Audio playback was blocked by the browser.');
      });
    }
  }, [initAudio]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEYS.MUTED, String(next));

      if (audioRef.current) {
        audioRef.current.muted = next;

        if (next) {
          // Muting
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          // Unmuting — start playback if not already
          audioRef.current.play().then(() => {
            setIsPlaying(true);
          }).catch(() => {
            console.warn('[Maison Glint] Audio playback was blocked by the browser.');
          });
        }
      } else if (!next) {
        // No audio element yet — create and play
        initAudio(false);
        setTimeout(() => {
          audioRef.current?.play().then(() => {
            setIsPlaying(true);
          }).catch(() => { });
        }, 50);
      }

      return next;
    });
  }, [initAudio]);

  return (
    <AudioCtx.Provider value={{ isPlaying, isMuted, hasCurtainBeenSeen, enterMaison, toggleMute }}>
      {children}
    </AudioCtx.Provider>
  );
}
