/**
 * Browser-compatible environment variables
 * This provides a replacement for Node.js process.env
 */

// Create a browser-compatible process object
const processMock = {
  // Environment variables from Vite
  env: {
    // Default to development mode if not explicitly set
    NODE_ENV: import.meta.env.MODE || 'development',
    
    // Map all import.meta.env variables to process.env format
    ...Object.fromEntries(
      Object.entries(import.meta.env).map(([key, value]) => {
        // If the key starts with VITE_, remove it to match standard NODE naming
        const processKey = key.startsWith('VITE_') ? key.replace('VITE_', '') : key;
        return [processKey, value];
      })
    ),
    
    // Add common environment variables used in the application
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
    
    // Access browser environment
    BROWSER: true,
  },
  
  // Helper method to get environment variables with fallback
  getEnv: function(name: string, fallback?: string): string {
    // First check if the variable exists in import.meta.env
    if (name in import.meta.env) {
      return import.meta.env[name] as string;
    }
    
    // Remove VITE_ prefix if present and check again
    const unprefixedName = name.startsWith('VITE_') ? name.replace('VITE_', '') : name;
    if (`VITE_${unprefixedName}` in import.meta.env) {
      return import.meta.env[`VITE_${unprefixedName}`] as string;
    }
    
    // Return fallback or empty string
    return fallback || '';
  },
  
  // Browser doesn't have standard input/output streams
  stdin: null,
  stdout: null,
  stderr: null,
  
  // Add any other process properties needed
  browser: true,
  
  // Current working directory (browser doesn't have this concept)
  cwd: () => '/',
  
  // Mock process.nextTick with setTimeout(fn, 0)
  nextTick: (callback: Function, ...args: any[]) => setTimeout(() => callback(...args), 0),
  
  // Check if in browser environment
  isBrowser: function(): boolean {
    return typeof window !== 'undefined';
  },
  
  // Check if in development mode
  isDevelopment: function(): boolean {
    return import.meta.env.MODE === 'development' || import.meta.env.DEV === true;
  },
  
  // Check if in production mode
  isProduction: function(): boolean {
    return import.meta.env.MODE === 'production' || import.meta.env.PROD === true;
  }
};

// Export the mock object
export default processMock;
