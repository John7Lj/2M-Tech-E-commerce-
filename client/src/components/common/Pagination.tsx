import React from 'react';

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ totalPages, currentPage, onPageChange }) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex justify-center items-center space-x-2">
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-4 py-2 rounded-md ${page === currentPage ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'} hover:bg-primary-dark hover:text-white transition`}
        >
          {page}
        </button>
      ))}
    </div>
  );
};

export default Pagination;
