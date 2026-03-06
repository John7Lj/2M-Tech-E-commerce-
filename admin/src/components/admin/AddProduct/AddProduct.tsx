// admin/src/components/admin/AddProduct/AddProduct.tsx
import { useNewProductMutation } from '../../../redux/api/product.api';
import { useGetAllCategoriesQuery } from '../../../redux/api/category.api';
import { useGetAllSubcategoriesQuery } from '../../../redux/api/subcategory.api';
import { useGetBrandsForDropdownQuery } from '../../../redux/api/brand.api';
import { CustomError } from '../../../types/api-types';
import { notify } from '../../../utils/util';

import ProductHeader from './components/ProductHeader';
import MainPhotoDisplay from './components/MainPhotoDisplay';
import PhotoGallery from './components/PhotoGallery';
import ProductForm from './components/ProductForm';
import { useProductForm } from './hooks/useProductForm';
import { useProductImages } from './hooks/useProductImages';
import { ProductFormData } from './types';

const AddProduct: React.FC = () => {
  const { data: categoriesData, isLoading: categoriesLoading } = useGetAllCategoriesQuery();
  const { data: subcategoriesData, isLoading: subcategoriesLoading } = useGetAllSubcategoriesQuery();
  const { data: brandsData, isLoading: brandsLoading } = useGetBrandsForDropdownQuery();
  const [createProduct, { isLoading: isCreating }] = useNewProductMutation();

  const {
    formData,
    handleInputChange,
    handleCategoryChange,
    handleSubcategoryChange,
    handleDescriptionChange,
    handleStatusChange, // Add this
    handleFeaturedChange, // Add this
    resetForm
  } = useProductForm();

  const {
    photos,
    photoPreviews,
    mainPhotoIndex,
    handleImageChange,
    removePhoto,
    setAsMainPhoto,
    resetImages
  } = useProductImages();

  const handleSubmit = async (data: ProductFormData) => {
    // Validation
    if (!data.name.trim()) {
      notify('Product name is required', 'error');
      return;
    }

    if (data.categories.length === 0) {
      notify('Please select at least one category', 'error');
      return;
    }

    if (!data.brand) {
      notify('Please select a brand', 'error');
      return;
    }

    if (!data.description.trim()) {
      notify('Product description is required', 'error');
      return;
    }

    if (data.price <= 0) {
      notify('Please enter a valid price', 'error');
      return;
    }

    if (data.discount < 0 || data.discount > 100) {
      notify('Discount must be between 0 and 100%', 'error');
      return;
    }

    if (photos.length === 0) {
      notify('Please add at least one product image', 'error');
      return;
    }

    // Create FormData
    const submitFormData = new FormData();
    submitFormData.append('name', data.name.trim());
    submitFormData.append('categories', JSON.stringify(data.categories));

    if (data.subcategories.length > 0) {
      submitFormData.append('subcategories', JSON.stringify(data.subcategories));
    }

    submitFormData.append('brand', data.brand);
    submitFormData.append('description', data.description.trim());
    submitFormData.append('stock', data.stock.toString());
    submitFormData.append('price', data.price.toString());
    submitFormData.append('discount', data.discount.toString());
    submitFormData.append('status', data.status.toString());
    submitFormData.append('featured', data.featured.toString());
    submitFormData.append('mainPhotoIndex', mainPhotoIndex.toString());

    photos.forEach(photo => {
      submitFormData.append('photos', photo);
    });

    try {
      await createProduct({ formData: submitFormData }).unwrap();
      notify('Product created successfully', 'success');

      resetForm();
      resetImages();
    } catch (error) {
      const err = error as CustomError;
      notify(err?.data?.message || 'Failed to create product', 'error');
    }
  };

  const categories = categoriesData?.categories || [];
  const subcategories = subcategoriesData?.subcategories || [];
  const brands = brandsData?.brands || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <ProductHeader />

        {/* Main Photo Display */}
        {photoPreviews.length > 0 && (
          <MainPhotoDisplay
            photoPreview={photoPreviews[mainPhotoIndex]}
          />
        )}

        {/* Photo Gallery */}
        {photoPreviews.length > 0 && (
          <PhotoGallery
            photoPreviews={photoPreviews}
            mainPhotoIndex={mainPhotoIndex}
            onSetAsMain={setAsMainPhoto}
            onRemovePhoto={removePhoto}
          />
        )}

        {/* Form */}
        <ProductForm
          formData={formData}
          categories={categories}
          subcategories={subcategories}
          brands={brands}
          photoPreviews={photoPreviews}
          isLoading={isCreating}
          categoriesLoading={categoriesLoading}
          subcategoriesLoading={subcategoriesLoading}
          brandsLoading={brandsLoading}
          onInputChange={handleInputChange}
          onCategoryChange={handleCategoryChange}
          onSubcategoryChange={handleSubcategoryChange}
          onDescriptionChange={handleDescriptionChange}
          onStatusChange={handleStatusChange} // Add this
          onFeaturedChange={handleFeaturedChange} // Add this
          onImageChange={handleImageChange}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export default AddProduct;