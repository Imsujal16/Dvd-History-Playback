import { useState, useEffect } from 'react';
import { LayoutGrid, List } from 'lucide-react';

interface DVRHeaderProps {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  isLive?: boolean;
}

export default function DVRHeader({ viewMode, onViewModeChange, isLive = false }: DVRHeaderProps) {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toISOString().replace('T', ' ').slice(0, 19)
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: 56,
        background: 'rgba(5, 10, 15, 0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid #1A2A3A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="14" stroke="#EDE8E4" strokeWidth="2" />
          <polygon points="12,8 24,16 12,24" fill="#30B0D0" />
        </svg>
        <span
          style={{
            fontFamily: '"Noto Serif SC", serif',
            fontSize: 18,
            fontWeight: 600,
            color: '#EDE8E4',
            letterSpacing: '0.05em',
          }}
        >
          CHRONOS
        </span>
      </div>

      {/* Center: Status + Time */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {isLive && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#E74C3C',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                display: 'inline-block',
              }}
            />
            <span
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: '#E74C3C',
                fontWeight: 500,
              }}
            >
              LIVE
            </span>
          </div>
        )}
        <span
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 13,
            color: '#8B9EB7',
          }}
        >
          {currentTime}
        </span>
      </div>

      {/* View toggles */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button
          onClick={() => onViewModeChange('grid')}
          style={{
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
            background: viewMode === 'grid' ? '#30B0D0' : 'transparent',
            color: viewMode === 'grid' ? '#050A0F' : '#8B9EB7',
            transition: 'all 200ms',
          }}
          title="Grid view"
        >
          <LayoutGrid size={18} />
        </button>
        <button
          onClick={() => onViewModeChange('list')}
          style={{
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
            background: viewMode === 'list' ? '#30B0D0' : 'transparent',
            color: viewMode === 'list' ? '#050A0F' : '#8B9EB7',
            transition: 'all 200ms',
          }}
          title="List view"
        >
          <List size={18} />
        </button>
      </div>
    </header>
  );
}
