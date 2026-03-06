// client/src/components/common/Header/components/SearchButton.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

const SearchButton: React.FC = () => {
  return (
    <Link
      to="/search"
      className="flex items-center space-x-2 md:space-x-3 px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary-light hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 group"
    >
      <div className="p-2 bg-primary/5 dark:bg-primary/10 rounded-lg group-hover:bg-primary/10 transition-colors">
        <Search className="w-4 h-4 md:w-5 md:h-5 text-primary" />
      </div>
      <span className="hidden sm:inline">Search</span>
    </Link>
  );
};

export default SearchButton;