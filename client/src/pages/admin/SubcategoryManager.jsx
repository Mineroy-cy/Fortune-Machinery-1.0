import { useEffect, useState } from 'react';
import { categoriesAPI, subcategoriesAPI } from '@/services/adminAPI';
import { Plus, Pencil, Trash } from 'lucide-react';
import SubcategoryForm from '@/components/admin/SubcategoryForm';
import AdminNavbar from '@/components/admin/adminNavbar';

const SubcategoryManager = ({ categoryId: propCategoryId }) => {
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState(propCategoryId || '');
  const [subcategories, setSubcategories] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState(null);

  const loadCategories = async () => {
    try {
      const { data } = await categoriesAPI.getAll();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const loadSubcategories = async () => {
    try {
      const { data } = await subcategoriesAPI.getSubcategories(categoryId);
      setSubcategories(data);
    } catch (err) {
      console.error('Failed to fetch subcategories', err);
    }
  };

  useEffect(() => {
    if (!propCategoryId) loadCategories();
  }, [propCategoryId]);

  useEffect(() => {
    if (categoryId) loadSubcategories();
  }, [categoryId]);

  const handleEditClick = (subcategory) => {
    setEditingSubcategory(subcategory);
    setShowEditForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this subcategory?')) {
      await subcategoriesAPI.removeSubcategory(categoryId, id);
      loadSubcategories();
    }
  };

  return (
    <div className="p-4">
      {!propCategoryId && <AdminNavbar />}
      {!propCategoryId && (
        <div className="mb-4">
          <label className="block font-semibold mb-1">Select Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">-- Choose Category --</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {categoryId && (
        <>
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-md font-semibold">Subcategories</h4>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
            >
              <Plus size={16} /> Add Subcategory
            </button>
          </div>

          {showAddForm && (
            <SubcategoryForm
              categoryId={categoryId}
              onSuccess={() => {
                setShowAddForm(false);
                loadSubcategories();
              }}
              onCancel={() => setShowAddForm(false)}
            />
          )}

          {showEditForm && editingSubcategory && (
            <SubcategoryForm
              categoryId={categoryId}
              subcategory={editingSubcategory}
              onSuccess={() => {
                setShowEditForm(false);
                setEditingSubcategory(null);
                loadSubcategories();
              }}
              onCancel={() => {
                setShowEditForm(false);
                setEditingSubcategory(null);
              }}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {subcategories.map((sub) => (
              <div key={sub._id} className="bg-gray-100 p-3 rounded relative">
                <div className="flex gap-3">
                  {sub.image?.url ? (
                    <img
                      src={sub.image.url}
                      alt={sub.name}
                      className="h-16 w-16 object-cover rounded border"
                      onError={(e) => (e.target.src = '/placeholder.jpg')}
                    />
                  ) : (
                    <div className="h-16 w-16 bg-gray-300 flex items-center justify-center rounded text-xs text-gray-600">
                      No image
                    </div>
                  )}
                  <div className="flex-1">
                    <h5 className="font-medium">{sub.name}</h5>
                    <p className="text-sm text-gray-600">{sub.description}</p>
                  </div>
                </div>
                <div className="absolute top-2 right-2 flex gap-2">
                  <button onClick={() => handleEditClick(sub)} className="text-blue-600 hover:text-blue-800">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(sub._id)} className="text-red-600 hover:text-red-800">
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SubcategoryManager;
