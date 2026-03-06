import React, { useState, useCallback } from 'react';
import {
  useGetAllPagesQuery,
  useCreatePageMutation,
  useUpdatePageMutation,
  useDeletePageMutation,
} from '../../redux/api/page.api';
import { Search, Plus, Edit2, Trash2, Eye, EyeOff, Save, X, FileText, Globe, Calendar } from 'lucide-react';
import WysiwygEditor from '../common/WysiwygEditor/WysiwygEditor';
import { notify } from '../../utils/util';

interface Page {
  _id?: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
  author?: string;
}

const PageManagement: React.FC = () => {
  const { data: pages = [], isLoading, error } = useGetAllPagesQuery();
  const [createPage, { isLoading: isCreating }] = useCreatePageMutation();
  const [updatePage, { isLoading: isUpdating }] = useUpdatePageMutation();
  const [deletePage, { isLoading: isDeleting }] = useDeletePageMutation();

  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [formData, setFormData] = useState<Page>({
    title: '',
    slug: '',
    content: '',
    isPublished: true
  });
  const [formErrors, setFormErrors] = useState<Partial<Page>>({});

  // Validation function
  const validateForm = useCallback(() => {
    const errors: Partial<Page> = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!formData.slug.trim()) {
      errors.slug = 'Slug is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      errors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens';
    }

    // Check if content has actual text (not just HTML tags)
    const textContent = formData.content.replace(/<[^>]*>/g, '').trim();
    if (!textContent) {
      errors.content = 'Content is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Auto-generate slug from title
  const generateSlug = useCallback((title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const pageData = {
        ...formData,
        slug: formData.slug || generateSlug(formData.title)
      };

      if (editingPage) {
        await updatePage({ id: editingPage._id!, page: pageData }).unwrap();
      } else {
        await createPage(pageData).unwrap();
      }

      handleResetForm();
    } catch (error: any) {
      console.error('Error saving page:', error);
      // Handle API errors (e.g., duplicate slug)
      if (error?.data?.message?.includes('slug')) {
        setFormErrors({ slug: 'This slug already exists. Please choose a different one.' });
      }
    }
  };

  // Reset form
  const handleResetForm = () => {
    setFormData({ title: '', slug: '', content: '', isPublished: true });
    setEditingPage(null);
    setIsFormVisible(false);
    setFormErrors({});
  };

  // Handle delete with better confirmation
  const handleDelete = async (page: Page) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to delete "${page.title}"?\n\nThis action cannot be undone.`
    );

    if (isConfirmed) {
      try {
        await deletePage(page._id!).unwrap();
      } catch (error) {
        console.error('Error deleting page:', error);
        notify('Failed to delete page. Please try again.', 'error');
      }
    }
  };

  // Handle edit
  const handleEdit = (page: Page) => {
    setEditingPage(page);
    setFormData(page);
    setIsFormVisible(true);
    setFormErrors({});
  };

  // Handle title change and auto-generate slug
  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: !editingPage ? generateSlug(title) : prev.slug
    }));
  };

  // Handle WYSIWYG content change
  const handleContentChange = (content: string) => {
    setFormData(prev => ({
      ...prev,
      content
    }));

    // Clear content error when user starts typing
    if (formErrors.content) {
      setFormErrors(prev => ({ ...prev, content: undefined }));
    }
  };



  // Filter pages based on search and status
  const filteredPages = pages.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'published' && page.isPublished) ||
      (filterStatus === 'draft' && !page.isPublished);
    return matchesSearch && matchesStatus;
  });

  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper to extract plain text from HTML content for preview
  const getContentPreview = (htmlContent: string, maxLength: number = 150) => {
    const textContent = htmlContent.replace(/<[^>]*>/g, '').trim();
    return textContent.length > maxLength
      ? textContent.substring(0, maxLength) + '...'
      : textContent;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FileText className="w-8 h-8 text-primary" />
                Page Management
              </h1>
              <p className="text-gray-600 mt-1">Create and manage website pages with our professional editor</p>
            </div>
            <button
              onClick={() => setIsFormVisible(true)}
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
            >
              <Plus className="w-4 h-4" />
              New Page
            </button>
          </div>
        </div>

        {/* Create/Edit Form */}
        {isFormVisible && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-primary" />
                  {editingPage ? 'Edit Page' : 'Create New Page'}
                </h2>
                <button
                  onClick={handleResetForm}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Title Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Page Title *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter page title (e.g., About Us, Privacy Policy)"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className={`w-full border rounded-lg px-4 py-3 transition-colors duration-200 ${formErrors.title
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:border-primary focus:ring-primary/20'
                      } focus:ring-2 focus:outline-none`}
                    required
                  />
                  {formErrors.title && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
                  )}
                </div>

                {/* Slug Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL Slug *
                  </label>
                  <div className="flex items-center">
                    <span className="text-gray-500 text-sm mr-2">/pages/</span>
                    <input
                      type="text"
                      placeholder="url-friendly-name"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className={`flex-1 border rounded-lg px-4 py-3 transition-colors duration-200 ${formErrors.slug
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:border-primary focus:ring-primary/20'
                        } focus:ring-2 focus:outline-none`}
                      required
                    />
                  </div>
                  {formErrors.slug && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.slug}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    Only lowercase letters, numbers, and hyphens allowed
                  </p>
                </div>
              </div>

              {/* WYSIWYG Content Editor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page Content *
                </label>
                <div className={`border rounded-lg ${formErrors.content ? 'border-red-300' : 'border-gray-300'
                  }`}>
                  <WysiwygEditor
                    value={formData.content}
                    onChange={handleContentChange}
                    placeholder="Write your page content here. Use the rich text editor to format your content with headings, lists, and more..."
                    height={400}
                    className="rounded-lg"
                    disabled={isCreating || isUpdating}
                  />
                </div>
                {formErrors.content && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.content}</p>
                )}
                <div className="mt-2 text-xs text-gray-500 space-y-1">
                  <p>Use the rich text editor to format your content with:</p>
                  <ul className="list-disc list-inside ml-2 space-y-0.5">
                    <li>Different fonts and text sizes</li>
                    <li>Headings, bold, italic, and other text formatting</li>
                    <li>Lists, quotes, and code blocks</li>
                    <li>Links and embedded content</li>
                  </ul>
                </div>
              </div>

              {/* Publishing Options */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Publishing Options</h3>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <div className="flex items-center gap-2">
                    {formData.isPublished ? (
                      <Eye className="w-4 h-4 text-primary" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      {formData.isPublished ? 'Published' : 'Save as Draft'}
                    </span>
                  </div>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-7">
                  {formData.isPublished
                    ? 'Page will be visible to website visitors'
                    : 'Page will be saved but not visible to visitors'
                  }
                </p>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white px-6 py-3 rounded-lg transition-colors duration-200 font-medium flex-1 sm:flex-none"
                >
                  <Save className="w-4 h-4" />
                  {isCreating || isUpdating ? 'Saving...' : (editingPage ? 'Update Page' : 'Create Page')}
                </button>

                <button
                  type="button"
                  onClick={handleResetForm}
                  className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg transition-colors duration-200 font-medium"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search pages by title or slug..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Filter:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              >
                <option value="all">All Pages</option>
                <option value="published">Published Only</option>
                <option value="draft">Drafts Only</option>
              </select>
            </div>

            {/* Stats */}
            <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
              {filteredPages.length} of {pages.length} pages
            </div>
          </div>
        </div>

        {/* Pages List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Website Pages
            </h2>
          </div>

          {error && (
            <div className="p-6 text-center">
              <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="font-medium">Error loading pages</p>
                <p className="text-sm mt-1">Please refresh the page or contact support if the problem persists.</p>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading pages...</p>
            </div>
          ) : filteredPages.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filterStatus !== 'all' ? 'No matching pages found' : 'No pages created yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterStatus !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Get started by creating your first page'
                }
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <button
                  onClick={() => setIsFormVisible(true)}
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  <Plus className="w-4 h-4" />
                  Create Your First Page
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredPages.map((page) => (
                <div key={page._id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Page Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate pr-4">
                          {page.title}
                        </h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${page.isPublished
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : 'bg-orange-100 text-orange-800 border border-orange-200'
                            }`}>
                            {page.isPublished ? (
                              <>
                                <Eye className="w-3 h-3" />
                                Published
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3 h-3" />
                                Draft
                              </>
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Globe className="w-4 h-4" />
                          <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                            /pages/{page.slug}
                          </span>
                        </div>
                        {page.updatedAt && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Updated {formatDate(page.updatedAt)}</span>
                          </div>
                        )}
                      </div>

                      {/* Content Preview */}
                      <div className="text-sm text-gray-600 line-clamp-2">
                        {getContentPreview(page.content)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(page)}
                        className="flex items-center gap-1 bg-primary/5 hover:bg-primary/10 text-primary-dark px-3 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(page)}
                        disabled={isDeleting}
                        className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 rounded-lg transition-colors duration-200 text-sm font-medium disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        {pages.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span>{pages.filter(p => p.isPublished).length} Published</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                <span>{pages.filter(p => !p.isPublished).length} Drafts</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>{pages.length} Total Pages</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageManagement;