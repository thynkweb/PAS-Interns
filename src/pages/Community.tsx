import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { getComments, createComment, addReaction, removeReaction, CommunityComment } from '../lib/api';
import { Link } from 'react-router-dom';

const CommunityPage = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
  
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

  const handleSubmit = async () => {
    if (!message.trim()) return;
    if (!user) return;

    setIsSubmitting(true);
    try {
      await createComment(message);
      // Note: We don't add the comment to the comments array since it's not approved yet
      setMessage('');
      setSubmissionStatus('Your comment has been submitted and is pending approval.');
      
      // Clear the status message after 5 seconds
      setTimeout(() => {
        setSubmissionStatus(null);
      }, 5000);
    } catch (err) {
      console.error('Error posting comment:', err);
      setError('Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Star performers data
  const starPerformers = [
    {
      name: 'Gabriel Summers',
      role: 'Brand Manager',
      quote: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley.',
      avatar: user?.user_metadata?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop",
      color: 'pink'
    },
    {
      name: 'Scarlett Nguyen',
      role: 'Brand Ambassador',
      quote: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley.',
      avatar: user?.user_metadata?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop",
      color: 'yellow'
    }
  ];
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-yellow-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-yellow-50">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center p-4 bg-white">
      <Link to="/" className="text-black">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="flex-1 text-center text-[#4a6fa5] text-xl font-bold">Pledge a smile community</h1>
      </div>
      
      {/* Star performers section */}
      <div className="p-4">
        <div className='flex justify-center items-center'>
        <p className="text-[#4a6fa5] text-xl font-bold mb-2">Message from our star performers</p>
        </div>
        
        <div className="flex gap-3 mb-6">
          {starPerformers.map((performer, index) => (
            <div 
              key={index} 
              className={`${
                performer.color === 'pink' ? 'bg-[#fdd6d6]' : 'bg-[#fef0cc]'
              } rounded-3xl flex-1`}
            >
              <div className='p-3'>
              <p className="text-[#055392] text-sm">
                {performer.quote}
              </p>
              </div>
              <div className={`${
  performer.color === 'pink' ? 'bg-[#ee6969]' : 'bg-[#fed166]'
} flex items-center p-3 rounded-b-3xl`}>

                <img 
                  src={performer.avatar}
                  alt={performer.name} 
                  className="w-6 h-6 rounded-full mr-2"
                />
                <div>
                  <p className={`text-xs font-bold ${
                    performer.color === 'pink' ? 'text-white' : 'text-[#8d7337]'
                  }`}>
                    {performer.name}
                  </p>
                  <p className={`text-xs font-bold ${
                    performer.color === 'pink' ? 'text-white' : 'text-[#8d7337]'
                  }`}>{performer.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Community Board */}
        <div className="bg-[#fed166] rounded-3xl p-4">
          <h2 className="text-center text-xl font-bold text-[#8d7337] mb-4">Community Board</h2>
          
          {/* Message input */}
          <div className="bg-white rounded-3xl p-3 mb-4 h-32 border-[#fef0cc] border-4">
            <input
              type="text"
              placeholder="Type Your Message"
              className="w-full outline-none text-gray-700 text-sm"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          
          {/* Submit button and status message */}
          <div className="mb-4">
            {submissionStatus && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-2">
                {submissionStatus}
              </div>
            )}
            <div className="flex justify-end">
              <button 
                onClick={handleSubmit}
                disabled={!message.trim() || isSubmitting}
                className="bg-[#69b0ee] text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  'Submit'
                )}
              </button>
            </div>
          </div>
          
          {/* Comments from backend */}
          <div className="space-y-3">
            {comments.length > 0 ? (
              comments.map(comment => (
                <div key={comment.id} className="bg-white rounded-lg p-3">
                  <p className="text-[#4a6fa5] pb-2 text-lg italic border-b-2 border-[#fef0cc]">
                    {comment.content}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center">
                      <img 
                        src={comment.user?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop"}
                        alt={comment.user?.full_name || 'User'} 
                        className="w-6 h-6 rounded-full mr-2"
                      />
                      <p className="text-md text-[#4a6fa5] font-bold">{comment.user?.full_name || 'Anonymous'}</p>
                    </div>
                    <p className="text-xs text-[#4a6fa5]">
                      {new Date(comment.created_at).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg p-3 text-center">
                <p className="text-[#4a6fa5]">No approved comments yet. Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;