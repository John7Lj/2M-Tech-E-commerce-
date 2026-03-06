// src/components/admin/AddProduct/components/form-sections/ImageUpload.tsx
import React from 'react';
import { FaImage } from 'react-icons/fa';

interface ImageUploadProps {
  photoPreviews: string[];
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  photoPreviews,
  onImageChange
}) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
          <span className="text-primary font-bold">3</span>
        </div>
        Product Images
      </h2>

      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-all duration-300">
          <label className="cursor-pointer block">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <FaImage className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-700 mb-2">
                  Upload Product Images
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  Drag and drop or <span className="text-primary underline">click to browse</span>
                </p>
                <p className="text-xs text-gray-400">
                  PNG, JPG, JPEG up to 10MB each • Multiple files supported
                </p>
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={onImageChange}
              className="hidden"
            />
          </label>
        </div>

        {photoPreviews.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-amber-800 text-sm flex items-center">
              <span className="mr-2">📸</span>
              At least one product image is required to create the product.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;