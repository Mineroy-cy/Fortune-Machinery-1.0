import { useEffect, useState } from 'react';
import { successStoryAPI } from '@/services/adminAPI';
import { uploadToCloudinary } from '@/utils/uploadToCloudinary';
import AdminNavbar from '@/components/admin/adminNavbar';
import ImageCropper from '@/components/admin/ImageCropper';
import { Plus, X, Upload, Star, User } from 'lucide-react';

const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

// Debug environment variables
console.log('🔧 Environment check:', {
  UPLOAD_PRESET: UPLOAD_PRESET ? 'SET' : 'MISSING',
  CLOUD_NAME: CLOUD_NAME ? 'SET' : 'MISSING'
});

const emptyForm = {
  title: '',
  user_name: '',
  company: '',
  description: '',
  success_image: null,
  profile_image: null,
  rating: 5,
};

export default function SuccessStoryManager() {
  const [stories, setStories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [cropperImage, setCropperImage] = useState('');
  const [cropperType, setCropperType] = useState('');

  const loadStories = async () => {
    const { data } = await successStoryAPI.getAll();
    setStories(data);
  };

  useEffect(() => { loadStories(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e, key) => {
    const file = e.target.files[0];
    if (!file) return;
    
    console.log(`📤 Uploading ${key} image:`, file.name, file.size);
    
    // Test environment variables
    if (!UPLOAD_PRESET || !CLOUD_NAME) {
      alert('Cloudinary environment variables are not set. Please check your .env file.');
      return;
    }
    
    if (key === 'profile_image') {
      // For profile images, show cropper
      const reader = new FileReader();
      reader.onload = () => {
        setCropperImage(reader.result);
        setCropperType(key);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    } else {
      // For other images, upload directly
      setUploading(true);
      try {
        console.log(`🔄 Uploading ${key} to Cloudinary...`);
        const uploaded = await uploadToCloudinary(file, 'image', UPLOAD_PRESET);
        console.log(`✅ ${key} uploaded successfully:`, uploaded);
        setForm((prev) => ({ ...prev, [key]: uploaded }));
      } catch (err) {
        console.error(`${key} upload failed:`, err);
        alert(`${key} upload failed: ${err.message}`);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleCropComplete = async (croppedImageUrl) => {
    try {
      console.log('🔄 Processing cropped image...');
      
      // Convert blob URL to file and upload
      const response = await fetch(croppedImageUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch cropped image');
      }
      
      const blob = await response.blob();
      console.log('📦 Cropped blob size:', blob.size);
      
      const file = new File([blob], 'cropped-profile.jpg', { type: 'image/jpeg' });
      console.log('📁 Created file:', file.name, file.size);
      
      setUploading(true);
      console.log('🔄 Uploading cropped image to Cloudinary...');
      const uploaded = await uploadToCloudinary(file, 'image', UPLOAD_PRESET);
      console.log('✅ Cropped image uploaded successfully:', uploaded);
      
      setForm((prev) => ({ ...prev, [cropperType]: uploaded }));
      setShowCropper(false);
      setCropperImage('');
      setCropperType('');
    } catch (err) {
      console.error('❌ Cropped image upload failed:', err);
      alert(`Failed to upload cropped image: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.user_name || !form.description) {
      alert('Please fill in all required fields (User Name and Description)');
      return;
    }

    try {
      // Prepare payload, omitting null fields
      const payload = { ...form };
      Object.keys(payload).forEach(key => {
        if (payload[key] === null || payload[key] === '') {
          delete payload[key];
        }
      });
      
      console.log('📦 SuccessStoryManager submitting payload:', JSON.stringify(payload, null, 2));
      
      if (editing) {
        console.log('🔄 Updating existing success story:', editing._id);
        await successStoryAPI.update(editing._id, payload);
      } else {
        console.log('🆕 Creating new success story');
        await successStoryAPI.create(payload);
      }
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
      loadStories();
    } catch (err) {
      console.error('❌ Submit error:', err);
      console.error('❌ Error response:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);
      alert(`Failed to save success story: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleEdit = (story) => {
    setEditing(story);
    setForm({
      title: story.title || '',
      user_name: story.user_name || '',
      company: story.company || '',
      description: story.description || '',
      success_image: story.success_image || null,
      profile_image: story.profile_image || null,
      rating: story.rating || 5,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this success story?')) {
      await successStoryAPI.remove(id);
      loadStories();
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
            <h2 className="text-xl font-bold">Manage Success Stories</h2>
            <button
              onClick={() => { 
                setShowForm(true); 
                setEditing(null); 
                setForm(emptyForm); 
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              <Plus size={18} /> Add Success Story
            </button>
          </div>

          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b">
                  <h2 className="text-xl font-bold">
                    {editing ? 'Edit Success Story' : 'Add New Success Story'}
                  </h2>
                  <button
                    onClick={() => { 
                      setShowForm(false); 
                      setEditing(null); 
                      setForm(emptyForm); 
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        User Name *
                      </label>
                      <input
                        name="user_name"
                        value={form.user_name}
                        onChange={handleChange}
                        placeholder="Enter user name"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company
                      </label>
                      <input
                        name="company"
                        value={form.company}
                        onChange={handleChange}
                        placeholder="Enter company name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="Enter story title"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Enter success story description"
                      rows={4}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Success Image
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
                        <div className="text-center">
                          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'success_image')}
                            className="hidden"
                            id="success-image-upload"
                          />
                          <label
                            htmlFor="success-image-upload"
                            className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                          >
                            <Upload size={16} />
                            Choose Image
                          </label>
                          {getMediaUrl(form.success_image) && (
                            <div className="mt-4">
                              <img
                                src={getMediaUrl(form.success_image)}
                                alt="Success image preview"
                                className="h-24 mx-auto object-cover border rounded"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Profile Image (with crop)
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
                        <div className="text-center">
                          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'profile_image')}
                            className="hidden"
                            id="profile-image-upload"
                          />
                          <label
                            htmlFor="profile-image-upload"
                            className="cursor-pointer bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center gap-2"
                          >
                            <Upload size={16} />
                            Choose & Crop
                          </label>
                          {getMediaUrl(form.profile_image) && (
                            <div className="mt-4">
                              <img
                                src={getMediaUrl(form.profile_image)}
                                alt="Profile image preview"
                                className="h-24 w-24 mx-auto object-cover border rounded-full"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        name="rating"
                        type="number"
                        min={1}
                        max={5}
                        value={form.rating}
                        onChange={handleChange}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={20}
                            className={i < form.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {uploading && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-blue-700">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span>Uploading image...</span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-4 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => { 
                        setShowForm(false); 
                        setEditing(null); 
                        setForm(emptyForm); 
                      }}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={uploading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {editing ? 'Update' : 'Create'} Success Story
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showCropper && (
            <ImageCropper
              image={cropperImage}
              onCropComplete={handleCropComplete}
              onCancel={() => {
                setShowCropper(false);
                setCropperImage('');
                setCropperType('');
              }}
              aspectRatio={1}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <div key={story._id} className="bg-white p-4 rounded shadow-md border">
                <div className="flex items-center space-x-3 mb-3">
                  {getMediaUrl(story.profile_image) ? (
                    <img
                      src={getMediaUrl(story.profile_image)}
                      alt={story.user_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-lg">{story.user_name}</h4>
                    {story.company && (
                      <p className="text-sm text-gray-500">{story.company}</p>
                    )}
                  </div>
                </div>

                {story.title && (
                  <h5 className="font-medium text-gray-900 mb-2">{story.title}</h5>
                )}

                <p className="text-gray-600 text-sm mb-3 line-clamp-3">{story.description}</p>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < story.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                      />
                    ))}
                    <span className="text-sm text-gray-500 ml-1">({story.rating}/5)</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    story.is_approved 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {story.is_approved ? 'Approved' : 'Pending'}
                  </span>
                </div>

                {getMediaUrl(story.success_image) && (
                  <img
                    src={getMediaUrl(story.success_image)}
                    alt="Success story"
                    className="w-full h-32 object-cover rounded mb-3"
                  />
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(story)}
                    className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded hover:bg-blue-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(story._id)}
                    className="text-red-600 hover:text-red-800 px-3 py-1 rounded hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 