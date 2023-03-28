export type ApiConfigType = {
  /**
   * Get api environment
   * @return {string}
   */
  getEnvironment(): string;
  /**
   * Get api http port
   * @return {string}
   */
  getHttpsPort(): number;
  /**
   * Get api name
   * @return {string}
   */
  getName(): string;
  /**
   * Get api version
   * @return {string}
   */
  getVersion(): string;

  /**
   * Is development environment
   * @return {boolean}
   */
  isDevelopment(): boolean;

  /**
   * Is local environment
   * @return {boolean}
   */
  isLocal(): boolean;

  /**
   * Is logger enabled
   * @return {boolean}
   */
  isLoggerEnabled(): boolean;

  /**
   * Is production environment
   * @return {boolean}
   */
  isProduction(): boolean;
};
