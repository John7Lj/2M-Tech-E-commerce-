import React, { ChangeEvent, FormEvent, useState } from 'react';
import { FaEdit, FaPlus, FaTrash, FaTimes, FaImage } from 'react-icons/fa';
import {
    useGetAllBrandsQuery,
    useCreateBrandMutation,
    useUpdateBrandMutation,
    useDeleteBrandMutation
} from '../../redux/api/brand.api';
import { Brand, CustomError } from '../../types/api-types';
import { notify } from '../../utils/util';
import Loader from '../common/Loader';
import Pagination from '../common/Pagination';

const BrandManagement: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        image: null as File | null
    });
    const [imagePreview, setImagePreview] = useState<string>('');

    const { data, isLoading, refetch } = useGetAllBrandsQuery({
        page: currentPage,
        limit: 10
    });
    const [createBrand, { isLoading: isCreating }] = useCreateBrandMutation();
    const [updateBrand, { isLoading: isUpdating }] = useUpdateBrandMutation();
    const [deleteBrand, { isLoading: isDeleting }] = useDeleteBrandMutation();

    const brands = data?.brands || [];
    const totalPages = data?.totalPages || 1;

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                image: file
            }));

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', image: null });
        setImagePreview('');
        setEditingBrand(null);
    };

    const openModal = (brand?: Brand) => {
        if (brand) {
            setEditingBrand(brand);
            setFormData({
                name: brand.name,
                image: null
            });
            setImagePreview(brand.image);
        } else {
            resetForm();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            notify('Brand name is required', 'error');
            return;
        }

        if (!editingBrand && !formData.image) {
            notify('Brand image is required', 'error');
            return;
        }

        const submitFormData = new FormData();
        submitFormData.append('name', formData.name.trim());

        if (formData.image) {
            submitFormData.append('image', formData.image);
        }

        try {
            if (editingBrand) {
                await updateBrand({
                    brandId: editingBrand._id!,
                    formData: submitFormData
                }).unwrap();
                notify('Brand updated successfully', 'success');
            } else {
                await createBrand({ formData: submitFormData }).unwrap();
                notify('Brand created successfully', 'success');
            }

            closeModal();
            refetch();
        } catch (error) {
            const err = error as CustomError;
            notify(err?.data?.message || 'Failed to save brand', 'error');
        }
    };

    const handleDelete = async (brandId: string, brandName: string) => {
        if (window.confirm(`Are you sure you want to delete "${brandName}"?`)) {
            try {
                await deleteBrand({ brandId }).unwrap();
                notify('Brand deleted successfully', 'success');
                refetch();
            } catch (error) {
                const err = error as CustomError;
                notify(err?.data?.message || 'Failed to delete brand', 'error');
            }
        }
    };

    if (isLoading) return <Loader />;

    return (
        <div className="bg-white p-6 rounded-md shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Brand Management</h2>
                <button
                    onClick={() => openModal()}
                    className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark flex items-center gap-2"
                >
                    <FaPlus /> Add Brand
                </button>
            </div>

            {/* Brands Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {brands.map((brand) => (
                    <div key={brand._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="aspect-square mb-3">
                            <img
                                src={brand.image}
                                alt={brand.name}
                                className="w-full h-full object-cover rounded-md"
                            />
                        </div>
                        <h3 className="font-semibold text-lg mb-3 text-center">{brand.name}</h3>
                        <div className="flex justify-center gap-2">
                            <button
                                onClick={() => openModal(brand)}
                                className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 flex items-center gap-1"
                            >
                                <FaEdit size={12} /> Edit
                            </button>
                            <button
                                onClick={() => handleDelete(brand._id!, brand.name)}
                                disabled={isDeleting}
                                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:bg-gray-400 flex items-center gap-1"
                            >
                                <FaTrash size={12} /> Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {brands.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-gray-500">No brands found. Create your first brand!</p>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-6">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">
                                {editingBrand ? 'Edit Brand' : 'Add Brand'}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-medium mb-2">
                                    Brand Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="Enter brand name"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 font-medium mb-2">
                                    Brand Image {!editingBrand && '*'}
                                </label>
                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                        {imagePreview ? (
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <FaImage className="w-8 h-8 mb-4 text-gray-500" />
                                                <p className="mb-2 text-sm text-gray-500">
                                                    <span className="font-semibold">Click to upload</span> brand image
                                                </p>
                                                <p className="text-xs text-gray-500">PNG, JPG, JPEG up to 5MB</p>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating || isUpdating}
                                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:bg-gray-400"
                                >
                                    {isCreating || isUpdating
                                        ? 'Saving...'
                                        : editingBrand
                                            ? 'Update Brand'
                                            : 'Create Brand'
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BrandManagement;