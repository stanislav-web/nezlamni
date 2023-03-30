/**
 * Ascending sort fo array objects
 * @param {any[]} objects
 * @param {string[]} property
 */
export const sortAscBy = (objects: any[], property: string) =>
  objects.sort((a, b) => a[property] - b[property]);

/**
 * Descending sort fo array objects
 * @param {object[]} objects
 * @param {string[]} property
 */
export const sortDescBy = (objects: object[], property: string) =>
  objects.sort((a, b) => b[property] - a[property]);
