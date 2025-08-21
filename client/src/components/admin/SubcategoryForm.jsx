import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { subcategoriesAPI } from '@/services/adminAPI';

const SubcategoryForm = ({ categoryId, subcategory, onSuccess, onCancel }) => {
  const isEditing = Boolean(subcategory);
  const [form, setForm] = useState({
    name: '',
    description: '',
    image: { url: '', public_id: '' },
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isEditing && subcategory) {
      setForm({
        name: subcategory.name || '',
        description: subcategory.description || '',
        image: subcategory.image || { url: '', public_id: '' },
      });
    }
  }, [subcategory, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = async () => {
      const base64Image = reader.result;

      try {
        const { data } = await subcategoriesAPI.uploadSubcategoryImage(base64Image);
        setForm((prev) => ({ ...prev, image: { url: data.url, public_id: data.public_id } }));
      } catch (err) {
        console.error('Image upload failed:', err);
        alert('Image upload failed');
      } finally {
        setUploading(false);
      }
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.image?.url) {
      alert('Please upload an image');
      return;
    }

    const payload = {
      name: form.name,
      description: form.description,
      image: form.image,
    };

    try {
      if (isEditing) {
        await subcategoriesAPI.updateSubcategory(categoryId, subcategory._id, payload);
      } else {
        await subcategoriesAPI.createSubcategory(categoryId, payload);
      }

      onSuccess();
    } catch (err) {
      console.error('Subcategory save failed:', err);
      alert('Failed to save subcategory');
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow-md mb-4 relative">
      <button onClick={onCancel} className="absolute top-2 right-2 text-gray-500 hover:text-black">
        <X size={20} />
      </button>

      <h3 className="text-lg font-semibold mb-3">
        {isEditing ? 'Edit Subcategory' : 'Add New Subcategory'}
      </h3>

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
          <input type="file" accept="image/*" onChange={handleImageChange} className="mt-1" />
          {uploading && <p className="text-sm text-blue-500">Uploading...</p>}
          {form.image?.url && (
            <img
              src={form.image.url}
              alt="Preview"
              className="mt-2 h-24 object-cover border rounded"
            />
          )}
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          {isEditing ? 'Update Subcategory' : 'Create Subcategory'}
        </button>
      </form>
    </div>
  );
};

export default SubcategoryForm;
