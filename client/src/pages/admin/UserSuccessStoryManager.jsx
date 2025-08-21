import { useEffect, useState } from 'react';
import { successStoryAPI } from '@/services/adminAPI';
import AdminNavbar from '@/components/admin/adminNavbar';
import { Check, X, Trash, Eye, Star, User, Award } from 'lucide-react';

export default function UserSuccessStoryManager() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      setLoading(true);
      const { data } = await successStoryAPI.getAll();
      setStories(data);
    } catch (error) {
      console.error('Error loading success stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await successStoryAPI.approve(id);
      alert('Success story approved successfully!');
      loadStories();
    } catch (error) {
      console.error('Error approving success story:', error);
      alert('Failed to approve success story');
    }
  };

  const handleDisapprove = async (id) => {
    try {
      await successStoryAPI.disapprove(id);
      alert('Success story disapproved successfully!');
      loadStories();
    } catch (error) {
      console.error('Error disapproving success story:', error);
      alert('Failed to disapprove success story');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this success story?')) {
      try {
        await successStoryAPI.delete(id);
        alert('Success story deleted successfully!');
        loadStories();
      } catch (error) {
        console.error('Error deleting success story:', error);
        alert('Failed to delete success story');
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
            <h2 className="text-2xl font-bold text-gray-900">User Success Story Manager</h2>
            <p className="text-gray-600">Manage user-submitted success stories</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading success stories...</p>
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
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rating
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
                    {stories.map((story) => (
                      <tr key={story._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {story.user_id?.profile_image?.url ? (
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={story.user_id.profile_image.url}
                                  alt={story.user_id.name}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                                  <User className="h-6 w-6 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {story.user_id?.name || story.user_name || 'Anonymous'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {story.user_id?.email || 'No email'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {story.title || story.user_name || 'Untitled'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {story.company || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < (story.rating || 5) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="ml-2 text-sm text-gray-500">({story.rating || 5}/5)</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(story.is_approved)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(story.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedStory(story);
                                setShowDetails(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            {story.is_approved !== true && (
                              <button
                                onClick={() => handleApprove(story._id)}
                                className="text-green-600 hover:text-green-900"
                                title="Approve"
                              >
                                <Check size={16} />
                              </button>
                            )}
                            {story.is_approved !== false && (
                              <button
                                onClick={() => handleDisapprove(story._id)}
                                className="text-red-600 hover:text-red-900"
                                title="Disapprove"
                              >
                                <X size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(story._id)}
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

          {/* Story Details Modal */}
          {showDetails && selectedStory && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Success Story Details</h3>
                    <button
                      onClick={() => setShowDetails(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* User Info */}
                    <div className="flex items-center space-x-4">
                      {selectedStory.user_id?.profile_image?.url ? (
                        <img
                          src={selectedStory.user_id.profile_image.url}
                          alt={selectedStory.user_id.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                          <User className="w-8 h-8 text-white" />
                        </div>
                      )}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {selectedStory.user_id?.name || selectedStory.user_name || 'Anonymous'}
                        </h4>
                        <p className="text-gray-600">{selectedStory.user_id?.email || 'No email'}</p>
                        {selectedStory.company && (
                          <p className="text-sm text-gray-500">Company: {selectedStory.company}</p>
                        )}
                        <p className="text-sm text-gray-500">
                          {new Date(selectedStory.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Title */}
                    {selectedStory.title && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Title</h5>
                        <p className="text-gray-700">{selectedStory.title}</p>
                      </div>
                    )}

                    {/* Description */}
                    {selectedStory.description && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Description</h5>
                        <p className="text-gray-700 whitespace-pre-wrap">{selectedStory.description}</p>
                      </div>
                    )}

                    {/* Rating */}
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Rating</h5>
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < (selectedStory.rating || 5) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-gray-600">({selectedStory.rating || 5}/5)</span>
                      </div>
                    </div>

                    {/* Success Image */}
                    {selectedStory.success_image?.url && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Success Image</h5>
                        <img
                          src={selectedStory.success_image.url}
                          alt="Success story"
                          className="max-w-full h-auto rounded-lg"
                        />
                      </div>
                    )}

                    {/* Profile Image */}
                    {selectedStory.profile_image?.url && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Profile Image</h5>
                        <img
                          src={selectedStory.profile_image.url}
                          alt="Profile"
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      </div>
                    )}
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