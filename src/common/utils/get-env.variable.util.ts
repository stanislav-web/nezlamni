/**
 * Get env variable
 * @param {string} key
 * @param {boolean} throwOnMissing
 */
export const getEnv = (key: string, throwOnMissing = true): string => {
  const value = process.env[key];
  if ((!value || typeof value === 'undefined') && throwOnMissing) {
    throw new Error(`Config error - missing .env -> ${key}`);
  }
  return value;
};
