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
export const addProps = (array: object[], props: object): object[] => {
  return array.map((obj) => ({ ...obj, ...props }));
};

/**
 * Check if string or number in array
 * @param {string[]} array
 * @param {string | number} str
 */
export const isInArray = (array: string[], str: string | number): boolean =>
  array.includes(str.toString());

/**
 * Split array to chunks
 * @param {any[]} array
 * @param {number} size
 */
export const arrayBatching = <T>(array: T[], size: number): T[][] => {
  const arr = [];
  for (let i = 0; i < array.length; i += size) {
    const chunk = array.slice(i, i + size);
    arr.push(chunk);
  }
  return arr;
};
