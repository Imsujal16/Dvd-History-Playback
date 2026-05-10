export type EventType = 'motion' | 'person' | 'vehicle' | 'unknown' | 'scheduled';

export interface VideoClip {
  id: string;
  title: string;
  camera: string;
  cameraLocation: string;
  timestamp: string;
  duration: number;
  thumbnail: string;
  videoSrc?: string;
  eventType: EventType;
  confidence?: number;
  description: string;
  resolution: string;
}

export interface PlaybackState {
  currentClipIndex: number;
  isPlaying: boolean;
  currentTime: number;
  playbackSpeed: number;
  isAutoPlay: boolean;
  isFullscreen: boolean;
  viewMode: 'grid' | 'list';
  isTransitioning: boolean;
}

export interface TimelineSegment {
  clipId: string;
  startTime: number;
  duration: number;
  eventType: EventType;
  color: string;
}

export const EVENT_TYPE_COLORS: Record<EventType, string> = {
  motion: '#30B0D0',
  person: '#2EC27E',
  vehicle: '#F5A623',
  unknown: '#E74C3C',
  scheduled: '#8B9EB7',
};

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  motion: 'Motion',
  person: 'Person',
  vehicle: 'Vehicle',
  unknown: 'Unknown',
  scheduled: 'Scheduled',
};
