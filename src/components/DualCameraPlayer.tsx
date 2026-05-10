import { useRef, useEffect, useState, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, ChevronDown, Maximize, Minimize } from 'lucide-react';
import type { VideoClip } from '../types/dvr';
import { CLIPS } from '../data/clips';

interface DualCameraPlayerProps {
  primaryClip: VideoClip;
  secondaryClip: VideoClip;
  isPlaying: boolean;
  playbackSpeed: number;
  isTransitioning: boolean;
  currentTime: number;
  primaryClipIndex: number;
  secondaryClipIndex: number;
  onTimeUpdate: (time: number) => void;
  onEnded: () => void;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSelectPrimary: (index: number) => void;
  onSelectSecondary: (index: number) => void;
  primaryVideoRef: React.RefObject<HTMLVideoElement | null>;
  secondaryVideoRef: React.RefObject<HTMLVideoElement | null>;
}

export default function DualCameraPlayer({
  primaryClip,
  secondaryClip,
  isPlaying,
  playbackSpeed,
  isTransitioning,
  currentTime,
  primaryClipIndex,
  secondaryClipIndex,
  onTimeUpdate,
  onEnded,
  onTogglePlay,
  onPrev,
  onNext,
  onSelectPrimary,
  onSelectSecondary,
  primaryVideoRef,
  secondaryVideoRef,
}: DualCameraPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [focusedPane, setFocusedPane] = useState<'primary' | 'secondary' | null>(null);
  const [showPrimaryDropdown, setShowPrimaryDropdown] = useState(false);
  const [showSecondaryDropdown, setShowSecondaryDropdown] = useState(false);
  const [primaryLoaded, setPrimaryLoaded] = useState(false);
  const [secondaryLoaded, setSecondaryLoaded] = useState(false);

  // Sync playback state on both videos
  useEffect(() => {
    const vid = primaryVideoRef.current;
    if (!vid) return;
    vid.playbackRate = playbackSpeed;
    if (isPlaying) vid.play().catch(() => {});
    else vid.pause();
  }, [isPlaying, playbackSpeed, primaryVideoRef]);

  useEffect(() => {
    const vid = secondaryVideoRef.current;
    if (!vid) return;
    vid.playbackRate = playbackSpeed;
    if (isPlaying) vid.play().catch(() => {});
    else vid.pause();
  }, [isPlaying, playbackSpeed, secondaryVideoRef]);

  // Reset loaded states when clips change
  useEffect(() => { setPrimaryLoaded(false); }, [primaryClip.id]);
  useEffect(() => { setSecondaryLoaded(false); }, [secondaryClip.id]);

  const handleTimeUpdate = useCallback(() => {
    const video = primaryVideoRef.current;
    if (!video) return;
    onTimeUpdate(video.currentTime);
  }, [onTimeUpdate, primaryVideoRef]);

  const toggleFullscreen = useCallback(async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      setIsFullscreen((p) => !p);
    }
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    return `${String(m).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden',
        background: '#050A0F',
        border: '1px solid #1A2A3A',
      }}
    >
      {/* ── Split Screen Grid ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 3,
          background: '#111D2E',
          aspectRatio: '32/9',
        }}
      >
        {/* ── Primary Cam ── */}
        <CameraPane
          label="CAM A"
          clip={primaryClip}
          clipIndex={primaryClipIndex}
          videoRef={primaryVideoRef}
          isLoaded={primaryLoaded}
          isFocused={focusedPane === 'primary'}
          isPlaying={isPlaying}
          currentTime={currentTime}
          showDropdown={showPrimaryDropdown}
          accentColor="#30B0D0"
          onLoadedData={() => setPrimaryLoaded(true)}
          onTimeUpdate={handleTimeUpdate}
          onEnded={onEnded}
          onFocus={() => setFocusedPane('primary')}
          onBlur={() => setFocusedPane(null)}
          onToggleDropdown={() => {
            setShowPrimaryDropdown((p) => !p);
            setShowSecondaryDropdown(false);
          }}
          onSelectClip={onSelectPrimary}
          formatTime={formatTime}
          isTransitioning={isTransitioning}
        />

        {/* ── Secondary Cam ── */}
        <CameraPane
          label="CAM B"
          clip={secondaryClip}
          clipIndex={secondaryClipIndex}
          videoRef={secondaryVideoRef}
          isLoaded={secondaryLoaded}
          isFocused={focusedPane === 'secondary'}
          isPlaying={isPlaying}
          currentTime={currentTime}
          showDropdown={showSecondaryDropdown}
          accentColor="#2EC27E"
          onLoadedData={() => setSecondaryLoaded(true)}
          onTimeUpdate={() => {}} // secondary time is not tracked globally
          onEnded={() => {}}
          onFocus={() => setFocusedPane('secondary')}
          onBlur={() => setFocusedPane(null)}
          onToggleDropdown={() => {
            setShowSecondaryDropdown((p) => !p);
            setShowPrimaryDropdown(false);
          }}
          onSelectClip={onSelectSecondary}
          formatTime={formatTime}
          isTransitioning={false}
        />
      </div>

      {/* ── Divider bar with SPLIT label ── */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: '50%',
          width: 3,
          transform: 'translateX(-50%)',
          background: 'linear-gradient(180deg, #30B0D0 0%, #2EC27E 100%)',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            background: '#050A0F',
            border: '1px solid #1A2A3A',
            borderRadius: 4,
            padding: '3px 6px',
            fontSize: 9,
            fontFamily: '"JetBrains Mono", monospace',
            fontWeight: 700,
            color: '#8B9EB7',
            letterSpacing: '0.1em',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          SPLIT
        </div>
      </div>

      {/* ── Shared overlay controls at bottom ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '32px 16px 12px',
          background: 'linear-gradient(transparent, rgba(5,10,15,0.9))',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          zIndex: 20,
        }}
      >
        <button onClick={onPrev} style={ctrlBtn}>
          <SkipBack size={14} />
        </button>
        <button
          onClick={onTogglePlay}
          style={{
            ...ctrlBtn,
            width: 36,
            height: 36,
            background: '#30B0D0',
            color: '#050A0F',
            borderRadius: '50%',
          }}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: 2 }} />}
        </button>
        <button onClick={onNext} style={ctrlBtn}>
          <SkipForward size={14} />
        </button>

        <span
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 11,
            color: '#EDE8E4',
            whiteSpace: 'nowrap',
            marginLeft: 4,
          }}
        >
          {formatTime(currentTime)}{' '}
          <span style={{ color: '#4A5A6E' }}>/ {formatTime(primaryClip.duration)}</span>
        </span>

        <div style={{ flex: 1 }} />

        {/* Sync indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            fontSize: 10,
            fontFamily: '"JetBrains Mono", monospace',
            color: '#2EC27E',
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#2EC27E',
              animation: isPlaying ? 'pulse 1.5s infinite' : 'none',
              display: 'inline-block',
            }}
          />
          SYNC
        </div>

        <button onClick={toggleFullscreen} style={ctrlBtn}>
          {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
        </button>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </div>
  );
}

/* ── Camera Pane Sub-component ── */
interface CamPaneProps {
  label: string;
  clip: VideoClip;
  clipIndex: number;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isLoaded: boolean;
  isFocused: boolean;
  isPlaying: boolean;
  currentTime: number;
  showDropdown: boolean;
  accentColor: string;
  onLoadedData: () => void;
  onTimeUpdate: () => void;
  onEnded: () => void;
  onFocus: () => void;
  onBlur: () => void;
  onToggleDropdown: () => void;
  onSelectClip: (index: number) => void;
  formatTime: (s: number) => string;
  isTransitioning: boolean;
}

function CameraPane({
  label, clip, clipIndex, videoRef, isLoaded, isFocused, isPlaying,
  currentTime, showDropdown, accentColor, onLoadedData, onTimeUpdate,
  onEnded, onFocus, onBlur, onToggleDropdown, onSelectClip, formatTime, isTransitioning,
}: CamPaneProps) {
  return (
    <div
      onMouseEnter={onFocus}
      onMouseLeave={onBlur}
      style={{
        position: 'relative',
        background: '#0A1628',
        overflow: 'hidden',
        outline: isFocused ? `2px solid ${accentColor}` : '2px solid transparent',
        transition: 'outline 200ms',
      }}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={clip.videoSrc}
        poster={clip.thumbnail}
        onLoadedData={onLoadedData}
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
        muted
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          opacity: isTransitioning ? 0 : 1,
          transition: 'opacity 400ms',
        }}
      />

      {/* Spinner while loading */}
      {!isLoaded && (
        <div style={absoluteCenter}>
          <div style={{
            width: 28, height: 28,
            border: '2px solid #1A2A3A',
            borderTopColor: accentColor,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
        </div>
      )}

      {/* Top-left: Camera label + clip selector */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 15,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        {/* Cam label badge */}
        <div
          style={{
            background: `${accentColor}22`,
            border: `1px solid ${accentColor}66`,
            borderRadius: 4,
            padding: '2px 8px',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 11,
            fontWeight: 700,
            color: accentColor,
            letterSpacing: '0.1em',
          }}
        >
          {label}
        </div>

        {/* Clip selector button */}
        <button
          onClick={onToggleDropdown}
          style={{
            background: 'rgba(5,10,15,0.75)',
            border: '1px solid #1A2A3A',
            borderRadius: 4,
            padding: '2px 8px 2px 10px',
            fontFamily: '"Inter", sans-serif',
            fontSize: 10,
            color: '#EDE8E4',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            backdropFilter: 'blur(4px)',
            maxWidth: 160,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {clip.camera} — {clip.cameraLocation}
          </span>
          <ChevronDown size={10} style={{ flexShrink: 0 }} />
        </button>

        {/* Dropdown */}
        {showDropdown && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: 4,
              background: '#0A1628',
              border: '1px solid #1A2A3A',
              borderRadius: 6,
              overflow: 'hidden',
              zIndex: 50,
              minWidth: 220,
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            }}
          >
            {CLIPS.map((c, idx) => (
              <button
                key={c.id}
                onClick={() => { onSelectClip(idx); }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: idx === clipIndex ? `${accentColor}18` : 'transparent',
                  border: 'none',
                  borderLeft: idx === clipIndex ? `3px solid ${accentColor}` : '3px solid transparent',
                  color: idx === clipIndex ? accentColor : '#8B9EB7',
                  fontFamily: '"Inter", sans-serif',
                  fontSize: 11,
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  transition: 'all 150ms',
                }}
              >
                <span style={{ fontWeight: 500, color: idx === clipIndex ? accentColor : '#EDE8E4' }}>
                  {c.camera} — {c.cameraLocation}
                </span>
                <span style={{ fontSize: 10, color: '#4A5A6E' }}>{c.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Top-right: REC dot */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          zIndex: 15,
        }}
      >
        <span
          style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#E74C3C',
            animation: isPlaying ? 'pulse 2s infinite' : 'none',
            display: 'inline-block',
          }}
        />
        <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#E74C3C', letterSpacing: '0.1em' }}>
          REC
        </span>
      </div>

      {/* Bottom: clip name + time */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '20px 10px 8px',
          background: 'linear-gradient(transparent, rgba(5,10,15,0.8))',
          zIndex: 15,
        }}
      >
        <div style={{ fontSize: 10, color: '#8B9EB7', fontFamily: '"Inter", sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {clip.title}
        </div>
        <div style={{ fontSize: 10, color: '#4A5A6E', fontFamily: '"JetBrains Mono", monospace', marginTop: 2 }}>
          {formatTime(currentTime)} / {formatTime(clip.duration)}
        </div>
      </div>
    </div>
  );
}

const ctrlBtn: React.CSSProperties = {
  width: 32, height: 32,
  borderRadius: '50%',
  border: 'none',
  background: 'rgba(10,22,40,0.7)',
  color: '#EDE8E4',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const absoluteCenter: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
