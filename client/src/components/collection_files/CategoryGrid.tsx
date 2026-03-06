import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Category } from '../../redux/api/category.api';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CategoryGridProps {
  categories: Category[];
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ categories }) => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  // Helper function to create consistent slugs
  const createSlug = (text: string): string => {
    return text.toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // Navigate to category page
  const handleCategoryClick = (category: Category) => {
    const slug = createSlug(category.name);
    navigate(`/category/${slug}`);
  };

  // Filter categories that have images
  const categoriesWithImages = categories.filter(category => category.image);

  if (categoriesWithImages.length === 0) {
    return (
      <section className="w-full py-8 px-4 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-600 text-lg">No collections available at the moment.</p>
        </div>
      </section>
    );
  }

  // Create triple array for infinite scroll effect
  const infiniteCategories = [
    ...categoriesWithImages,
    ...categoriesWithImages,
    ...categoriesWithImages
  ];

  // Initialize scroll position to middle section
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container && categoriesWithImages.length > 0) {
      const isMobile = window.innerWidth < 768;
      const itemWidth = isMobile ? 140 : 240;
      const middlePosition = categoriesWithImages.length * itemWidth;
      container.scrollLeft = middlePosition;
    }
  }, [categoriesWithImages]);

  // Handle infinite scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (isScrolling) return;

      const isMobile = window.innerWidth < 768;
      const itemWidth = isMobile ? 140 : 240;
      const sectionWidth = categoriesWithImages.length * itemWidth;
      const scrollLeft = container.scrollLeft;
      const scrollWidth = container.scrollWidth;
      const clientWidth = container.clientWidth;

      if (scrollLeft <= 0) {
        setIsScrolling(true);
        container.scrollLeft = sectionWidth;
        setTimeout(() => setIsScrolling(false), 50);
      } else if (scrollLeft >= scrollWidth - clientWidth - 10) {
        setIsScrolling(true);
        container.scrollLeft = sectionWidth;
        setTimeout(() => setIsScrolling(false), 50);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [categoriesWithImages.length, isScrolling]);

  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const isMobile = window.innerWidth < 768;
      const scrollDistance = isMobile ? 200 : 400;
      container.scrollBy({ left: -scrollDistance, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const isMobile = window.innerWidth < 768;
      const scrollDistance = isMobile ? 200 : 400;
      container.scrollBy({ left: scrollDistance, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full py-8 bg-white relative">
      {/* Navigation Arrows */}
      <button
        onClick={scrollLeft}
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-50 bg-white shadow-xl rounded-full p-2 md:p-4 hover:bg-gray-50 transition-all duration-200 border border-gray-300 hover:scale-110"
      >
        <ChevronLeft className="w-4 h-4 md:w-7 md:h-7 text-gray-700" />
      </button>

      <button
        onClick={scrollRight}
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-50 bg-white shadow-xl rounded-full p-2 md:p-4 hover:bg-gray-50 transition-all duration-200 border border-gray-300 hover:scale-110"
      >
        <ChevronRight className="w-4 h-4 md:w-7 md:h-7 text-gray-700" />
      </button>

      <div className="max-w-7.5xl mx-auto">
        <div
          ref={scrollContainerRef}
          className="flex gap-3 md:gap-6 overflow-x-auto scrollbar-hide py-4 md:py-6"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            paddingLeft: '1rem',
            paddingRight: '1rem'
          }}
        >
          {infiniteCategories.map((category, index) => (
            <div
              key={`${category._id}-${Math.floor(index / categoriesWithImages.length)}`}
              onClick={() => handleCategoryClick(category)}
              className="flex-shrink-0 text-center cursor-pointer group"
              style={{
                animationDelay: `${(index % categoriesWithImages.length) * 0.1}s`,
              }}
            >
              {/* Circular Image Container */}
              <div className="relative mx-auto mb-2 md:mb-4">
                <div
                  className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 lg:w-52 lg:h-52 xl:w-56 xl:h-56 rounded-full flex items-center justify-center overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300 border-2 md:border-4 border-gray-200 group-hover:border-primary/30"
                >
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 xl:w-48 xl:h-48 object-contain transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/api/placeholder/200/200';
                    }}
                  />
                </div>
              </div>

              {/* Category Name */}
              <div className="text-center">
                <h3 className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-semibold text-gray-900 dark:text-white uppercase tracking-wide group-hover:text-primary transition-colors duration-300 max-w-24 sm:max-w-28 md:max-w-32 mx-auto leading-tight">
                  {category.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryGrid;