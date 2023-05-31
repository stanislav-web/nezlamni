/**
 * Generate random number
 * @param {number} min
 * @param {number} max
 * @return number
 */
export const getRandomNumber = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min) + min);
