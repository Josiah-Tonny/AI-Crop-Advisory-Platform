# Browser Compatibility Reference Guide

## Overview of Changes Made

This document outlines the specific changes implemented to fix browser compatibility issues in the AI Advisory Platform. We addressed two main issues:

1. Usage of Node.js `url` module in browser code
2. References to Node.js `process` object in browser code

## Files Created/Modified

### New Utility Files

1. **browserUrl.ts**
   - Location: `src/utils/browserUrl.ts`
   - Purpose: Browser-compatible replacement for Node.js URL functionality
   - API:
     - `parseUrl(urlString)`: Parse a URL string into components
     - `formatUrl(urlObj)`: Convert URL object to string
     - `joinUrl(base, ...paths)`: Join URL segments
     - `getQueryParams(url)`: Extract query parameters

2. **browserEnv.ts**
   - Location: `src/utils/browserEnv.ts`
   - Purpose: Browser-compatible environment variable access
   - API:
     - `env`: Object containing environment variables
     - `getEnv(key, defaultValue)`: Safe method to get environment variables

3. **nodePolyfillPlugin.ts**
   - Location: `src/utils/nodePolyfillPlugin.ts`
   - Purpose: Vite plugin to handle Node.js module imports

### Modified Files

1. **vite.config.ts**
   - Added Node.js polyfill plugin
   - Added define replacements for Node.js globals

2. **apiConfig.ts**
   - Updated to use browser-compatible URL parsing
   - Fixed environment variable access

## Specific Changes Made

### 1. apiConfig.ts Changes

```typescript
// Before:
import { parse as parseUrl } from 'url';
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3000';

// After:
import { parseUrl } from '../utils/browserUrl';
import browserEnv from '../utils/browserEnv';
const API_BASE_URL = browserEnv.getEnv('VITE_API_BASE_URL', 'http://localhost:3000');
```

### 2. vite.config.ts Changes

```typescript
// Added:
import { nodePolyfillPlugin } from './src/utils/nodePolyfillPlugin';

export default defineConfig({
  // Other config...
  plugins: [
    react(),
    nodePolyfillPlugin(),
    // Other plugins...
  ],
  define: {
    'process.env': import.meta.env,
    // Other definitions...
  },
})
```

## Testing the Fixes

To verify that the browser compatibility issues are fixed:

1. Check the browser console for errors when loading the Crops page
2. Verify API requests are correctly formed and sent
3. Test URL parsing functionality in various components
4. Ensure environment variables are correctly accessed

## Common Pitfalls & Solutions

| Issue | Solution |
|-------|----------|
| `Module "url" has been externalized` | Use `browserUrl.ts` utilities instead of Node.js `url` module |
| `process is not defined` | Use `browserEnv.ts` or `import.meta.env` for environment variables |
| URL parsing errors | Use the browser's native URL API via our wrappers |
| Missing environment variables | Ensure all variables have proper prefixes (`VITE_`) and use `browserEnv.getEnv()` with default values |

## Resources for Further Reading

1. [Vite Environment Variables Guide](https://vitejs.dev/guide/env-and-mode.html)
2. [Browser URL API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/URL)
3. [Node.js vs. Browser Environments](https://nodejs.org/api/globals.html#globals_global_objects)

For any questions or issues related to browser compatibility, please reference this guide or contact the development team.
