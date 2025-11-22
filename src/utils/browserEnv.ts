// Browser-compatible environment variable utility
const browserEnv = {
  // Get environment variable with fallback
  getEnv: (key: string, fallback: string = ''): string => {
    // In browser environment, we can only access VITE_ prefixed variables
    // @ts-ignore - TypeScript doesn't know about import.meta.env
    const value = import.meta.env ? import.meta.env[key] : undefined;
    
    if (value !== undefined && value !== '') {
      return value;
    }
    
    // Check process.env as fallback (for testing environments)
    // @ts-ignore - TypeScript doesn't know about process.env
    const processValue = typeof process !== 'undefined' && process.env ? process.env[key] : undefined;
    
    if (processValue !== undefined && processValue !== '') {
      return processValue;
    }
    
    // Return fallback or empty string
    return fallback || '';
  },
  
  // Check if environment variable exists
  hasEnv: (key: string): boolean => {
    // @ts-ignore - TypeScript doesn't know about import.meta.env
    const value = import.meta.env ? import.meta.env[key] : undefined;
    
    if (value !== undefined && value !== '') {
      return true;
    }
    
    // @ts-ignore - TypeScript doesn't know about process.env
    const processValue = typeof process !== 'undefined' && process.env ? process.env[key] : undefined;
    
    return processValue !== undefined && processValue !== '';
  }
};

export default browserEnv;
