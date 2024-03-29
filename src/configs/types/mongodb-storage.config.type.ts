export type MongodbStorageConfigType = {
  /**
   * Get db collection name
   * @return string
   */
  getDbCollectionName(): string;

  /**
   * Get database connection retries
   * @return number
   */
  getDbConnectionRetries(): number;

  /**
   * Get database connection retries delay
   * @return number
   */
  getDbConnectionRetriesDelay(): number;

  /**
   * Get Database connection string
   * @return string
   */
  getDbConnectionString(): string;

  /**
   * Get db logger level
   * @return string
   */
  getDbLoggerLevel(): string;

  /**
   * Get db password
   * @return string
   */
  getDbPassword(): string;

  /**
   * Get db user name
   * @return string
   */
  getDbUsername(): string;

  /**
   * Is authentication enabled
   * @return boolean
   */
  isDbAuthenticationEnabled(): boolean;

  /**
   * Is auto reconnect enabled
   * @return boolean
   */
  isDbAutoReconnectEnabled(): boolean;

  /**
   * Is db collection auto create on model create
   * Set to `true` to make Mongoose automatically call `createCollection()` on every model created on this connection.
   * @return boolean
   */
  isDbCollectionAutoCreateEnabled(): boolean;

  /**
   * Is db collection indexed automatically
   * Set to false to disable automatic index creation for all models associated with this connection.
   * @return boolean
   */
  isDbCollectionAutoIndexEnabled(): boolean;

  /**
   * Is keep-alive mode enabled
   * @return boolean
   */
  isDbKeepAliveEnabled(): boolean;
};
