import {
  SkipBack,
  ChevronLeft,
  Play,
  Pause,
  ChevronRight,
  SkipForward,
  Repeat,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type { VideoClip } from '../types/dvr';
import { useState, useRef, useCallback } from 'react';

interface PlaybackControlsProps {
  clip: VideoClip;
  isPlaying: boolean;
  currentTime: number;
  playbackSpeed: number;
  isAutoPlay: boolean;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSeek: (time: number) => void;
  onSpeedChange: (speed: number) => void;
  onToggleAutoPlay: () => void;
}

const SPEED_OPTIONS = [0.25, 0.5, 1, 1.5, 2, 4, 8, 16];

export default function PlaybackControls({
  clip,
  isPlaying,
  currentTime,
  playbackSpeed,
  isAutoPlay,
  onTogglePlay,
  onPrev,
  onNext,
  onSeek,
  onSpeedChange,
  onToggleAutoPlay,
}: PlaybackControlsProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  const progressPercent = Math.min((currentTime / clip.duration) * 100, 100);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = progressRef.current?.getBoundingClientRect();
      if (!rect) return;
      const clickX = e.clientX - rect.left;
      const percent = Math.max(0, Math.min(1, clickX / rect.width));
      onSeek(percent * clip.duration);
    },
    [clip.duration, onSeek]
  );

  const handleProgressHover = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = progressRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left;
      const percent = Math.max(0, Math.min(1, x / rect.width));
      setHoverTime(percent * clip.duration);
    },
    [clip.duration]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      setIsDragging(true);
      handleProgressClick(e);

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const rect = progressRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = moveEvent.clientX - rect.left;
        const percent = Math.max(0, Math.min(1, x / rect.width));
        onSeek(percent * clip.duration);
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [clip.duration, handleProgressClick, onSeek]
  );

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: 'rgba(5, 10, 15, 0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid #1A2A3A',
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        animation: 'slideUp 400ms ease-out 300ms both',
      }}
    >
      {/* Transport Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        <ControlButton onClick={onPrev} title="Previous clip">
          <SkipBack size={14} />
        </ControlButton>
        <ControlButton onClick={onPrev} title="Previous clip">
          <ChevronLeft size={16} />
        </ControlButton>

        {/* Play/Pause — larger, primary */}
        <button
          onClick={onTogglePlay}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: 'none',
            background: '#30B0D0',
            color: '#050A0F',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 200ms',
            flexShrink: 0,
          }}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: 2 }} />}
        </button>

        <ControlButton onClick={onNext} title="Next clip">
          <ChevronRight size={16} />
        </ControlButton>
        <ControlButton onClick={onNext} title="Next clip">
          <SkipForward size={14} />
        </ControlButton>
      </div>

      {/* Time Display */}
      <span
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 12,
          color: '#EDE8E4',
          minWidth: 100,
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        <span>{formatTime(currentTime)}</span>
        <span style={{ color: '#8B9EB7' }}> / {formatTime(clip.duration)}</span>
      </span>

      {/* Progress Slider */}
      <div
        ref={progressRef}
        onClick={handleProgressClick}
        onMouseMove={handleProgressHover}
        onMouseLeave={() => setHoverTime(null)}
        onMouseDown={handleMouseDown}
        style={{
          flex: 1,
          height: 20,
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        {/* Track background */}
        <div
          style={{
            width: '100%',
            height: 4,
            borderRadius: 2,
            background: '#1A2A3A',
            position: 'relative',
            overflow: 'visible',
          }}
        >
          {/* Filled portion */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: `${progressPercent}%`,
              borderRadius: 2,
              background: 'linear-gradient(90deg, #30B0D0, #1E6E85)',
              transition: isDragging ? 'none' : 'width 100ms linear',
            }}
          />

          {/* Hover preview */}
          {hoverTime !== null && !isDragging && (
            <>
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: `${(hoverTime / clip.duration) * 100}%`,
                  width: 2,
                  height: '100%',
                  background: 'rgba(48, 176, 208, 0.5)',
                  borderRadius: 1,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: -26,
                  left: `${(hoverTime / clip.duration) * 100}%`,
                  transform: 'translateX(-50%)',
                  background: '#30B0D0',
                  color: '#050A0F',
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 10,
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 4,
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                }}
              >
                {formatTime(hoverTime)}
              </div>
            </>
          )}

          {/* Handle */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: `${progressPercent}%`,
              transform: 'translate(-50%, -50%)',
              width: 12,
              height: 12,
              background: '#30B0D0',
              borderRadius: '50%',
              boxShadow: '0 0 8px rgba(48, 176, 208, 0.4)',
              opacity: isDragging ? 1 : 0,
              transition: 'opacity 200ms',
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>

      {/* Speed Control */}
      <select
        value={playbackSpeed}
        onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
        style={{
          background: '#0A1628',
          border: '1px solid #1A2A3A',
          borderRadius: 4,
          color: '#8B9EB7',
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 12,
          padding: '4px 8px',
          cursor: 'pointer',
          outline: 'none',
          flexShrink: 0,
        }}
      >
        {SPEED_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s}×
          </option>
        ))}
      </select>

      {/* Auto-play Toggle */}
      <ControlButton
        onClick={onToggleAutoPlay}
        title="Auto-play"
        active={isAutoPlay}
      >
        <Repeat size={14} />
      </ControlButton>

      {/* Volume */}
      <ControlButton
        onClick={() => setIsMuted(!isMuted)}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
      </ControlButton>

      {/* CSS animations */}
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

function ControlButton({
  onClick,
  title,
  children,
  active,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        border: 'none',
        background: 'transparent',
        color: active ? '#30B0D0' : '#8B9EB7',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 200ms',
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}
