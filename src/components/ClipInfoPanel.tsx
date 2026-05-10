import type { VideoClip } from '../types/dvr';

interface ClipInfoPanelProps {
  clip: VideoClip;
}

export default function ClipInfoPanel({ clip }: ClipInfoPanelProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const metaFields = [
    { label: 'Camera', value: `${clip.camera} (${clip.cameraLocation})` },
    { label: 'Duration', value: formatDuration(clip.duration) },
    { label: 'Resolution', value: clip.resolution },
    { label: 'Event Type', value: clip.eventType.charAt(0).toUpperCase() + clip.eventType.slice(1) },
    ...(clip.confidence ? [{ label: 'Confidence', value: `${clip.confidence}%` }] : []),
  ];

  return (
    <div
      style={{
        background: 'rgba(10, 22, 40, 0.6)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid #1A2A3A',
        borderRadius: 12,
        padding: 24,
        height: 'fit-content',
        position: 'sticky',
        top: 80,
      }}
    >
      {/* Title */}
      <h2
        style={{
          fontFamily: '"Noto Serif SC", serif',
          fontSize: 20,
          fontWeight: 600,
          color: '#EDE8E4',
          lineHeight: 1.3,
          margin: 0,
        }}
      >
        {clip.title}
      </h2>

      {/* Timestamp */}
      <p
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 13,
          color: '#8B9EB7',
          margin: '8px 0 0',
        }}
      >
        {clip.timestamp.replace('T', ' ').replace('Z', '')}
      </p>

      {/* Divider */}
      <div style={{ height: 1, background: '#1A2A3A', margin: '16px 0' }} />

      {/* Metadata Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px 16px',
        }}
      >
        {metaFields.map((field, index) => (
          <div key={field.label} style={{ animationDelay: `${index * 50}ms` }}>
            <p
              style={{
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#4A5A6E',
                margin: '0 0 4px',
                fontFamily: '"Inter", sans-serif',
                fontWeight: 500,
              }}
            >
              {field.label}
            </p>
            <p
              style={{
                fontSize: 13,
                color: '#EDE8E4',
                margin: 0,
                fontFamily: '"Inter", sans-serif',
                fontWeight: 400,
                wordBreak: 'break-word',
              }}
            >
              {field.value}
            </p>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: '#1A2A3A', margin: '16px 0' }} />

      {/* Description */}
      <p
        style={{
          fontFamily: '"Inter", sans-serif',
          fontSize: 13,
          color: '#8B9EB7',
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        {clip.description}
      </p>
    </div>
  );
}
