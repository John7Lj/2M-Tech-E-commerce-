import React, { useState } from 'react';
import {
  useGetAllSubcategoriesQuery,
  useCreateSubcategoryMutation,
  useUpdateSubcategoryMutation,
  useDeleteSubcategoryMutation,
  Subcategory,
} from '../../redux/api/subcategory.api';
import { useGetAllCategoriesQuery } from '../../redux/api/category.api';
import { notify } from '../../utils/util';
import { CustomError } from '../../types/api-types';

interface SubcategoryFormData {
  name: string;
  description: string;
  parentCategory: string;
  image: File | null;
}

const SubcategoryManagement: React.FC = () => {
  const { data: subcategoriesData, isLoading: subcategoriesLoading } = useGetAllSubcategoriesQuery();
  const { data: categoriesData, isLoading: categoriesLoading } = useGetAllCategoriesQuery();
  const [createSubcategory, { isLoading: isCreating }] = useCreateSubcategoryMutation();
  const [updateSubcategory, { isLoading: isUpdating }] = useUpdateSubcategoryMutation();
  const [deleteSubcategory, { isLoading: isDeleting }] = useDeleteSubcategoryMutation();

  const [showForm, setShowForm] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [formData, setFormData] = useState<SubcategoryFormData>({
    name: '',
    description: '',
    parentCategory: '',
    image: null,
  });

  const subcategories = subcategoriesData?.subcategories || [];
  const categories = categoriesData?.categories || [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, image: file }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      parentCategory: '',
      image: null,
    });
    setEditingSubcategory(null);
    setShowForm(false);
  };

  const handleEdit = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
    setFormData({
      name: subcategory.name,
      description: subcategory.description || '',
      parentCategory: subcategory.parentCategory._id,
      image: null,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      notify('Subcategory name is required', 'error');
      return;
    }

    if (!formData.parentCategory) {
      notify('Parent category is required', 'error');
      return;
    }

    const submitFormData = new FormData();
    submitFormData.append('name', formData.name.trim());
    submitFormData.append('description', formData.description.trim());
    submitFormData.append('parentCategory', formData.parentCategory);

    if (formData.image) {
      submitFormData.append('image', formData.image);
    }

    try {
      if (editingSubcategory) {
        await updateSubcategory({
          id: editingSubcategory._id,
          formData: submitFormData,
        }).unwrap();
        notify('Subcategory updated successfully', 'success');
      } else {
        await createSubcategory({ formData: submitFormData }).unwrap();
        notify('Subcategory created successfully', 'success');
      }
      resetForm();
    } catch (error) {
      const err = error as CustomError;
      notify(err?.data?.message || 'Operation failed', 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteSubcategory(id).unwrap();
        notify('Subcategory deleted successfully', 'success');
      } catch (error) {
        const err = error as CustomError;
        notify(err?.data?.message || 'Failed to delete subcategory', 'error');
      }
    }
  };

  if (subcategoriesLoading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subcategories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Subcategory Management</h1>
          <p className="text-gray-600 mt-1">Manage product subcategories</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center space-x-2"
        >
          <span>+</span>
          <span>Add Subcategory</span>
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">
              {editingSubcategory ? 'Edit Subcategory' : 'Add New Subcategory'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="parentCategory"
                  value={formData.parentCategory}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select parent category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image
                </label>
                <input
                  type="file"
                  onChange={handleImageChange}
                  accept="image/*"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
                >
                  {isCreating || isUpdating ? 'Saving...' : editingSubcategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subcategories List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-800">
            All Subcategories ({subcategories.length})
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {subcategories.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              <p>No subcategories found</p>
              <button
                onClick={() => setShowForm(true)}
                className="text-primary hover:text-primary-dark mt-2"
              >
                Create your first subcategory
              </button>
            </div>
          ) : (
            subcategories.map((subcategory) => (
              <div key={subcategory._id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {subcategory.image && (
                    <img
                      src={subcategory.image}
                      alt={subcategory.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <h3 className="font-medium text-gray-800">{subcategory.name}</h3>
                    <p className="text-sm text-gray-500">
                      Parent: {subcategory.parentCategory.name}
                    </p>
                    {subcategory.description && (
                      <p className="text-sm text-gray-600 mt-1">{subcategory.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${subcategory.isActive
                      ? 'bg-primary/10 text-primary'
                      : 'bg-red-100 text-red-800'
                    }`}>
                    {subcategory.isActive ? 'Active' : 'Inactive'}
                  </span>

                  <button
                    onClick={() => handleEdit(subcategory)}
                    className="text-primary hover:text-primary-dark text-sm"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(subcategory._id, subcategory.name)}
                    disabled={isDeleting}
                    className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SubcategoryManagement;