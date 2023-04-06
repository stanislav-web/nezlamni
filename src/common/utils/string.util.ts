/**
 * Check if string is empty
 * @param {string} str
 */
export const isEmpty = (str) => !str || str.length === 0;

/**
 * Escape string
 * @param {string} str
 */
export const escapeString = (str: string): string =>
  str.replace(/[!'_~$&()%*+#^><]/g, '');
