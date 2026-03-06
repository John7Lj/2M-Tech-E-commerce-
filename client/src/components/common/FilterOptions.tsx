import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface FilterOptionsProps {
    categories: string[];
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    minPrice: number | undefined;
    setMinPrice: (price: number) => void;
    maxPrice: number | undefined;
    setMaxPrice: (price: number) => void;
    sort: 'asc' | 'desc' | 'relevance';
    setSort: (sort: 'asc' | 'desc' | 'relevance') => void;
    clearFilters: () => void;
}

const FilterOptions: React.FC<FilterOptionsProps> = ({
    categories,
    selectedCategory,
    setSelectedCategory,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    sort,
    setSort,
    clearFilters,
}) => {
    const [showCategories, setShowCategories] = useState(true);

    return (
        <div className="p-6 bg-white dark:bg-secondary-dark rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 transition-colors duration-500">
            {/* Sort options */}
            <div className="mb-6">
                <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3">Sort By</label>
                <div className="relative">
                    <select
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none text-sm font-bold text-gray-700 dark:text-gray-200 transition-all"
                        value={sort}
                        onChange={(e) => setSort(e.target.value as 'asc' | 'desc' | 'relevance')}
                    >
                        <option value="relevance">Relevance</option>
                        <option value="asc">Price: Low to High</option>
                        <option value="desc">Price: High to Low</option>
                    </select>
                    <FaChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                </div>
            </div>

            {/* Category filter */}
            <div className="mb-6">
                <div
                    className="flex items-center justify-between cursor-pointer group"
                    onClick={() => setShowCategories(!showCategories)}
                >
                    <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Categories</h3>
                    {showCategories ? (
                        <FaChevronUp className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
                    ) : (
                        <FaChevronDown className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
                    )}
                </div>
                {showCategories && (
                    <ul className="mt-4 space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        {categories.map((category) => (
                            <li
                                key={category}
                                className={`cursor-pointer px-4 py-3 rounded-xl text-sm font-bold transition-all ${selectedCategory === category
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-primary/5 dark:hover:bg-primary/10 hover:text-primary'
                                    }`}
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Price filter */}
            <div className="mb-8">
                <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-4">Price Range</h3>
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Min</span>
                        <input
                            type="number"
                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            placeholder="Min Price"
                            value={minPrice || ''}
                            onChange={(e) => setMinPrice(Number(e.target.value))}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Max</span>
                        <input
                            type="number"
                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            placeholder="Max Price"
                            value={maxPrice || ''}
                            onChange={(e) => setMaxPrice(Number(e.target.value))}
                        />
                    </div>
                </div>
            </div>

            {/* Clear filters button */}
            <button
                className="w-full bg-primary text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] text-xs hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 active:scale-95"
                onClick={clearFilters}
            >
                Clear Filters
            </button>
        </div>
    );
};

export default FilterOptions;
