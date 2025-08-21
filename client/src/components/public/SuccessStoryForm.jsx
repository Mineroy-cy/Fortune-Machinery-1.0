import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { successStoryAPI } from '@/services/publicAPI';
import { Star, Upload, User, X } from 'lucide-react';

export default function SuccessStoryForm({ onSuccess, onCancel }) {
  const { user } = useUser();
  const [form, setForm] = useState({
    user_name: user?.name || '',
    title: '',
    company: user?.company || '',
    description: '',
    rating: 5,
    profile_image: user?.profile_image || null,
    success_image: null
  });
  const [profileImagePreview, setProfileImagePreview] = useState(user?.profile_image?.url || '');
  const [successImagePreview, setSuccessImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        user_name: user.name || '',
        company: user.company || '',
        profile_image: user.profile_image || null
      }));
      setProfileImagePreview(user.profile_image?.url || '');
    }
  }, [user]);

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">Please log in to share your success story</p>
        <button
          onClick={onCancel}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Login
        </button>
      </div>
    );
  }

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Image = reader.result;
        const response = await successStoryAPI.uploadImage(base64Image);
        setForm(prev => ({ ...prev, profile_image: response.data.profile_image }));
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Profile image upload failed:', error);
      alert('Failed to upload profile image');
    } finally {
      setUploading(false);
    }
  };

  const handleSuccessImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Image = reader.result;
        const response = await successStoryAPI.uploadImage(base64Image);
        setForm(prev => ({ ...prev, success_image: response.data.success_image }));
        setSuccessImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Success image upload failed:', error);
      alert('Failed to upload success image');
    } finally {
      setUploading(false);
    }
  };

  const removeProfileImage = () => {
    setForm(prev => ({ ...prev, profile_image: null }));
    setProfileImagePreview('');
  };

  const removeSuccessImage = () => {
    setForm(prev => ({ ...prev, success_image: null }));
    setSuccessImagePreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.user_name.trim() || !form.description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      // Use user's existing profile image if no new one is uploaded
      const submissionData = {
        ...form,
        profile_image: form.profile_image || user?.profile_image
      };
      
      await successStoryAPI.submitUserStory(submissionData);
      alert('Thank you for sharing your success story! It will be reviewed by our team.');
      onSuccess?.();
    } catch (error) {
      console.error('Success story submission failed:', error);
      alert('Failed to submit success story. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Share Your Success Story</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name *
            </label>
            <input
              type="text"
              value={form.user_name}
              onChange={(e) => setForm(prev => ({ ...prev, user_name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your name"
              maxLength={100}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company (Optional)
            </label>
            <input
              type="text"
              value={form.company}
              onChange={(e) => setForm(prev => ({ ...prev, company: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your company name"
              maxLength={100}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Story Title (Optional)
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter a title for your story"
            maxLength={200}
          />
        </div>

        {/* Profile Image - Only show if user doesn't have one */}
        {!user?.profile_image?.url && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Picture (Optional)
            </label>
            <div className="flex items-center space-x-4">
              <div className="relative">
                {profileImagePreview ? (
                  <div className="relative">
                    <img
                      src={profileImagePreview}
                      alt="Profile preview"
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={removeProfileImage}
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
                  onChange={handleProfileImageUpload}
                  className="hidden"
                  id="story-profile-image"
                  disabled={uploading}
                />
                <label
                  htmlFor="story-profile-image"
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Upload size={16} />
                  {uploading ? 'Uploading...' : 'Upload Photo'}
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Show existing profile image if user has one */}
        {user?.profile_image?.url && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Profile Picture
            </label>
            <div className="flex items-center space-x-4">
              <img
                src={user.profile_image.url}
                alt="Your profile"
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
              />
              <div className="text-sm text-gray-600">
                Your existing profile picture will be used for this success story.
              </div>
            </div>
          </div>
        )}

        {/* Success Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Success Image (Optional)
          </label>
          <div className="flex items-center space-x-4">
            <div className="relative">
              {successImagePreview ? (
                <div className="relative">
                  <img
                    src={successImagePreview}
                    alt="Success image preview"
                    className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={removeSuccessImage}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-gray-400 text-2xl">📸</div>
                </div>
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleSuccessImageUpload}
                className="hidden"
                id="story-success-image"
                disabled={uploading}
              />
              <label
                htmlFor="story-success-image"
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Upload size={16} />
                {uploading ? 'Uploading...' : 'Upload Success Image'}
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

        {/* Story Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Success Story *
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Share your success story with our products and services..."
            maxLength={2000}
          />
          <p className="text-sm text-gray-500 mt-1">
            {form.description.length}/2000 characters
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
            disabled={submitting || !form.user_name.trim() || !form.description.trim()}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Share Story'}
          </button>
        </div>
      </form>
    </div>
  );
} 