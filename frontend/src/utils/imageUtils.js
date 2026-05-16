/**
 * Utility functions for handling image URLs
 */

/**
 * Get the full URL for an image path
 * @param {string|object} image - Image object with path/url property or string path
 * @returns {string} Full URL to the image
 */
export const getImageUrl = (image) => {
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  
  // Handle different image formats
  let imagePath = '';
  if (typeof image === 'string') {
    imagePath = image;
  } else if (image && typeof image === 'object') {
    imagePath = image.path || image.url || '';
  }
  
  // Return placeholder if no path
  if (!imagePath) {
    return '/placeholder.jpg';
  }
  
  // Normalize path - ensure it starts with /
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  // Construct full URL
  return `${apiUrl}${normalizedPath}`;
};

/**
 * Get multiple image URLs
 * @param {Array} images - Array of image objects or paths
 * @returns {Array} Array of full URLs
 */
export const getImageUrls = (images) => {
  if (!images || !Array.isArray(images)) {
    return [];
  }
  
  return images.map(img => getImageUrl(img));
};

