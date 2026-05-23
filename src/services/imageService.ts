// Deprecated legacy file replaced with a secure wrapper.
// This module now re-exports the server-backed `secureImageService` to
// ensure all Cloudinary interactions go through the backend proxy.

import secureImageService from './secureImageService';

// Helpful runtime notice for developers during migration
if (typeof window !== 'undefined' && typeof console !== 'undefined') {
  console.warn('Deprecated: import of `imageService` — re-exporting `secureImageService`. Update imports to use `secureImageService` directly.');
}

export const imageService = secureImageService;
export default imageService;
