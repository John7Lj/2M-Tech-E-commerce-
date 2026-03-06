/**
 * Ensures the VITE_SERVER_URL has a protocol (https:// or http://).
 * If missing and not localhost, prepends https://.
 */
export const getViteServerUrl = (url: string | undefined): string => {
    if (!url) return '';

    const trimmedUrl = url.trim();

    // If it's already an absolute URL, return as is
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
        return trimmedUrl;
    }

    // If it's localhost or an IP, use http, otherwise default to https
    if (trimmedUrl.includes('localhost') || trimmedUrl.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/)) {
        return `http://${trimmedUrl}`;
    }

    return `https://${trimmedUrl}`;
};
