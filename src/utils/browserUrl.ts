// Browser-compatible URL utility functions
const browserUrl = {
  // Join URL parts safely
  joinUrl: (baseUrl: string, path: string): string => {
    // Remove trailing slash from base URL and leading slash from path
    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    
    // Join with a single slash
    return `${cleanBase}/${cleanPath}`;
  },
  
  // Parse URL parameters
  parseUrlParams: (url: string): Record<string, string> => {
    const params: Record<string, string> = {};
    try {
      // Use a dummy base URL if window is not available
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
      const urlObj = new URL(url, baseUrl);
      urlObj.searchParams.forEach((value, key) => {
        params[key] = value;
      });
    } catch (e) {
      console.warn('Error parsing URL parameters:', e);
    }
    return params;
  },
  
  // Build URL with parameters
  buildUrlWithParams: (baseUrl: string, params: Record<string, string | number>): string => {
    try {
      // Use a dummy base URL if window is not available
      const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
      const url = new URL(baseUrl, base);
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
      return url.toString();
    } catch (e) {
      console.warn('Error building URL with params:', e);
      // Fallback to simple URL building if URL constructor fails
      const query = Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        .join('&');
      return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${query}`;
    }
  }
};

export default browserUrl;
