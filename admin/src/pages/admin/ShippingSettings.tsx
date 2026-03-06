import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaTrash, FaPlus, FaTruck, FaEdit } from 'react-icons/fa';
import { toast } from 'react-toastify';
import {
    useGetAllShippingTiersQuery,
    useCreateShippingTierMutation,
    useUpdateShippingTierMutation,
    useDeleteShippingTierMutation,
} from '../../redux/api/shippingTier.api';

const ShippingSettings: React.FC = () => {
    // Shipping tier management state
    const [showShippingForm, setShowShippingForm] = useState(false);
    const [editingTier, setEditingTier] = useState<string | null>(null);
    const [shippingFormData, setShippingFormData] = useState({
        minOrderValue: '',
        maxOrderValue: '',
        shippingCost: ''
    });

    // Shipping tier API hooks
    const { data: shippingTiersData, isLoading: shippingTiersLoading } = useGetAllShippingTiersQuery();
    const [createShippingTier, { isLoading: isCreatingTier }] = useCreateShippingTierMutation();
    const [updateShippingTier, { isLoading: isUpdatingTier }] = useUpdateShippingTierMutation();
    const [deleteShippingTier, { isLoading: isDeletingTier }] = useDeleteShippingTierMutation();

    const shippingTiers = shippingTiersData?.shippingTiers || [];

    // Shipping tier management functions
    const handleShippingFormChange = (field: string, value: string) => {
        setShippingFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const resetShippingForm = () => {
        setShippingFormData({
            minOrderValue: '',
            maxOrderValue: '',
            shippingCost: ''
        });
        setEditingTier(null);
        setShowShippingForm(false);
    };

    const validateShippingForm = () => {
        const { minOrderValue, maxOrderValue, shippingCost } = shippingFormData;

        if (!minOrderValue.trim() || !maxOrderValue.trim() || !shippingCost.trim()) {
            toast.error('All fields are required');
            return false;
        }

        const minVal = parseFloat(minOrderValue);
        const maxVal = parseFloat(maxOrderValue);
        const costVal = parseFloat(shippingCost);

        if (isNaN(minVal) || isNaN(maxVal) || isNaN(costVal)) {
            toast.error('Please enter valid numbers');
            return false;
        }

        if (minVal < 0 || maxVal < 0 || costVal < 0) {
            toast.error('Values cannot be negative');
            return false;
        }

        if (maxVal <= minVal) {
            toast.error('Maximum value must be greater than minimum value');
            return false;
        }

        return { minVal, maxVal, costVal };
    };

    const handleCreateShippingTier = async () => {
        const validation = validateShippingForm();
        if (!validation) return;

        const { minVal, maxVal, costVal } = validation;

        try {
            await createShippingTier({
                minOrderValue: minVal,
                maxOrderValue: maxVal,
                shippingCost: costVal
            }).unwrap();
            toast.success('Shipping tier created successfully');
            resetShippingForm();
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to create shipping tier');
        }
    };

    const handleEditShippingTier = (tier: any) => {
        setShippingFormData({
            minOrderValue: tier.minOrderValue.toString(),
            maxOrderValue: tier.maxOrderValue.toString(),
            shippingCost: tier.shippingCost.toString()
        });
        setEditingTier(tier._id);
        setShowShippingForm(true);
    };

    const handleUpdateShippingTier = async () => {
        if (!editingTier) return;

        const validation = validateShippingForm();
        if (!validation) return;

        const { minVal, maxVal, costVal } = validation;

        try {
            await updateShippingTier({
                id: editingTier,
                minOrderValue: minVal,
                maxOrderValue: maxVal,
                shippingCost: costVal
            }).unwrap();
            toast.success('Shipping tier updated successfully');
            resetShippingForm();
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to update shipping tier');
        }
    };

    const handleDeleteShippingTier = async (tierId: string) => {
        if (window.confirm('Are you sure you want to delete this shipping tier?')) {
            try {
                await deleteShippingTier(tierId).unwrap();
                toast.success('Shipping tier deleted successfully');
            } catch (error: any) {
                toast.error(error?.data?.message || 'Failed to delete shipping tier');
            }
        }
    };

    if (shippingTiersLoading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FaTruck className="mr-3 text-primary" />
                    Shipping Tiers Management
                </h3>
                <motion.button
                    onClick={() => {
                        setShowShippingForm(!showShippingForm);
                        if (showShippingForm) resetShippingForm();
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <FaPlus className="w-4 h-4" />
                    <span>{showShippingForm ? 'Cancel' : 'Add Tier'}</span>
                </motion.button>
            </div>

            {/* Add/Edit Shipping Tier Form */}
            {showShippingForm && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-gray-50 p-6 rounded-lg border"
                >
                    <h4 className="text-md font-semibold mb-4 text-gray-700">
                        {editingTier ? 'Edit Shipping Tier' : 'Add New Shipping Tier'}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Minimum Order Value ($)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={shippingFormData.minOrderValue}
                                onChange={(e) => handleShippingFormChange('minOrderValue', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="0.00"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Maximum Order Value ($)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={shippingFormData.maxOrderValue}
                                onChange={(e) => handleShippingFormChange('maxOrderValue', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="100.00"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Shipping Cost ($)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={shippingFormData.shippingCost}
                                onChange={(e) => handleShippingFormChange('shippingCost', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="10.00"
                            />
                        </div>
                    </div>

                    <div className="flex space-x-3">
                        <button
                            onClick={editingTier ? handleUpdateShippingTier : handleCreateShippingTier}
                            disabled={isCreatingTier || isUpdatingTier}
                            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center space-x-2"
                        >
                            {(isCreatingTier || isUpdatingTier) && (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            )}
                            <span>
                                {isCreatingTier || isUpdatingTier ?
                                    (editingTier ? 'Updating...' : 'Creating...') :
                                    (editingTier ? 'Update Tier' : 'Create Tier')
                                }
                            </span>
                        </button>
                        <button
                            onClick={resetShippingForm}
                            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Existing Shipping Tiers */}
            <div>
                <h4 className="text-md font-semibold mb-4 text-gray-700">Current Shipping Tiers</h4>

                {shippingTiers.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <FaTruck className="mx-auto text-4xl text-gray-400 mb-4" />
                        <p className="text-gray-500 mb-4">No shipping tiers configured</p>
                        <p className="text-sm text-gray-400">
                            Add shipping tiers to enable dynamic shipping costs based on order value
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {[...shippingTiers]
                            .sort((a, b) => a.minOrderValue - b.minOrderValue)
                            .map((tier) => (
                                <div
                                    key={tier._id}
                                    className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-6">
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-primary">
                                                    ${tier.minOrderValue} - ${tier.maxOrderValue}
                                                </div>
                                                <div className="text-sm text-gray-500">Order Range</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-primary-dark">
                                                    ${tier.shippingCost}
                                                </div>
                                                <div className="text-sm text-gray-500">Shipping Cost</div>
                                            </div>
                                        </div>

                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEditShippingTier(tier)}
                                                className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm flex items-center space-x-1"
                                            >
                                                <FaEdit className="w-3 h-3" />
                                                <span>Edit</span>
                                            </button>

                                            <button
                                                onClick={() => handleDeleteShippingTier(tier._id)}
                                                disabled={isDeletingTier}
                                                className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 text-sm flex items-center space-x-1"
                                            >
                                                {isDeletingTier ? (
                                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                                ) : (
                                                    <FaTrash className="w-3 h-3" />
                                                )}
                                                <span>Delete</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>

            {/* Info Box */}
            <div className="p-4 bg-primary/5 border-l-4 border-primary">
                <div className="flex">
                    <div className="ml-3">
                        <p className="text-sm text-primary">
                            <strong>How it works:</strong> Create shipping tiers based on order value ranges.
                            For example: $0-$50 = $10 shipping, $50-$100 = $5 shipping, $100+ = Free shipping.
                            Customers will automatically get the appropriate shipping cost based on their cart total.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShippingSettings;