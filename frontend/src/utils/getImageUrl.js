const DEFAULT_PLACEHOLDER = 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=600&q=80';

export const getImageUrl = (url, fallback = DEFAULT_PLACEHOLDER) => {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return fallback;
  }
  // If it's a relative path from backend uploads
  if (url.startsWith('/uploads/')) {
    const backendBase = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace('/api', '')
      : 'http://localhost:5000';
    return `${backendBase}${url}`;
  }
  return url;
};

export default getImageUrl;
