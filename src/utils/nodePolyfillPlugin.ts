/**
 * Vite plugin to handle Node.js compatibility in browser environment
 */
import { Plugin } from 'vite';

export default function nodePolyfillPlugin(): Plugin {
  const nodeBuiltins = {
    url: '@utils/browserUrl.ts',
    process: '@utils/browserEnv.ts',
  };

  return {
    name: 'node-polyfill',
    
    // Resolve Node.js builtins to our custom implementations
    resolveId(id: string) {
      if (id in nodeBuiltins) {
        return { id: nodeBuiltins[id as keyof typeof nodeBuiltins], external: false };
      }
      return null;
    },
    
    // Transform imports to use our polyfills
    transform(code, id) {
      // Skip transformation for our own polyfill files and node_modules
      if (id.includes('src/utils/browserEnv.ts') || id.includes('src/utils/browserUrl.ts') ||
          id.includes('@utils/browserEnv.ts') || id.includes('@utils/browserUrl.ts') ||
          id.includes('browserEnv.ts') || id.includes('browserUrl.ts') ||
          id.includes('node_modules')) {
        return null;
      }
      
      let transformedCode = code;
      
      // Replace require('url') and import from 'url' with our implementation
      if (code.includes(`require('url')`) || code.includes(`require("url")`) ||
          code.includes(`from 'url'`) || code.includes(`from "url"`)) {
        transformedCode = transformedCode
          .replace(/require\(['"]url['"]\)/g, `require('${nodeBuiltins.url}')`)
          .replace(/from ['"]url['"]/g, `from '${nodeBuiltins.url}'`);
      }
      
      // Handle fileURLToPath import from url module
      if (code.includes('fileURLToPath') && (code.includes(`from 'url'`) || code.includes(`from "url"`))) {
        transformedCode = transformedCode
          .replace(/from ['"]url['"]/g, `from '${nodeBuiltins.url}'`);
      }
      
      // Replace process references with our browserEnv implementation
      if (code.includes('process') && !code.includes('import process') && 
          !code.includes('const process') && !code.includes('let process') && 
          !code.includes('var process')) {
        transformedCode = `import processMock from '${nodeBuiltins.process}';\nconst process = processMock;\n${transformedCode}`;
      }
      
      return transformedCode !== code ? { code: transformedCode, map: null } : null;
    }
  };
}