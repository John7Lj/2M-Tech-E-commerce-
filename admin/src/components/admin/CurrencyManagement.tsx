import React, { useState } from 'react';
import { FaTrash, FaCheck, FaPlus, FaDollarSign } from 'react-icons/fa';
import { toast } from 'react-toastify';
import {
    useGetAllCurrenciesQuery,
    useCreateCurrencyMutation,
    useSetDefaultCurrencyMutation,
    useDeleteCurrencyMutation
} from '../../redux/api/currency.api';
import { PREDEFINED_CURRENCIES } from '../common/currency_countries'

// Predefined currency symbol
const CurrencyManagement: React.FC = () => {
    const [selectedSymbol, setSelectedSymbol] = useState('');
    const [showPredefinedList, setShowPredefinedList] = useState(false);

    const { data: currenciesData, isLoading, refetch } = useGetAllCurrenciesQuery();
    const [createCurrency, { isLoading: isCreating }] = useCreateCurrencyMutation();
    const [setDefaultCurrency, { isLoading: isSettingDefault }] = useSetDefaultCurrencyMutation();
    const [deleteCurrency, { isLoading: isDeleting }] = useDeleteCurrencyMutation();

    const currencies = currenciesData?.currencies || [];

    const handleCreateCurrency = async () => {
        if (!selectedSymbol.trim()) {
            toast.error('Please select a currency symbol');
            return;
        }

        try {
            await createCurrency({ symbol: selectedSymbol }).unwrap();
            toast.success('Currency created successfully');
            setSelectedSymbol('');
            setShowPredefinedList(false);
            refetch();
        } catch (error: any) {
            toast.error(error.data?.message || 'Failed to create currency');
        }
    };

    const handleSetDefault = async (currencyId: string) => {
        try {
            await setDefaultCurrency(currencyId).unwrap();
            toast.success('Default currency updated successfully');
            refetch();
        } catch (error: any) {
            toast.error(error.data?.message || 'Failed to set default currency');
        }
    };

    const handleDelete = async (currencyId: string) => {
        if (window.confirm('Are you sure you want to delete this currency?')) {
            try {
                await deleteCurrency(currencyId).unwrap();
                toast.success('Currency deleted successfully');
                refetch();
            } catch (error: any) {
                toast.error(error.data?.message || 'Failed to delete currency');
            }
        }
    };

    const availableCurrencies = PREDEFINED_CURRENCIES.filter(
        predefined => !currencies.some(existing => existing.symbol === predefined.symbol)
    );

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-700 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <FaDollarSign className="mr-3 text-primary" />
                    Currency Management
                </h2>
            </div>

            {/* Add New Currency Section */}
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Add New Currency</h3>

                <div className="flex flex-col space-y-4">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setShowPredefinedList(!showPredefinedList)}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center"
                        >
                            <FaPlus className="mr-2" />
                            {showPredefinedList ? 'Hide Currencies' : 'Select Currency'}
                        </button>

                        {selectedSymbol && (
                            <div className="flex items-center space-x-2">
                                <span className="text-lg font-bold bg-primary/10 text-primary px-3 py-1 rounded">
                                    Selected: {selectedSymbol}
                                </span>
                                <button
                                    onClick={handleCreateCurrency}
                                    disabled={isCreating}
                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                                >
                                    {isCreating ? 'Adding...' : 'Add Currency'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Predefined Currencies Grid */}
                    {showPredefinedList && (
                        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                            {availableCurrencies.map((currency) => (
                                <button
                                    key={currency.symbol}
                                    onClick={() => setSelectedSymbol(currency.symbol)}
                                    className={`p-3 border-2 rounded-lg text-center hover:bg-primary/5 transition-colors ${selectedSymbol === currency.symbol
                                            ? 'border-primary bg-primary/10'
                                            : 'border-gray-300'
                                        }`}
                                    title={currency.name}
                                >
                                    <div className="text-2xl font-bold">{currency.symbol}</div>
                                    <div className="text-xs text-gray-600 mt-1">{currency.name}</div>
                                </button>
                            ))}
                        </div>
                    )}

                    {availableCurrencies.length === 0 && showPredefinedList && (
                        <p className="text-gray-500 text-center py-4">
                            All predefined currencies have been added.
                        </p>
                    )}
                </div>
            </div>

            {/* Existing Currencies */}
            <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Existing Currencies</h3>

                {currencies.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                        No currencies found. Add a currency to get started.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {currencies.map((currency) => (
                            <div
                                key={currency._id}
                                className={`p-4 rounded-lg border-2 ${currency.isDefault
                                        ? 'border-primary bg-primary/5'
                                        : 'border-gray-300 bg-white'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="text-3xl font-bold">{currency.symbol}</div>
                                        {currency.isDefault && (
                                            <span className="bg-primary text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                                                <FaCheck className="mr-1" />
                                                Default
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex space-x-2">
                                        {!currency.isDefault && (
                                            <button
                                                onClick={() => handleSetDefault(currency._id)}
                                                disabled={isSettingDefault}
                                                className="px-3 py-1 bg-primary text-white rounded hover:bg-primary-dark transition-colors disabled:opacity-50 text-sm"
                                            >
                                                Set Default
                                            </button>
                                        )}

                                        {!currency.isDefault && (
                                            <button
                                                onClick={() => handleDelete(currency._id)}
                                                disabled={isDeleting}
                                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 text-sm"
                                            >
                                                <FaTrash />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-2 text-sm text-gray-600">
                                    Created: {new Date(currency.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Info Box */}
            <div className="mt-8 p-4 bg-primary/5 border-l-4 border-primary">
                <div className="flex">
                    <div className="ml-3">
                        <p className="text-sm text-primary">
                            <strong>Note:</strong> Setting a default currency will update all existing products
                            to use the new currency symbol. This action cannot be undone.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CurrencyManagement;