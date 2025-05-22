// ModulePlayer.tsx - YouTube player improvements

import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Check } from "lucide-react";
import { supabase } from "../lib/supabase";
import CustomVideoPlayer from "../components/CustomVideoPlayer";
import { getModuleById, getModuleProgress, updateModuleProgress } from "../lib/api";

interface Comment {
  id: string;
  user_name: string;
  comment: string;
  created_at: string;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function ModulePlayer() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const [module, setModule] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [lastWatchedPosition, setLastWatchedPosition] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("Anonymous");
  
  // YouTube player state
  const [youtubePlayer, setYoutubePlayer] = useState<any>(null);
  const youtubeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const youtubeProgressRef = useRef<{progress: number, position: number}>({progress: 0, position: 0});
  const lastSavedPositionRef = useRef<number>(0);
  const saveProgressDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debug logging
  const logDebug = (message: string, data?: any) => {
    console.log(`[ModulePlayer DEBUG] ${message}`, data || '');
  };

  useEffect(() => {
    // Check authentication and load data
    const initializeData = async () => {
      logDebug('Initializing data');
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          logDebug('No authenticated user found, redirecting to login');
          navigate("/login");
          return;
        }
        
        setUserId(user.id);
        logDebug('User authenticated:', user.id);
        
        // Get user name
        const { data: userData } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
          
        if (userData?.full_name) {
          setUserName(userData.full_name);
          logDebug('User name loaded:', userData.full_name);
        }
        
        // Load module data
        logDebug('Loading module data for ID:', moduleId);
        const moduleData = await getModuleById(moduleId!);
        setModule(moduleData);
        logDebug('Module data loaded:', moduleData);
        
        // Load progress data
        logDebug('Loading progress data');
        const progressData = await getModuleProgress(moduleId!);
        
        if (progressData) {
          logDebug('Progress data found:', progressData);
          setProgress(progressData.progress_percentage || 0);
          setVideoCompleted(progressData.completed || false);
          setLastWatchedPosition(progressData.last_watched_position || 0);
          lastSavedPositionRef.current = progressData.last_watched_position || 0;
          youtubeProgressRef.current = {
            progress: progressData.progress_percentage || 0,
            position: progressData.last_watched_position || 0
          };
        } else {
          // Create initial progress record if one doesn't exist
          logDebug('No progress data found, creating initial record');
          await updateModuleProgress(moduleId!, 0, 0, false);
        }
        
        // Load comments
        fetchComments();
      } catch (err) {
        console.error("Error initializing data:", err);
        setError("Failed to load module. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initializeData();
    
    // Cleanup function
    return () => {
      logDebug('Component unmounting, cleaning up timers');
      if (youtubeTimerRef.current) {
        clearInterval(youtubeTimerRef.current);
      }
      if (saveProgressDebounceRef.current) {
        clearTimeout(saveProgressDebounceRef.current);
      }
      
      // Final save of progress on unmount
      if (youtubeProgressRef.current.position > 0 && 
          Math.abs(youtubeProgressRef.current.position - lastSavedPositionRef.current) > 3) {
        logDebug('Saving final progress on unmount:', youtubeProgressRef.current);
        updateModuleProgress(
          moduleId!, 
          youtubeProgressRef.current.progress, 
          youtubeProgressRef.current.position, 
          videoCompleted
        ).catch(err => console.error('Error saving final progress on unmount:', err));
      }
    };
  }, [moduleId, navigate]);

  // Load the YouTube API
  useEffect(() => {
    if (module?.video_url && module.video_url.includes("youtube") && !window.YT) {
      logDebug('Loading YouTube API');
      // This function will be called once the API is loaded
      window.onYouTubeIframeAPIReady = () => {
        logDebug('YouTube API ready');
        initializeYouTubePlayer();
      };
      
      // Load the YouTube iframe API
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    } else if (module?.video_url && module.video_url.includes("youtube") && window.YT) {
      // If API is already loaded, initialize player directly
      logDebug('YouTube API already loaded, initializing player');
      initializeYouTubePlayer();
    }
    
    return () => {
      // Clean up timer when component unmounts
      if (youtubeTimerRef.current) {
        clearInterval(youtubeTimerRef.current);
      }
    };
  }, [module]);

  // Add this useEffect to properly initialize the YouTube player with the last position
  useEffect(() => {
    if (youtubePlayer && lastWatchedPosition > 0) {
      logDebug('Setting initial YouTube position:', lastWatchedPosition);
      youtubePlayer.seekTo(lastWatchedPosition);
      
      // Calculate initial progress
      youtubePlayer.getDuration().then((duration: number) => {
        const initialProgress = Math.floor((lastWatchedPosition / duration) * 100);
        logDebug('Initial progress calculated:', initialProgress);
        setProgress(initialProgress);
        youtubeProgressRef.current = {
          progress: initialProgress,
          position: lastWatchedPosition
        };
      });
    }
  }, [youtubePlayer, lastWatchedPosition]);

  const initializeYouTubePlayer = () => {
    if (!document.getElementById('youtube-player') || !window.YT?.Player) {
      logDebug('Cannot initialize YouTube player - element or API not ready');
      return;
    }
    
    try {
      logDebug('Initializing YouTube player with video ID:', getYouTubeVideoId(module.video_url));
      const player = new window.YT.Player('youtube-player', {
        videoId: getYouTubeVideoId(module.video_url),
        playerVars: {
          controls: 1,
          disablekb: 0,
          enablejsapi: 1,
          start: Math.floor(lastWatchedPosition)
        },
        events: {
          'onReady': onYoutubePlayerReady,
          'onStateChange': onYoutubePlayerStateChange,
          'onError': (event: any) => logDebug('YouTube player error:', event.data)
        }
      });
      
      setYoutubePlayer(player);
      logDebug('YouTube player initialized');
    } catch (err) {
      console.error("Error initializing YouTube player:", err);
    }
  };

  const onYoutubePlayerReady = (event: any) => {
    logDebug('YouTube player ready event triggered');
    // Seek to last watched position if available
    if (lastWatchedPosition > 0) {
      logDebug('Seeking to last watched position:', lastWatchedPosition);
      event.target.seekTo(lastWatchedPosition);
    }
  };

  const onYoutubePlayerStateChange = (event: any) => {
    // Check if video ended (state = 0)
    if (event.data === window.YT.PlayerState.ENDED) {
      logDebug('YouTube video ended');
      handleVideoCompletion();
      
      if (youtubeTimerRef.current) {
        clearInterval(youtubeTimerRef.current);
        youtubeTimerRef.current = null;
      }
    }
    
    // Start tracking if playing (state = 1)
    if (event.data === window.YT.PlayerState.PLAYING) {
      logDebug('YouTube video playing, starting progress tracking');
      startYoutubeProgressTracking();
    } 
    
    // Pause tracking if paused/buffering/etc
    if (event.data !== window.YT.PlayerState.PLAYING && youtubeTimerRef.current) {
      logDebug('YouTube video paused/buffering, pausing tracking');
      clearInterval(youtubeTimerRef.current);
      youtubeTimerRef.current = null;
      
      // Save position when paused
      if (youtubeProgressRef.current.position > 0) {
        saveProgressNow();
      }
    }
  };

  const saveProgressNow = async () => {
    logDebug('Saving progress immediately:', youtubeProgressRef.current);

    if (youtubeProgressRef.current.position > 0 && 
        Math.abs(youtubeProgressRef.current.position - lastSavedPositionRef.current) > 3) {
      logDebug('Saving progress immediately:', youtubeProgressRef.current);
      
      try {
        await updateModuleProgress(
          moduleId!, 
          youtubeProgressRef.current.progress, 
          youtubeProgressRef.current.position, 
          videoCompleted
        );
        
        // Update last saved position
        lastSavedPositionRef.current = youtubeProgressRef.current.position;
        logDebug('Progress saved successfully');
      } catch (err) {
        console.error("Error saving progress immediately:", err);
      }
    } else {
      logDebug('Skipping immediate save - insufficient position change');
    }
  };

  const startYoutubeProgressTracking = () => {
    // Clear any existing interval
    if (youtubeTimerRef.current) {
      clearInterval(youtubeTimerRef.current);
      youtubeTimerRef.current = null;
    }
    
    // Create new interval that runs every second to update UI
    const trackingInterval = setInterval(async () => {
      if (youtubePlayer && typeof youtubePlayer.getCurrentTime === 'function') {
        try {
          const currentTime = youtubePlayer.getCurrentTime();
          const duration = youtubePlayer.getDuration();
          
          if (currentTime && duration) {
            const progressPercent = Math.floor((currentTime / duration) * 100);
            
            // Update UI progress
            setProgress(progressPercent);
            setLastWatchedPosition(currentTime);
            
            // Store progress in ref to avoid saving too frequently
            youtubeProgressRef.current = {
              progress: progressPercent,
              position: currentTime
            };
            
            // Check if video is nearly complete (95%)
            if (progressPercent >= 95 && !videoCompleted) {
              logDebug('Video nearly complete (95%+), marking as completed');
              handleVideoCompletion();
            }
          }
        } catch (err) {
          console.error("Error tracking YouTube progress:", err);
        }
      }
    }, 1000);
    
    youtubeTimerRef.current = trackingInterval;
    
    // Separate timer for saving progress every 5 seconds
    const saveInterval = setInterval(async () => {
      if (youtubeProgressRef.current.position > 0 && 
          Math.abs(youtubeProgressRef.current.position - lastSavedPositionRef.current) > 3) {
        logDebug('Saving progress at 5s interval:', youtubeProgressRef.current);
        
        try {
          await updateModuleProgress(
            moduleId!, 
            youtubeProgressRef.current.progress, 
            youtubeProgressRef.current.position, 
            videoCompleted
          );
          
          // Update last saved position
          lastSavedPositionRef.current = youtubeProgressRef.current.position;
          logDebug('Progress saved successfully');
        } catch (err) {
          console.error("Error saving progress at interval:", err);
        }
      } else {
        logDebug('Skipping save - insufficient position change');
      }
    }, 5000);
    
    // Also store this interval (we'll clear it along with the tracking interval)
    const originalInterval = youtubeTimerRef.current;
    youtubeTimerRef.current = {
      clear: () => {
        clearInterval(originalInterval);
        clearInterval(saveInterval);
      }
    } as any;
  };

  const fetchComments = async () => {
    try {
      logDebug('Fetching comments for module:', moduleId);
      // Get only approved comments for this module
      const { data, error } = await supabase
        .from("module_comments")
        .select("id, comment, created_at, user_name, user_id")
        .eq("module_id", moduleId)
        .eq("approved", 1)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComments(data || []);
      logDebug('Comments loaded:', data?.length || 0);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !userId || !moduleId) return;

    setSubmittingComment(true);
    logDebug('Submitting comment');

    try {
      // Add comment (approved will default to false)
      const { error } = await supabase.from("module_comments").insert({
        module_id: moduleId,
        user_id: userId,
        comment: newComment,
        user_name: userName,
        approved: 0 // Require approval before showing
      });

      if (error) throw error;
      logDebug('Comment submitted successfully');
      setNewComment("");
      
      // Let the user know their comment will be reviewed
      alert("Your comment has been submitted and will be visible after review.");
    } catch (err) {
      console.error("Error submitting comment:", err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleProgressUpdate = async (newProgress: number, currentTime: number) => {
    // Update local state
    setProgress(newProgress);
    setLastWatchedPosition(currentTime);
    
    // Save position to ref for debounced save
    youtubeProgressRef.current = {
      progress: newProgress,
      position: currentTime
    };
    
    // Debounced save of progress
    if (saveProgressDebounceRef.current) {
      clearTimeout(saveProgressDebounceRef.current);
    }
    
    saveProgressDebounceRef.current = setTimeout(() => {
      if (Math.abs(currentTime - lastSavedPositionRef.current) > 3) {
        logDebug('Saving progress from CustomVideoPlayer:', {progress: newProgress, position: currentTime});
        updateModuleProgress(moduleId!, newProgress, currentTime, videoCompleted)
          .then(() => {
            lastSavedPositionRef.current = currentTime;
            logDebug('Progress saved successfully');
          })
          .catch(err => console.error("Error saving progress:", err));
      }
    }, 1000);
  };

  const handleVideoCompletion = async () => {
    logDebug('Video completed');
    // Update local state
    setVideoCompleted(true);
    setProgress(100);
    
    // Make sure to update the database with completion status
    if (moduleId) {
      try {
        logDebug('Saving completion status');
        await updateModuleProgress(moduleId, 100, lastWatchedPosition, true);
        logDebug('Completion status saved successfully');
      } catch (err) {
        console.error("Error updating completion status:", err);
      }
    }
    
    // Reload comments after completion in case there are completion-specific comments
    fetchComments();
  };

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !module) {
    return (
      <div className="min-h-screen bg-[#69b0ee] flex items-center justify-center text-black">
        <div className="text-center">
          <p className="text-xl">{error || "Module not found"}</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 bg-black text-white px-4 py-2 rounded-full font-medium"
          >
            Back to Modules
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#d8edff] pb-20">
      <div className="p-4">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-black hover:text-black/80 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Modules</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-[#d8edff] rounded-t-[2.5rem] min-h-[calc(100vh-140px)] p-6">
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="bg-white border-[#69b0ee] border-2 rounded-full p-2 flex items-center mb-6">
            <div className="text-[#69b0ee] font-medium text-sm mr-2">
              Progress
            </div>
            <div className="flex-1 bg-gray-100 rounded-full h-2.5">
              <div
                className="bg-[#69b0ee] h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-[#69b0ee] font-medium text-sm ml-2">
              {progress}% Complete
            </div>
          </div>

          {/* Module Title */}
          <div>
            <div className="p-2 bg-white shadow-lg rounded-2xl">
              <h3 className="text-[#69b0ee] font-bold mb-1">
                MODULE {module.number}: {module.title}
              </h3>
            </div>
            {videoCompleted && (
              <div className="mt-2 inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                <Check size={16} />
                <span>Completed</span>
              </div>
            )}
          </div>

          {/* Video Player */}
          {module.video_url && module.video_url.includes("youtube") ? (
  // YouTube embed with postMessage API
  <div className="rounded-xl overflow-hidden bg-black">
    <div className="w-full aspect-video relative">
      <iframe
        src={`https://www.youtube.com/embed/${getYouTubeVideoId(module.video_url)}?enablejsapi=1&controls=1&disablekb=0&start=${Math.floor(lastWatchedPosition)}&origin=${window.location.origin}`}
        className="w-full h-full"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title={module.title}
        id="youtube-iframe"
        onLoad={() => {
          logDebug('YouTube iframe loaded');
          // Set up a message listener for YouTube API events
          window.addEventListener('message', (event) => {
            if (event.origin !== 'https://www.youtube.com') return;
            
            try {
              const data = JSON.parse(event.data);
              if (data.event === 'onStateChange' && data.info === 0) {
                // Video ended
                handleVideoCompletion();
              }
            } catch (e) {
              // Not a JSON message
            }
          });
          
          // Set up a timer to check progress periodically
          const timer = setInterval(() => {
            // Use postMessage to get current time
            document.getElementById('youtube-iframe')?.contentWindow?.postMessage(
              JSON.stringify({ event: 'listening', id: 'youtube-iframe' }),
              'https://www.youtube.com'
            );
          }, 1000);
          
          // Clean up on unmount
          return () => clearInterval(timer);
        }}
      />
    </div>
  </div>
): (
            // Custom video player
            <CustomVideoPlayer
              videoUrl={module.video_url}
              moduleId={moduleId!}
              lastWatchedPosition={lastWatchedPosition}
              onProgressUpdate={handleProgressUpdate}
              onCompletion={handleVideoCompletion}
            />
            
          )}
<button 
  onClick={() => {
    // Force update progress to 100%
    updateModuleProgress(moduleId!, 100, lastWatchedPosition, true);
    setVideoCompleted(true);
    setProgress(100);
    alert("Progress marked as complete!");
  }}
  className="mt-2 bg-[#69B0EE] text-white px-4 py-2 rounded-2xl hover:bg-[#69B0EE]"
>
  Mark as Complete
</button>
          {/* Comments Section */}
          <div className="border-t pt-6 mt-6">
            <div className="flex items-center justify-center">
              <span className="text-2xl font-bold text-[#ee6969] mb-4">
                The{" "}
              </span>
              <span className="text-2xl font-bold text-[#69b0ee] mb-4">
                {" "}
                Manifestation Wall! ✨
              </span>
            </div>

            {/* Comment Input */}
            <div className="bg-white border-2 border-[#69b0ee] rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="bg-orange-200 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                  <span className="text-orange-700 text-sm font-bold">
                    {userName ? userName.slice(0, 2).toUpperCase() : "AN"}
                  </span>
                </div>
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Type your message here"
                  className="flex-1 text-[#5578ab] bg-white rounded-lg border border-[#fed166] px-4 py-2 text-sm"
                />
                <button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || submittingComment}
                  className={`bg-red-500 text-white rounded-lg px-4 py-2 text-sm flex items-center gap-1 ${
                    !newComment.trim() || submittingComment
                      ? "opacity-50"
                      : "hover:bg-red-600"
                  }`}
                >
                  <Send size={16} />
                  <span className="hidden md:block">Send</span>
                </button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-indigo-200 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                        <span className="text-indigo-700 text-sm font-bold">
                          {comment.user_name.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">
                            {comment.user_name}
                          </p>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700 mt-1">{comment.comment}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No comments yet. Be the first to share your thoughts!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}