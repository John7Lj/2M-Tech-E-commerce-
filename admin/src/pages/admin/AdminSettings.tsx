import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { notify } from '../../utils/util';
import Loader from '../../components/common/Loader';
import ShippingSettings from './ShippingSettings'; // Import the separate shipping component
import { FaTrash, FaCheck, FaPlus, FaDollarSign, FaTruck } from 'react-icons/fa';
import { toast } from 'react-toastify';
import {
    Building2,
    Globe,
    Mail,
    Phone,
    MapPin,
    Camera,
    Save,
    Settings as SettingsIcon,
    Search,
    Facebook,
    Instagram,
    Twitter,
    Linkedin,
    MessageCircle,
    Clock,
    Languages,
    Shield,
    Loader2
} from 'lucide-react';
import { useGetSettingsQuery, useUpdateSettingsMutation } from '../../redux/api/settings.api';
import {
    useGetAllCurrenciesQuery,
    useCreateCurrencyMutation,
    useSetDefaultCurrencyMutation,
    useDeleteCurrencyMutation
} from '../../redux/api/currency.api';
import { PREDEFINED_CURRENCIES } from '../../components/common/currency_countries';

const AdminSettings: React.FC = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'general' | 'seo' | 'social' | 'system' | 'shipping'>('general');

    // Currency management state
    const [selectedSymbol, setSelectedSymbol] = useState('');
    const [showPredefinedList, setShowPredefinedList] = useState(false);

    // API hooks
    const { data: settingsData, isLoading } = useGetSettingsQuery();
    const [updateSettings, { isLoading: isUpdating }] = useUpdateSettingsMutation();

    // Currency API hooks
    const { data: currenciesData, isLoading: currenciesLoading } = useGetAllCurrenciesQuery();
    const [createCurrency, { isLoading: isCreating }] = useCreateCurrencyMutation();
    const [setDefaultCurrency, { isLoading: isSettingDefault }] = useSetDefaultCurrencyMutation();
    const [deleteCurrency, { isLoading: isDeleting }] = useDeleteCurrencyMutation();

    const currencies = currenciesData?.currencies || [];

    // Form state
    const [formData, setFormData] = useState({
        companyName: '',
        phone: '',
        email: '',
        address: '',
        website: '',
        description: '',
        metaTitle: '',
        metaDescription: '',
        metaKeywords: '',
        facebook: '',
        instagram: '',
        twitter: '',
        linkedin: '',
        whatsapp: '',
        timezone: 'UTC',
        language: 'en',
    });

    // Update form data when settings are loaded
    useEffect(() => {
        if (settingsData?.settings) {
            const settings = settingsData.settings;
            setFormData({
                companyName: settings.companyName,
                phone: settings.phone,
                email: settings.email,
                address: settings.address,
                website: settings.website,
                description: settings.description,
                metaTitle: settings.metaTitle,
                metaDescription: settings.metaDescription,
                metaKeywords: settings.metaKeywords,
                facebook: settings.facebook,
                instagram: settings.instagram,
                twitter: settings.twitter,
                linkedin: settings.linkedin,
                whatsapp: settings.whatsapp,
                timezone: settings.timezone,
                language: settings.language,
            });
        }
    }, [settingsData]);

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleSaveSettings = async () => {
        try {
            const data = new FormData();

            Object.entries(formData).forEach(([key, value]) => {
                data.append(key, value.toString());
            });

            if (selectedFile) {
                data.append('logo', selectedFile);
            }

            await updateSettings(data).unwrap();

            setSelectedFile(null);
            setPreviewUrl('');

            notify('Settings updated successfully!', null);
        } catch (error) {
            console.error('Error updating settings:', error);
            notify('Error updating settings. Please try again.', error);
        }
    };

    // Currency management functions
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
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to create currency');
        }
    };

    const handleSetDefaultCurrency = async (currencyId: string) => {
        try {
            await setDefaultCurrency(currencyId).unwrap();
            toast.success('Default currency updated successfully');
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to set default currency');
        }
    };

    const handleDeleteCurrency = async (currencyId: string) => {
        if (window.confirm('Are you sure you want to delete this currency?')) {
            try {
                await deleteCurrency(currencyId).unwrap();
                toast.success('Currency deleted successfully');
            } catch (error: any) {
                toast.error(error?.data?.message || 'Failed to delete currency');
            }
        }
    };

    const availableCurrencies = PREDEFINED_CURRENCIES.filter(
        predefined => !currencies.some(existing => existing.symbol === predefined.symbol)
    );

    if (isLoading || currenciesLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader />
            </div>
        );
    }

    const tabs = [
        { id: 'general', label: 'General', icon: Building2 },
        { id: 'seo', label: 'SEO & Meta', icon: Search },
        { id: 'social', label: 'Social Media', icon: MessageCircle },
        { id: 'shipping', label: 'Shipping', icon: FaTruck },
        { id: 'system', label: 'System', icon: Shield },
    ];

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                            <SettingsIcon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                            <p className="text-gray-600">Manage your application settings</p>
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <motion.button
                            onClick={handleSaveSettings}
                            disabled={isUpdating}
                            className="flex items-center space-x-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-200 disabled:opacity-50"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            <span>{isUpdating ? 'Saving...' : 'Save Changes'}</span>
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-8">
                <div className="flex space-x-8">
                    {tabs.map((tab) => (
                        <motion.button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === tab.id
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {activeTab === 'general' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Company Info */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.companyName}
                                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                                        className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="Enter company name"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="Enter phone number"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="Enter email address"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <input
                                        type="url"
                                        value={formData.website}
                                        onChange={(e) => handleInputChange('website', e.target.value)}
                                        className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="https://example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <textarea
                                        value={formData.address}
                                        onChange={(e) => handleInputChange('address', e.target.value)}
                                        className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        rows={3}
                                        placeholder="Enter company address"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    rows={4}
                                    placeholder="Enter company description"
                                />
                            </div>
                        </div>

                        {/* Logo Upload */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Logo</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-center w-full">
                                    <div className="relative">
                                        <img
                                            src={previewUrl || settingsData?.settings.logo || 'https://placehold.co/200x80/6366f1/ffffff?text=LOGO'}
                                            alt="Company Logo"
                                            className="h-20 w-auto max-w-48 object-contain bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 p-4"
                                        />
                                        <motion.button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute -bottom-2 -right-2 p-2 bg-primary text-white rounded-full shadow-lg hover:bg-primary-dark transition-colors duration-200"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <Camera className="w-4 h-4" />
                                        </motion.button>
                                    </div>
                                </div>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />

                                <motion.button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center space-x-2"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Camera className="w-4 h-4" />
                                    <span>{selectedFile ? selectedFile.name : 'Choose new logo'}</span>
                                </motion.button>

                                <p className="text-sm text-gray-500 text-center">
                                    Recommended: PNG or JPG, max 2MB, 200x80px
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'seo' && (
                    <div className="max-w-2xl space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO & Meta Information</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
                            <input
                                type="text"
                                value={formData.metaTitle}
                                onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="Enter meta title"
                                maxLength={60}
                            />
                            <p className="text-xs text-gray-500 mt-1">{formData.metaTitle.length}/60 characters</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                            <textarea
                                value={formData.metaDescription}
                                onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                rows={3}
                                placeholder="Enter meta description"
                                maxLength={160}
                            />
                            <p className="text-xs text-gray-500 mt-1">{formData.metaDescription.length}/160 characters</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Meta Keywords</label>
                            <input
                                type="text"
                                value={formData.metaKeywords}
                                onChange={(e) => handleInputChange('metaKeywords', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="keyword1, keyword2, keyword3"
                            />
                            <p className="text-xs text-gray-500 mt-1">Separate keywords with commas</p>
                        </div>
                    </div>
                )}

                {activeTab === 'social' && (
                    <div className="max-w-2xl space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media Links</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                            <div className="relative">
                                <Facebook className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <input
                                    type="url"
                                    value={formData.facebook}
                                    onChange={(e) => handleInputChange('facebook', e.target.value)}
                                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="https://facebook.com/yourpage"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                            <div className="relative">
                                <Instagram className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <input
                                    type="url"
                                    value={formData.instagram}
                                    onChange={(e) => handleInputChange('instagram', e.target.value)}
                                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="https://instagram.com/yourpage"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
                            <div className="relative">
                                <Twitter className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <input
                                    type="url"
                                    value={formData.twitter}
                                    onChange={(e) => handleInputChange('twitter', e.target.value)}
                                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="https://twitter.com/yourpage"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                            <div className="relative">
                                <Linkedin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <input
                                    type="url"
                                    value={formData.linkedin}
                                    onChange={(e) => handleInputChange('linkedin', e.target.value)}
                                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="https://linkedin.com/company/yourcompany"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
                            <div className="relative">
                                <MessageCircle className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.whatsapp}
                                    onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="Enter WhatsApp number (with country code)"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'shipping' && (
                    <ShippingSettings />
                )}

                {activeTab === 'system' && (
                    <div className="space-y-8">
                        {/* System Configuration */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Configuration</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                        <select
                                            value={formData.timezone}
                                            onChange={(e) => handleInputChange('timezone', e.target.value)}
                                            className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        >
                                            <option value="UTC">UTC</option>
                                            <option value="America/New_York">Eastern Time</option>
                                            <option value="America/Chicago">Central Time</option>
                                            <option value="America/Los_Angeles">Pacific Time</option>
                                            <option value="Europe/London">London</option>
                                            <option value="Africa/Cairo">Cairo</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                                    <div className="relative">
                                        <Languages className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                        <select
                                            value={formData.language}
                                            onChange={(e) => handleInputChange('language', e.target.value)}
                                            className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        >
                                            <option value="en">English</option>
                                            <option value="ar">Arabic</option>
                                            <option value="es">Spanish</option>
                                            <option value="fr">French</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Currency Management Section */}
                        <div className="border-t border-gray-200 pt-8">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <FaDollarSign className="mr-3 text-primary" />
                                    Currency Management
                                </h3>
                            </div>

                            {/* Add New Currency Section */}
                            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                                <h4 className="text-md font-semibold mb-4 text-gray-700">Add New Currency</h4>

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
                                <h4 className="text-md font-semibold mb-4 text-gray-700">Existing Currencies</h4>

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
                                                    ? 'border-green-500 bg-green-50'
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
                                                                onClick={() => handleSetDefaultCurrency(currency._id)}
                                                                disabled={isSettingDefault}
                                                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
                                                            >
                                                                Set Default
                                                            </button>
                                                        )}

                                                        {!currency.isDefault && (
                                                            <button
                                                                onClick={() => handleDeleteCurrency(currency._id)}
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
                            <div className="mt-6 p-4 bg-primary/5 border-l-4 border-primary">
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
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default AdminSettings;