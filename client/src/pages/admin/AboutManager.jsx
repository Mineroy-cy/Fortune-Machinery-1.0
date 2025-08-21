import { useEffect, useState } from 'react';
import { aboutAPI } from '@/services/adminAPI';
import { uploadToCloudinary } from '@/utils/uploadToCloudinary';
import AdminNavbar from '@/components/admin/adminNavbar';

const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const emptyForm = {
  description: '',
  whyChooseUs: [''],
  images: [],
};

export default function AboutManager() {
  const [about, setAbout] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadAbout = async () => {
    const { data } = await aboutAPI.get();
    setAbout(data);
    if (data) setForm({
      description: data.description || '',
      whyChooseUs: data.whyChooseUs?.length ? data.whyChooseUs : [''],
      images: data.images || [],
    });
  };

  useEffect(() => { loadAbout(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleWhyChange = (idx, value) => {
    setForm((prev) => {
      const arr = [...prev.whyChooseUs];
      arr[idx] = value;
      return { ...prev, whyChooseUs: arr };
    });
  };

  const addWhy = () => setForm((prev) => ({ ...prev, whyChooseUs: [...prev.whyChooseUs, ''] }));
  const removeWhy = (idx) => setForm((prev) => ({ ...prev, whyChooseUs: prev.whyChooseUs.filter((_, i) => i !== idx) }));

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const uploaded = await uploadToCloudinary(file, 'image', UPLOAD_PRESET);
      setForm((prev) => ({ ...prev, images: [...prev.images, uploaded] }));
    } catch (err) {
      alert('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx) => setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (about && about._id) {
        await aboutAPI.update(about._id, form);
      } else {
        await aboutAPI.create(form);
      }
      setEditing(false);
      loadAbout();
    } catch (err) {
      alert('Failed to save about info.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="md:ml-64 pt-16 md:pt-0">
        <div className="p-4 md:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Manage About Page</h2>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {about ? 'Edit' : 'Add About Info'}
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} className="bg-white rounded shadow-md p-4 mb-6 max-w-2xl">
              <div className="mb-4">
                <label className="block font-medium">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  required
                  className="w-full border rounded px-3 py-2 mt-1"
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium">Why Choose Us</label>
                {form.whyChooseUs.map((why, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      value={why}
                      onChange={e => handleWhyChange(idx, e.target.value)}
                      className="w-full border rounded px-3 py-2"
                      placeholder={`Reason #${idx + 1}`}
                      maxLength={300}
                      required
                    />
                    {form.whyChooseUs.length > 1 && (
                      <button type="button" onClick={() => removeWhy(idx)} className="text-red-600">Remove</button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addWhy} className="text-blue-600 mt-2">+ Add Reason</button>
              </div>
              <div className="mb-4">
                <label className="block font-medium">Images (optional)</label>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="mt-1" />
                {uploading && <p className="text-blue-600 text-sm">Uploading...</p>}
                <div className="flex gap-2 mt-2 flex-wrap">
                  {form.images.map((img, idx) => (
                    <div key={idx} className="relative">
                      <img src={img.url} alt="About" className="h-16 w-24 object-cover border rounded" />
                      <button
                        type="button"
                        className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        onClick={() => removeImage(idx)}
                        title="Remove"
                      >×</button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  disabled={uploading}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
                  onClick={() => { setEditing(false); loadAbout(); }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : about ? (
            <div className="bg-white rounded shadow-md p-4 max-w-2xl">
              <h3 className="font-semibold mb-2">Current About Info</h3>
              <div className="mb-2 text-gray-700 whitespace-pre-line">{about.description}</div>
              <div className="mb-2">
                <h4 className="font-medium mb-1">Why Choose Us</h4>
                <ul className="list-disc list-inside text-gray-700">
                  {about.whyChooseUs.map((why, idx) => (
                    <li key={idx}>{why}</li>
                  ))}
                </ul>
              </div>
              {about.images?.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {about.images.map((img, idx) => (
                    <img key={idx} src={img.url} alt="About" className="h-16 w-24 object-cover border rounded" />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500">No about info yet.</div>
          )}
        </div>
      </div>
    </div>
  );
} 