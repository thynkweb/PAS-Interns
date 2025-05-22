import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import { updateModuleProgress } from '../lib/api';

interface CustomVideoPlayerProps {
  videoUrl: string;
  moduleId: string;
  lastWatchedPosition: number;
  onProgressUpdate: (progress: number, currentTime: number) => void;
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
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressDataRef = useRef({progress: 0, position: 0});

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
      setIsLoading(false);
      
      // Calculate initial progress if we have a last watched position
      if (lastWatchedPosition > 0) {
        const initialProgress = Math.floor((lastWatchedPosition / video.duration) * 100);
        setProgress(initialProgress);
        progressDataRef.current = {progress: initialProgress, position: lastWatchedPosition};
      }
    };

    const handleTimeUpdate = () => {
      const currentTimeValue = video.currentTime;
      const durationValue = video.duration;
      
      if (durationValue) {
        const progressValue = Math.floor((currentTimeValue / durationValue) * 100);
        setProgress(progressValue);
        setCurrentTime(currentTimeValue);
        
        // Update ref with latest progress data
        progressDataRef.current = {
          progress: progressValue,
          position: currentTimeValue
        };
        
        // Notify parent component
        onProgressUpdate(progressValue, currentTimeValue);

        // Mark as completed when reaching 95% of the video
        if (progressValue >= 95 && !completed) {
          setCompleted(true);
          updateModuleProgress(moduleId, 100, durationValue, true)
            .then(() => {
              onCompletion();
            })
            .catch(err => console.error('Error updating completion status:', err));
        }
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleVideoEnded);

    // Start save interval
    const saveInterval = setInterval(() => {
      if (progressDataRef.current.progress > 0 && !completed) {
        console.log('Saving progress:', progressDataRef.current.progress);
        
        updateModuleProgress(
          moduleId, 
          progressDataRef.current.progress, 
          progressDataRef.current.position, 
          false
        ).catch(err => console.error('Error saving progress:', err));
      }
    }, 5000);

    saveTimerRef.current = saveInterval;

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleVideoEnded);
      
      // Clear interval on unmount
      if (saveTimerRef.current) {
        clearInterval(saveTimerRef.current);
      }
      
      // Save final progress if not completed
      if (video.currentTime > 0 && !completed) {
        const finalProgress = Math.floor((video.currentTime / video.duration) * 100);
        console.log('Saving final progress:', finalProgress);
        updateModuleProgress(moduleId, finalProgress, video.currentTime, false)
          .catch(err => console.error('Error saving final progress:', err));
      }
    };
  }, [moduleId, lastWatchedPosition, completed, onCompletion, onProgressUpdate]);

  const handleVideoEnded = () => {
    if (!completed) {
      setCompleted(true);
      if (videoRef.current) {
        updateModuleProgress(moduleId, 100, videoRef.current.duration, true)
          .then(() => {
            onCompletion();
          })
          .catch(err => console.error('Error updating completion status:', err));
      }
    }
  };

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

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !videoRef.current) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    
    videoRef.current.currentTime = pos * duration;
    setCurrentTime(pos * duration);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    
    const newVolume = parseFloat(e.target.value);
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    
    const newMuteState = !isMuted;
    videoRef.current.muted = newMuteState;
    setIsMuted(newMuteState);
    
    if (newMuteState) {
      videoRef.current.volume = 0;
      setVolume(0);
    } else {
      videoRef.current.volume = 1;
      setVolume(1);
    }
  };

  const toggleFullscreen = () => {
    const videoContainer = videoRef.current?.parentElement;
    if (!videoContainer) return;
    
    if (!isFullscreen) {
      if (videoContainer.requestFullscreen) {
        videoContainer.requestFullscreen();
      } else if ((videoContainer as any).webkitRequestFullscreen) {
        (videoContainer as any).webkitRequestFullscreen();
      } else if ((videoContainer as any).msRequestFullscreen) {
        (videoContainer as any).msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
    
    setIsFullscreen(!isFullscreen);
  };

  // Format time as mm:ss
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        !!document.fullscreenElement || 
        !!(document as any).webkitFullscreenElement || 
        !!(document as any).msFullscreenElement
      );
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className="relative bg-black rounded-xl overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}
      
      <video
        ref={videoRef}
        className="w-full aspect-video"
        src={videoUrl}
        playsInline
        onClick={togglePlayPause}
      />
      
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
        {/* Progress bar */}
        <div 
          ref={progressBarRef}
          className="w-full h-2 bg-gray-600 rounded cursor-pointer mb-2"
          onClick={handleProgressClick}
        >
          <div 
            className="h-full bg-[#69b0ee] rounded transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Play/Pause button */}
            <button 
              onClick={togglePlayPause}
              className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
            >
              {isPlaying ? <Pause size={20} color="white" /> : <Play size={20} color="white" />}
            </button>
            
            {/* Time */}
            <div className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Volume control */}
            <div className="flex items-center space-x-2">
              <button onClick={toggleMute} className="text-white hover:text-[#69b0ee]">
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-gray-600 rounded appearance-none cursor-pointer"
              />
            </div>
            
            {/* Fullscreen button */}
            <button onClick={toggleFullscreen} className="text-white hover:text-[#69b0ee]">
              <Maximize size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomVideoPlayer;