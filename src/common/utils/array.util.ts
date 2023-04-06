/**
 * Ascending sort fo array objects
 * @param {any[]} objects
 * @param {string} property
 * @return object[]
 */
export const sortAscBy = (objects: any[], property: string): object[] =>
  objects.sort((a, b) => a[property] - b[property]);

/**
 * Descending sort fo array objects
 * @param {object[]} objects
 * @param {string} property
 * @return object[]
 */
export const sortDescBy = (objects: object[], property: string): object[] =>
  objects.sort((a, b) => b[property] - a[property]);

/**
 * Find in array of objects (case-insensitive)
 * @param {object[]} objects
 * @param {string} property
 * @param {string} value
 */
export const findInArrayInsensitive = (
  objects: object[],
  property: string,
  value: string,
): object =>
  objects.find((obj) =>
    obj[property]
      ? obj[property]?.toLowerCase() === value.toLowerCase()
      : undefined,
  );

/**
 * Add properties to each object in array
 * @param {object[]} array
 * @param {object} props
 */
export const addProps = (array: object[], props: object) => {
  return array.map((obj) => ({ ...obj, ...props }));
};
