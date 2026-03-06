// admin/src/components/admin/AddProduct/components/form-sections/ProductDetails.tsx
import React, { useMemo } from 'react';
import { ProductFormData } from '../../types';
import WysiwygEditor from '../../../../common/WysiwygEditor/WysiwygEditor';

interface ProductDetailsProps {
  formData: ProductFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onDescriptionChange: (value: string) => void;
  onStatusChange: (status: boolean) => void; // New prop
  onFeaturedChange: (featured: boolean) => void; // New prop
}

const ProductDetails: React.FC<ProductDetailsProps> = ({
  formData,
  onInputChange,
  onDescriptionChange,
  onStatusChange,
  onFeaturedChange
}) => {
  // Calculate net price based on price and discount
  const netPrice = useMemo(() => {
    if (formData.price && formData.discount >= 0) {
      return formData.price - ((formData.price * formData.discount) / 100);
    }
    return formData.price;
  }, [formData.price, formData.discount]);

  // Handle status toggle - now clean and simple
  const handleStatusToggle = () => {
    onStatusChange(!formData.status);
  };

  const handleFeaturedToggle = () => {
    onFeaturedChange(!formData.featured);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
          <span className="text-primary font-bold">2</span>
        </div>
        Product Details
      </h2>

      <div className="space-y-6">
        {/* WYSIWYG Description Editor */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Description <span className="text-red-500">*</span>
          </label>
          <div className="bg-white rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all duration-200">
            <WysiwygEditor
              value={formData.description}
              onChange={onDescriptionChange}
              placeholder="Describe your product features, benefits, and specifications in detail..."
              height={400}
              className="rounded-xl"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Use the toolbar above to format your product description with headings, lists, links, and more.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Stock Quantity <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={onInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
                min="0"
                placeholder="0"
                required
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                units
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Price <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={onInputChange}
                className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
                min="0"
                step="0.01"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Discount (%)
            </label>
            <div className="relative">
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={onInputChange}
                className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
                min="0"
                max="100"
                step="0.01"
                placeholder="0"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                %
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Optional: Enter discount percentage (0-100%)
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Net Price
            </label>
            <div className="relative">
              <input
                type="text"
                value={netPrice.toFixed(2)}
                className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
                disabled
                readOnly
              />
            </div>
            <p className="text-xs text-gray-500">
              Final price after discount (calculated automatically)
            </p>
          </div>
        </div>

        {/* Simplified Status Toggle */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-primary/5 rounded-xl p-6 border border-primary/20">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-gray-800">Publication Status</h3>
                <p className="text-xs text-gray-600">
                  Visible to customers
                </p>
              </div>
              <div className="flex items-center">
                <div className="flex items-center cursor-pointer" onClick={handleStatusToggle}>
                  <div className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${formData.status ? 'bg-primary' : 'bg-gray-200'
                    }`}>
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${formData.status ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-secondary/5 rounded-xl p-6 border border-secondary/20">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-gray-800">Featured Product</h3>
                <p className="text-xs text-gray-600">
                  Show in featured section
                </p>
              </div>
              <div className="flex items-center">
                <div className="flex items-center cursor-pointer" onClick={handleFeaturedToggle}>
                  <div className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${formData.featured ? 'bg-secondary' : 'bg-gray-200'
                    }`}>
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${formData.featured ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Price Summary Card */}
        {(formData.price > 0 || formData.discount > 0) && (
          <div className="bg-primary/5 rounded-xl p-6 border border-primary/20">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Price Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Original Price:</span>
                <span className="font-semibold text-gray-800">${formData.price}</span>
              </div>
              {formData.discount > 0 && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Discount ({formData.discount}%):</span>
                    <span className="font-semibold text-red-600">
                      -${((formData.price * formData.discount) / 100)}
                    </span>
                  </div>
                  <div className="border-t border-primary/20 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-800">Final Price:</span>
                      <span className="text-lg font-bold text-primary">${netPrice}</span>
                    </div>
                  </div>
                </>
              )}
              {formData.discount === 0 && (
                <div className="text-sm text-gray-500 italic">No discount applied</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;