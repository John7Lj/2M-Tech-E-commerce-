import React, { ChangeEvent, FormEvent, useEffect, useState, useMemo } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { FaPlus, FaTrash, FaImage, FaCheck, FaStar } from 'react-icons/fa';
import { useDeleteProductMutation, useFeatureProductMutation, useProductDetailsQuery, useUpdateProductMutation } from '../../redux/api/product.api';
import { useGetAllCategoriesQuery } from '../../redux/api/category.api';
import { useGetAllSubcategoriesQuery } from '../../redux/api/subcategory.api';
import { useGetBrandsForDropdownQuery } from '../../redux/api/brand.api';
import { CustomError } from '../../types/api-types';
import { notify } from '../../utils/util';
import SkeletonLoader from '../common/SkeletonLoader';
import WysiwygEditor from '../common/WysiwygEditor/WysiwygEditor';
import BackButton from '../common/BackBtn';


interface FormData {
    name: string;
    categories: string[];
    subcategories: string[];
    brand: string;
    description: string;
    stock: number;
    price: number;
    discount: number;
    status: boolean;
    featured: boolean; // Added featured to FormData

}

const AdminManageProduct: React.FC = () => {
    const { productId } = useParams<{ productId: string }>();
    const navigate = useNavigate();

    // API hooks
    const { data, isLoading, isError, error } = useProductDetailsQuery(productId!);
    const { data: categoriesData, isLoading: categoriesLoading } = useGetAllCategoriesQuery();
    const { data: subcategoriesData, isLoading: subcategoriesLoading } = useGetAllSubcategoriesQuery();
    const { data: brandsData, isLoading: brandsLoading } = useGetBrandsForDropdownQuery();
    const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
    const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
    const [featureProduct, { isLoading: isFeaturing }] = useFeatureProductMutation();

    // State
    const [formData, setFormData] = useState<FormData>({
        name: '', categories: [], subcategories: [], brand: '', description: '', stock: 0, price: 0, discount: 0, status: true, featured: false // Initialize featured
    });
    const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
    const [newPhotos, setNewPhotos] = useState<File[]>([]);
    const [newPhotosPreviews, setNewPhotosPreviews] = useState<string[]>([]);
    const [photosToDelete, setPhotosToDelete] = useState<number[]>([]);
    const [mainPhotoIndex, setMainPhotoIndex] = useState<number>(0);
    // const [isFeatured, setIsFeatured] = useState<boolean>(false); // This state is now part of formData

    // Extract data
    const product = data?.product;
    const categoriesList = categoriesData?.categories || [];
    const subcategoriesList = subcategoriesData?.subcategories || [];
    const brandsList = brandsData?.brands || [];

    // Calculate pricing
    const netPrice = useMemo(() =>
        formData.price - ((formData.price * formData.discount) / 100),
        [formData.price, formData.discount]
    );

    // Filter subcategories
    const filteredSubcategories = subcategoriesList.filter(sub =>
        sub.parentCategory && formData.categories.includes(sub.parentCategory._id)
    );

    // Initialize form data
    useEffect(() => {
        if (product && !isLoading) {
            const extractId = (item: any) =>
                typeof item === 'string' ? item : item?._id || String(item);

            setFormData({
                name: product.name || '',
                categories: Array.isArray(product.categories) ? product.categories.map(extractId) : [],
                subcategories: Array.isArray(product.subcategories) ? product.subcategories.map(extractId) : [],
                brand: extractId(product.brand),
                description: product.description || '',
                stock: Number(product.stock) || 0,
                price: Number(product.price) || 0,
                discount: Number(product.discount) || 0,
                status: Boolean(product.status),
                featured: Boolean(product.featured), // Initialize featured from product data
            });

            setExistingPhotos(product.photos || []);
            // setIsFeatured(Boolean(product.featured)); // No longer needed, managed by formData.featured
            setMainPhotoIndex(0);
        }
    }, [product, isLoading]);

    // Clean invalid subcategories
    useEffect(() => {
        if (formData.categories.length === 0) {
            setFormData(prev => ({ ...prev, subcategories: [] }));
        } else {
            const validSubcategories = formData.subcategories.filter(subId =>
                filteredSubcategories.some(sub => sub._id === subId)
            );
            if (validSubcategories.length !== formData.subcategories.length) {
                setFormData(prev => ({ ...prev, subcategories: validSubcategories }));
            }
        }
    }, [formData.categories, filteredSubcategories]);

    // Handle input changes
    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        // Prevent default behavior for checkbox to avoid form submission
        if (type === 'checkbox') {
            e.preventDefault();
        }

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox'
                ? (e.target as HTMLInputElement).checked
                : ['stock', 'price', 'discount'].includes(name)
                    ? parseFloat(value) || 0
                    : value
        }));
    };
    // Handle array toggles
    const handleArrayToggle = (field: 'categories' | 'subcategories', id: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].includes(id)
                ? prev[field].filter(item => item !== id)
                : [...prev[field], id]
        }));
    };

    // Handle image upload
    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        Promise.all(files.map(file => {
            return new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(file);
            });
        })).then(previews => {
            setNewPhotos(prev => [...prev, ...files]);
            setNewPhotosPreviews(prev => [...prev, ...previews]);
        });
    };

    // Photo management
    const removePhoto = (index: number, isExisting: boolean) => {
        if (isExisting) {
            setPhotosToDelete(prev => [...prev, index]);
            setExistingPhotos(prev => prev.filter((_, i) => i !== index));
            if (index === mainPhotoIndex) setMainPhotoIndex(0);
            else if (index < mainPhotoIndex) setMainPhotoIndex(prev => prev - 1);
        } else {
            setNewPhotos(prev => prev.filter((_, i) => i !== index));
            setNewPhotosPreviews(prev => prev.filter((_, i) => i !== index));
        }
    };

    const setAsMainPhoto = (index: number, isExisting: boolean) => {
        setMainPhotoIndex(isExisting ? index : existingPhotos.length + index);
    };

    // Form submission
    // Replace the submitHandler function in ManageProduct.tsx with this fixed version

    const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Validation
        const validations = [
            { condition: !formData.name.trim(), message: 'Product name is required' },
            { condition: formData.categories.length === 0, message: 'Please select at least one category' },
            { condition: !formData.brand, message: 'Please select a brand' },
            { condition: !formData.description.trim(), message: 'Product description is required' },
            { condition: formData.price <= 0, message: 'Please enter a valid price' },
            { condition: formData.discount < 0 || formData.discount > 100, message: 'Discount must be between 0 and 100%' },
            { condition: existingPhotos.length === 0 && newPhotos.length === 0, message: 'Please add at least one product image' }
        ];

        for (const { condition, message } of validations) {
            if (condition) {
                notify(message, 'error');
                return;
            }
        }

        const submitFormData = new FormData();

        // Handle each field explicitly
        submitFormData.append('name', formData.name.toString().trim());
        submitFormData.append('brand', formData.brand.toString().trim());
        submitFormData.append('description', formData.description.toString().trim());
        submitFormData.append('stock', formData.stock.toString());
        submitFormData.append('price', formData.price.toString());
        submitFormData.append('discount', formData.discount.toString());

        // Handle status and featured as boolean explicitly
        submitFormData.append('status', formData.status.toString());
        submitFormData.append('featured', formData.featured.toString()); // Added featured to submission

        // Handle arrays
        if (formData.categories.length > 0) {
            submitFormData.append('categories', JSON.stringify(formData.categories));
        }
        if (formData.subcategories.length > 0) {
            submitFormData.append('subcategories', JSON.stringify(formData.subcategories));
        }

        submitFormData.append('mainPhotoIndex', mainPhotoIndex.toString());
        newPhotos.forEach(photo => submitFormData.append('photos', photo));
        if (photosToDelete.length > 0) {
            submitFormData.append('photosToDelete', JSON.stringify(photosToDelete));
        }

        try {
            await updateProduct({ formData: submitFormData, productId: product!._id }).unwrap();
            notify('Product updated successfully', 'success');
            navigate('/admin/products');
        } catch (error) {
            const err = error as CustomError;
            notify(err?.data?.message || 'Failed to update product', 'error');
        }
    };
    // Delete handler
    const deleteHandler = async () => {
        if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

        try {
            await deleteProduct({ productId: product!._id }).unwrap();
            notify('Product deleted successfully', 'success');
            navigate('/admin/products');
        } catch (error) {
            const err = error as CustomError;
            notify(err?.data?.message || 'Failed to delete product', 'error');
        }
    };

    // Feature toggle (now directly updates formData)
    const handleFeatureToggle = async () => {
        try {
            // The API call for featuring is separate, but the local state should reflect the change
            // The submitHandler will send the final formData.featured value
            await featureProduct({ productId: product!._id }).unwrap();
            setFormData(prev => ({ ...prev, featured: !prev.featured }));
            notify('Product featured status updated successfully', 'success');
        } catch (error) {
            notify('Failed to update product featured status', 'error');
        }
    };

    // Handle errors
    useEffect(() => {
        if (isError && error) {
            const err = error as CustomError;
            notify(err.data.message, 'error');
        }
    }, [isError, error]);

    if (isError) return <Navigate to="/404" />;
    if (isLoading || categoriesLoading || subcategoriesLoading || brandsLoading) {
        return <SkeletonLoader rows={10} />;
    }
    if (!product) return <div className="flex justify-center items-center min-h-screen"><div className="text-gray-500">Product not found</div></div>;

    const allPhotos = [...existingPhotos, ...newPhotosPreviews];
    const mainPhoto = allPhotos[mainPhotoIndex];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-300">
            <div className="max-w-6xl mx-auto px-4">
                <BackButton />

                {/* Header */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8 border border-gray-100 dark:border-gray-700 transition-all">
                    <div className="bg-primary px-8 py-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-white flex items-center">
                                    <FaPlus className="mr-3" />
                                    Manage Product
                                </h1>
                                <p className="text-white/80 mt-2">Update your product information and settings</p>
                            </div>
                            <div className="flex items-center bg-white bg-opacity-20 rounded-full px-4 py-2">
                                <span className={`inline-block w-3 h-3 rounded-full mr-2 ${formData.featured ? 'bg-green-400' : 'bg-red-400'}`}></span>
                                <span className="text-white font-medium">{formData.featured ? 'Featured' : 'Not Featured'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Photo */}
                {mainPhoto && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8 border border-gray-100 dark:border-gray-700">
                        <div className="p-8 bg-gray-50 dark:bg-gray-900/50 border-b dark:border-gray-700">
                            <div className="flex flex-col items-center">
                                <div className="relative group">
                                    <img src={mainPhoto} alt="Main Product" className="w-80 h-80 object-cover rounded-2xl shadow-2xl border-4 border-white dark:border-gray-700" />
                                    <div className="absolute -top-3 -right-3 bg-primary text-white px-4 py-2 rounded-full shadow-lg flex items-center">
                                        <FaStar className="w-4 h-4 mr-2" />
                                        <span className="font-semibold text-sm">Main Photo</span>
                                    </div>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 mt-4 text-sm">This is your product's primary image</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Photo Gallery */}
                {allPhotos.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 border border-gray-100 dark:border-gray-700">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                                <FaImage className="text-primary w-4 h-4" />
                            </div>
                            Product Images ({allPhotos.length})
                        </h2>

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {/* Render Photos */}
                            {[...existingPhotos, ...newPhotosPreviews].map((photo, index) => {
                                const isExisting = index < existingPhotos.length;
                                const photoIndex = isExisting ? index : index - existingPhotos.length;
                                const isMain = mainPhotoIndex === index;

                                return (
                                    <div key={`${isExisting ? 'existing' : 'new'}-${photoIndex}`} className="relative group">
                                        <img
                                            src={photo}
                                            alt={`Product ${index + 1}`}
                                            className={`w-full h-32 object-cover rounded-xl border-2 cursor-pointer transition-all ${isMain ? 'border-primary shadow-lg scale-105' :
                                                isExisting ? 'border-gray-200 dark:border-gray-700 hover:border-primary/50' : 'border-primary/30 hover:border-primary'
                                                }`}
                                            onClick={() => setAsMainPhoto(photoIndex, isExisting)}
                                        />

                                        {!isExisting && (
                                            <div className="absolute -top-2 -left-2 bg-green-500 text-white rounded-full px-2 py-1 text-xs font-bold">
                                                NEW
                                            </div>
                                        )}

                                        {isMain && (
                                            <div className="absolute -top-2 -right-2 bg-yellow-400 text-white rounded-full p-1">
                                                <FaStar className="w-3 h-3" />
                                            </div>
                                        )}

                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-xl flex items-center justify-center">
                                            <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                                                <button
                                                    onClick={() => setAsMainPhoto(photoIndex, isExisting)}
                                                    className="p-2 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors"
                                                    title="Set as main"
                                                >
                                                    <FaCheck className="w-3 h-3" />
                                                </button>
                                                <button
                                                    onClick={() => removePhoto(photoIndex, isExisting)}
                                                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                                    title="Remove image"
                                                >
                                                    <FaTrash className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Form */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
                    <form onSubmit={submitHandler} className="space-y-8">
                        {/* Basic Information */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Basic Information</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Product Name */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Product Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
                                        placeholder="Enter product name"
                                        required
                                    />
                                </div>

                                {/* Brand */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Brand <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200 bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 dark:text-gray-300"
                                        required
                                    >
                                        <option value="">Select a brand</option>
                                        {brandsList.map((brand) => (
                                            <option key={brand._id} value={brand._id}>
                                                {brand.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Stock */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Stock <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200 bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 dark:text-gray-300"
                                        min="0"
                                        placeholder="0"
                                        required
                                    />
                                </div>

                                {/* Price */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Price  <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
                                        min="0"

                                        placeholder="0.00"
                                        required
                                    />
                                </div>

                                {/* Discount */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Discount (%)
                                    </label>
                                    <input
                                        type="number"
                                        name="discount"
                                        value={formData.discount}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200 bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 dark:text-gray-300"
                                        min="0"
                                        max="100"

                                        placeholder="0"
                                    />
                                </div>

                                {/* Net Price */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Net Price
                                    </label>
                                    <input
                                        type="text"
                                        value={netPrice}
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                                        disabled
                                        readOnly
                                    />

                                </div>
                            </div>
                            <div className="md:col-span-2 mt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-6 border border-primary/20 dark:border-primary/30">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-2">
                                                <h3 className="text-lg font-semibold text-gray-800">Publication Status</h3>
                                                <p className="text-sm text-gray-600">Control whether this product is visible to customers</p>
                                            </div>

                                            {/* Modern Toggle Switch for Status */}
                                            <div className="flex items-center space-x-3">
                                                <span className={`text-sm font-medium ${!formData.status ? 'text-red-600' : 'text-gray-400'}`}>
                                                    Draft
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setFormData(prev => ({ ...prev, status: !prev.status }));
                                                    }}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${formData.status
                                                        ? 'bg-green-600 focus:ring-green-500'
                                                        : 'bg-red-600 focus:ring-red-500'
                                                        }`}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.status ? 'translate-x-6' : 'translate-x-1'
                                                            }`}
                                                    />
                                                </button>
                                                <span className={`text-sm font-medium ${formData.status ? 'text-green-600' : 'text-gray-400'}`}>
                                                    Published
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-yellow-50/5 dark:bg-yellow-50/10 rounded-xl p-6 border border-yellow-200/20 dark:border-yellow-200/30">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-2">
                                                <h3 className="text-lg font-semibold text-gray-800">Featured Product</h3>
                                                <p className="text-sm text-gray-600">Highlight this product on your homepage or special sections</p>
                                            </div>

                                            {/* Modern Toggle Switch for Featured */}
                                            <div className="flex items-center space-x-3">
                                                <span className={`text-sm font-medium ${!formData.featured ? 'text-gray-400' : 'text-yellow-600'}`}>
                                                    No
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setFormData(prev => ({ ...prev, featured: !prev.featured }));
                                                    }}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${formData.featured
                                                        ? 'bg-yellow-500 focus:ring-yellow-400'
                                                        : 'bg-gray-300 focus:ring-gray-200'
                                                        }`}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.featured ? 'translate-x-6' : 'translate-x-1'
                                                            }`}
                                                    />
                                                </button>
                                                <span className={`text-sm font-medium ${formData.featured ? 'text-yellow-600' : 'text-gray-400'}`}>
                                                    Yes
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>


                                {/* Categories */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Categories <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-3 gap-3 max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-4 bg-gray-50">
                                        {categoriesList.map((category) => (
                                            <label key={category._id} className="flex items-center space-x-2 p-2 hover:bg-white rounded-lg cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.categories.includes(category._id)}
                                                    onChange={() => handleArrayToggle('categories', category._id)}
                                                    className="w-4 h-4 text-primary rounded focus:ring-primary dark:bg-gray-900 dark:border-gray-700"
                                                />
                                                <span className="text-sm font-medium text-gray-700">{category.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Subcategories */}
                                {formData.categories.length > 0 && filteredSubcategories.length > 0 && (
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Subcategories</label>
                                        <div className="grid grid-cols-3 gap-3 max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-4 bg-gray-50">
                                            {filteredSubcategories.map((subcategory) => (
                                                <label key={subcategory._id} className="flex items-center space-x-2 p-2 hover:bg-white rounded-lg cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.subcategories.includes(subcategory._id)}
                                                        onChange={() => handleArrayToggle('subcategories', subcategory._id)}
                                                        className="w-4 h-4 text-primary rounded focus:ring-primary dark:bg-gray-900 dark:border-gray-700"
                                                    />
                                                    <div className="text-sm">
                                                        <div className="font-medium text-gray-700">{subcategory.name}</div>
                                                        <div className="text-xs text-gray-500">{subcategory.parentCategory.name}</div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Description</h2>
                            <WysiwygEditor
                                value={formData.description}
                                onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                                placeholder="Describe your product..."
                                height={400}
                            />
                        </div>

                        {/* Image Upload */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Add More Images</h2>
                            <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-all">
                                <label className="cursor-pointer block">
                                    <div className="space-y-4">
                                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                                            <FaImage className="w-8 h-8 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-semibold text-gray-700 mb-2">Upload More Images</p>
                                            <p className="text-sm text-gray-500">Click to browse or drag and drop</p>
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="bg-gray-50 rounded-2xl p-6">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="text-sm text-gray-600">
                                    <p className="font-medium">Ready to update your product?</p>
                                    <p>Make sure all required fields are filled.</p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={deleteHandler}
                                        disabled={isDeleting}
                                        className="px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 disabled:bg-gray-400 transition-all flex items-center gap-2"
                                    >
                                        {isDeleting ? <><Loader />Deleting...</> : <><FaTrash size={14} />Delete</>}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleFeatureToggle}
                                        disabled={isFeaturing}
                                        className={`px-6 py-3 ${formData.featured ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'} text-white font-semibold rounded-xl transition-all flex items-center gap-2`}
                                    >
                                        {isFeaturing ? <><Loader />Updating...</> : <><FaStar size={14} />{formData.featured ? 'Unfeature' : 'Feature'}</>}
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={isUpdating}
                                        className="px-8 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark disabled:bg-gray-400 transition-all flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                    >
                                        {isUpdating ? <><Loader />Updating...</> : <><FaPlus size={16} />Update Product</>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminManageProduct;


const Loader: React.FC = () => {
    return (
        <div className="flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-gray-500 text-xs">Loading...</p>
            </div>
        </div>
    );
};