import { useState, useRef, useCallback, useMemo } from 'react';
import { EVENT_TYPE_COLORS } from '../types/dvr';
import { CLIPS } from '../data/clips';

interface TimelineProps {
  currentClipIndex: number;
  currentTime: number;
  onSelectClip: (index: number) => void;
}

export default function Timeline({ currentClipIndex, currentTime, onSelectClip }: TimelineProps) {
  const [hoveredClip, setHoveredClip] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const trackRef = useRef<HTMLDivElement>(null);

  // Calculate timeline spans for each clip (cumulative)
  const timelineData = useMemo(() => {
    let cumulative = 0;
    return CLIPS.map((clip, index) => {
      const start = cumulative;
      cumulative += clip.duration;
      return {
        clip,
        index,
        startTime: start,
        endTime: cumulative,
        duration: clip.duration,
      };
    });
  }, []);

  const totalDuration = useMemo(
    () => timelineData[timelineData.length - 1]?.endTime ?? 0,
    [timelineData]
  );

  // Current playhead position
  const currentClipStart = useMemo(() => {
    return timelineData[currentClipIndex]?.startTime ?? 0;
  }, [timelineData, currentClipIndex]);

  const playheadPercent = useMemo(() => {
    if (totalDuration === 0) return 0;
    const absoluteTime = currentClipStart + currentTime;
    return (absoluteTime / totalDuration) * 100;
  }, [totalDuration, currentClipStart, currentTime]);

  // Time ruler markers
  const timeMarkers = useMemo(() => {
    const markers: { time: number; label: string }[] = [];
    const step = Math.max(60, Math.floor(totalDuration / 8));
    for (let t = 0; t <= totalDuration; t += step) {
      const mins = Math.floor(t / 60);
      const secs = Math.floor(t % 60);
      markers.push({
        time: t,
        label: `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`,
      });
    }
    return markers;
  }, [totalDuration]);

  const handleTrackClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = trackRef.current?.getBoundingClientRect();
      if (!rect) return;
      const clickX = e.clientX - rect.left;
      const percent = clickX / rect.width;
      const targetTime = percent * totalDuration;

      // Find which clip this time falls into
      for (let i = 0; i < timelineData.length; i++) {
        if (targetTime >= timelineData[i].startTime && targetTime < timelineData[i].endTime) {
          onSelectClip(i);
          return;
        }
      }
      // If at the end, select last clip
      if (targetTime >= totalDuration) {
        onSelectClip(timelineData.length - 1);
      }
    },
    [totalDuration, timelineData, onSelectClip]
  );

  const handleSegmentHover = useCallback(
    (e: React.MouseEvent, clipId: string) => {
      setHoveredClip(clipId);
      const rect = trackRef.current?.getBoundingClientRect();
      if (rect) {
        setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }
    },
    []
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div
      style={{
        width: '100%',
        padding: '0 24px',
        marginTop: 8,
      }}
    >
      <div
        style={{
          background: 'rgba(10, 22, 40, 0.5)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid #1A2A3A',
          borderRadius: 8,
          padding: '16px 24px 20px',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
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
            TIMELINE
          </span>
          <span
            style={{
              fontSize: 13,
              color: '#4A5A6E',
              fontFamily: '"Inter", sans-serif',
            }}
          >
            May 10, 2026
          </span>
        </div>

        {/* Time Ruler */}
        <div
          style={{
            position: 'relative',
            height: 20,
            marginBottom: 4,
          }}
        >
          {timeMarkers.map((marker) => (
            <div
              key={marker.time}
              style={{
                position: 'absolute',
                left: `${(marker.time / totalDuration) * 100}%`,
                transform: 'translateX(-50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <div
                style={{
                  width: 1,
                  height: 6,
                  background: '#1A2A3A',
                }}
              />
              <span
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 10,
                  color: '#4A5A6E',
                }}
              >
                {marker.label}
              </span>
            </div>
          ))}
        </div>

        {/* Track */}
        <div
          ref={trackRef}
          onClick={handleTrackClick}
          style={{
            position: 'relative',
            height: 48,
            cursor: 'pointer',
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          {/* Background track */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: '#111D2E',
              borderRadius: 4,
            }}
          />

          {/* Segments */}
          {timelineData.map(({ clip, index, startTime, duration: segDuration }) => {
            const leftPercent = (startTime / totalDuration) * 100;
            const widthPercent = (segDuration / totalDuration) * 100;
            const isActive = index === currentClipIndex;
            const isHovered = hoveredClip === clip.id;

            return (
              <div
                key={clip.id}
                onMouseEnter={(e) => handleSegmentHover(e, clip.id)}
                onMouseLeave={() => setHoveredClip(null)}
                onMouseMove={(e) => handleSegmentHover(e, clip.id)}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectClip(index);
                }}
                style={{
                  position: 'absolute',
                  left: `${leftPercent}%`,
                  width: `${widthPercent}%`,
                  height: 32,
                  top: 8,
                  background: EVENT_TYPE_COLORS[clip.eventType],
                  borderRadius: 4,
                  opacity: isActive ? 1 : isHovered ? 0.9 : 0.6,
                  transition: 'opacity 200ms, transform 200ms',
                  transform: isHovered ? 'scaleY(1.1)' : 'scaleY(1)',
                  zIndex: isActive || isHovered ? 10 : 1,
                  boxShadow: isActive
                    ? `0 0 12px ${EVENT_TYPE_COLORS[clip.eventType]}40`
                    : 'none',
                  cursor: 'pointer',
                }}
              />
            );
          })}

          {/* Tooltip */}
          {hoveredClip && (
            <div
              style={{
                position: 'absolute',
                bottom: 'calc(100% + 8px)',
                left: Math.min(Math.max(tooltipPos.x, 80), (trackRef.current?.clientWidth ?? 400) - 80),
                transform: 'translateX(-50%)',
                background: '#0A1628',
                border: '1px solid #1A2A3A',
                borderRadius: 6,
                padding: '8px 12px',
                whiteSpace: 'nowrap',
                zIndex: 20,
                pointerEvents: 'none',
              }}
            >
              {(() => {
                const td = timelineData.find((t) => t.clip.id === hoveredClip);
                if (!td) return null;
                return (
                  <>
                    <div
                      style={{
                        fontSize: 12,
                        color: '#EDE8E4',
                        fontFamily: '"Inter", sans-serif',
                        fontWeight: 500,
                      }}
                    >
                      {td.clip.title}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: '#8B9EB7',
                        fontFamily: '"JetBrains Mono", monospace',
                        marginTop: 2,
                      }}
                    >
                      {formatTime(td.startTime)} - {formatTime(td.endTime)}
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* Playhead */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: `${playheadPercent}%`,
              width: 2,
              background: '#30B0D0',
              zIndex: 15,
              pointerEvents: 'none',
              transition: 'left 100ms linear',
            }}
          >
            {/* Playhead handle */}
            <div
              style={{
                position: 'absolute',
                top: -4,
                left: -4,
                width: 10,
                height: 10,
                background: '#30B0D0',
                borderRadius: '50%',
                boxShadow: '0 0 8px rgba(48, 176, 208, 0.5)',
              }}
            />
            {/* Time tooltip */}
            <div
              style={{
                position: 'absolute',
                top: -24,
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#30B0D0',
                color: '#050A0F',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 10,
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: 4,
                whiteSpace: 'nowrap',
              }}
            >
              {formatTime(currentClipStart + currentTime)}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginTop: 12,
            flexWrap: 'wrap',
          }}
        >
          {Object.entries(EVENT_TYPE_COLORS).map(([type, color]) => (
            <div
              key={type}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  background: color,
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
                {type === 'motion'
                  ? 'Motion'
                  : type === 'person'
                  ? 'Person'
                  : type === 'vehicle'
                  ? 'Vehicle'
                  : type === 'unknown'
                  ? 'Unknown'
                  : 'Scheduled'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
