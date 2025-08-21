import { useEffect, useState } from 'react';
import { partnerAPI } from '@/services/adminAPI';
import { uploadToCloudinary } from '@/utils/uploadToCloudinary';
import AdminNavbar from '@/components/admin/adminNavbar';
import { Plus, X, Upload } from 'lucide-react';

const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const emptyForm = { name: '', website: '', logo: null };

export default function PartnerManager() {
  const [partners, setPartners] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const loadPartners = async () => {
    const { data } = await partnerAPI.getAll();
    setPartners(data);
  };

  useEffect(() => { loadPartners(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const uploaded = await uploadToCloudinary(file, 'image', UPLOAD_PRESET);
      setForm((prev) => ({ ...prev, logo: uploaded }));
    } catch (err) {
      console.error('Logo upload failed:', err);
      alert('Logo upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.name) {
      alert('Please enter a partner name');
      return;
    }

    try {
      console.log('📥 Form data:', form);

      if (editing) {
        await partnerAPI.update(editing._id, form);
      } else {
        await partnerAPI.create(form);
      }
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
      loadPartners();
    } catch (err) {
      console.error('Failed to save partner:', err);
      alert('Failed to save partner.');
    }
  };

  const handleEdit = (partner) => {
    setEditing(partner);
    setForm({
      name: partner.name || '',
      website: partner.website || '',
      logo: partner.logo || null,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this partner?')) {
      await partnerAPI.remove(id);
      loadPartners();
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
            <h2 className="text-xl font-bold">Manage Partners</h2>
            <button
              onClick={() => { 
                setShowForm(true); 
                setEditing(null); 
                setForm(emptyForm); 
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              <Plus size={18} /> Add Partner
            </button>
          </div>

          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b">
                  <h2 className="text-xl font-bold">
                    {editing ? 'Edit Partner' : 'Add New Partner'}
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Partner Name *
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter partner name"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website URL
                    </label>
                    <input
                      name="website"
                      value={form.website}
                      onChange={handleChange}
                      type="url"
                      placeholder="https://example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Partner Logo
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
                      <div className="text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          id="logo-upload"
                        />
                        <label
                          htmlFor="logo-upload"
                          className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                        >
                          <Upload size={16} />
                          Choose Logo
                        </label>
                        {getMediaUrl(form.logo) && (
                          <div className="mt-4">
                            <img
                              src={getMediaUrl(form.logo)}
                              alt="Logo preview"
                              className="h-24 mx-auto object-contain border rounded"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {uploading && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-blue-700">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span>Uploading logo...</span>
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
                      {editing ? 'Update' : 'Create'} Partner
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.map((p) => (
              <div key={p._id} className="bg-white p-4 rounded shadow-md border flex flex-col items-center">
                <img
                  src={getMediaUrl(p.logo) || '/placeholder.jpg'}
                  alt={p.name}
                  className="h-20 object-contain mb-2"
                  onError={e => (e.target.src = '/placeholder.jpg')}
                />
                <h4 className="font-semibold text-lg mb-1">{p.name}</h4>
                {p.website && (
                  <a 
                    href={p.website} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:underline text-sm mb-2"
                  >
                    {p.website}
                  </a>
                )}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleEdit(p)}
                    className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded hover:bg-blue-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p._id)}
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