import { useEffect, useState } from 'react';
import { videosAPI } from '@/services/adminAPI';
import { Plus, Pencil, Trash, Star, Crown, X } from 'lucide-react';
import AdminNavbar from '@/components/admin/adminNavbar';
import VideoForm from '@/components/admin/VideoForm';

const VideoManager = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const { data } = await videosAPI.getAll();
      setVideos(data);
    } catch (err) {
      console.error('Failed to fetch videos', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const handleToggleFeatured = async (id) => {
    try {
      await videosAPI.toggleFeatured(id);
      loadVideos();
    } catch (err) {
      console.error('Failed to toggle featured status', err);
      alert('Failed to update featured status');
    }
  };

  const handleToggleHighlighted = async (id) => {
    try {
      await videosAPI.toggleHighlighted(id);
      loadVideos();
    } catch (err) {
      console.error('Failed to toggle highlighted status', err);
      alert('Failed to update highlighted status');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this video?')) {
      try {
        await videosAPI.remove(id);
        loadVideos();
      } catch (err) {
        console.error('Failed to delete video', err);
        alert('Failed to delete video');
      }
    }
  };

  const getMediaUrl = (media) => {
    if (!media) return '';
    if (typeof media === 'string') return media;
    return media.url;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="md:ml-64 pt-16 md:pt-0">
        <div className="p-4 md:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Manage Videos</h2>
            <button
              onClick={() => {
                setEditingVideo(null);
                setShowForm(true);
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              <Plus size={18} /> Add Video
            </button>
          </div>

          {showForm && (
            <VideoForm
              existingData={editingVideo}
              onSuccess={() => {
                setShowForm(false);
                setEditingVideo(null);
                loadVideos();
              }}
              onCancel={() => {
                setShowForm(false);
                setEditingVideo(null);
              }}
            />
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading videos...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <div key={video._id} className="bg-white p-4 rounded shadow-md border relative">
                  {/* Video Thumbnail */}
                  {getMediaUrl(video.thumbnail) ? (
                    <img
                      src={getMediaUrl(video.thumbnail)}
                      alt={video.title}
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-100 flex items-center justify-center text-gray-400 rounded mb-2">
                      <div className="text-center">
                        <div className="text-2xl mb-1">🎥</div>
                        <div className="text-xs">No thumbnail</div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{video.title}</h3>
                      <p className="text-sm text-gray-500">{video.description}</p>
                      
                      {/* Status Badges */}
                      <div className="flex gap-2 mt-2">
                        {video.isFeatured && (
                          <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                            <Star size={12} />
                            Featured
                          </span>
                        )}
                        {video.isHighlighted && (
                          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                            <Crown size={12} />
                            Highlighted
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-2">
                      {/* Featured Toggle */}
                      <button
                        onClick={() => handleToggleFeatured(video._id)}
                        className={`p-2 rounded ${
                          video.isFeatured 
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title={video.isFeatured ? 'Remove from featured' : 'Mark as featured'}
                      >
                        <Star size={16} />
                      </button>
                      
                      {/* Highlighted Toggle */}
                      <button
                        onClick={() => handleToggleHighlighted(video._id)}
                        className={`p-2 rounded ${
                          video.isHighlighted 
                            ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title={video.isHighlighted ? 'Remove highlight' : 'Set as highlighted'}
                      >
                        <Crown size={16} />
                      </button>
                      
                      {/* Edit Button */}
                      <button
                        onClick={() => {
                          setEditingVideo(video);
                          setShowForm(true);
                        }}
                        className="p-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        title="Edit video"
                      >
                        <Pencil size={16} />
                      </button>
                      
                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(video._id)}
                        className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                        title="Delete video"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {videos.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎥</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Videos</h3>
              <p className="text-gray-600">Add your first video to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoManager; 