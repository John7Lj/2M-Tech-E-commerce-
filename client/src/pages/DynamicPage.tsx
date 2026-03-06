// client/src/pages/DynamicPage.tsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetPageBySlugQuery } from '../redux/api/page.api';

const DynamicPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: page, isLoading, error } = useGetPageBySlugQuery(slug || '');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-secondary-dark transition-colors duration-500">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading Module...</p>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-secondary-dark transition-colors duration-500">
        <div className="text-center p-12 bg-white dark:bg-gray-950 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800">
          <h1 className="text-6xl font-black text-primary/20 mb-4 tracking-tighter uppercase">404</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8 font-black uppercase tracking-widest text-xs">Module Not Found</p>
          <Link
            to="/"
            className="inline-block bg-primary text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-primary-dark transition-all shadow-xl shadow-primary/20"
          >
            Return Home →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-secondary-dark py-16 md:py-24 transition-colors duration-500">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-950 p-8 md:p-16 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800">
          <div className="flex items-center space-x-3 mb-10">
            <div className="w-2 h-10 bg-primary rounded-full" />
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{page.title}</h1>
          </div>

          <div className="prose prose-red dark:prose-invert max-w-none">
            <div
              className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicPage;