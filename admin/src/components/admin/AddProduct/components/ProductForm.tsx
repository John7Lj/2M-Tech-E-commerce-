// admin/src/components/admin/AddProduct/components/ProductForm.tsx
import React, { FormEvent } from 'react';
import { FaPlus } from 'react-icons/fa';
import { ProductFormProps } from '../types';
import BasicInformation from './form-sections/BasicInformation';
import ProductDetails from './form-sections/ProductDetails';
import ImageUpload from './form-sections/ImageUpload';

const ProductForm: React.FC<ProductFormProps> = ({
  formData,
  categories,
  subcategories,
  brands,
  photoPreviews,
  isLoading,
  categoriesLoading,
  subcategoriesLoading,
  brandsLoading,
  onInputChange,
  onCategoryChange,
  onSubcategoryChange,
  onImageChange,
  onDescriptionChange,
  onStatusChange, // New prop
  onFeaturedChange, // New prop
  onSubmit
}) => {
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information Section */}
        <BasicInformation
          formData={formData}
          categories={categories}
          subcategories={subcategories}
          brands={brands}
          categoriesLoading={categoriesLoading}
          subcategoriesLoading={subcategoriesLoading}
          brandsLoading={brandsLoading}
          onInputChange={onInputChange}
          onCategoryChange={onCategoryChange}
          onSubcategoryChange={onSubcategoryChange}
        />

        {/* Product Details Section with WYSIWYG */}
        <ProductDetails
          formData={formData}
          onInputChange={onInputChange}
          onDescriptionChange={onDescriptionChange}
          onStatusChange={onStatusChange} // Pass the new handler
          onFeaturedChange={onFeaturedChange} // Pass the new handler
        />

        {/* Images Upload Section */}
        <ImageUpload
          photoPreviews={photoPreviews}
          onImageChange={onImageChange}
        />

        {/* Submit Button */}
        <div className="bg-gray-50 rounded-2xl p-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <p className="font-medium">Ready to create your product?</p>
              <p>Make sure all required fields are filled.</p>
            </div>
            <button
              type="submit"
              disabled={isLoading || categoriesLoading || subcategoriesLoading || brandsLoading}
              className="px-8 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Product...
                </>
              ) : (
                <>
                  <FaPlus size={18} />
                  Create Product
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;