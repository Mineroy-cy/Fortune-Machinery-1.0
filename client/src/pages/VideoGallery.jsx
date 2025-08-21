import { useEffect, useState } from 'react';
import { videosAPI } from '@/services/publicAPI';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import Navbar from '@/components/public/Navbar';
import Hero from '@/components/public/Hero';
import UniversalCard from '@/components/public/UniversalCard';
import Footer from '@/components/public/Footer';
import { Play, Eye, ShoppingCart, LogIn } from 'lucide-react';

const getMediaUrl = (media) => {
  if (!media) return '';
  if (typeof media === 'string') return media;
  return media.url;
};

export default function VideoGallery() {
  const { user, addToCart } = useUser();
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadVideos = async () => {
      try {
        setLoading(true);
        const { data } = await videosAPI.getAllPublic();
        setVideos(data);
        
        // Auto-select highlighted video, then first video if no highlighted
        const highlightedVideo = data.find(v => v.is_highlighted);
        if (highlightedVideo) {
          setSelectedVideo(highlightedVideo);
        } else if (data.length > 0) {
          setSelectedVideo(data[0]);
        }
      } catch (error) {
        console.error('Error loading videos:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadVideos();
  }, []);

  const handleSeeMore = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddToCart = (video) => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    
    try {
      // For videos, we might want to add the related machine if available
      // For now, we'll add the video itself or show a message
      alert('Video cart functionality coming soon!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add video to cart. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <Navbar />
      
      {/* Hero Section with custom content */}
      <Hero 
        pageKey="videos"
        customTitle={
          <>
            Video
            <br />
            <span className="text-blue-200">Gallery</span>
          </>
        }
        customSubtitle="Watch our machinery in action and see how our products can transform your operations."
      />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading videos...</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left: Focused Video Player */}
            <div className="lg:w-2/3 w-full">
              {selectedVideo ? (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  {/* Video Player */}
                  <div className="w-full aspect-video bg-black relative">
                    {selectedVideo.video_url ? (
                      <video
                        src={selectedVideo.video_url}
                        controls
                        className="w-full h-full object-contain"
                        poster={selectedVideo.thumbnail_url}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-gray-400 text-lg">No Video Available</div>
                      </div>
                    )}
                  </div>
                  
                  {/* Video Info */}
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">{selectedVideo.title}</h2>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 mb-4">
                      <button
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-colors flex items-center gap-2"
                        onClick={() => navigate('/contact#contact-hero')}
                      >
                        <Eye size={18} />
                        Get Quote
                      </button>
                      <button
                        className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 focus:ring-4 focus:ring-green-300 transition-colors flex items-center gap-2"
                        onClick={() => navigate('/contact#contact-hero')}
                      >
                        Order Now
                      </button>
                      <button
                        className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 focus:ring-4 focus:ring-orange-300 transition-colors flex items-center gap-2"
                        onClick={() => handleAddToCart(selectedVideo)}
                      >
                        <ShoppingCart size={18} />
                        Add to Cart
                      </button>
                    </div>
                    
                    {/* Description */}
                    <div className="text-gray-700 leading-relaxed">
                      {selectedVideo.description || 'No description available.'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                  <div className="text-6xl mb-4">📹</div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">No Video Selected</h2>
                  <p className="text-gray-600">Select a video from the list to start watching.</p>
                </div>
              )}
            </div>
            
            {/* Right: Independent Scrollable Video Cards */}
            <div className="lg:w-1/3 w-full">
              <div className="bg-white rounded-xl shadow-lg p-4">
                <h3 className="text-xl font-bold text-gray-800 mb-4 px-2">Video Library</h3>
                
                {/* Scrollable Container */}
                <div className="max-h-[calc(100vh-200px)] overflow-y-auto pr-2 space-y-3">
                  {videos.map((v) => {
                    const isSelected = selectedVideo && v._id === selectedVideo._id;
                    
                    return (
                      <div
                        key={v._id}
                        className={`transition-all duration-200 ${
                          isSelected 
                            ? 'ring-2 ring-blue-500' 
                            : 'hover:ring-1 hover:ring-gray-300'
                        }`}
                        onClick={() => setSelectedVideo(v)}
                      >
                        <UniversalCard
                          item={v}
                          type="video"
                          className={isSelected ? 'bg-blue-50' : ''}
                        />
                      </div>
                    );
                  })}
                </div>
                
                {/* Empty State */}
                {videos.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">📹</div>
                    <p>No videos available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Call to Action */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Need More Information?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Contact our experts to learn more about our machinery and get personalized recommendations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/contact#contact-hero')}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Free Quote
            </button>
            <button 
              onClick={() => navigate('/contact#contact-hero')}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <LogIn className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Login Required</h3>
              <p className="text-gray-600 mb-6">
                You need to be logged in to add items to your cart.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setShowLoginPrompt(false);
                    navigate('/login');
                  }}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setShowLoginPrompt(false);
                    navigate('/register');
                  }}
                  className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Sign Up
                </button>
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="w-full text-gray-500 px-6 py-2 hover:text-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
} 