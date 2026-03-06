import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductsByCategoryQuery } from '../redux/api/product.api';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface RelatedProductsProps {
    currentProductId: string;
    categoryId: string;
    categoryName?: string;
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({
    currentProductId,
    categoryId,
    categoryName = 'Category'
}) => {
    // Don't make API call if categoryId is invalid
    const shouldSkipQuery = !categoryId || typeof categoryId !== 'string' || !/^[0-9a-fA-F]{24}$/.test(categoryId);

    const { data, isLoading, isError } = useProductsByCategoryQuery(
        { category: categoryId, limit: 8 },
        { skip: shouldSkipQuery }
    );

    const scrollContainer = React.useRef<HTMLDivElement>(null);

    const scrollLeft = () => {
        if (scrollContainer.current) {
            scrollContainer.current.scrollBy({ left: -280, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollContainer.current) {
            scrollContainer.current.scrollBy({ left: 280, behavior: 'smooth' });
        }
    };

    // Early return if we should skip the query
    if (shouldSkipQuery) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Related Products</h3>
                <div className="text-gray-500 text-center py-8">
                    <p>No related products available</p>
                </div>
            </div>
        );
    }

    // Filter out the current product from related products
    const relatedProducts = data?.products?.filter(product => product._id !== currentProductId) || [];

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Related Products</h3>
                <div className="flex gap-4 overflow-hidden">
                    {[...Array(4)].map((_, index) => (
                        <div key={index} className="flex-shrink-0 w-64">
                            <div className="bg-gray-200 h-48 rounded-lg animate-pulse mb-4"></div>
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Related Products</h3>
                <div className="text-gray-500 text-center py-8">
                    <p>Could not load related products</p>
                </div>
            </div>
        );
    }

    if (relatedProducts.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Related Products</h3>
                <div className="text-gray-500 text-center py-8">
                    <p>No related products found in {categoryName}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                    Related Products in {categoryName}
                </h3>

                {/* Scroll Arrows */}
                {relatedProducts.length > 3 && (
                    <div className="flex gap-2">
                        <button
                            onClick={scrollLeft}
                            className="p-2 rounded-full border border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors"
                            aria-label="Scroll left"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <button
                            onClick={scrollRight}
                            className="p-2 rounded-full border border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors"
                            aria-label="Scroll right"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                )}
            </div>

            {/* Products Container */}
            <div
                ref={scrollContainer}
                className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {relatedProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                ))}
            </div>
        </div>
    );
};

// Enhanced ProductCard with better error handling
const ProductCard: React.FC<{ product: any }> = ({ product }) => {
    const navigate = useNavigate();

    const handleProductClick = () => {
        navigate(`/product/${product._id}`);
    };

    const finalPrice = product.netPrice || (product.price - (product.price * product.discount / 100));
    const hasDiscount = product.discount > 0;
    const brandName = typeof product.brand === 'object' ? product.brand?.name : product.brand;
    const currencySymbol = product.currencySymbol || 'LE';

    return (
        <div
            onClick={handleProductClick}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group flex-shrink-0 w-64"
        >
            {/* Product Image */}
            <div className="relative bg-gray-50 h-48 overflow-hidden">
                <img
                    src={product.photos && product.photos.length > 0 ? product.photos[0] : '/placeholder-image.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Discount Badge */}
                {hasDiscount && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                        -{product.discount}% OFF
                    </div>
                )}

                {/* Stock Status */}
                {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-semibold">Out of Stock</span>
                    </div>
                )}
            </div>

            {/* Product Details */}
            <div className="p-4 space-y-2">
                {/* Brand */}
                {brandName && (
                    <p className="text-xs text-gray-500 uppercase tracking-wide">{brandName}</p>
                )}

                {/* Product Name */}
                <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm leading-tight">
                    {product.name}
                </h3>

                {/* Price */}
                <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">
                        {currencySymbol} {finalPrice.toLocaleString()}
                    </span>
                    {hasDiscount && (
                        <span className="text-sm text-gray-500 line-through">
                            {currencySymbol} {product.price.toLocaleString()}
                        </span>
                    )}
                </div>

                {/* Stock Indicator */}
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-primary' : 'bg-red-400'}`}></div>
                    <span className={`text-xs ${product.stock > 0 ? 'text-primary' : 'text-red-600'}`}>
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default RelatedProducts;