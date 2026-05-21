// Stub for native-only packages that are not supported on web.
// Metro resolves these modules to this file when platform === 'web',
// so the bundler never tries to process the real native code.
// monetisation.ts guards every call with `if (!admobLib)` / `if (!iapLib)`,
// so returning null here is safe — those code paths simply won't run on web.
module.exports = null;
