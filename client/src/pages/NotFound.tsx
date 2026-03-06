import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-secondary-dark p-6 transition-colors duration-500">
      <div className="bg-white dark:bg-gray-950 shadow-2xl rounded-[3rem] p-12 md:p-20 max-w-2xl w-full text-center border border-gray-100 dark:border-gray-800">
        <div className="relative mb-12">
          <h1 className="text-[8rem] md:text-[12rem] font-black text-primary/10 dark:text-primary/5 uppercase tracking-tighter leading-none select-none">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Lost?</h2>
          </div>
        </div>

        <p className="text-sm md:text-base font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] mb-12 leading-loose">
          THE PAGE YOU ARE SEEKING HAS DRIFTED INTO ANOTHER DIMENSION OR NEVER EXISTED.
        </p>

        <Link
          to="/"
          className="inline-block bg-primary text-white px-12 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-primary-dark transition-all shadow-2xl shadow-primary/25 hover:scale-105 active:scale-95"
        >
          Return to Universe →
        </Link>

        <div className="mt-16 pt-8 border-t border-gray-50 dark:border-gray-900 flex justify-center space-x-8 opacity-30 grayscale">
          <div className="w-8 h-8 rounded-full bg-primary" />
          <div className="w-8 h-8 rounded-full bg-primary/50" />
          <div className="w-8 h-8 rounded-full bg-primary/20" />
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
