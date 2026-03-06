// src/components/admin/AddProduct/components/PhotoGallery.tsx
import React from 'react';
import { FaImage, FaTrash, FaCheck } from 'react-icons/fa';
import { PhotoGalleryProps } from '../types';

const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photoPreviews,
  mainPhotoIndex,
  onSetAsMain,
  onRemovePhoto
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center">
            <FaImage className="mr-3 text-primary" />
            Photo Gallery
          </h3>
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
            {photoPreviews.length} photo{photoPreviews.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {photoPreviews.map((preview, index) => (
            <div key={index} className="relative group">
              <div
                className={`relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 ${mainPhotoIndex === index
                    ? 'ring-4 ring-primary transform scale-105'
                    : 'hover:transform hover:scale-105 hover:shadow-lg'
                  }`}
                onClick={() => onSetAsMain(index)}
              >
                <img
                  src={preview}
                  alt={`Product ${index + 1}`}
                  className="w-full h-24 object-cover"
                />
                {mainPhotoIndex === index && (
                  <div className="absolute inset-0 bg-primary bg-opacity-20 flex items-center justify-center">
                    <FaCheck className="text-white text-lg drop-shadow-lg" />
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => onRemovePhoto(index)}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg transform hover:scale-110"
              >
                <FaTrash size={10} />
              </button>

              {mainPhotoIndex === index && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-primary text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
                  Main
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="text-gray-500 text-sm mt-4 text-center">
          💡 Click any image to set as main photo • Use trash icon to remove
        </p>
      </div>
    </div>
  );
};

export default PhotoGallery;