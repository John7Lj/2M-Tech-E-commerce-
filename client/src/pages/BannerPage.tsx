// client/src/pages/BannerPage.tsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, Tag, Calendar, ShoppingBag } from 'lucide-react';
import { useGetBannerByIdQuery } from '../redux/api/banner.api';
import Loader from '../components/common/Loader';
import ProductCard from '../components/ProductCard';
import { Product } from '../types/api-types';

const BannerPage: React.FC = () => {
  const { bannerId } = useParams<{ bannerId: string }>();
  const { data: bannerData, isLoading, isError } = useGetBannerByIdQuery(bannerId!);

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !bannerData?.banner) {
    return (
      <div className="min-h-screen bg-white dark:bg-secondary-dark flex items-center justify-center transition-colors duration-500">
        <div className="text-center px-4">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="text-xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight">Banner not found</div>
          <div className="text-gray-500 dark:text-gray-400 mb-8 font-medium">The collection you're looking for doesn't exist.</div>

          <Link
            to="/"
            className="inline-flex items-center px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const banner = bannerData.banner;
  const products = banner.products || [];

  // Transform banner products to regular products for ProductCard
  const transformedProducts: Product[] = products.map((bannerProduct: any) => {
    const product = bannerProduct.product;
    const discountPercentage = bannerProduct.discountPercentage || 0;

    // Calculate discounted price
    const originalPrice = product.price;
    const discountedPrice = originalPrice - (originalPrice * discountPercentage / 100);

    return {
      ...product,
      discount: discountPercentage,
      netPrice: discountedPrice,
      price: originalPrice, // Keep original price for comparison
    };
  });

  return (
    <div className="min-h-screen bg-white dark:bg-secondary-dark transition-colors duration-500 pb-20">
      {/* Banner Header */}
      <div className="relative">
        <div
          className="relative bg-gray-900 overflow-hidden shadow-2xl"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.5)), url(${banner.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '450px'
          }}
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />

          {/* Back Button */}
          <div className="absolute top-6 left-6 z-20">
            <Link
              to="/"
              className="inline-flex items-center px-5 py-2.5 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl hover:bg-white/20 transition-all font-bold text-sm tracking-tight"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Main Menu
            </Link>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-7xl font-black text-white mb-6 uppercase tracking-tighter leading-none">
                {banner.name}
              </h1>
              <p className="text-lg md:text-xl text-gray-200 mb-10 leading-relaxed font-medium max-w-2xl">
                {banner.description}
              </p>

              {/* Banner Stats */}
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl">
                  <Package className="w-4 h-4 text-primary" />
                  <span className="text-white font-bold text-sm">
                    {products.length} Items
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-primary px-4 py-2 rounded-xl shadow-lg shadow-primary/40 animate-pulse">
                  <Tag className="w-4 h-4 text-white" />
                  <span className="text-white font-black text-sm uppercase tracking-wider">
                    Exclusive
                  </span>
                </div>

                {banner.createdAt && (
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl">
                    <Calendar className="w-4 h-4 text-white/60" />
                    <span className="text-white text-sm font-medium">
                      Since {new Date(banner.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {transformedProducts.length > 0 ? (
          <>
            <div className="flex items-center gap-4 mb-12">
              <ShoppingBag className="w-8 h-8 text-primary" />
              <h2 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                Collection Items
              </h2>
              <div className="h-0.5 bg-primary/20 dark:bg-primary/10 flex-1 ml-4" />
            </div>

            {/* Products Grid using ProductCard */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8">
              {transformedProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                />
              ))}
            </div>

            {/* Additional Info */}
            <div className="mt-20 bg-gray-50 dark:bg-secondary-dark/50 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-8 md:p-16 overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -mr-48 -mt-48 blur-[100px] group-hover:bg-primary/10 transition-colors" />

              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-8 uppercase tracking-tight relative">
                About The Collection
              </h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-10 font-medium relative max-w-4xl text-lg">
                {banner.description}
              </p>
              <div className="flex flex-wrap gap-6 text-sm font-bold text-gray-400 dark:text-gray-500 relative uppercase tracking-widest">
                <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-primary rounded-full"></div> Exclusive discounts applied</span>
                <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-primary rounded-full"></div> Limited time offers</span>
                <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-primary rounded-full"></div> Premium quality products</span>
                <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-primary rounded-full"></div> Fast shipping available</span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-24">
            <div className="w-32 h-32 bg-gray-50 dark:bg-gray-800 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-gray-100 dark:border-gray-700 shadow-inner">
              <Package className="w-12 h-12 text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tight">
              Empty Collection
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-12 max-w-sm mx-auto font-medium text-lg leading-relaxed">
              We're currently updating this collection with stunning new arrivals. Check back soon for the latest drops!
            </p>
            <Link
              to="/products"
              className="inline-flex items-center px-12 py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary-dark transition-all shadow-2xl shadow-primary/30"
            >
              <ShoppingBag className="w-5 h-5 mr-3" />
              Explore All Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default BannerPage;