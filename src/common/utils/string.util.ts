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

/**
 * Capitalize first letters
 * @param {string} str
 */
export const ucFirstAll = (str: string): string =>
  (str && str.toLowerCase()).replace(/(^\w{1})|(\s+\w{1})/g, (letter) =>
    letter.toUpperCase(),
  );
