import React from 'react';
import { Product } from '../types/api-types';
import ProductCard from './ProductCard';
import { Link } from 'react-router-dom';
import { Package, ArrowRight, Sparkles } from 'lucide-react';

interface PopularProductsProps {
  products: Product[];
  selectedCategory?: string;
  limit?: number; // Add optional limit prop
  showViewAll?: boolean; // Add optional prop to control view all button
}

const PopularProducts: React.FC<PopularProductsProps> = ({
  products,
  selectedCategory,
  limit = 50,
  showViewAll = true
}) => {
  // Apply limit only if specified and greater than 0
  const displayedProducts = limit > 0 ? products.slice(0, limit) : products;

  // Determine section title based on whether category is selected
  const sectionTitle = selectedCategory
    ? `New ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(8)} Arrivals`
    : 'New Arrival Products';

  // Handle empty state
  if (products.length === 0) {
    return (
      <section className="container mx-auto my-8 p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{sectionTitle}</h2>
          </div>
          {showViewAll && (
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
            >
              <span>View All Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Empty state */}
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            {selectedCategory
              ? `No new arrivals found in ${selectedCategory}`
              : 'No new arrivals available'
            }
          </h3>
          <p className="text-gray-500 mb-4">
            {selectedCategory
              ? 'Try selecting a different category or check back later'
              : 'Check back later for exciting new arrivals'
            }
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-3 bg-primary hover:bg-primary-dark text-white px-10 py-4 rounded-xl font-bold transition-all shadow-xl shadow-primary/20"
          >
            <Sparkles className="w-5 h-5" />
            <span>Explore All Products</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto my-8 p-4">
      {/* Header section with title and link to view all products */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-1">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">{sectionTitle}</h2>
            {selectedCategory && (
              <p className="text-gray-600 text-sm mt-1">
                Showing <span className="text-primary font-black">{displayedProducts.length}</span> of {products.length} stunning arrival{products.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
        {showViewAll && (
          <Link
            to={selectedCategory ? `/products?category=${selectedCategory}` : '/products'}
            className="inline-flex items-center gap-2 bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-primary px-8 py-3 rounded-xl font-bold transition-all border border-gray-100 dark:border-gray-700"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Grid for displaying products - Updated for better mobile layout */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-4 gap-4 md:gap-6">
        {/* Map through the products and display each one using ProductCard component */}
        {displayedProducts.map((product) => (
          <ProductCard product={product} key={product._id} />
        ))}
      </div>

      {/* Enhanced "View All" button if there are more products than displayed */}
      {showViewAll && products.length > displayedProducts.length && (
        <div className="text-center mt-12">
          <div className="inline-flex flex-col items-center gap-3">
            <p className="text-gray-600 font-medium">
              Showing {displayedProducts.length} of {products.length} new arrivals
            </p>
            <Link
              to={selectedCategory ? `/products?category=${selectedCategory}` : '/products'}
              className="inline-flex items-center gap-3 bg-primary hover:bg-primary-dark text-white px-12 py-5 rounded-2xl text-lg font-black transition-all shadow-2xl shadow-primary/30"
            >
              <Sparkles className="w-6 h-6" />
              <span>Discover More</span>
              <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        </div>
      )}
    </section>
  );
};

export default PopularProducts;