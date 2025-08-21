import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { feedbackAPI } from '@/services/publicAPI';
import { Star, Upload, User, X } from 'lucide-react';

export default function FeedbackForm({ onSuccess, onCancel }) {
  const { user } = useUser();
  const [form, setForm] = useState({
    message: '',
    rating: 5,
    profile_image: null
  });
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">Please log in to submit feedback</p>
        <button
          onClick={onCancel}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Login
        </button>
      </div>
    );
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Image = reader.result;
        const response = await feedbackAPI.uploadImage(base64Image);
        setForm(prev => ({ ...prev, profile_image: response.data.profile_image }));
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setForm(prev => ({ ...prev, profile_image: null }));
    setImagePreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.message.trim()) {
      alert('Please enter your feedback message');
      return;
    }

    setSubmitting(true);
    try {
      console.log('Submitting feedback with data:', form);
      console.log('User token:', localStorage.getItem('userToken'));
      const response = await feedbackAPI.submit(form);
      console.log('Feedback submission response:', response);
      alert('Thank you for your feedback! It will be reviewed by our team.');
      onSuccess?.();
    } catch (error) {
      console.error('Feedback submission failed:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      alert(`Failed to submit feedback: ${error.response?.data?.error || error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Share Your Feedback</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Picture (Optional)
          </label>
          <div className="flex items-center space-x-4">
            <div className="relative">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Profile preview"
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="feedback-profile-image"
                disabled={uploading}
              />
              <label
                htmlFor="feedback-profile-image"
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Upload size={16} />
                {uploading ? 'Uploading...' : 'Upload Photo'}
              </label>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating *
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setForm(prev => ({ ...prev, rating: star }))}
                className={`text-2xl transition-colors ${
                  star <= form.rating ? 'text-yellow-400' : 'text-gray-300'
                } hover:text-yellow-400`}
              >
                <Star className="w-8 h-8" fill={star <= form.rating ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {form.rating} out of 5 stars
          </p>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Feedback *
          </label>
          <textarea
            value={form.message}
            onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Share your experience with our products and services..."
            maxLength={2000}
          />
          <p className="text-sm text-gray-500 mt-1">
            {form.message.length}/2000 characters
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !form.message.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </form>
    </div>
  );
} 