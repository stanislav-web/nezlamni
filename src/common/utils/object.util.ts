/**
 * Convert object to query string
 * @param {object} obj
 * @return string
 */
export const toQueryString = (obj: object): string => {
  return Object.keys(obj)
    .map((key) => key + '=' + obj[key])
    .join('&');
};
