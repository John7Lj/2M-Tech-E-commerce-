import React, { useState, useEffect } from 'react';
import { ProductFormData, Category, Subcategory, Brand } from '../../types';

interface BasicInformationProps {
  formData: ProductFormData;
  categories: Category[];
  subcategories: Subcategory[];
  brands: Brand[];
  categoriesLoading: boolean;
  subcategoriesLoading: boolean;
  brandsLoading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onCategoryChange: (selectedCategories: string[]) => void;
  onSubcategoryChange: (selectedSubcategories: string[]) => void;
}

const BasicInformation: React.FC<BasicInformationProps> = ({
  formData,
  categories,
  subcategories,
  brands,
  categoriesLoading,
  subcategoriesLoading,
  brandsLoading,
  onInputChange,
  onCategoryChange,
  onSubcategoryChange
}) => {
  const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([]);

  // Filter subcategories based on selected categories
  useEffect(() => {
    if (formData.categories.length > 0) {
      const filtered = subcategories.filter(sub =>
        sub.parentCategory && formData.categories.includes(sub.parentCategory._id)
      );
      setFilteredSubcategories(filtered);

      // Remove subcategories that are no longer valid
      const validSubcategories = formData.subcategories.filter(subId =>
        filtered.some(sub => sub._id === subId)
      );

      if (validSubcategories.length !== formData.subcategories.length) {
        onSubcategoryChange(validSubcategories);
      }
    } else {
      setFilteredSubcategories([]);
      if (formData.subcategories.length > 0) {
        onSubcategoryChange([]);
      }
    }
  }, [formData.categories, subcategories, formData.subcategories, onSubcategoryChange]);

  const handleCategoryToggle = (categoryId: string) => {
    const updatedCategories = formData.categories.includes(categoryId)
      ? formData.categories.filter(id => id !== categoryId)
      : [...formData.categories, categoryId];

    onCategoryChange(updatedCategories);
  };

  const handleSubcategoryToggle = (subcategoryId: string) => {
    const updatedSubcategories = formData.subcategories.includes(subcategoryId)
      ? formData.subcategories.filter(id => id !== subcategoryId)
      : [...formData.subcategories, subcategoryId];

    onSubcategoryChange(updatedSubcategories);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
          <span className="text-primary font-bold">1</span>
        </div>
        Basic Information
      </h2>

      <div className="space-y-6">
        {/* Product Name */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={onInputChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
            placeholder="Enter product name"
            required
          />
        </div>

        {/* Categories */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Categories <span className="text-red-500">*</span>
            <span className="text-xs text-gray-500 ml-2">
              (Select one or more categories)
            </span>
          </label>

          {categoriesLoading ? (
            <div className="text-center py-4 text-gray-500">⏳ Loading categories...</div>
          ) : categories.length === 0 ? (
            <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
              ⚠️ No categories available. Please create categories first.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-4 bg-gray-50">
              {categories.map((category) => (
                <label
                  key={category._id}
                  className="flex items-center space-x-2 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.categories.includes(category._id)}
                    onChange={() => handleCategoryToggle(category._id)}
                    className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {category.name}
                  </span>
                </label>
              ))}
            </div>
          )}

          {formData.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.categories.map(categoryId => {
                const category = categories.find(cat => cat._id === categoryId);
                return category ? (
                  <span
                    key={categoryId}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                  >
                    {category.name}
                    <button
                      type="button"
                      onClick={() => handleCategoryToggle(categoryId)}
                      className="ml-2 text-primary hover:text-primary-dark"
                    >
                      ×
                    </button>
                  </span>
                ) : null;
              })}
            </div>
          )}
        </div>

        {/* Subcategories */}
        {formData.categories.length > 0 && (
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Subcategories
              <span className="text-xs text-gray-500 ml-2">
                (Optional - Select relevant subcategories)
              </span>
            </label>

            {subcategoriesLoading ? (
              <div className="text-center py-4 text-gray-500">⏳ Loading subcategories...</div>
            ) : filteredSubcategories.length === 0 ? (
              <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                📂 No subcategories available for selected categories.
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-4 bg-gray-50">
                {filteredSubcategories.map((subcategory) => (
                  <label
                    key={subcategory._id}
                    className="flex items-center space-x-2 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={formData.subcategories.includes(subcategory._id)}
                      onChange={() => handleSubcategoryToggle(subcategory._id)}
                      className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
                    />
                    <div className="text-sm">
                      <div className="font-medium text-gray-700">{subcategory.name}</div>
                      <div className="text-xs text-gray-500">{subcategory.parentCategory.name}</div>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {formData.subcategories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.subcategories.map(subcategoryId => {
                  const subcategory = filteredSubcategories.find(sub => sub._id === subcategoryId);
                  return subcategory ? (
                    <span
                      key={subcategoryId}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                    >
                      {subcategory.name}
                      <button
                        type="button"
                        onClick={() => handleSubcategoryToggle(subcategoryId)}
                        className="ml-2 text-primary hover:text-primary-dark"
                      >
                        ×
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>
        )}

        {/* Brand */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Brand <span className="text-red-500">*</span>
          </label>
          <select
            name="brand"
            value={formData.brand}
            onChange={onInputChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
            required
            disabled={brandsLoading}
          >
            <option value="">
              {brandsLoading ? '⏳ Loading brands...' : '🏷️ Select a brand'}
            </option>
            {brands.map((brand) => (
              <option key={brand._id} value={brand._id}>
                {brand.name}
              </option>
            ))}
          </select>
          {brands.length === 0 && !brandsLoading && (
            <p className="text-sm text-red-500 bg-red-50 p-2 rounded-lg">
              ⚠️ No brands available. Please create brands first.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BasicInformation;


