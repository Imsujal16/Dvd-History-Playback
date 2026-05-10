import { useState, useCallback, useRef, useEffect } from 'react';
import type { PlaybackState, VideoClip } from '../types/dvr';
import { CLIPS } from '../data/clips';

export function usePlayback() {
  const [state, setState] = useState<PlaybackState>({
    currentClipIndex: 0,
    isPlaying: false,
    currentTime: 0,
    playbackSpeed: 1,
    isAutoPlay: true,
    isFullscreen: false,
    viewMode: 'grid',
    isTransitioning: false,
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const currentClip: VideoClip = CLIPS[state.currentClipIndex] ?? CLIPS[0];

  const play = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.play();
    }
    setState((s) => ({ ...s, isPlaying: true }));
  }, []);

  const pause = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setState((s) => ({ ...s, isPlaying: false }));
  }, []);

  const togglePlay = useCallback(() => {
    setState((s) => {
      if (s.isPlaying) {
        videoRef.current?.pause();
        return { ...s, isPlaying: false };
      } else {
        videoRef.current?.play();
        return { ...s, isPlaying: true };
      }
    });
  }, []);

  const selectClip = useCallback((index: number) => {
    if (index < 0 || index >= CLIPS.length) return;
    setState((s) => ({
      ...s,
      currentClipIndex: index,
      currentTime: 0,
      isTransitioning: true,
    }));
    // Clear transitioning flag after animation
    setTimeout(() => {
      setState((s) => ({ ...s, isTransitioning: false }));
    }, 600);
  }, []);

  const nextClip = useCallback(() => {
    setState((s) => {
      const nextIndex = s.currentClipIndex < CLIPS.length - 1 ? s.currentClipIndex + 1 : 0;
      return {
        ...s,
        currentClipIndex: nextIndex,
        currentTime: 0,
        isTransitioning: true,
      };
    });
    setTimeout(() => {
      setState((s) => ({ ...s, isTransitioning: false }));
    }, 600);
  }, []);

  const prevClip = useCallback(() => {
    setState((s) => {
      const prevIndex = s.currentClipIndex > 0 ? s.currentClipIndex - 1 : CLIPS.length - 1;
      return {
        ...s,
        currentClipIndex: prevIndex,
        currentTime: 0,
        isTransitioning: true,
      };
    });
    setTimeout(() => {
      setState((s) => ({ ...s, isTransitioning: false }));
    }, 600);
  }, []);

  const setPlaybackSpeed = useCallback((speed: number) => {
    setState((s) => ({ ...s, playbackSpeed: speed }));
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  }, []);

  const toggleAutoPlay = useCallback(() => {
    setState((s) => ({ ...s, isAutoPlay: !s.isAutoPlay }));
  }, []);

  const setViewMode = useCallback((mode: 'grid' | 'list') => {
    setState((s) => ({ ...s, viewMode: mode }));
  }, []);

  const seekTo = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
    setState((s) => ({ ...s, currentTime: time }));
  }, []);

  const setCurrentTime = useCallback((time: number) => {
    setState((s) => ({ ...s, currentTime: time }));
  }, []);

  // NOTE: Auto-play between clips is handled via the video element's onEnded event
  // in App.tsx, which is more reliable than a polling interval.

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextClip();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevClip();
          break;
        case 'ArrowUp':
          e.preventDefault();
          setPlaybackSpeed(Math.min(state.playbackSpeed + 0.5, 16));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setPlaybackSpeed(Math.max(state.playbackSpeed - 0.5, 0.25));
          break;
        case 'f':
        case 'F':
          setState((s) => ({ ...s, isFullscreen: !s.isFullscreen }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, nextClip, prevClip, setPlaybackSpeed, state.playbackSpeed]);

  return {
    state,
    currentClip,
    videoRef,
    play,
    pause,
    togglePlay,
    selectClip,
    nextClip,
    prevClip,
    setPlaybackSpeed,
    toggleAutoPlay,
    setViewMode,
    seekTo,
    setCurrentTime,
    setIsFullscreen: (val: boolean) => setState((s) => ({ ...s, isFullscreen: val })),
  };
}
