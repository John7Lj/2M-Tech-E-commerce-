import React, { useEffect, useState } from 'react';
import { useGetAllFeaturedProductsQuery, useFeatureProductMutation } from '../../redux/api/product.api';
import { Product } from '../../types/api-types';

const AdminFeaturedProducts: React.FC = () => {
    const { data, isLoading } = useGetAllFeaturedProductsQuery('');
    const [featureProduct] = useFeatureProductMutation();
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        if (data && data.products) {
            setProducts(data.products);
        }
    }, [data]);

    const handleFeatureToggle = async (productId: string) => {
        try {
            await featureProduct({ productId }).unwrap();
            setProducts(products.filter(product => product._id !== productId));
        } catch (error) {
            console.error('Error updating featured status', error);
        }
    };

    if (isLoading) {
        return <p>Loading...</p>;
    }

    return (
        <div className="container mx-auto my-8 p-4 bg-white rounded-lg shadow-md min-h-screen">
            <h1 className="text-2xl font-bold mb-6">Admin - Featured Products</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border rounded-lg overflow-hidden">
                    <thead className="bg-primary text-white">
                        <tr>
                            <th className="py-3 px-4 border-b-2 border-gray-300 text-left text-sm font-semibold uppercase tracking-wider">Photos</th>
                            <th className="py-3 px-4 border-b-2 border-gray-300 text-left text-sm font-semibold uppercase tracking-wider">ID</th>
                            <th className="py-3 px-4 border-b-2 border-gray-300 text-left text-sm font-semibold uppercase tracking-wider">Name</th>
                            <th className="py-3 px-4 border-b-2 border-gray-300 text-left text-sm font-semibold uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => {
                            // Handle multiple images from photos array
                            const productImages = product.photos && product.photos.length > 0
                                ? product.photos
                                : [];

                            return (
                                <tr key={product._id} className="hover:bg-gray-100">
                                    <td className="py-3 px-4 border-b border-gray-300">
                                        <div className="flex items-center space-x-3">
                                            {productImages.length > 0 ? (
                                                <>
                                                    {/* Main Image */}
                                                    <div className="relative">
                                                        <img
                                                            src={productImages[0]}
                                                            alt={`${product.name} - Main`}
                                                            className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                                                        />
                                                        {productImages.length > 1 && (
                                                            <div className="absolute -top-1 -right-1 bg-primary text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                                                {productImages.length}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Additional Images Preview */}
                                                    {productImages.length > 1 && (
                                                        <div className="flex flex-col space-y-1">
                                                            <div className="grid grid-cols-3 gap-1">
                                                                {productImages.slice(1, 7).map((image, index) => (
                                                                    <img
                                                                        key={index}
                                                                        src={image}
                                                                        alt={`${product.name} - ${index + 2}`}
                                                                        className="w-8 h-8 object-cover rounded border border-gray-200"
                                                                    />
                                                                ))}
                                                                {productImages.length > 7 && (
                                                                    <div className="w-8 h-8 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                                                                        <span className="text-xs text-gray-600 font-medium">
                                                                            +{productImages.length - 7}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <span className="text-xs text-gray-500 font-medium">
                                                                {productImages.length} total images
                                                            </span>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="w-20 h-20 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs">
                                                    <div className="text-center">
                                                        <div className="text-lg">📷</div>
                                                        <div>No Image</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 border-b border-gray-300 text-sm font-mono text-gray-600">
                                        {product._id.slice(-8)}...
                                    </td>
                                    <td className="py-3 px-4 border-b border-gray-300 text-sm">
                                        <div className="space-y-1">
                                            <div className="font-semibold text-gray-900">{product.name}</div>
                                            <div className="text-xs text-gray-500">
                                                Categories: {product.categories && product.categories.length > 0 ? product.categories.join(', ') : 'No categories'}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Stock: {product.stock} | Price:  {product.price.toLocaleString()}
                                            </div>
                                            {productImages.length > 0 && (
                                                <div className="text-xs text-blue-600 font-medium">
                                                    {productImages.length} image{productImages.length !== 1 ? 's' : ''}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 border-b border-gray-300">
                                        <button
                                            className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium
                                            hover:bg-red-600 transition-all duration-300 ease-in-out transform hover:scale-105
                                            focus:outline-none focus:ring-2 focus:ring-red-300 shadow-sm hover:shadow-md"
                                            onClick={() => handleFeatureToggle(product._id)}
                                        >
                                            Remove from Featured
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Empty State */}
                {products.length === 0 && !isLoading && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">⭐</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Featured Products</h3>
                        <p className="text-gray-600">No products are currently featured. Add some products to the featured list to see them here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminFeaturedProducts;