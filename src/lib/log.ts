/**
 * Environment-aware logging utility
 * Prevents console output in production builds
 */

const isProd = import.meta.env.PROD === true;
const noop = (..._args: unknown[]) => {};

export const log = {
  debug: isProd ? noop : (...args: unknown[]) => console.debug(...args),
  info: isProd ? noop : (...args: unknown[]) => console.info(...args),
  warn: (...args: unknown[]) => console.warn(...args),
  error: (...args: unknown[]) => console.error(...args),
};

export default log;
