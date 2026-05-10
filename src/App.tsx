import { useCallback, useEffect } from 'react';
import FluidBackground from './components/FluidBackground';
import DVRHeader from './components/DVRHeader';
import VideoPlayer from './components/VideoPlayer';
import DualCameraPlayer from './components/DualCameraPlayer';
import ClipInfoPanel from './components/ClipInfoPanel';
import Timeline from './components/Timeline';
import ClipLibrary from './components/ClipLibrary';
import PlaybackControls from './components/PlaybackControls';
import { usePlayback } from './hooks/usePlayback';
import { CLIPS } from './data/clips';

function App() {
  const {
    state,
    currentClip,
    secondaryClip,
    videoRef,
    secondaryVideoRef,
    togglePlay,
    selectClip,
    selectSecondaryClip,
    toggleDualCamera,
    nextClip,
    prevClip,
    setPlaybackSpeed,
    toggleAutoPlay,
    setViewMode,
    seekTo,
    setCurrentTime,
  } = usePlayback();

  const handleTimeUpdate = useCallback(
    (time: number) => {
      setCurrentTime(time);
    },
    [setCurrentTime]
  );

  const handleVideoEnded = useCallback(() => {
    if (state.isAutoPlay) {
      const nextIndex =
        state.currentClipIndex < CLIPS.length - 1 ? state.currentClipIndex + 1 : 0;
      selectClip(nextIndex);
      setTimeout(() => {
        const video = videoRef.current;
        if (video) {
          const tryPlay = () => {
            video.play().catch(() => {});
            video.removeEventListener('loadeddata', tryPlay);
          };
          if (video.readyState >= 2) {
            video.play().catch(() => {});
          } else {
            video.addEventListener('loadeddata', tryPlay);
          }
        }
      }, 50);
    }
  }, [state.isAutoPlay, state.currentClipIndex, selectClip, videoRef]);

  // Play video when clip changes and was previously playing
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (state.isPlaying && videoRef.current) {
      videoRef.current.currentTime = 0;
      const video = videoRef.current;
      const tryPlay = () => {
        video.play().catch(() => {});
        video.removeEventListener('loadeddata', tryPlay);
      };
      if (video.readyState >= 2) {
        video.play().catch(() => {});
      } else {
        video.addEventListener('loadeddata', tryPlay);
      }
    }
  }, [state.currentClipIndex]);

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        background: '#050A0F',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
        color: '#EDE8E4',
        overflowX: 'hidden',
      }}
    >
      {/* Fluid Shader Background */}
      <FluidBackground isActive={true} />

      {/* Dark overlay for readability */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          background:
            'linear-gradient(180deg, rgba(5,10,15,0.75) 0%, rgba(5,10,15,0.88) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <DVRHeader
          viewMode={state.viewMode}
          onViewModeChange={setViewMode}
          isLive={state.currentClipIndex === CLIPS.length - 1}
          isDualCamera={state.isDualCamera}
          onToggleDualCamera={toggleDualCamera}
        />

        {/* Main Player Area */}
        <div
          style={{
            padding: '80px 24px 24px',
            display: 'grid',
            gridTemplateColumns: state.isDualCamera ? '1fr' : '1fr 320px',
            gap: 24,
            maxWidth: 1600,
            margin: '0 auto',
            transition: 'grid-template-columns 400ms ease',
          }}
        >
          {state.isDualCamera ? (
            /* ── Dual Camera Mode ── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Dual camera mode banner */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 16px',
                  background: 'rgba(48,176,208,0.08)',
                  border: '1px solid rgba(48,176,208,0.2)',
                  borderRadius: 8,
                  fontSize: 12,
                  color: '#30B0D0',
                  fontFamily: '"JetBrains Mono", monospace',
                  letterSpacing: '0.05em',
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#30B0D0', display: 'inline-block' }} />
                DUAL CAMERA MODE — Both feeds are synchronized. Press <strong style={{ margin: '0 4px' }}>D</strong> to toggle.
              </div>

              <DualCameraPlayer
                primaryClip={currentClip}
                secondaryClip={secondaryClip}
                isPlaying={state.isPlaying}
                playbackSpeed={state.playbackSpeed}
                isTransitioning={state.isTransitioning}
                currentTime={state.currentTime}
                primaryClipIndex={state.currentClipIndex}
                secondaryClipIndex={state.secondaryClipIndex}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleVideoEnded}
                onTogglePlay={togglePlay}
                onPrev={prevClip}
                onNext={nextClip}
                onSelectPrimary={selectClip}
                onSelectSecondary={selectSecondaryClip}
                primaryVideoRef={videoRef}
                secondaryVideoRef={secondaryVideoRef}
              />
            </div>
          ) : (
            /* ── Single Camera Mode ── */
            <>
              <VideoPlayer
                clip={currentClip}
                isPlaying={state.isPlaying}
                playbackSpeed={state.playbackSpeed}
                isTransitioning={state.isTransitioning}
                currentTime={state.currentTime}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleVideoEnded}
                onTogglePlay={togglePlay}
                onPrev={prevClip}
                onNext={nextClip}
                videoRef={videoRef}
              />
              <ClipInfoPanel clip={currentClip} />
            </>
          )}
        </div>

        {/* Timeline */}
        <Timeline
          currentClipIndex={state.currentClipIndex}
          currentTime={state.currentTime}
          onSelectClip={selectClip}
        />

        {/* Clip Library */}
        <ClipLibrary
          currentClipIndex={state.currentClipIndex}
          viewMode={state.viewMode}
          onSelectClip={selectClip}
        />

        {/* Spacer for fixed bottom controls */}
        <div style={{ height: 80 }} />
      </div>

      {/* Playback Controls */}
      <PlaybackControls
        clip={currentClip}
        isPlaying={state.isPlaying}
        currentTime={state.currentTime}
        playbackSpeed={state.playbackSpeed}
        isAutoPlay={state.isAutoPlay}
        onTogglePlay={togglePlay}
        onPrev={prevClip}
        onNext={nextClip}
        onSeek={seekTo}
        onSpeedChange={setPlaybackSpeed}
        onToggleAutoPlay={toggleAutoPlay}
      />

      {/* Global Styles */}
      <style>{`
        * {
          box-sizing: border-box;
        }
        body {
          margin: 0;
          padding: 0;
          background: #050A0F;
          color: #EDE8E4;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        select option {
          background: #0A1628;
          color: #8B9EB7;
        }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1A2A3A; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #2A3A4A; }
      `}</style>
    </div>
  );
}

export default App;
