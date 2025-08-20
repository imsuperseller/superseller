// Server-side polyfills for browser globals
if (typeof globalThis !== 'undefined' && typeof globalThis.self === 'undefined') {
  globalThis.self = globalThis;
}

if (typeof globalThis !== 'undefined' && typeof globalThis.window === 'undefined') {
  globalThis.window = undefined;
}

if (typeof globalThis !== 'undefined' && typeof globalThis.document === 'undefined') {
  globalThis.document = undefined;
}

// Export for module system
module.exports = {};
