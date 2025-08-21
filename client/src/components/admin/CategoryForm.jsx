import { useEffect, useState } from 'react';
import { categoriesAPI } from '@/services/adminAPI';
import { X } from 'lucide-react';

const CategoryForm = ({ category, onSuccess, onCancel }) => {
  const isEditing = Boolean(category);
  const [form, setForm] = useState({
    name: '',
    description: '',
    image: {
      url: '',
      public_id: '',
    },
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isEditing && category) {
      setForm({
        name: category.name || '',
        description: category.description || '',
        image: category.image || { url: '', public_id: '' },
      });
    }
  }, [isEditing, category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result;
      try {
        const { data } = await categoriesAPI.uploadImage(base64Image);
        setForm((prev) => ({
          ...prev,
          image: {
            url: data.url,
            public_id: data.public_id,
          },
        }));
      } catch (err) {
        console.error('❌ Upload failed:', err);
        alert('Image upload failed');
      } finally {
        setUploading(false);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!form.image?.url) {
    alert('Please upload a category image.');
    return;
  }

  const payload = {
    name: form.name,
    description: form.description,
    image: {
      url: form.image?.url,
      public_id: form.image?.public_id,
    },
  };

  console.log('📦 Payload being submitted:', payload);

  try {
    if (isEditing) {
      console.log("🟡 Final Payload:", JSON.stringify(payload, null, 2));
      await categoriesAPI.update(category._id, payload);
    } else {
      console.log("🟡 Final Payload:", JSON.stringify(payload, null, 2));

      await categoriesAPI.create(payload);
    }

    onSuccess();
  } catch (err) {
    console.error('❌ Save failed:', err);
    alert('Failed to save category.');
  }
};


  return (
    <div className="border rounded-lg p-4 bg-white shadow-md mb-4 relative">
      <button onClick={onCancel} className="absolute top-2 right-2 text-gray-500 hover:text-black">
        <X size={20} />
      </button>
      <h3 className="text-lg font-semibold mb-3">{isEditing ? 'Edit Category' : 'Add New Category'}</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2 mt-1"
          />
        </div>

        <div>
          <label className="block font-medium">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="w-full border rounded px-3 py-2 mt-1"
          />
        </div>

        <div>
          <label className="block font-medium">Image</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="mt-1" />
          {uploading && <p className="text-sm text-blue-500">Uploading...</p>}
          {form.image?.url && (
            <img
              src={form.image.url}
              alt="Preview"
              className="mt-2 h-24 object-cover border rounded"
              onError={(e) => (e.target.src = '/placeholder.jpg')}
            />
          )}
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {isEditing ? 'Update Category' : 'Create Category'}
        </button>
      </form>
    </div>
  );
};

export default CategoryForm;
