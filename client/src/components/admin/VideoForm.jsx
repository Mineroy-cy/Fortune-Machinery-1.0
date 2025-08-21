import React, { useState, useEffect } from 'react';
import { uploadToCloudinary } from '@/utils/uploadToCloudinary';
import { machinesAPI, videosAPI } from '@/services/adminAPI';
import { X, Upload, Play, Image, Star } from 'lucide-react';

const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const VideoForm = ({ onSuccess, existingData, onCancel }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    video: null,
    thumbnail: null,
    duration: '',
    machine_id: '',
    isFeatured: false,
  });
  const [machines, setMachines] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    machinesAPI.getAll().then(({ data }) => setMachines(data));
    if (existingData) {
      setForm((prev) => ({
        ...prev,
        ...existingData,
        video: existingData.video || null,
        thumbnail: existingData.thumbnail || null,
        machine_id: existingData.machine_id?._id || existingData.machine_id || '',
      }));
    }
  }, [existingData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Video upload
  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const uploaded = await uploadToCloudinary(file, 'video', UPLOAD_PRESET);
      setForm((prev) => ({ ...prev, video: uploaded }));
    } catch (err) {
      alert('Video upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Thumbnail upload
  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const uploaded = await uploadToCloudinary(file, 'image', UPLOAD_PRESET);
      setForm((prev) => ({ ...prev, thumbnail: uploaded }));
    } catch (err) {
      alert('Thumbnail upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Omit thumbnail if not set
      const payload = { ...form };
      if (!form.thumbnail) delete payload.thumbnail;
      if (existingData) {
        await videosAPI.update(existingData._id, payload);
      } else {
        await videosAPI.create(payload);
      }
      onSuccess?.();
    } catch (err) {
      console.error('Submit error:', err.response?.data || err.message);
      alert('Failed to save video.');
    }
  };

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
            {existingData ? 'Edit Video' : 'Add New Video'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video Title *
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter video title"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration
              </label>
              <input
                name="duration"
                value={form.duration}
                onChange={handleChange}
                placeholder="e.g. 2:30"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter video description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Associated Machine *
            </label>
            <select
              name="machine_id"
              value={form.machine_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a machine</option>
              {machines.map((m) => (
                <option key={m._id} value={m._id}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Media Upload Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Video Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
              <div className="text-center">
                <Play className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video File *
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                  id="video-upload"
                />
                <label
                  htmlFor="video-upload"
                  className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                >
                  <Upload size={16} />
                  Choose Video
                </label>
                {getMediaUrl(form.video) && (
                  <div className="mt-4">
                    <video
                      src={getMediaUrl(form.video)}
                      controls
                      className="w-full h-32 object-cover rounded"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
              <div className="text-center">
                <Image className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thumbnail Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  className="hidden"
                  id="thumbnail-upload"
                />
                <label
                  htmlFor="thumbnail-upload"
                  className="cursor-pointer bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center gap-2"
                >
                  <Upload size={16} />
                  Choose Image
                </label>
                {getMediaUrl(form.thumbnail) && (
                  <div className="mt-4">
                    <img
                      src={getMediaUrl(form.thumbnail)}
                      alt="Thumbnail"
                      className="w-full h-32 object-cover rounded"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isFeatured"
              checked={form.isFeatured}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Star size={16} className="text-yellow-500" />
              Mark as Featured Video
            </label>
          </div>

          {/* Upload Status */}
          {uploading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-700">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Uploading media...</span>
              </div>
            </div>
          )}

          {/* Submit Buttons */}
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
              {existingData ? 'Update' : 'Create'} Video
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VideoForm; 