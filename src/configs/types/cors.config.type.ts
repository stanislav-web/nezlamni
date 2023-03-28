export type CorsConfigType = {
  /**
   * Get CORS allowed headers
   * @return string
   */
  getAllowedHeaders(): string;

  /**
   * Get CORS allowed methods
   * @return string[] | string
   */
  getAllowedMethods(): string[] | string;

  /**
   * Get CORS allowed domains
   * @return string[] | string
   */
  getAllowedOrigins(): string[] | string;

  /**
   * Get CORS exposed headers
   * @return string
   */
  getExposedHeaders(): string;

  /**
   * Is credentials required
   * @return boolean
   */
  requireCredentials(): boolean;
};
