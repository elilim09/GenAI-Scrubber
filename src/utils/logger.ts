export function log(...args: unknown[]): void {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log('[genai-scrubber]', ...args);
  }
}
