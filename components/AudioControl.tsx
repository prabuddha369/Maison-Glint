'use client';

import React from 'react';
import { useAudio } from '../context/AudioContext';

export default function AudioControl() {
  const { isPlaying, isMuted, hasCurtainBeenSeen, toggleMute } = useAudio();

  // Don't show until curtain has been dismissed
  if (!hasCurtainBeenSeen) return null;

  return (
    <button
      onClick={toggleMute}
      className="fixed bottom-6 right-6 z-[100] group"
      aria-label={isMuted ? 'Unmute ambient music' : 'Mute ambient music'}
      title={isMuted ? 'Unmute ambient music' : 'Mute ambient music'}
      style={{
        width: '44px',
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(17, 17, 17, 0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(201, 169, 110, 0.2)',
        transition: 'all 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(17, 17, 17, 0.9)';
        e.currentTarget.style.borderColor = 'rgba(201, 169, 110, 0.4)';
        e.currentTarget.style.transform = 'scale(1.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(17, 17, 17, 0.7)';
        e.currentTarget.style.borderColor = 'rgba(201, 169, 110, 0.2)';
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {/* Pulse ring when playing */}
      {isPlaying && !isMuted && (
        <span
          className="audio-pulse-ring"
          style={{
            position: 'absolute',
            inset: '-3px',
            border: '1px solid rgba(201, 169, 110, 0.3)',
            pointerEvents: 'none',
          }}
        />
      )}

      {isMuted ? (
        /* Muted icon — speaker with X */
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      ) : (
        /* Playing icon — sound waves */
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      )}
    </button>
  );
}
