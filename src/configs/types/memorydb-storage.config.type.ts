export type MemoryDbStorageConfigType = {
  /**
   * Get Memory Db namespace size
   * @return number
   */
  getDbNamespaceSize(): number;

  /**
   * Get Memory Db pool size
   * @return number
   */
  getDbSize(): number;
};
