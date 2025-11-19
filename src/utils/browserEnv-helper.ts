/**
 * Browser-compatible environment variable helper
 * This provides a replacement for Node.js process.env
 */

const browserEnv = {
  /**
   * Gets an environment variable with a fallback value
   * @param name The environment variable name
   * @param fallback Optional fallback value if not found
   */
  getEnv: (name: string, fallback?: string): string => {
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
  
  /**
   * Checks if the code is running in a browser environment
   */
  isBrowser: (): boolean => {
    return typeof window !== 'undefined';
  },
  
  /**
   * Checks if the environment is development
   */
  isDevelopment: (): boolean => {
    return import.meta.env.MODE === 'development' || import.meta.env.DEV === true;
  },
  
  /**
   * Checks if the environment is production
   */
  isProduction: (): boolean => {
    return import.meta.env.MODE === 'production' || import.meta.env.PROD === true;
  }
};

export default browserEnv;
