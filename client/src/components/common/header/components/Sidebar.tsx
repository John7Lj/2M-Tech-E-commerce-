import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  LogOut,
  ChevronRight,
  Package,
} from 'lucide-react';
import { FaThLarge } from 'react-icons/fa';
import { navigationItems } from '../constants';
import { User as UserType } from '../types';
import { useGetAllCategoriesQuery } from '../../../../redux/api/category.api';
import { useGetSubcategoriesByCategoryQuery } from '../../../../redux/api/subcategory.api';
import { useGetAllBrandsQuery } from '../../../../redux/api/brand.api';
import { useGetAllBannersQuery } from '../../../../redux/api/banner.api';
import { useConstants } from '../../../../hooks/useConstants';

import SocialMediaSection from './SocialMediaSection';

interface SidebarProps {
  isSidebarOpen: boolean;
  onClose: () => void;
  user: UserType | null;
  onProfileHandler: () => void;
  onLogout: () => void;
}

const createSlug = (text: string): string => {
  return text.toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

const CategoryItem = React.memo(({
  category,
  onClose,
  isExpanded,
  onToggle
}: {
  category: any;
  onClose: () => void;
  isExpanded: boolean;
  onToggle: (id: string, e: React.MouseEvent) => void;
}) => {
  const categorySlug = createSlug(category.name);
  const { data: subcategoriesData, isLoading: subcategoriesLoading } = useGetSubcategoriesByCategoryQuery(
    category._id,
    { skip: !isExpanded }
  );
  const subcategories = subcategoriesData?.subcategories || [];

  return (
    <div className="mb-2">
      <div className="group flex items-center justify-between rounded-xl hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-300">
        <Link
          to={`/category/${categorySlug}`}
          onClick={onClose}
          className="flex-1 flex items-center space-x-3 p-3 text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-primary transition-colors"
        >
          {category.image ? (
            <img
              src={category.image}
              alt={category.name}
              className="w-8 h-8 rounded-lg object-cover shadow-sm group-hover:shadow-md transition-all"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="w-4 h-4 text-primary" />
            </div>
          )}
          <span>{category.name}</span>
        </Link>

        <button
          onClick={(e) => onToggle(category._id, e)}
          className="p-2 mr-1 text-gray-400 hover:text-primary transition-colors hover:bg-primary/10 rounded-lg"
        >
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="w-4 h-4" />
          </motion.div>
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="ml-11 overflow-hidden space-y-1 mt-1 border-l-2 border-primary/10"
          >
            {subcategoriesLoading ? (
              <div className="p-2 text-xs text-gray-400 animate-pulse">Loading...</div>
            ) : (
              subcategories.map((subcategory: any) => {
                const subcategorySlug = createSlug(subcategory.name);
                return (
                  <Link
                    key={subcategory._id}
                    to={`/category/${categorySlug}/${subcategorySlug}`}
                    onClick={onClose}
                    className="block p-2.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light hover:bg-primary/5 dark:hover:bg-primary/10 rounded-lg transition-all"
                  >
                    {subcategory.name}
                  </Link>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

const Sidebar: React.FC<SidebarProps> = ({
  isSidebarOpen,
  onClose,
  user,
  onProfileHandler,
  onLogout
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isBrandsOpen, setIsBrandsOpen] = useState(false);
  const [isOffersOpen, setIsOffersOpen] = useState(false);

  const { constants } = useConstants();
  const { data: categoriesData, isLoading: categoriesLoading } = useGetAllCategoriesQuery();
  const { data: brandsData, isLoading: brandsLoading } = useGetAllBrandsQuery({ page: 1, limit: 100 });
  const { data: bannersData, isLoading: bannersLoading } = useGetAllBannersQuery();

  const categories = categoriesData?.categories || [];
  const brands = brandsData?.brands || [];
  const banners = bannersData?.banners || [];

  const toggleCategories = () => {
    setIsCategoriesOpen(!isCategoriesOpen);
    if (!isCategoriesOpen) {
      setIsBrandsOpen(false);
      setIsOffersOpen(false);
    }
  };

  const toggleBrands = () => {
    setIsBrandsOpen(!isBrandsOpen);
    if (!isBrandsOpen) {
      setIsCategoriesOpen(false);
      setIsOffersOpen(false);
    }
  };

  const toggleOffers = () => {
    setIsOffersOpen(!isOffersOpen);
    if (!isOffersOpen) {
      setIsCategoriesOpen(false);
      setIsBrandsOpen(false);
    }
  };

  const toggleCategoryExpansion = React.useCallback((categoryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  }, []);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 lg:hidden overlay-fade ${isSidebarOpen ? 'open' : ''}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-lg z-[60] flex flex-col overflow-hidden border-r border-gray-100 dark:border-gray-800 sidebar-container ${isSidebarOpen ? 'open' : ''}`}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/5 dark:bg-primary/10 rounded-xl">
              <img
                src={constants.logo}
                alt="Logo"
                className="w-8 h-8 object-contain"
              />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              {constants.companyName}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-accent dark:bg-gray-800 text-gray-500 hover:text-primary transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {/* Main Navigation */}
          <div className="space-y-1 mb-8">
            {navigationItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={onClose}
                className="flex items-center space-x-3 p-3.5 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-primary/5 dark:hover:bg-primary/10 hover:text-primary dark:hover:text-primary-light transition-all duration-200 group"
              >
                <div className="p-2 rounded-lg bg-accent dark:bg-gray-800 group-hover:bg-primary/10 transition-colors">
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="font-semibold text-sm">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Categories Section */}
          <div className="px-2">
            <button
              onClick={toggleCategories}
              className="flex items-center justify-between w-full p-3 rounded-xl bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all duration-300"
            >
              <div className="flex items-center space-x-3">
                <FaThLarge className="w-5 h-5" />
                <span className="font-bold text-sm tracking-wide">Categories</span>
              </div>
              <motion.div
                animate={{ rotate: isCategoriesOpen ? 90 : 0 }}
              >
                <ChevronRight className="w-4 h-4" />
              </motion.div>
            </button>

            <AnimatePresence>
              {isCategoriesOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 space-y-1 pl-1"
                >
                  {categoriesLoading ? (
                    <div className="p-4 text-center text-sm text-gray-400 animate-pulse">Loading categories...</div>
                  ) : categories.map((category) => (
                    <CategoryItem
                      key={category._id}
                      category={category}
                      onClose={onClose}
                      isExpanded={expandedCategories.has(category._id)}
                      onToggle={toggleCategoryExpansion}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Brands Section */}
          <div className="px-2 mt-4">
            <button
              onClick={toggleBrands}
              className="flex items-center justify-between w-full p-3 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-700 hover:border-primary transition-all duration-300 shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <Package className="w-4 h-4 text-primary" />
                </div>
                <span className="font-bold text-sm tracking-wide">Shop by Brand</span>
              </div>
              <motion.div
                animate={{ rotate: isBrandsOpen ? 90 : 0 }}
              >
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </motion.div>
            </button>

            <AnimatePresence>
              {isBrandsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 grid grid-cols-2 gap-2 pl-1"
                >
                  {brandsLoading ? (
                    <div className="col-span-2 p-4 text-center text-sm text-gray-400 animate-pulse">Loading brands...</div>
                  ) : brands.map((brand) => (
                    <Link
                      key={brand._id}
                      to={`/products?brand=${brand._id}`}
                      onClick={onClose}
                      className="flex flex-col items-center p-3 rounded-xl hover:bg-primary/5 dark:hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all group text-center"
                    >
                      {brand.image ? (
                        <img
                          src={brand.image}
                          alt={brand.name}
                          className="w-10 h-10 object-contain mb-2 group-hover:scale-110 transition-transform"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg mb-2 flex items-center justify-center">
                          <span className="text-xs font-bold text-gray-400">{brand.name.charAt(0)}</span>
                        </div>
                      )}
                      <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 truncate w-full">{brand.name}</span>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Offers/Banners Section */}
          <div className="px-2 mt-4 pb-4">
            <button
              onClick={toggleOffers}
              className="flex items-center justify-between w-full p-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg shadow-primary/20 hover:brightness-110 transition-all duration-300"
            >
              <div className="flex items-center space-x-3">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <FaThLarge className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-sm tracking-wide">Official Banners</span>
              </div>
              <motion.div
                animate={{ rotate: isOffersOpen ? 90 : 0 }}
              >
                <ChevronRight className="w-4 h-4" />
              </motion.div>
            </button>

            <AnimatePresence>
              {isOffersOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 space-y-3 pl-1"
                >
                  {bannersLoading ? (
                    <div className="p-4 text-center text-sm text-gray-400 animate-pulse">Loading offers...</div>
                  ) : banners.length > 0 ? (
                    banners.map((banner) => (
                      <Link
                        key={banner._id}
                        to={`/banner/${banner._id}`}
                        onClick={onClose}
                        className="block relative rounded-xl overflow-hidden group shadow-sm hover:shadow-md transition-all"
                      >
                        <img
                          src={banner.image}
                          alt={banner.name}
                          className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-3">
                          <span className="text-xs font-bold text-white truncate">{banner.name}</span>
                          <span className="text-[10px] text-gray-300 line-clamp-1">{banner.description}</span>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-gray-400">No active offers</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* User & Footer Section */}
        <div className="p-6 bg-accent/50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800 space-y-3">
          <button
            onClick={() => { onProfileHandler(); onClose(); }}
            className="flex items-center justify-center space-x-3 w-full p-3.5 bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-200 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary transition-all font-semibold text-sm shadow-sm"
          >
            <User className="w-5 h-5 text-primary" />
            <span>{user ? (user.role === 'admin' ? 'Admin Panel' : 'My Account') : 'Sign In'}</span>
          </button>

          {user && (
            <button
              onClick={() => { onLogout(); onClose(); }}
              className="flex items-center justify-center space-x-3 w-full p-3.5 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all font-semibold text-sm"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          )}

          <div className="pt-2">
            <SocialMediaSection />
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;