import { CrudInterface, Table } from 'brackets-manager';
import { Config, JsonDB } from 'node-json-db';
import rfdc from 'rfdc';

const clone = rfdc();

type StringIndexedObject = Record<string, unknown>;
type Filter<T> = (obj: T) => boolean;

export class BracketsProvider implements CrudInterface {
  private internal: JsonDB;

  /**
   * Creates an instance of JsonDatabase, an implementation of CrudInterface for a json file.
   */
  constructor() {
    const config = new Config('brackets', true, true);
    this.internal = new JsonDB(config);
    void this.init();
  }

  /**
   * Creates the array if it doesn't exist.
   *
   * @param table The table to check.
   */
  private async ensureArrayExists(table: Table): Promise<void> {
    const path = BracketsProvider.makePath(table);
    const isExist = await this.internal.exists(path);
    if (!isExist) await this.internal.push(path, []);
  }

  /**
   * Initiates the storage.
   */
  private async init(): Promise<void> {
    await this.ensureArrayExists('participant');
    await this.ensureArrayExists('stage');
    await this.ensureArrayExists('group');
    await this.ensureArrayExists('round');
    await this.ensureArrayExists('match');
    await this.ensureArrayExists('match_game');
  }

  /**
   * Creates the path of a table.
   *
   * @param table Name of the table.
   */
  private static makePath(table: Table): string {
    return `/${table}`;
  }

  /**
   * Creates the path of an array.
   *
   * @param table Name of the table.
   */
  private static makeArrayPath(table: Table): string {
    return `/${table}[]`;
  }

  /**
   * Creates the path of an element at a given index in an array.
   *
   * @param table Name of the table.
   * @param index Index of the element.
   */
  private static makeArrayIndexPath(table: Table, index: number): string {
    return `/${table}[${index}]`;
  }

  /**
   * Makes the filter function associated to the partial object.
   *
   * @param partial A partial object with given values as query.
   */
  private makeFilter<T extends StringIndexedObject>(
    partial: Partial<T>,
  ): Filter<T> {
    return (obj: T): boolean => {
      let result = true;

      for (const [key, value] of Object.entries(partial))
        result = result && obj[key] === value;

      return result;
    };
  }

  /**
   * Empties the database and `init()` it back.
   */
  public reset(): void {
    this.internal.resetData({});
    this.init();
  }

  /**
   * Inserts a value in a table and returns its id.
   *
   * @param table Where to insert.
   * @param value What to insert.
   */
  public insert<T>(table: Table, value: T): Promise<number>;

  /**
   * Inserts multiple values in a table.
   *
   * @param table Where to insert.
   * @param values What to insert.
   */
  public insert<T>(table: Table, values: T[]): Promise<boolean>;

  /**
   * Inserts a unique value or multiple values in a table.
   *
   * @param table Name of the table.
   * @param arg A single value or an array of values.
   */
  public async insert<T>(
    table: Table,
    arg: T | T[],
  ): Promise<number | boolean> {
    const existing: (T & { id: any })[] = await this.internal.getData(
      BracketsProvider.makePath(table),
    );
    let id = Math.max(-1, ...existing.map((element) => element.id)) + 1;

    if (!Array.isArray(arg)) {
      try {
        await this.internal.push(BracketsProvider.makeArrayPath(table), {
          id,
          ...arg,
        });
      } catch (error) {
        return -1;
      }
      return id;
    }

    try {
      await this.internal.push(
        BracketsProvider.makePath(table),
        arg.map((object) => ({ id: id++, ...object })),
        false,
      );
    } catch (error) {
      return false;
    }

    return true;
  }

  /**
   * Gets all data from a table.
   *
   * @param table Where to get from.
   */
  public select<T>(table: Table): Promise<T[] | null>;

  /**
   * Gets specific data from a table.
   *
   * @param table Where to get from.
   * @param key What to get.
   */
  public select<T>(table: Table, key: number): Promise<T | null>;

  /**
   * Gets data from a table with a filter.
   *
   * @param table Where to get from.
   * @param filter An object to filter data.
   */
  public select<T>(table: Table, filter: Partial<T>): Promise<T[] | null>;

  /**
   * Gets a unique elements, elements matching a filter or all the elements in a table.
   *
   * @param table Name of the table.
   * @param arg An index or a filter.
   */
  public async select<T>(
    table: Table,
    arg?: number | Partial<T>,
  ): Promise<T | T[] | null> {
    try {
      if (arg === undefined) {
        const data = await this.internal.getData(
          BracketsProvider.makePath(table),
        );
        return data.map(clone);
      }

      if (typeof arg === 'number') {
        const index = await this.internal.getIndex(
          BracketsProvider.makePath(table),
          arg,
        );
        if (index === -1) return null;

        return clone(
          this.internal.getData(
            BracketsProvider.makeArrayIndexPath(table, index),
          ),
        );
      }

      const values =
        (await this.internal.filter<T>(
          BracketsProvider.makePath(table),
          this.makeFilter(arg),
        )) || null;
      return values && values.map(clone);
    } catch (error) {
      return null;
    }
  }

  /**
   * Updates data in a table.
   *
   * @param table Where to update.
   * @param key What to update.
   * @param value How to update.
   */
  public update<T>(table: Table, key: number, value: T): Promise<boolean>;

  /**
   * Updates data in a table.
   *
   * @param table Where to update.
   * @param filter An object to filter data.
   * @param value How to update.
   */
  public update<T>(
    table: Table,
    filter: Partial<T>,
    value: Partial<T>,
  ): Promise<boolean>;

  /**
   * Updates one or multiple elements in a table.
   *
   * @param table Name of the table.
   * @param arg An index or a filter.
   * @param value The whole object if arg is an index or the values to change if arg is a filter.
   */
  public async update<T>(
    table: Table,
    arg: number | Partial<T>,
    value: T | Partial<T>,
  ): Promise<boolean> {
    if (typeof arg === 'number') {
      try {
        const index = await this.internal.getIndex(
          BracketsProvider.makePath(table),
          arg,
        );
        if (index === -1) return false;

        await this.internal.push(
          BracketsProvider.makeArrayIndexPath(table, index),
          value,
        );
        return true;
      } catch (error) {
        return false;
      }
    }

    const values = await this.internal.filter<{ id: number }>(
      BracketsProvider.makePath(table),
      this.makeFilter(arg),
    );
    if (!values) return false;

    values.forEach((v) =>
      this.internal.push(
        BracketsProvider.makeArrayIndexPath(table, v.id),
        value,
        false,
      ),
    );
    return true;
  }

  /**
   * Delete data in a table, based on a filter.
   *
   * @param table Where to delete in.
   * @param filter An object to filter data or undefined to empty the table.
   */
  public async delete<T extends { [key: string]: unknown }>(
    table: Table,
    filter?: Partial<T>,
  ): Promise<boolean> {
    const path = BracketsProvider.makePath(table);

    if (!filter) {
      await this.internal.push(path, []);
      return true;
    }

    const values: T[] = await this.internal.getData(path);
    if (!values) return false;

    const predicate = this.makeFilter(filter);

    await this.internal.push(
      path,
      values.filter((value) => !predicate(value)),
    );
    return true;
  }
}
