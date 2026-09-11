// src/utils/slugify.js
// Converts strings to URL-friendly slugs

/**
 * Converts a string into a URL-safe slug
 * Example: "Men's Clothing" → "mens-clothing"
 * @param {string} str - Input string
 * @returns {string} slug
 */
export const createSlug = (str) => {
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')   // remove non-word chars except spaces and hyphens
    .replace(/[\s_]+/g, '-')    // replace spaces and underscores with hyphens
    .replace(/--+/g, '-')       // collapse multiple hyphens
    .replace(/^-+|-+$/g, '');   // trim leading/trailing hyphens
};

export default createSlug;
