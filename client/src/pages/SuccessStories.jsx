import { useEffect, useState } from 'react';
import { successStoryAPI, feedbackAPI } from '@/services/publicAPI';
import { useUser } from '@/context/UserContext';
import Navbar from '@/components/public/Navbar';
import Hero from '@/components/public/Hero';
import Footer from '@/components/public/Footer';
import FeedbackForm from '@/components/public/FeedbackForm';
import SuccessStoryForm from '@/components/public/SuccessStoryForm';
import FeedbackDisplay from '@/components/public/FeedbackDisplay';
import { MessageCircle, Star, Send, User, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function SuccessStories() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showShareForm, setShowShareForm] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [storiesRes, feedbackRes, userStoriesRes] = await Promise.all([
          successStoryAPI.getAll(), // Admin stories (already approved)
          feedbackAPI.getAll(), // Only approved feedback
          successStoryAPI.getUserStories() // Only approved user stories
        ]);
        setStories([...storiesRes.data, ...userStoriesRes.data]);
        setFeedback(feedbackRes.data);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleShareStory = () => {
    if (!user) {
      navigate('/contact#contact-hero');
    } else {
      setShowShareForm(true);
    }
  };

  const handleSendFeedback = () => {
    if (!user) {
      navigate('/contact#contact-hero');
    } else {
      setShowFeedbackForm(true);
    }
  };

  return (
    <div className="min-h-screen pt-16">
      <Navbar />
      
      {/* Hero Section with custom content */}
      <Hero 
        pageKey="success-stories"
        customTitle={
          <>
            Success
            <br />
            <span className="text-blue-200">Stories</span>
          </>
        }
        customSubtitle="See how our clients have transformed their businesses with Fortune Machinery."
      />
      
      {/* Case Studies Title */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Case Studies
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real success stories from businesses that have transformed their operations with our machinery solutions
            </p>
          </div>
        </div>
      </div>
      
      {/* Success Stories with Enhanced Background */}
      <div className="relative py-16">
        {/* Enhanced Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234f46e5' fill-opacity='0.1'%3E%3Cpath d='M0 0h40v40H0V0zm40 40h40v40H40V40zm0-40h2l-2 2V0zm0 4l4-4h2l-6 6V4zm0 4l8-8h2L40 10V8zm0 4L52 0h2L40 14v-2zm0 4L56 0h2L40 18v-2zm0 4L60 0h2L40 22v-2zm0 4L64 0h2L40 26v-2zm0 4L68 0h2L40 30v-2zm0 4L72 0h2L40 34v-2zm0 4L76 0h2L40 38v-2zm0 4L80 0v2L42 40h-2zm4 0L80 4v2L46 40h-2zm4 0L80 8v2L50 40h-2zm4 0l28-28v2L54 40h-2zm4 0l24-24v2L58 40h-2zm4 0l20-20v2L62 40h-2zm4 0l16-16v2L66 40h-2zm4 0l12-12v2L70 40h-2zm4 0l8-8v2l-6 6h-2zm4 0l4-4v2l-2 2h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '80px 80px'
          }}></div>
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading success stories...</p>
            </div>
          ) : stories.length > 0 ? (
            <div className="space-y-12">
              {stories.map((s, i) => {
                const isEven = i % 2 === 0;
                return (
                  <div
                    key={s._id}
                    className={`bg-white rounded-xl shadow-lg overflow-hidden ${
                      isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                    } md:flex`}
                  >
                    {/* Success Image */}
                    <div className="md:w-1/2 w-full">
                      <img
                        src={s.success_image?.url || '/placeholder.jpg'}
                        alt={s.title || s.user_name}
                        className="w-full h-64 md:h-full object-cover"
                        onError={e => (e.target.src = '/placeholder.jpg')}
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="md:w-1/2 w-full p-8">
                      <div className="flex items-center mb-6">
                        <img
                          src={s.profile_image?.url || '/placeholder.jpg'}
                          alt={s.user_name}
                          className="h-16 w-16 object-cover rounded-full border-4 border-blue-100 shadow-lg mr-4"
                          onError={e => (e.target.src = '/placeholder.jpg')}
                        />
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{s.user_name}</h3>
                          {s.title && <div className="text-blue-600 font-medium">{s.title}</div>}
                          {s.company && <div className="text-gray-500 text-sm">{s.company}</div>}
                        </div>
                      </div>
                      
                      <div className="text-gray-700 leading-relaxed mb-4 whitespace-pre-line">
                        {s.description}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {[...Array(s.rating || 5)].map((_, i) => (
                            <span key={i} className="text-yellow-400 text-lg">★</span>
                          ))}
                        </div>
                        <span className="text-gray-500 text-sm">({s.rating || 5}/5)</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Success Stories</h3>
              <p className="text-gray-600">No success stories available yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Share Your Success Story Section */}
      <section className="bg-gradient-to-r from-green-50 to-emerald-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="mb-8">
            <MessageCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Do you have a success story with us?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              We would love to hear about your experience and share it with others!
            </p>
            <button 
              onClick={handleShareStory}
              className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Send size={20} />
              Share Your Story
            </button>
          </div>
        </div>
      </section>

      {/* Feedback Section */}
      <section className="bg-gradient-to-r from-purple-50 to-pink-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="mb-8">
            <Star className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Have any feedback?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Your feedback helps us improve and serve you better. We'd love to hear from you!
            </p>
            <button 
              onClick={handleSendFeedback}
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <MessageCircle size={20} />
              Send Feedback
            </button>
          </div>
        </div>
      </section>

      {/* Feedback Display Section */}
      {feedback.length > 0 && (
        <section className="bg-white py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Testimonials & Feedback
              </h2>
              <p className="text-xl text-gray-600">
                What our customers are saying about us
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {feedback.map((item) => (
                <FeedbackDisplay key={item._id} feedback={item} />
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Feedback Form Modal */}
      {showFeedbackForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowFeedbackForm(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
            <FeedbackForm 
              onSuccess={() => {
                setShowFeedbackForm(false);
                // Refresh feedback data
                window.location.reload();
              }}
              onCancel={() => setShowFeedbackForm(false)}
            />
          </div>
        </div>
      )}

      {/* Share Story Form Modal */}
      {showShareForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowShareForm(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
            <SuccessStoryForm 
              onSuccess={() => {
                setShowShareForm(false);
                // Refresh success stories data
                window.location.reload();
              }}
              onCancel={() => setShowShareForm(false)}
            />
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
} 