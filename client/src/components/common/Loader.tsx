import React from "react";

const Loader: React.FC = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-black z-[9999] transition-colors duration-500">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-primary/10 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin"></div>
      </div>
      <h2 className="mt-4 text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-[0.4em] animate-pulse">
        2M Technology
      </h2>
    </div>
  );
};

export default Loader;
