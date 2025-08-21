import { useEffect, useState } from 'react';
import { machinesAPI } from '@/services/adminAPI';
import MachineForm from '@/components/admin/MachineForm';
import AdminNavbar from '@/components/admin/adminNavbar';
import { Plus, Pencil, Trash, Eye } from 'lucide-react';

const MachineManager = () => {
  const [machines, setMachines] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMachine, setEditingMachine] = useState(null);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [viewMode, setViewMode] = useState('gallery');

  const loadMachines = async () => {
    try {
      const { data } = await machinesAPI.getAll();
      setMachines(data);
    } catch (err) {
      console.error('Failed to load machines', err);
    }
  };

  useEffect(() => {
    loadMachines();
  }, []);

  const handleDelete = async (id) => {
    if (confirm('Delete this machine?')) {
      await machinesAPI.remove(id);
      loadMachines();
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
            <h2 className="text-xl font-bold">Manage Machines</h2>
            <button
              onClick={() => {
                setEditingMachine(null);
                setShowForm(true);
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              <Plus size={18} /> Add Machine
            </button>
          </div>

          {showForm && (
            <MachineForm
              existingData={editingMachine}
              onSuccess={() => {
                setShowForm(false);
                loadMachines();
              }}
              onCancel={() => setShowForm(false)}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {machines.map((m) => (
              <div key={m._id} className="bg-white p-4 rounded shadow-md border relative">
                {getMediaUrl(m.cover_image) ? (
                  <img
                    src={getMediaUrl(m.cover_image)}
                    className="h-40 w-full object-cover rounded"
                    alt={`${m.name} cover`}
                    onError={(e) => (e.target.src = '/placeholder.jpg')}
                  />
                ) : (
                  <div className="h-40 w-full bg-gray-200 flex items-center justify-center rounded text-gray-500">
                    No Image
                  </div>
                )}

                <div className="mt-3">
                  <h3 className="text-lg font-semibold">{m.name}</h3>
                  <p className="text-sm text-gray-600">{m.description?.slice(0, 80)}...</p>
                  <div className="flex gap-2 mt-2 text-xs">
                    {m.is_new && <span className="bg-green-100 text-green-700 px-2 py-1 rounded">New</span>}
                    {m.is_featured && <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Featured</span>}
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingMachine(m);
                        setShowForm(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(m._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedMachine(m);
                      setViewMode('gallery');
                      setShowDetails(true);
                    }}
                    className="text-gray-700 hover:text-black"
                  >
                    <Eye size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showDetails && selectedMachine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-6xl rounded-lg overflow-y-auto p-6 relative max-h-[90vh]">
            <button
              className="absolute top-3 right-3 text-gray-600 hover:text-black"
              onClick={() => setShowDetails(false)}
            >
              ✖
            </button>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/2">
                {getMediaUrl(selectedMachine.demo_video) ? (
                  <video
                    src={getMediaUrl(selectedMachine.demo_video)}
                    controls
                    className="w-full h-64 object-cover rounded"
                    onError={(e) => (e.target.style.display = 'none')}
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-100 flex items-center justify-center text-gray-500 rounded">
                    No Demo Video
                  </div>
                )}
              </div>
              <div className="md:w-1/2">
                <h2 className="text-2xl font-bold mb-2">{selectedMachine.name}</h2>
                <p className="text-gray-700 mb-4">{selectedMachine.description}</p>
                <div className="flex gap-2 text-sm mb-2">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">{selectedMachine.category_id?.name}</span>
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded">{selectedMachine.subcategory_id?.name}</span>
                </div>
                <div className="flex gap-2 text-xs">
                  {selectedMachine.is_new && <span className="text-green-700 font-semibold">🆕 New</span>}
                  {selectedMachine.is_featured && <span className="text-yellow-600 font-semibold">⭐ Featured</span>}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex gap-4 mb-4">
                <button
                  onClick={() => setViewMode('gallery')}
                  className={`px-4 py-2 rounded font-medium ${viewMode === 'gallery' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                  Gallery
                </button>
                <button
                  onClick={() => setViewMode('specs')}
                  className={`px-4 py-2 rounded font-medium ${viewMode === 'specs' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                  Specifications
                </button>
              </div>

              {viewMode === 'gallery' ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Array.isArray(selectedMachine.gallery_images) && selectedMachine.gallery_images.length > 0 ? (
                    selectedMachine.gallery_images.map((img, i) => (
                      <img
                        key={i}
                        src={getMediaUrl(img)}
                        alt={`Gallery ${i + 1}`}
                        className="w-full h-32 object-cover rounded"
                        onError={(e) => (e.target.src = '/placeholder.jpg')}
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center text-gray-500">No gallery images available.</div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-1">Specifications</h4>
                    <ul className="list-disc list-inside text-sm text-gray-700">
                      {selectedMachine.specifications.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Features</h4>
                    <ul className="list-disc list-inside text-sm text-gray-700">
                      {selectedMachine.features.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MachineManager;
