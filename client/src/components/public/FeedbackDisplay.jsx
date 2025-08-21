import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { feedbackAPI } from '@/services/publicAPI';
import { Star, ThumbsUp, ThumbsDown, MessageCircle, User } from 'lucide-react';

export default function FeedbackDisplay({ feedback: initialFeedback }) {
  const { user } = useUser();
  const [feedback, setFeedback] = useState(initialFeedback);
  const [showReplies, setShowReplies] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [dislikeLoading, setDislikeLoading] = useState(false);

  const handleLike = async () => {
    if (!user) {
      alert('Please log in to like feedback');
      return;
    }
    setLikeLoading(true);
    try {
      const { data } = await feedbackAPI.like(feedback._id);
      setFeedback(data.feedback);
    } catch (error) {
      console.error('Failed to like feedback:', error);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleDislike = async () => {
    if (!user) {
      alert('Please log in to dislike feedback');
      return;
    }
    setDislikeLoading(true);
    try {
      const { data } = await feedbackAPI.dislike(feedback._id);
      setFeedback(data.feedback);
    } catch (error) {
      console.error('Failed to dislike feedback:', error);
    } finally {
      setDislikeLoading(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;
    setSubmittingReply(true);
    try {
      const { data } = await feedbackAPI.reply(feedback._id, replyMessage);
      setFeedback(data.feedback);
      setReplyMessage('');
    } catch (error) {
      console.error('Failed to submit reply:', error);
      alert('Failed to submit reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleLikeReply = async (replyId) => {
    if (!user) {
      alert('Please log in to like replies');
      return;
    }
    try {
      const { data } = await feedbackAPI.likeReply(feedback._id, replyId);
      setFeedback(data.feedback);
    } catch (error) {
      console.error('Failed to like reply:', error);
    }
  };

  const handleDislikeReply = async (replyId) => {
    if (!user) {
      alert('Please log in to dislike replies');
      return;
    }
    try {
      const { data } = await feedbackAPI.dislikeReply(feedback._id, replyId);
      setFeedback(data.feedback);
    } catch (error) {
      console.error('Failed to dislike reply:', error);
    }
  };

  const hasUserLiked = user && feedback.likes?.some(like => like.user_id === user._id);
  const hasUserDisliked = user && feedback.dislikes?.some(dislike => dislike.user_id === user._id);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      {/* User Info */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative">
          {feedback.profile_image?.url ? (
            <img
              src={feedback.profile_image.url}
              alt={feedback.user_id?.name || 'User'}
              className="w-12 h-12 rounded-full object-cover border-2 border-blue-100"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center border-2 border-blue-100">
              <User className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">
            {feedback.user_id?.name || 'Anonymous User'}
          </h4>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">
              {feedback.rating}/5
            </span>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {new Date(feedback.created_at).toLocaleDateString()}
        </div>
      </div>
      {/* Message */}
      <div className="text-gray-700 mb-4 leading-relaxed">
        {feedback.message}
      </div>
      {/* Actions */}
      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            disabled={likeLoading}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
              hasUserLiked 
                ? 'bg-blue-100 text-blue-600' 
                : 'hover:bg-gray-100 text-gray-600'
            } ${likeLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <ThumbsUp size={16} />
            <span>{feedback.likes?.length || 0}</span>
          </button>
          <button
            onClick={handleDislike}
            disabled={dislikeLoading}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
              hasUserDisliked 
                ? 'bg-red-100 text-red-600' 
                : 'hover:bg-gray-100 text-gray-600'
            } ${dislikeLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <ThumbsDown size={16} />
            <span>{feedback.dislikes?.length || 0}</span>
          </button>
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <MessageCircle size={16} />
            <span>{feedback.replies?.length || 0} Replies</span>
          </button>
        </div>
      </div>
      {/* Replies Section */}
      {showReplies && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <h5 className="font-medium text-gray-900 mb-4">Replies</h5>
          {/* Reply Form */}
          {user && (
            <form onSubmit={handleReply} className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Add a reply..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={1000}
                />
                <button
                  type="submit"
                  disabled={submittingReply || !replyMessage.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {submittingReply ? 'Sending...' : 'Reply'}
                </button>
              </div>
            </form>
          )}
          {/* Replies List */}
          <div className="max-h-64 overflow-y-auto space-y-3 pr-2">
            {feedback.replies?.map((reply) => {
              const hasUserLikedReply = user && reply.likes?.some(like => like.user_id === user._id);
              const hasUserDislikedReply = user && reply.dislikes?.some(dislike => dislike.user_id === user._id);
              return (
                <div key={reply._id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="relative">
                      {reply.user_id?.profile_image?.url ? (
                        <img
                          src={reply.user_id.profile_image.url}
                          alt={reply.user_id.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h6 className="font-medium text-gray-900">
                        {reply.user_id?.name || 'Anonymous User'}
                      </h6>
                      <p className="text-sm text-gray-500">
                        {new Date(reply.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-3">{reply.message}</p>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLikeReply(reply._id)}
                      className={`flex items-center gap-1 text-sm transition-colors ${
                        hasUserLikedReply ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                      }`}
                    >
                      <ThumbsUp size={14} />
                      <span>{reply.likes?.length || 0}</span>
                    </button>
                    <button
                      onClick={() => handleDislikeReply(reply._id)}
                      className={`flex items-center gap-1 text-sm transition-colors ${
                        hasUserDislikedReply ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
                      }`}
                    >
                      <ThumbsDown size={14} />
                      <span>{reply.dislikes?.length || 0}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
} 