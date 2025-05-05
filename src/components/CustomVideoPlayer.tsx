import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause } from 'lucide-react';
import { updateModuleProgress } from '../lib/api';
// import { updateModuleProgress } from '../api/modules';

interface CustomVideoPlayerProps {
  videoUrl: string;
  moduleId: string;
  lastWatchedPosition: number;
  onProgressUpdate: (progress: number) => void;
  onCompletion: () => void;
}

const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({
  videoUrl,
  moduleId,
  lastWatchedPosition,
  onProgressUpdate,
  onCompletion
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [saveTimer, setSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const [completed, setCompleted] = useState(false);

  // Initialize video when component mounts
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Set initial position if available
    if (lastWatchedPosition > 0) {
      video.currentTime = lastWatchedPosition;
      setCurrentTime(lastWatchedPosition);
    }

    // Set up event listeners
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      const currentTimeValue = video.currentTime;
      const durationValue = video.duration;
      
      if (durationValue) {
        const progressValue = Math.floor((currentTimeValue / durationValue) * 100);
        setProgress(progressValue);
        setCurrentTime(currentTimeValue);
        onProgressUpdate(progressValue);

        // Mark as completed when reaching 95% of the video
        if (progressValue >= 95 && !completed) {
          setCompleted(true);
          updateModuleProgress(moduleId, 100, currentTimeValue, true)
            .then(() => {
              onCompletion();
            })
            .catch(err => console.error('Error updating completion status:', err));
        }
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      
      // Save progress on unmount
      if (video.currentTime > 0 && !completed) {
        const finalProgress = Math.floor((video.currentTime / video.duration) * 100);
        updateModuleProgress(moduleId, finalProgress, video.currentTime, false)
          .catch(err => console.error('Error saving final progress:', err));
      }
      
      // Clear any pending timers
      if (saveTimer) clearTimeout(saveTimer);
    };
  }, [moduleId, lastWatchedPosition, completed]);

  // Save progress periodically
  useEffect(() => {
    // Don't save if video hasn't started or is already completed
    if (currentTime === 0 || !duration || completed) return;

    // Debounce saving progress (save every 5 seconds)
    if (saveTimer) clearTimeout(saveTimer);

    const timer = setTimeout(() => {
      updateModuleProgress(moduleId, progress, currentTime, false)
        .catch(err => console.error('Error updating progress:', err));
    }, 5000);

    setSaveTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [currentTime, moduleId, progress, duration, completed]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  // Format time as mm:ss
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="relative rounded-xl overflow-hidden bg-black">
      {/* Video */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full aspect-video"
        playsInline
        onClick={togglePlayPause}
      />

      {/* Custom Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
        <div className="flex items-center gap-3">
          {/* Play/Pause Button */}
          <button 
            onClick={togglePlayPause}
            className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
          >
            {isPlaying ? <Pause size={20} color="white" /> : <Play size={20} color="white" />}
          </button>
          
          {/* Time display */}
          <div className="text-white text-xs">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
          
          {/* Progress bar */}
          <div className="flex-1 h-1.5 bg-white/30 rounded-full">
            <div 
              className="h-1.5 bg-white rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomVideoPlayer;