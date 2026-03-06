import { Currency } from "../models/currency.model"; // Added import

export const getDefaultCurrencySymbol = async (): Promise<string> => {
    const defaultCurrency = await Currency.findOne({ isDefault: true });
    return defaultCurrency?.symbol || "$";
};

// Escape user input for safe use in MongoDB $regex to prevent ReDoS attacks
export const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
