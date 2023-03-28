import { Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { memoryDbStorageConfig } from '../../../configs';
import { MemoryDbErrorEnum } from '../enums/memory-db-error.enum';
import { MemoryDbErrorException } from '../exceptions/memory-db-error.exception';

@Injectable()
export class MemoryDbStorageProvider {
  /**
   * Constructor
   * @param {string} namespace
   * @param {object} pool
   * @param {ConfigType<typeof memoryDbStorageConfig>} memoryDbStorageConf
   */
  constructor(
    private readonly namespace: string,
    private readonly pool: object,
    private readonly memoryDbStorageConf: ConfigType<
      typeof memoryDbStorageConfig
    >,
  ) {
    this.namespace = namespace;
    this.pool[namespace] = pool;
  }

  /**
   * Put item
   * @param {string|number} key
   * @param {any} value
   * @returns { [p: string]: any }
   */
  put(key: string | number, value: any): { [p: string]: any } {
    if (this.pool[this.namespace][key]) {
      throw new MemoryDbErrorException(
        MemoryDbErrorEnum.ConflictException,
        `key "${key}" already exist in namespace: ${this.namespace}`,
      );
    }

    if (Object.keys(this.pool).length >= this.memoryDbStorageConf.getDbSize()) {
      throw new MemoryDbErrorException(
        MemoryDbErrorEnum.LimitExceededException,
        `Memory pool limit exceed. Max allowed ${this.memoryDbStorageConf.getDbSize()}`,
      );
    }

    if (
      Object.keys(this.pool[this.namespace]).length >=
      this.memoryDbStorageConf.getDbNamespaceSize()
    ) {
      throw new MemoryDbErrorException(
        MemoryDbErrorEnum.LimitExceededException,
        `Memory pool limit exceed for: "${
          this.namespace
        }". Max allowed ${this.memoryDbStorageConf.getDbNamespaceSize()}`,
      );
    }
    this.pool[this.namespace][key] = value;
    return { [key]: value };
  }

  /**
   * Get item
   * @param {string} key
   * @returns {*}
   */
  get(key) {
    if (!this.pool[this.namespace][key]) {
      return null;
    }
    return this.pool[this.namespace][key];
  }

  /**
   * List items
   * @returns {*}
   */
  list() {
    if (Object.keys(this.pool[this.namespace]).length <= 0) {
      throw new MemoryDbErrorException(
        MemoryDbErrorEnum.ResourceNotFoundException,
        `Items not found in: ${this.namespace}`,
      );
    }

    return this.pool[this.namespace];
  }

  /**
   * Pool size
   * @returns {number}
   */
  length() {
    return Object.keys(this.pool[this.namespace]).length;
  }

  /**
   * Update item
   * @param {string} key
   * @param {object} value
   * @returns {{}}
   */
  update(key, value) {
    if (!this.pool[this.namespace][key]) {
      throw new MemoryDbErrorException(
        MemoryDbErrorEnum.ResourceNotFoundException,
        `"${key}" not found in namespace: ${this.namespace}`,
      );
    }
    this.pool[this.namespace][key] = value;
    return { [key]: value };
  }

  /**
   * Delete item
   * @param {string} key
   * @returns {boolean}
   */
  remove(key) {
    if (!this.pool[this.namespace][key]) {
      throw new MemoryDbErrorException(
        MemoryDbErrorEnum.ResourceNotFoundException,
        `"${key}" not found in namespace: ${this.namespace}`,
      );
    }

    delete this.pool[this.namespace][key];
    return true;
  }
}
