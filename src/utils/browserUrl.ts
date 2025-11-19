/**
 * Browser-compatible utility functions for URL operations
 * This replaces the Node.js 'url' module usage in client-side code
 */

// Type guard for browser environment
const isBrowser = (): boolean => {
  return typeof window !== 'undefined';
};

// Helper function to safely access window.location.origin
const getWindowLocationOrigin = (): string => {
  if (isBrowser() && (window as unknown as { location?: { origin: string } }).location) {
    return (window as unknown as { location: { origin: string } }).location.origin;
  }
  return 'http://localhost';
};

/**
 * Parse a URL string and return its components
 * @param {string} urlString The URL string to parse
 * @returns {object} The parsed URL components
 */
export const parseUrl = (urlString: string) => {
  try {
    const url = new URL(urlString);
    return {
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port,
      pathname: url.pathname,
      search: url.search,
      searchParams: url.searchParams,
      hash: url.hash
    };
  } catch (_error: unknown) /* eslint-disable-line @typescript-eslint/no-unused-vars */ {
    // Handle relative URLs or invalid URLs
    // For relative URLs, we can create a URL relative to base
    try {
      // Check if we're in a browser environment
      const base = getWindowLocationOrigin();
      const url = new URL(urlString, base);
      return {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port,
        pathname: url.pathname,
        search: url.search,
        searchParams: url.searchParams,
        hash: url.hash
      };
    } catch (_error: unknown) { // eslint-disable-line @typescript-eslint/no-unused-vars
      // Suppress the error and return a default object
      // This is intentional as we want to handle invalid URLs gracefully
      return {
        protocol: '',
        hostname: '',
        port: '',
        pathname: urlString,
        search: '',
        searchParams: new URLSearchParams(),
        hash: ''
      };
    }
  }
};

/**
 * Format URL components into a URL string
 * @param {object} urlObj The URL components
 * @returns {string} The formatted URL string
 */
export const formatUrl = (urlObj: {
  protocol?: string;
  hostname?: string;
  port?: string;
  pathname?: string;
  search?: string;
  hash?: string;
}) => {
  // Build the URL
  let result = '';
  
  // Protocol
  if (urlObj.protocol) {
    result += urlObj.protocol;
    if (!urlObj.protocol.endsWith(':')) {
      result += ':';
    }
    result += '//';
  }
  
  // Hostname
  if (urlObj.hostname) {
    result += urlObj.hostname;
  }
  
  // Port
  if (urlObj.port) {
    result += ':' + urlObj.port;
  }
  
  // Pathname
  if (urlObj.pathname) {
    if (!urlObj.pathname.startsWith('/') && result) {
      result += '/';
    }
    result += urlObj.pathname;
  }
  
  // Search
  if (urlObj.search) {
    if (!urlObj.search.startsWith('?')) {
      result += '?';
    }
    result += urlObj.search.replace(/^\?/, '');
  }
  
  // Hash
  if (urlObj.hash) {
    if (!urlObj.hash.startsWith('#')) {
      result += '#';
    }
    result += urlObj.hash.replace(/^#/, '');
  }
  
  return result;
};

/**
 * Join URL paths safely
 * @param {string} base The base URL
 * @param {...string} parts The URL parts to join
 * @returns {string} The joined URL
 */
export const joinUrl = (base: string, ...parts: string[]): string => {
  // Remove trailing slashes from base and leading/trailing slashes from parts
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const cleanParts = parts.map(part => {
    let clean = part;
    if (part.startsWith('/')) clean = clean.slice(1);
    if (part.endsWith('/')) clean = clean.slice(0, -1);
    return clean;
  });
  
  // Join everything with slashes
  return [cleanBase, ...cleanParts].join('/');
};

/**
 * Convert relative path to absolute URL
 * @param {string} relativePath The relative path
 * @param {string} base The base URL (defaults to window.location.origin)
 * @returns {string} The absolute URL
 */
export const getAbsoluteUrl = (relativePath: string, base?: string): string => {
  // For server-side rendering, we need to provide a fallback
  const windowLocation = getWindowLocationOrigin();
  const baseUrl = base || windowLocation;
  return new URL(relativePath, baseUrl).toString();
};

/**
 * Extract query parameters from URL
 * @param {string} url The URL string
 * @returns {object} Object with query parameters
 */
export const getQueryParams = (url: string): Record<string, string> => {
  const result: Record<string, string> = {};
  // For server-side rendering, we need to provide a fallback
  const windowLocation = getWindowLocationOrigin();
  const searchParams = new URL(url, windowLocation).searchParams;
  
  searchParams.forEach((value, key) => {
    result[key] = value;
  });
  
  return result;
};

// Export parse as an alias to match Node.js url.parse
export const parse = parseUrl;

export default {
  parseUrl,
  formatUrl,
  joinUrl,
  getAbsoluteUrl,
  getQueryParams,
  // Add parse as an alias to match Node.js url.parse
  parse
};