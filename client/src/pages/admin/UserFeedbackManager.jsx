import { useEffect, useState } from 'react';
import { feedbackAPI } from '@/services/adminAPI';
import AdminNavbar from '@/components/admin/adminNavbar';
import { Check, X, Trash, Eye, Star, User, MessageCircle } from 'lucide-react';

export default function UserFeedbackManager() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      const { data } = await feedbackAPI.getAll();
      setFeedback(data);
    } catch (error) {
      console.error('Error loading feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await feedbackAPI.approve(id);
      alert('Feedback approved successfully!');
      loadFeedback();
    } catch (error) {
      console.error('Error approving feedback:', error);
      alert('Failed to approve feedback');
    }
  };

  const handleDisapprove = async (id) => {
    try {
      await feedbackAPI.disapprove(id);
      alert('Feedback disapproved successfully!');
      loadFeedback();
    } catch (error) {
      console.error('Error disapproving feedback:', error);
      alert('Failed to disapprove feedback');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this feedback?')) {
      try {
        await feedbackAPI.delete(id);
        alert('Feedback deleted successfully!');
        loadFeedback();
      } catch (error) {
        console.error('Error deleting feedback:', error);
        alert('Failed to delete feedback');
      }
    }
  };

  const getStatusBadge = (isApproved) => {
    if (isApproved === true) {
      return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">Approved</span>;
    } else if (isApproved === false) {
      return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">Disapproved</span>;
    } else {
      return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold">Pending</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="md:ml-64 pt-16 md:pt-0">
        <div className="p-4 md:p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">User Feedback Manager</h2>
            <p className="text-gray-600">Manage user-submitted feedback and testimonials</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading feedback...</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rating
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Message
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {feedback.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {item.user_id?.profile_image?.url ? (
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={item.user_id.profile_image.url}
                                  alt={item.user_id.name}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                                  <User className="h-6 w-6 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {item.user_id?.name || 'Anonymous'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.user_id?.email || 'No email'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < item.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="ml-2 text-sm text-gray-500">({item.rating}/5)</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {item.message}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(item.is_approved)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(item.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedFeedback(item);
                                setShowDetails(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            {item.is_approved !== true && (
                              <button
                                onClick={() => handleApprove(item._id)}
                                className="text-green-600 hover:text-green-900"
                                title="Approve"
                              >
                                <Check size={16} />
                              </button>
                            )}
                            {item.is_approved !== false && (
                              <button
                                onClick={() => handleDisapprove(item._id)}
                                className="text-red-600 hover:text-red-900"
                                title="Disapprove"
                              >
                                <X size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <Trash size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Feedback Details Modal */}
          {showDetails && selectedFeedback && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Feedback Details</h3>
                    <button
                      onClick={() => setShowDetails(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* User Info */}
                    <div className="flex items-center space-x-4">
                      {selectedFeedback.user_id?.profile_image?.url ? (
                        <img
                          src={selectedFeedback.user_id.profile_image.url}
                          alt={selectedFeedback.user_id.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                          <User className="w-8 h-8 text-white" />
                        </div>
                      )}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {selectedFeedback.user_id?.name || 'Anonymous'}
                        </h4>
                        <p className="text-gray-600">{selectedFeedback.user_id?.email || 'No email'}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(selectedFeedback.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < selectedFeedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-gray-600">({selectedFeedback.rating}/5)</span>
                    </div>

                    {/* Message */}
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Message</h5>
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedFeedback.message}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 