import React, { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaImage } from 'react-icons/fa';
import {
  useGetAllCategoriesAdminQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  usePermanentDeleteCategoryMutation,
  Category
} from '../../redux/api/category.api';
import { notify } from '../../utils/util';
import SkeletonLoader from '../common/SkeletonLoader';

const CategoryManagement: React.FC = () => {
  const { data: categoriesData, isLoading } = useGetAllCategoriesAdminQuery();
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [permanentDeleteCategory, { isLoading: isDeleting }] = usePermanentDeleteCategoryMutation();

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const resetForm = () => {
    setFormData({
      name: ''
    });
    setImageFile(null);
    setImagePreview('');
    setEditingCategory(null);
    setShowForm(false);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name
    });
    setImagePreview(category.image || '');
    setShowForm(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      notify('Category name is required', 'error');
      return;
    }

    const submitData = new FormData();
    submitData.append('name', formData.name.trim());

    if (imageFile) {
      submitData.append('image', imageFile);
    }

    try {
      if (editingCategory) {
        await updateCategory({
          id: editingCategory._id,
          formData: submitData
        }).unwrap();
        notify('Category updated successfully', 'success');
      } else {
        await createCategory({ formData: submitData }).unwrap();
        notify('Category created successfully', 'success');
      }
      resetForm();
    } catch (error: any) {
      notify(error?.data?.message || 'Operation failed', 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to permanently delete "${name}"? This action cannot be undone.`)) {
      try {
        await permanentDeleteCategory(id).unwrap();
        notify('Category permanently deleted successfully', 'success');
      } catch (error: any) {
        notify(error?.data?.message || 'Failed to delete category', 'error');
      }
    }
  };

  if (isLoading) return <SkeletonLoader rows={6} />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Category Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
        >
          <FaPlus /> Add Category
        </button>
      </div>

      {/* Category Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Hard Disk, Laptop, Mobile Phone"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category Image</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-200">
                    <FaImage />
                    Choose Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg" />
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark disabled:opacity-50"
                >
                  {(isCreating || isUpdating) ? 'Saving...' : (editingCategory ? 'Update' : 'Create')}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoriesData?.categories
          .filter(category => category.isActive)
          .map((category) => (
            <div key={category._id} className="bg-white rounded-lg shadow-md p-4 border hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{category.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">Value: {category.value}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    title="Edit Category"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(category._id, category.name)}
                    disabled={isDeleting}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete Category"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              {category.image && (
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
              )}

              <div className="flex items-center justify-between text-sm">
                <span className={`px-2 py-1 rounded-full text-xs ${category.isActive ? 'bg-primary/10 text-primary' : 'bg-red-100 text-red-800'
                  }`}>
                  {category.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="text-gray-500">
                  {new Date(category.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
      </div>

      {(!categoriesData?.categories.filter(cat => cat.isActive).length) && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No active categories found</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            Create Your First Category
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;