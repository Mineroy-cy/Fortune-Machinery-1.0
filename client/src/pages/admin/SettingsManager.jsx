import { useEffect, useState } from 'react';
import { settingsAPI } from '@/services/adminAPI';
import AdminNavbar from '@/components/admin/adminNavbar';
import { Upload, Save, Trash, Eye } from 'lucide-react';

const PAGES = [
  { key: 'home', name: 'Home Page' },
  { key: 'about', name: 'About Page' },
  { key: 'contact', name: 'Contact Page' },
  { key: 'products', name: 'Products Page' },
  { key: 'videos', name: 'Video Gallery' },
  { key: 'success-stories', name: 'Success Stories' },
];

export default function SettingsManager() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState({});
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data } = await settingsAPI.getAll();
      const settingsMap = {};
      data.forEach(setting => {
        settingsMap[setting.page] = setting;
      });
      setSettings(settingsMap);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (page, file) => {
    if (!file) return;

    console.log('📤 Starting image upload for page:', page);
    console.log('📊 Original file size:', file.size, 'bytes');

    setUploading(prev => ({ ...prev, [page]: true }));

    try {
      // Compress image before upload to reduce size
      const compressedFile = await compressImage(file);
      console.log('📊 Compressed file size:', compressedFile.size, 'bytes');

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result;
        console.log('📊 Base64 size:', base64Image.length, 'characters');
        
        try {
          const { data } = await settingsAPI.uploadBackground(base64Image, page);
          console.log('✅ Upload successful:', data);
          
          setSettings(prev => ({
            ...prev,
            [page]: {
              ...prev[page],
              background_image: data
            }
          }));
        } catch (err) {
          console.error('❌ Upload failed:', err);
          let errorMessage = 'Image upload failed';
          
          if (err.response?.status === 408) {
            errorMessage = 'Upload timeout - image may be too large. Please try a smaller image.';
          } else if (err.response?.data?.error) {
            errorMessage = err.response.data.error;
          }
          
          alert(errorMessage);
        } finally {
          setUploading(prev => ({ ...prev, [page]: false }));
        }
      };

      reader.readAsDataURL(compressedFile);
    } catch (err) {
      console.error('❌ Image compression failed:', err);
      alert('Failed to process image. Please try a different image.');
      setUploading(prev => ({ ...prev, [page]: false }));
    }
  };

  // Image compression function
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions (max 1920px width)
        const maxWidth = 1920;
        const maxHeight = 1080;
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          0.8 // 80% quality
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleSave = async (page) => {
    const setting = settings[page];
    if (!setting?.background_image?.url) {
      alert('Please upload a background image first.');
      return;
    }

    try {
      if (setting._id) {
        await settingsAPI.update(page, setting);
      } else {
        await settingsAPI.create(setting);
      }
      alert('Settings saved successfully!');
      loadSettings();
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save settings.');
    }
  };

  const handleDelete = async (page) => {
    if (!confirm('Delete settings for this page?')) return;

    try {
      await settingsAPI.remove(page);
      setSettings(prev => {
        const newSettings = { ...prev };
        delete newSettings[page];
        return newSettings;
      });
      alert('Settings deleted successfully!');
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete settings.');
    }
  };

  const updateSetting = (page, field, value) => {
    setSettings(prev => ({
      ...prev,
      [page]: {
        ...prev[page],
        page,
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        <div className="md:ml-64 pt-16 md:pt-0">
          <div className="p-4 md:p-6">
            <div className="text-center py-8">Loading settings...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="md:ml-64 pt-16 md:pt-0">
        <div className="p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Page Settings Manager</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {PAGES.map(({ key, name }) => {
                const setting = settings[key] || { page: key, is_active: true };
                
                return (
                  <div key={key} className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold">{name}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSave(key)}
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1"
                        >
                          <Save size={16} />
                          Save
                        </button>
                        {setting._id && (
                          <button
                            onClick={() => handleDelete(key)}
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 flex items-center gap-1"
                          >
                            <Trash size={16} />
                            Delete
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Background Image Upload */}
                    <div className="mb-4">
                      <label className="block font-medium mb-2">Background Image</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(key, e.target.files[0])}
                          className="flex-1"
                          disabled={uploading[key]}
                        />
                        {uploading[key] && <span className="text-blue-600">Uploading...</span>}
                      </div>
                      
                      {setting.background_image?.url && (
                        <div className="mt-3 relative">
                          <img
                            src={setting.background_image.url}
                            alt="Background preview"
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => setPreview(setting.background_image.url)}
                            className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded hover:bg-black/70"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Title and Subtitle */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block font-medium mb-1">Title</label>
                        <input
                          type="text"
                          value={setting.title || ''}
                          onChange={(e) => updateSetting(key, 'title', e.target.value)}
                          className="w-full border rounded px-3 py-2"
                          placeholder="Page title"
                        />
                      </div>
                      <div>
                        <label className="block font-medium mb-1">Subtitle</label>
                        <input
                          type="text"
                          value={setting.subtitle || ''}
                          onChange={(e) => updateSetting(key, 'subtitle', e.target.value)}
                          className="w-full border rounded px-3 py-2"
                          placeholder="Page subtitle"
                        />
                      </div>
                    </div>

                    {/* Active Toggle */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`active-${key}`}
                        checked={setting.is_active}
                        onChange={(e) => updateSetting(key, 'is_active', e.target.checked)}
                        className="rounded"
                      />
                      <label htmlFor={`active-${key}`} className="font-medium">
                        Active
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-2xl max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Image Preview</h3>
              <button
                onClick={() => setPreview(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <img src={preview} alt="Preview" className="w-full rounded" />
          </div>
        </div>
      )}
    </div>
  );
} 