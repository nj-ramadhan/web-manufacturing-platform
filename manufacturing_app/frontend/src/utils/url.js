const API_BASE = 'http://localhost:8000';

/**
 * Ensure URL is absolute and properly formatted
 * @param {string} url - URL from API (could be relative or absolute)
 * @param {string} baseUrl - Base URL to prepend if needed
 * @returns {string} - Properly formatted absolute URL
 */
export const ensureAbsoluteUrl = (url, baseUrl = API_BASE) => {
  if (!url) return null;
  
  // Already absolute URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Relative URL - prepend base
  if (url.startsWith('/')) {
    return `${baseUrl}${url}`;
  }
  
  // Relative path without leading slash
  return `${baseUrl}/${url}`;
};

/**
 * Get file URL for 3D viewer
 * @param {object} quoteInfo - quote_info object from API
 * @returns {string|null} - Properly formatted file URL
 */
export const getFileUrl = (quoteInfo) => {
  if (!quoteInfo?.file_url) return null;
  return ensureAbsoluteUrl(quoteInfo.file_url);
};

export default { ensureAbsoluteUrl, getFileUrl };