import { useEffect, useState } from 'react';
import { categoriesAPI } from '@/services/adminAPI';
import { Plus, Pencil, Trash } from 'lucide-react';
import CategoryForm from '@/components/admin/CategoryForm';
import AdminNavbar from '@/components/admin/adminNavbar';
import SubcategoryManager from '@/pages/admin/SubcategoryManager'; // 🔥

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const loadCategories = async () => {
    try {
      const { data } = await categoriesAPI.getAll();
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleEditClick = (category) => {
    setEditingCategory(category);
    setShowEditForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this category?')) {
      await categoriesAPI.remove(id);
      loadCategories();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="md:ml-64 pt-16 md:pt-0">
        <div className="p-4 md:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Manage Categories</h2>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              <Plus size={18} /> Add Category
            </button>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <CategoryForm
              onSuccess={() => {
                setShowAddForm(false);
                loadCategories();
              }}
              onCancel={() => setShowAddForm(false)}
            />
          )}

          {/* Edit Form */}
          {showEditForm && editingCategory && (
            <CategoryForm
              category={editingCategory}
              onSuccess={() => {
                setShowEditForm(false);
                setEditingCategory(null);
                loadCategories();
              }}
              onCancel={() => {
                setShowEditForm(false);
                setEditingCategory(null);
              }}
            />
          )}

          {/* Category + Subcategory Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {categories.map((cat) => (
              
              <div key={cat._id} className="bg-white p-4 rounded shadow-md border relative">
                {cat.image?.url && (
        <img
          src={cat.image.url}
          alt={cat.name}
          className="w-full h-32 object-cover rounded mb-2"
        />
      )}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{cat.name}</h3>
                    <p className="text-sm text-gray-500">{cat.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditClick(cat)} className="text-blue-600 hover:text-blue-800">
                      <Pencil size={18} />
                    </button>
                    <button onClick={() => handleDelete(cat._id)} className="text-red-600 hover:text-red-800">
                      <Trash size={18} />
                    </button>
                  </div>
                </div>

                {/* 🔥 Embedded Subcategory Manager */}
                <div className="mt-4">
                  <SubcategoryManager categoryId={cat._id} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
