// admin/src/components/admin/BannerManagement.tsx
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Image as ImageIcon, X } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  useGetAllBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
  useToggleBannerStatusMutation
} from '../../redux/api/banner.api';
import { useAllProductsQuery } from '../../redux/api/product.api';
import Loader from '../common/Loader';

interface BannerProduct {
  product: string;
  discountPercentage: number;
}

interface BannerFormData {
  name: string;
  description: string;
  products: BannerProduct[];
  isActive: boolean;
  image?: File;
}

const BannerManagement: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false);

  const [formData, setFormData] = useState<BannerFormData>({
    name: '',
    description: '',
    products: [],
    isActive: true,
    image: undefined
  });

  const [selectedProducts, setSelectedProducts] = useState<BannerProduct[]>([]);
  const [imagePreview, setImagePreview] = useState<string>('');

  // API hooks
  const { data: bannersData, isLoading: bannersLoading } = useGetAllBannersQuery({ includeInactive: true });
  const { data: productsData, isLoading: productsLoading } = useAllProductsQuery({
    page: 1,
    limit: 100,
  });

  const [createBanner, { isLoading: creating }] = useCreateBannerMutation();
  const [updateBanner, { isLoading: updating }] = useUpdateBannerMutation();
  const [deleteBanner, { isLoading: deleting }] = useDeleteBannerMutation();
  const [toggleStatus] = useToggleBannerStatusMutation();

  const banners = bannersData?.banners || [];
  const products = productsData?.products || [];

  // Open modal for new banner
  const openCreateModal = () => {
    setEditingBanner(null);
    setFormData({
      name: '',
      description: '',
      products: [],
      isActive: true,
      image: undefined
    });
    setSelectedProducts([]);
    setImagePreview('');
    setIsModalOpen(true);
  };

  // Open modal for editing banner
  const openEditModal = (banner: any) => {
    setEditingBanner(banner);
    setFormData({
      name: banner.name,
      description: banner.description,
      products: banner.products.map((p: any) => ({
        product: p.product._id,
        discountPercentage: p.discountPercentage
      })),
      isActive: banner.isActive,
      image: undefined
    });
    setSelectedProducts(banner.products.map((p: any) => ({
      product: p.product._id,
      discountPercentage: p.discountPercentage
    })));
    setImagePreview(banner.image);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBanner(null);
    setIsProductSelectorOpen(false);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Add product to banner
  const addProductToBanner = (productId: string) => {
    if (!selectedProducts.find(p => p.product === productId)) {
      const newProduct = { product: productId, discountPercentage: 0 };
      setSelectedProducts(prev => [...prev, newProduct]);
      setFormData(prev => ({ ...prev, products: [...prev.products, newProduct] }));
    }
  };

  // Remove product from banner
  const removeProductFromBanner = (productId: string) => {
    setSelectedProducts(prev => prev.filter(p => p.product !== productId));
    setFormData(prev => ({ ...prev, products: prev.products.filter(p => p.product !== productId) }));
  };

  // Update product discount
  const updateProductDiscount = (productId: string, discount: number) => {
    setSelectedProducts(prev =>
      prev.map(p => p.product === productId ? { ...p, discountPercentage: discount } : p)
    );
    setFormData(prev => ({
      ...prev,
      products: prev.products.map(p => p.product === productId ? { ...p, discountPercentage: discount } : p)
    }));
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitFormData = new FormData();
    submitFormData.append('name', formData.name);
    submitFormData.append('description', formData.description);
    submitFormData.append('products', JSON.stringify(formData.products));
    submitFormData.append('isActive', formData.isActive.toString());

    if (formData.image) {
      submitFormData.append('image', formData.image);
    }

    try {
      if (editingBanner) {
        await updateBanner({ id: editingBanner._id, formData: submitFormData }).unwrap();
        toast.success('Banner updated successfully');
      } else {
        await createBanner({ formData: submitFormData }).unwrap();
        toast.success('Banner created successfully');
      }
      closeModal();
    } catch (error: any) {
      toast.error(error.data?.message || 'Something went wrong');
    }
  };

  // Delete banner
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        await deleteBanner({ id }).unwrap();
        toast.success('Banner deleted successfully');
      } catch (error: any) {
        toast.error(error.data?.message || 'Failed to delete banner');
      }
    }
  };

  // Toggle banner status
  const handleToggleStatus = async (id: string) => {
    try {
      await toggleStatus({ id }).unwrap();
      toast.success('Banner status updated');
    } catch (error: any) {
      toast.error(error.data?.message || 'Failed to update banner status');
    }
  };

  if (bannersLoading || productsLoading) return <Loader />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Banner Management</h1>
        <button
          onClick={openCreateModal}
          className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-dark"
        >
          <Plus className="w-4 h-4" />
          Create Banner
        </button>
      </div>

      {/* Banners Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {banners.map((banner: any) => (
          <div key={banner._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative h-48">
              <img
                src={banner.image}
                alt={banner.name}
                className="w-full h-full object-cover"
              />
              <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${banner.isActive ? 'bg-primary text-white' : 'bg-gray-500 text-white'
                }`}>
                {banner.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{banner.name}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{banner.description}</p>
              <p className="text-sm text-gray-500 mb-4">{banner.products.length} products</p>

              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(banner)}
                  className="flex-1 bg-primary text-white px-3 py-2 rounded text-sm flex items-center justify-center gap-1 hover:bg-primary-dark"
                >
                  <Edit2 className="w-3 h-3" />
                  Edit
                </button>
                <button
                  onClick={() => handleToggleStatus(banner._id)}
                  className={`flex-1 px-3 py-2 rounded text-sm flex items-center justify-center gap-1 ${banner.isActive
                      ? 'bg-gray-600 text-white hover:bg-gray-700'
                      : 'bg-primary text-white hover:bg-primary-dark'
                    }`}
                >
                  {banner.isActive ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {banner.isActive ? 'Hide' : 'Show'}
                </button>
                <button
                  onClick={() => handleDelete(banner._id)}
                  className="px-3 py-2 bg-red-600 text-white rounded text-sm flex items-center justify-center hover:bg-red-700"
                  disabled={deleting}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {banners.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-red-500">No banners created yet</p>
        </div>
      )}

      {/* Main Edit/Create Banner Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">
                {editingBanner ? 'Edit Banner' : 'Create Banner'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Left Column */}
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Banner Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg px-3 py-2"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg px-3 py-2 h-24 resize-none"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Banner Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full border rounded-lg px-3 py-2"
                      required={!editingBanner}
                    />
                  </div>

                  {imagePreview && (
                    <div className="mb-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      Active Banner
                    </label>
                  </div>
                </div>

                {/* Right Column - Products */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium">Selected Products ({selectedProducts.length})</label>
                    <button
                      type="button"
                      onClick={() => setIsProductSelectorOpen(true)}
                      className="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-primary-dark"
                    >
                      Add Products
                    </button>
                  </div>

                  <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                    {selectedProducts.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No products selected</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedProducts.map((selectedProduct) => {
                          const product = products.find(p => p._id === selectedProduct.product);
                          return (
                            <div key={selectedProduct.product} className="flex items-center gap-3 p-3 border rounded">
                              <img
                                src={product?.photos[0]}
                                alt={product?.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                              <div className="flex-1">
                                <p className="font-medium text-sm">{product?.name}</p>
                                <p className="text-xs text-gray-500">${product?.price}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={selectedProduct.discountPercentage}
                                  onChange={(e) => updateProductDiscount(
                                    selectedProduct.product,
                                    Number(e.target.value)
                                  )}
                                  className="w-16 border rounded px-2 py-1 text-sm"
                                  placeholder="0"
                                />
                                <span className="text-sm">%</span>
                                <button
                                  type="button"
                                  onClick={() => removeProductFromBanner(selectedProduct.product)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark"
                  disabled={creating || updating}
                >
                  {creating || updating ? 'Saving...' : editingBanner ? 'Update Banner' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Selector Modal - FIXED Z-INDEX */}
      {isProductSelectorOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">Select Products</h3>
              <button
                onClick={() => setIsProductSelectorOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid gap-3 md:grid-cols-2">
                {products.map((product: any) => {
                  const isSelected = selectedProducts.some(p => p.product === product._id);
                  return (
                    <div
                      key={product._id}
                      className={`border rounded-lg p-3 cursor-pointer transition-colors ${isSelected ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      onClick={() => {
                        if (isSelected) {
                          removeProductFromBanner(product._id);
                        } else {
                          addProductToBanner(product._id);
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={product.photos[0]}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{product.name}</h4>
                          <p className="text-xs text-gray-500">{product.brand?.name}</p>
                          <p className="text-sm font-semibold text-primary">${product.price}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-primary bg-primary' : 'border-gray-300'
                          }`}>
                          {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t">
              <button
                onClick={() => setIsProductSelectorOpen(false)}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark"
              >
                Done ({selectedProducts.length} selected)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerManagement;