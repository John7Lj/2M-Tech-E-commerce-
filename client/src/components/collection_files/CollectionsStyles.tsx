import React from 'react';

const CollectionsStyles: React.FC = () => {
  return (
    <style>{`
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
      
      @keyframes fade-in {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .animate-fade-in {
        animation: fade-in 0.5s ease-out;
      }
      
      /* Smooth text transition */
      .text-transition {
        transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      
      
   
      
      /* Smooth scroll behavior */
      #category-scroll {
        scroll-behavior: smooth;
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
      
      #category-scroll::-webkit-scrollbar {
        display: none;
      }
      
      /* Category circle styling */
      .category-circle {
        transition: all 0.3s ease-out;
        background: linear-gradient(145deg, #f8f9fa, #e9ecef);
        border: 2px solid transparent;
      }
      
     
      /* Navigation buttons */
      .nav-button {
        backdrop-filter: blur(10px);
        background: rgba(255, 255, 255, 0.9);
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
      }
      
      .nav-button:hover {
        background: rgba(255, 255, 255, 1);
        box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
        transform: scale(1.05);
      }
      
      /* Staggered animation for categories */
      .category-item {
        animation: fade-in 0.6s ease-out forwards;
        opacity: 0;
      }
      
  
      /* Search Bar Enhancement Animations */
      @keyframes searchPulse {
        0%, 100% { opacity: 0.4; }
        50% { opacity: 0.8; }
      }
      
      .search-pulse {
        animation: searchPulse 2s ease-in-out infinite;
      }

      /* Professional gradient border effect */
      .search-container::before {
        content: '';
        position: absolute;
        inset: -1px;
        padding: 1px;
        background: linear-gradient(45deg, #EF5350, #D32F2F, #EF5350);
        border-radius: inherit;
        mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        mask-composite: exclude;
      }
 
      
      .category-name::after {
        content: '';
        position: absolute;
        bottom: -4px;
        left: 50%;
        width: 0;
        height: 2px;
        background: #D32F2F;
        transition: all 0.3s ease;
        transform: translateX(-50%);
      }
      
      .category-item:hover .category-name::after {
        width: 100%;
      }
      
    
      
      
    `}</style>
  );
};

export default CollectionsStyles;