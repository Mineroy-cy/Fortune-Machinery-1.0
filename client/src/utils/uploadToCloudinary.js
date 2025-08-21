/**
 * Upload a file directly to Cloudinary using an unsigned preset.
 * @param {File} file - The file to upload
 * @param {'image'|'video'} resourceType - Type of the media (image/video)
 * @param {string} uploadPreset - Your Cloudinary unsigned upload preset
 * @returns {Promise<{ url: string, public_id: string }>}
 */
export const uploadToCloudinary = async (file, resourceType = 'image', uploadPreset) => {
  // Check for required environment variables
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    throw new Error('VITE_CLOUDINARY_CLOUD_NAME environment variable is not set');
  }
  
  if (!uploadPreset) {
    throw new Error('Upload preset is required for Cloudinary upload');
  }

  console.log('🌤️ Starting Cloudinary upload:', {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    resourceType,
    uploadPreset: uploadPreset ? 'SET' : 'MISSING',
    cloudName: cloudName ? 'SET' : 'MISSING'
  });

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  console.log('📤 Uploading to:', url);

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    console.log('📥 Response status:', response.status, response.statusText);

    if (!response.ok) {
      const err = await response.json();
      console.error('❌ Cloudinary upload failed:', err);
      throw new Error(err.error?.message || `Cloudinary upload failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Cloudinary upload successful:', {
      url: data.secure_url,
      public_id: data.public_id
    });
    
    return {
      url: data.secure_url,
      public_id: data.public_id,
    };
  } catch (error) {
    console.error('❌ Upload error:', error);
    throw error;
  }
};
