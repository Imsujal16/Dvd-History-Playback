import { useState } from 'react';
import { Play } from 'lucide-react';
import { EVENT_TYPE_COLORS } from '../types/dvr';
import type { VideoClip } from '../types/dvr';
import { CLIPS } from '../data/clips';

interface ClipLibraryProps {
  currentClipIndex: number;
  viewMode: 'grid' | 'list';
  onSelectClip: (index: number) => void;
}

export default function ClipLibrary({ currentClipIndex, viewMode, onSelectClip }: ClipLibraryProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formatTimestamp = (ts: string) => {
    return ts.replace('T', ' ').replace('Z', '');
  };

  return (
    <div
      style={{
        width: '100%',
        padding: '24px',
        marginTop: 8,
      }}
    >
      {/* Section Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#8B9EB7',
              fontFamily: '"Inter", sans-serif',
              fontWeight: 500,
            }}
          >
            CLIP LIBRARY
          </span>
          <span
            style={{
              fontSize: 12,
              color: '#4A5A6E',
              fontFamily: '"Inter", sans-serif',
            }}
          >
            ({CLIPS.length} clips)
          </span>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {CLIPS.map((clip, index) => (
            <ClipCardGrid
              key={clip.id}
              clip={clip}
              index={index}
              isActive={index === currentClipIndex}
              isHovered={hoveredIndex === index}
              onHover={() => setHoveredIndex(index)}
              onLeave={() => setHoveredIndex(null)}
              onClick={() => onSelectClip(index)}
              formatDuration={formatDuration}
              formatTimestamp={formatTimestamp}
            />
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {CLIPS.map((clip, index) => (
            <ClipCardList
              key={clip.id}
              clip={clip}
              index={index}
              isActive={index === currentClipIndex}
              isHovered={hoveredIndex === index}
              onHover={() => setHoveredIndex(index)}
              onLeave={() => setHoveredIndex(null)}
              onClick={() => onSelectClip(index)}
              formatDuration={formatDuration}
              formatTimestamp={formatTimestamp}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ClipCardGrid({
  clip,
  index,
  isActive,
  isHovered,
  onHover,
  onLeave,
  onClick,
  formatDuration,
  formatTimestamp,
}: {
  clip: VideoClip;
  index: number;
  isActive: boolean;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
  formatDuration: (s: number) => string;
  formatTimestamp: (s: string) => string;
}) {
  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
      style={{
        background: '#0A1628',
        border: `1px solid ${isActive ? '#30B0D0' : '#1A2A3A'}`,
        borderLeft: isActive ? '3px solid #30B0D0' : '1px solid #1A2A3A',
        borderRadius: 8,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 300ms',
        boxShadow: isActive
          ? '0 0 20px rgba(48, 176, 208, 0.15)'
          : isHovered
          ? '0 0 20px rgba(48, 176, 208, 0.05)'
          : 'none',
        animation: `fadeInUp 300ms ease-out ${index * 40}ms both`,
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          width: '100%',
          aspectRatio: '16/9',
          background: '#111D2E',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <img
          src={clip.thumbnail}
          alt={clip.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 400ms',
          }}
        />

        {/* Event type badge */}
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            background: 'rgba(5, 10, 15, 0.7)',
            backdropFilter: 'blur(4px)',
            padding: '3px 8px',
            borderRadius: 4,
            fontSize: 10,
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: EVENT_TYPE_COLORS[clip.eventType],
            fontFamily: '"Inter", sans-serif',
          }}
        >
          {clip.eventType}
        </div>

        {/* Duration badge */}
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            background: 'rgba(5, 10, 15, 0.7)',
            backdropFilter: 'blur(4px)',
            padding: '2px 8px',
            borderRadius: 4,
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 11,
            color: '#8B9EB7',
          }}
        >
          {formatDuration(clip.duration)}
        </div>

        {/* Play overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(5, 10, 15, 0.4)',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 300ms',
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'rgba(5, 10, 15, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Play size={20} color="#EDE8E4" style={{ marginLeft: 2 }} />
          </div>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '12px 16px 16px' }}>
        <p
          style={{
            fontSize: 14,
            color: '#EDE8E4',
            fontWeight: 500,
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontFamily: '"Inter", sans-serif',
          }}
        >
          {clip.title}
        </p>
        <p
          style={{
            fontSize: 12,
            color: '#8B9EB7',
            fontFamily: '"JetBrains Mono", monospace',
            margin: '4px 0 0',
          }}
        >
          {formatTimestamp(clip.timestamp)}
        </p>
        <p
          style={{
            fontSize: 12,
            color: '#4A5A6E',
            margin: '2px 0 0',
            fontFamily: '"Inter", sans-serif',
          }}
        >
          {clip.camera} — {clip.cameraLocation}
        </p>
      </div>
    </div>
  );
}

function ClipCardList({
  clip,
  index,
  isActive,
  isHovered,
  onHover,
  onLeave,
  onClick,
  formatDuration,
  formatTimestamp,
}: {
  clip: VideoClip;
  index: number;
  isActive: boolean;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
  formatDuration: (s: number) => string;
  formatTimestamp: (s: string) => string;
}) {
  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
      style={{
        background: isHovered ? '#111D2E' : '#0A1628',
        border: `1px solid ${isActive ? '#30B0D0' : isHovered ? 'rgba(48, 176, 208, 0.3)' : '#1A2A3A'}`,
        borderLeft: isActive ? '3px solid #30B0D0' : undefined,
        borderRadius: 6,
        padding: '10px 16px',
        display: 'grid',
        gridTemplateColumns: '60px 1fr 140px 80px 100px',
        alignItems: 'center',
        gap: 16,
        cursor: 'pointer',
        transition: 'all 200ms',
        animation: `fadeInUp 300ms ease-out ${index * 40}ms both`,
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          width: 60,
          height: 42,
          borderRadius: 4,
          background: '#111D2E',
          overflow: 'hidden',
        }}
      >
        <img
          src={clip.thumbnail}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Title + Camera */}
      <div>
        <p
          style={{
            fontSize: 13,
            color: '#EDE8E4',
            fontWeight: 500,
            margin: 0,
            fontFamily: '"Inter", sans-serif',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {clip.title}
        </p>
        <p
          style={{
            fontSize: 12,
            color: '#4A5A6E',
            margin: '2px 0 0',
            fontFamily: '"Inter", sans-serif',
          }}
        >
          {clip.camera}
        </p>
      </div>

      {/* Timestamp */}
      <span
        style={{
          fontSize: 12,
          color: '#8B9EB7',
          fontFamily: '"JetBrains Mono", monospace',
        }}
      >
        {formatTimestamp(clip.timestamp)}
      </span>

      {/* Duration */}
      <span
        style={{
          fontSize: 12,
          color: '#8B9EB7',
          fontFamily: '"JetBrains Mono", monospace',
        }}
      >
        {formatDuration(clip.duration)}
      </span>

      {/* Event type badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: EVENT_TYPE_COLORS[clip.eventType],
          }}
        />
        <span
          style={{
            fontSize: 11,
            color: '#8B9EB7',
            textTransform: 'capitalize',
            fontFamily: '"Inter", sans-serif',
          }}
        >
          {clip.eventType}
        </span>
      </div>
    </div>
  );
}
