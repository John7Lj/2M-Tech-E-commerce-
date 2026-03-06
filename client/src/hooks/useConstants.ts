import { useGetSettingsQuery } from '../redux/api/settings.api';
import { useGetDefaultCurrencyQuery } from '../redux/api/currency.api';

// Default constants as fallback
const DEFAULT_CONSTANTS = {
    companyName: 'My Company',
    logo: 'https://placehold.co/200x80/6366f1/ffffff?text=LOGO',
    phone: '',
    email: '',
    address: '',
    website: '',
    description: '',
    metaTitle: 'My E-commerce Store',
    metaDescription: 'Best products at affordable prices',
    metaKeywords: 'ecommerce, online store, products',
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: '',
    whatsapp: '',
    timezone: 'UTC',
    language: 'en',
};

export const useConstants = () => {
    const { data: settingsData, isLoading: settingsLoading, isError: settingsError } = useGetSettingsQuery();
    const { data: currencyData, isLoading: currencyLoading, isError: currencyError } = useGetDefaultCurrencyQuery();

    // Combine loading states
    const isLoading = settingsLoading || currencyLoading;
    const isError = settingsError || currencyError;

    // Get currency symbol from API or use fallback
    const currencySymbol = currencyData?.currency?.symbol;

    // Return settings data or fallback to defaults
    const constants = settingsData?.settings || DEFAULT_CONSTANTS;

    return {
        constants,
        isLoading,
        isError,
        currencySymbol,

        // Helper functions for common use cases
        getSocialLinks: () => ({
            facebook: constants.facebook,
            instagram: constants.instagram,
            twitter: constants.twitter,
            linkedin: constants.linkedin,
            whatsapp: constants.whatsapp,
        }),
        getContactInfo: () => ({
            phone: constants.phone,
            email: constants.email,
            address: constants.address,
            website: constants.website,
        }),
        getMetaData: () => ({
            title: constants.metaTitle,
            description: constants.metaDescription,
            keywords: constants.metaKeywords,
        }),
    };
};