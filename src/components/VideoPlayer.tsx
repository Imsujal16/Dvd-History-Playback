import { useRef, useEffect, useState, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Maximize, Minimize } from 'lucide-react';
import type { VideoClip } from '../types/dvr';

interface VideoPlayerProps {
  clip: VideoClip;
  isPlaying: boolean;
  playbackSpeed: number;
  isTransitioning: boolean;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  onEnded: () => void;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export default function VideoPlayer({
  clip,
  isPlaying,
  playbackSpeed,
  isTransitioning,
  currentTime,
  onTimeUpdate,
  onEnded,
  onTogglePlay,
  onPrev,
  onNext,
  videoRef,
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showControls, setShowControls] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync playback state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = playbackSpeed;

    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying, playbackSpeed, videoRef]);

  // Reset loaded state when clip changes
  useEffect(() => {
    setLoaded(false);
  }, [clip.id]);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    onTimeUpdate(video.currentTime);
  }, [onTimeUpdate, videoRef]);

  const handleEnded = useCallback(() => {
    onEnded();
  }, [onEnded]);

  const handleLoaded = useCallback(() => {
    setLoaded(true);
  }, []);

  // Show/hide overlay controls
  const handleMouseEnter = useCallback(() => {
    setShowControls(true);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (isPlaying) {
      hideTimeoutRef.current = setTimeout(() => setShowControls(false), 2000);
    }
  }, [isPlaying]);

  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // Fallback
      setIsFullscreen((prev) => !prev);
    }
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseEnter}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16/9',
        borderRadius: 12,
        overflow: 'hidden',
        background: '#0A1628',
        border: '1px solid #1A2A3A',
      }}
    >
      {/* Main Video */}
      <video
        ref={videoRef}
        src={clip.videoSrc}
        poster={clip.thumbnail}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onLoadedData={handleLoaded}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          opacity: isTransitioning ? 0 : 1,
          transition: 'opacity 400ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />

      {/* Loading State */}
      {!loaded && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              border: '2px solid #1A2A3A',
              borderTopColor: '#30B0D0',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <span style={{ fontSize: 12, color: '#8B9EB7', fontFamily: '"Inter", sans-serif' }}>
            Loading clip...
          </span>
        </div>
      )}

      {/* Transition overlay */}
      {isTransitioning && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: '#0A1628',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 5,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              border: '3px solid #1A2A3A',
              borderTopColor: '#30B0D0',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
        </div>
      )}

      {/* Overlay Controls */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '48px 20px 16px',
          background: 'linear-gradient(transparent 0%, rgba(5,10,15,0.85) 100%)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          opacity: showControls || !isPlaying ? 1 : 0,
          transition: 'opacity 300ms',
          zIndex: 10,
        }}
      >
        {/* Play/Pause */}
        <button
          onClick={onTogglePlay}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(10, 22, 40, 0.8)',
            color: '#EDE8E4',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 200ms',
            flexShrink: 0,
          }}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: 2 }} />}
        </button>

        {/* Prev */}
        <button
          onClick={onPrev}
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: 'none',
            background: 'transparent',
            color: '#EDE8E4',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 200ms',
            flexShrink: 0,
          }}
        >
          <SkipBack size={16} />
        </button>

        {/* Next */}
        <button
          onClick={onNext}
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: 'none',
            background: 'transparent',
            color: '#EDE8E4',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 200ms',
            flexShrink: 0,
          }}
        >
          <SkipForward size={16} />
        </button>

        {/* Time display */}
        <span
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 12,
            color: '#EDE8E4',
            marginLeft: 8,
            whiteSpace: 'nowrap',
          }}
        >
          {formatTime(currentTime)}{' '}
          <span style={{ color: '#8B9EB7' }}>/ {formatTime(clip.duration)}</span>
        </span>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: 'none',
            background: 'transparent',
            color: '#EDE8E4',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 200ms',
            flexShrink: 0,
          }}
        >
          {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
        </button>
      </div>

      {/* CSS for spin animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
