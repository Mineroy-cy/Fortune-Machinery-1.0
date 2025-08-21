import React, { useState, useEffect } from 'react';
import { machinesAPI, categoriesAPI, subcategoriesAPI } from '@/services/adminAPI';
import { uploadToCloudinary } from '@/utils/uploadToCloudinary';
import { X } from 'lucide-react';

const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const MachineForm = ({ onSuccess, onCancel, existingData }) => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    cover_image: null,
    demo_video: null,
    gallery_images: [],
    video_thumbnail: null,
    features: [],
    specifications: [],
    category_id: '',
    subcategory_id: '',
    is_new: false,
    is_featured: false,
    price: '',
  });

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    categoriesAPI.getAll().then(({ data }) => setCategories(data));
    if (existingData) {
      setForm((prev) => ({
        ...prev,
        ...existingData,
        features: existingData.features || [],
        specifications: existingData.specifications || [],
        gallery_images: existingData.gallery_images || [],
      }));
    }
  }, [existingData]);

  useEffect(() => {
    if (form.category_id) {
      subcategoriesAPI.getByCategory(form.category_id).then(({ data }) => setSubcategories(data));
    } else {
      setSubcategories([]);
    }
  }, [form.category_id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleArrayChange = (e, key) => {
    const values = e.target.value
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
    setForm((prev) => ({ ...prev, [key]: values }));
  };

  // Cover Image Upload (direct to Cloudinary)
  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const uploaded = await uploadToCloudinary(file, 'image', UPLOAD_PRESET);
      setForm((prev) => ({ ...prev, cover_image: uploaded }));
    } catch (err) {
      console.error('Cover image upload failed:', err);
      alert('Cover image upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Demo Video Upload (direct to Cloudinary)
  const handleDemoVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const uploaded = await uploadToCloudinary(file, 'video', UPLOAD_PRESET);
      setForm((prev) => ({ ...prev, demo_video: uploaded }));
    } catch (err) {
      console.error('Demo video upload failed:', err);
      alert('Demo video upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Video Thumbnail Upload (direct to Cloudinary)
  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const uploaded = await uploadToCloudinary(file, 'image', UPLOAD_PRESET);
      setForm((prev) => ({ ...prev, video_thumbnail: uploaded }));
    } catch (err) {
      console.error('Thumbnail upload failed:', err);
      alert('Thumbnail upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Gallery Images Upload (Multiple, direct to Cloudinary)
  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);
    try {
      const uploads = await Promise.all(
        files.map((file) => uploadToCloudinary(file, 'image', UPLOAD_PRESET))
      );
      setForm((prev) => ({
        ...prev,
        gallery_images: [...prev.gallery_images, ...uploads],
      }));
    } catch (err) {
      console.error('Gallery image upload failed:', err);
      alert('Gallery image upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Remove gallery image
  const handleRemoveGalleryImage = (idx) => {
    setForm((prev) => ({
      ...prev,
      gallery_images: prev.gallery_images.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.name || !form.category_id || !form.subcategory_id) {
      alert('Please fill in all required fields (Name, Category, Subcategory)');
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
      
      console.log('📦 MachineForm submitting payload:', JSON.stringify(payload, null, 2));
      
      if (existingData) {
        console.log('🔄 Updating existing machine:', existingData._id);
        await machinesAPI.update(existingData._id, payload);
      } else {
        console.log('🆕 Creating new machine');
        await machinesAPI.create(payload);
      }
      onSuccess?.();
    } catch (err) {
      console.error('❌ Submit error:', err);
      console.error('❌ Error response:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);
      alert(`Failed to save machine: ${err.response?.data?.error || err.message}`);
    }
  };

  // Helper to preview images/videos
  const getMediaUrl = (media) => {
    if (!media) return '';
    if (typeof media === 'string') return media;
    return media.url;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">
            {existingData ? 'Edit Machine' : 'Add New Machine'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Machine Name *
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter machine name"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (optional)
              </label>
              <input
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="Enter price"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter machine description"
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subcategory *
              </label>
              <select
                name="subcategory_id"
                value={form.subcategory_id}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Subcategory</option>
                {subcategories.map((sub) => (
                  <option key={sub._id} value={sub._id}>{sub.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Media Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cover Image
              </label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleCoverUpload} 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
              {getMediaUrl(form.cover_image) && (
                <img src={getMediaUrl(form.cover_image)} alt="Cover" className="h-32 mt-2 object-cover rounded" />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Demo Video
              </label>
              <input 
                type="file" 
                accept="video/*" 
                onChange={handleDemoVideoUpload} 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
              {getMediaUrl(form.demo_video) && (
                <video src={getMediaUrl(form.demo_video)} controls className="h-32 mt-2 rounded" />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Video Thumbnail
              </label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleThumbnailUpload} 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
              {getMediaUrl(form.video_thumbnail) && (
                <img src={getMediaUrl(form.video_thumbnail)} alt="Thumbnail" className="h-24 mt-2 object-cover rounded" />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gallery Images
              </label>
              <input 
                type="file" 
                accept="image/*" 
                multiple 
                onChange={handleGalleryUpload} 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
              <div className="flex gap-2 mt-2 overflow-auto">
                {form.gallery_images?.map((img, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={getMediaUrl(img)}
                      alt={`Gallery ${idx}`}
                      className="h-20 w-20 object-cover rounded"
                    />
                    <button
                      type="button"
                      className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      onClick={() => handleRemoveGalleryImage(idx)}
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Features & Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Features (comma separated)
              </label>
              <input
                type="text"
                value={form.features.join(', ')}
                onChange={(e) => handleArrayChange(e, 'features')}
                placeholder="Enter features separated by commas"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specifications (comma separated)
              </label>
              <input
                type="text"
                value={form.specifications.join(', ')}
                onChange={(e) => handleArrayChange(e, 'specifications')}
                placeholder="Enter specifications separated by commas"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                name="is_new" 
                checked={form.is_new} 
                onChange={handleChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">New Machine</span>
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                name="is_featured" 
                checked={form.is_featured} 
                onChange={handleChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Featured</span>
            </label>
          </div>

          {uploading && (
            <div className="text-blue-600 text-center py-2">
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Uploading media...
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={uploading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {existingData ? 'Update' : 'Create'} Machine
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MachineForm;
