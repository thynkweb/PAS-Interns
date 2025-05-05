import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Check } from "lucide-react";
import { supabase } from "../lib/supabase";
import CustomVideoPlayer from "../components/CustomVideoPlayer";
import { getModuleById, getModuleProgress } from "../lib/api";
// import { getModuleById, getModuleProgress, updateModuleProgress, unlockNextModule } from "../api/modules";

interface Comment {
  id: string;
  user_name: string;
  comment: string;
  created_at: string;
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

  useEffect(() => {
    // Check authentication and load data
    const initializeData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/login");
          return;
        }
        
        setUserId(user.id);
        
        // Load module data
        const moduleData = await getModuleById(moduleId!);
        setModule(moduleData);
        
        // Load progress data
        const progressData = await getModuleProgress(moduleId!);
        
        if (progressData) {
          setProgress(progressData.progress_percentage || 0);
          setVideoCompleted(progressData.completed || false);
          setLastWatchedPosition(progressData.last_watched_position || 0);
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
  }, [moduleId, navigate]);

  const fetchComments = async () => {
    try {
      // Get only approved comments for this module
      const { data, error } = await supabase
        .from("module_comments")
        .select("id, comment, created_at, user_name, user_id")
        .eq("module_id", moduleId)
        .eq("approved", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !userId || !moduleId) return;

    setSubmittingComment(true);

    try {
      // Get user details
      const { data: userData } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", userId)
        .single();

      const userName = userData?.full_name || "Anonymous";

      // Add comment (approved will default to false)
      const { error } = await supabase.from("module_comments").insert({
        module_id: moduleId,
        user_id: userId,
        comment: newComment,
        user_name: userName,
        approved: false // Require approval before showing
      });

      if (error) throw error;

      setNewComment("");
      
      // Let the user know their comment will be reviewed
      alert("Your comment has been submitted and will be visible after review.");
    } catch (err) {
      console.error("Error submitting comment:", err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleProgressUpdate = (newProgress: number) => {
    setProgress(newProgress);
  };

  const handleVideoCompletion = async () => {
    setVideoCompleted(true);
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
                className="bg-[#69b0ee] h-2.5 rounded-full"
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
            // YouTube embed
            <div className="rounded-xl overflow-hidden bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${getYouTubeVideoId(
                  module.video_url
                )}?controls=0&disablekb=1`}
                className="w-full aspect-video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={module.title}
              />
            </div>
          ) : (
            // Custom video player
            <CustomVideoPlayer
              videoUrl={module.video_url}
              moduleId={moduleId!}
              lastWatchedPosition={lastWatchedPosition}
              onProgressUpdate={handleProgressUpdate}
              onCompletion={handleVideoCompletion}
            />
          )}

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
                    {userId ? userId.slice(0, 2).toUpperCase() : "AN"}
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