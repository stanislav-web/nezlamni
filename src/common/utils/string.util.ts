/**
 * Check if string is empty
 * @param {string} str
 */
export const isEmpty = (str) => !str || str.length === 0;

export const escapeString = (str: string): string =>
  str.replace(/[!'_~$&()%*+#^><]/g, '').replace(/ /g, '');
