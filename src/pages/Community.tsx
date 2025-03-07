import React, { useState, useEffect } from 'react';
import { ArrowLeft, Image as ImageIcon, Smile, Send, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { getComments, createComment, addReaction, removeReaction, CommunityComment } from '../lib/api';

interface Story {
  id: string;
  title: string;
  content: string;
  image_url: string;
  author: {
    name: string;
    avatar_url: string;
  };
  created_at: string;
}

const EMOJI_LIST = ['❤️', '👍', '😊', '👏', '🙏', '🎉', '💪', '🌟', '✨', '💯'];

const stories: Story[] = [
  {
    id: '1',
    title: 'How the crowdfunding internship has contributed in building my professional skills',
    content: 'My internship experience with Muskurahat has been nothing short of amazing. I\'ve learned a lot and encountered both highs and lows, creating a bittersweet yet enriching journey.\n\nNavigating through the highs and lows of this experience, there were moments of happiness and, yes, a few setbacks. Learning to handle rejection was perhaps the most challenging part of this journey. However, I take pride in the fact that I am now halfway through mastering this art.\n\nOverall, I couldn\'t have asked for a better experience. It has not only enhanced my professional skills but has also contributed to my personal growth. I am leaving this internship with a deep sense of accomplishment and gratitude for the opportunity to contribute to such a meaningful cause.\n\nThank you for this incredible journey.',
    image_url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=2000&auto=format&fit=crop',
    author: {
      name: 'Anushka Solanki',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop'
    },
    created_at: '2025-02-21T10:00:00Z'
  },
  {
    id: '2',
    title: 'A new perspective on life through this internship',
    content: 'I want to express how profoundly life-changing my internship with Muskurahat has been. After three years of intense preparation for civil services, I found myself in need of a break, a respite from the isolation that had become all too familiar. Little did I know that the break I needed would manifest in an opportunity to work with your team for such a great cause.\n\nInteracting with people and contributing to a cause as noble as supporting underprivileged children has been more rejuvenating than I could have imagined. The experience has not only allowed me to recharge and gain a new perspective on life but has also rekindled my passion for making a positive impact on the world.\n\nThank you for providing me with this transformative experience. It has been a much-needed pause in my journey and a reminder of the profound impact one can have when working towards a meaningful goal.',
    image_url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=2000&auto=format&fit=crop',
    author: {
      name: 'Ethi Verma',
      avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop'
    },
    created_at: '2025-02-20T15:30:00Z'
  }
];

export default function Community() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  useEffect(() => {
    async function fetchComments() {
      try {
        const data = await getComments();
        setComments(data);
      } catch (err) {
        console.error('Error fetching comments:', err);
        setError('Failed to load comments');
      } finally {
        setLoading(false);
      }
    }

    fetchComments();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage('https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&auto=format&fit=crop');
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim() && !selectedImage) return;
    if (!user) return;

    setIsSubmitting(true);
    try {
      const comment = await createComment(newComment, selectedImage || undefined);
      setComments([comment, ...comments]);
      setNewComment('');
      setSelectedImage(null);
    } catch (err) {
      console.error('Error posting comment:', err);
      setError('Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReaction = async (commentId: string, reaction: string) => {
    if (!user) return;

    try {
      const comment = comments.find(c => c.id === commentId);
      if (!comment) return;

      const existingReaction = comment.reactions?.find(
        r => r.user_id === user.id && r.reaction === reaction
      );

      if (existingReaction) {
        await removeReaction(commentId, reaction);
        setComments(comments.map(c => {
          if (c.id === commentId) {
            return {
              ...c,
              reactions: c.reactions?.filter(r => 
                !(r.user_id === user.id && r.reaction === reaction)
              )
            };
          }
          return c;
        }));
      } else {
        await addReaction(commentId, reaction);
        setComments(comments.map(c => {
          if (c.id === commentId) {
            return {
              ...c,
              reactions: [...(c.reactions || []), {
                id: Date.now().toString(),
                comment_id: commentId,
                user_id: user.id,
                reaction,
                created_at: new Date().toISOString()
              }]
            };
          }
          return c;
        }));
      }
    } catch (err) {
      console.error('Error handling reaction:', err);
      setError('Failed to update reaction');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (selectedStory) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white p-4 flex items-center gap-4 sticky top-0 z-10">
          <button onClick={() => setSelectedStory(null)} className="text-gray-600">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">Story Details</h1>
        </div>

        <div className="p-4">
          <img 
            src={selectedStory.image_url} 
            alt={selectedStory.title}
            className="w-full h-64 object-cover rounded-xl mb-4"
          />

          <div className="bg-white rounded-xl p-4 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src={selectedStory.author.avatar_url}
                alt={selectedStory.author.name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h2 className="font-bold">{selectedStory.author.name}</h2>
                <p className="text-sm text-gray-500">
                  {new Date(selectedStory.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <h1 className="text-2xl font-bold mb-4">{selectedStory.title}</h1>
            <p className="text-gray-700 whitespace-pre-wrap">{selectedStory.content}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-b from-orange-400 to-red-500 text-white p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/" className="text-white">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold">COMMUNITY</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stories.map(story => (
            <div 
              key={story.id}
              onClick={() => setSelectedStory(story)}
              className="relative rounded-xl overflow-hidden cursor-pointer group"
            >
              <img 
                src={story.image_url}
                alt={story.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                <h3 className="text-white font-bold group-hover:underline">
                  {story.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4">
        <div className="bg-white rounded-xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <img 
              src={user?.user_metadata?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop"}
              alt="Your avatar"
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your experience..."
                className="w-full min-h-[100px] bg-gray-50 rounded-xl p-3 text-gray-700 placeholder-gray-400 resize-none"
                maxLength={200}
              />
              
              {selectedImage && (
                <div className="relative mt-2">
                  <img 
                    src={selectedImage} 
                    alt="Selected" 
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  <button 
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <label className="p-2 hover:bg-gray-100 rounded-full cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <ImageIcon size={20} className="text-gray-500" />
                  </label>
                  <div className="relative">
                    <button 
                      className="p-2 hover:bg-gray-100 rounded-full"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                      <Smile size={20} className="text-gray-500" />
                    </button>
                    {showEmojiPicker && (
                      <div className="absolute bottom-full left-0 mb-2 p-2 bg-white rounded-xl shadow-lg border flex gap-1 flex-wrap max-w-[200px] z-50">
                        {EMOJI_LIST.map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => {
                              setNewComment(prev => prev + emoji);
                              setShowEmojiPicker(false);
                            }}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={handlePostComment}
                  disabled={(!newComment.trim() && !selectedImage) || isSubmitting}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-full font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {comments.map(comment => (
            <div key={comment.id} className="bg-white rounded-xl p-4">
              <div className="flex items-start gap-3">
                <img 
                  src={comment.user?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop"}
                  alt={comment.user?.full_name || 'User'}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold">{comment.user?.full_name || 'Anonymous'}</h3>
                    <span className="text-sm text-gray-500">
                      {new Date(comment.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long'
                      })}
                    </span>
                  </div>
                  <p className="text-gray-700 mt-1">{comment.content}</p>
                  
                  {comment.image_url && (
                    <img 
                      src={comment.image_url} 
                      alt="Comment attachment" 
                      className="mt-2 w-full h-48 object-cover rounded-xl"
                    />
                  )}

                  <div className="flex flex-wrap gap-2 mt-3">
                    {EMOJI_LIST.map(emoji => {
                      const reactionCount = comment.reactions?.filter(r => r.reaction === emoji).length || 0;
                      const hasReacted = comment.reactions?.some(r => 
                        r.reaction === emoji && r.user_id === user?.id
                      );

                      if (reactionCount > 0 || hasReacted) {
                        return (
                          <button
                            key={emoji}
                            onClick={() => handleReaction(comment.id, emoji)}
                            className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                              hasReacted
                                ? 'bg-indigo-100 text-indigo-600'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <span>{emoji}</span>
                            <span>{reactionCount}</span>
                          </button>
                        );
                      }
                      return null;
                    })}
                    <div className="relative">
                      <button
                        onClick={() => setShowReactionPicker(
                          showReactionPicker === comment.id ? null : comment.id
                        )}
                        className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
                      >
                        + Add Reaction
                      </button>
                      {showReactionPicker === comment.id && (
                        <div className="absolute bottom-full left-0 mb-2 p-2 bg-white rounded-xl shadow-lg border flex gap-1 flex-wrap max-w-[200px] z-50">
                          {EMOJI_LIST.map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => {
                                handleReaction(comment.id, emoji);
                                setShowReactionPicker(null);
                              }}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}