import { QueryRunner } from 'typeorm';
import { ITransaction } from '../interfaces';

/**
 * Handles transactions in a TypeORM database.
 * Implements the `ITransaction` interface to provide commit and rollback functionality.
 *
 * @class TypeORMTransaction
 * @implements {ITransaction}
 */
export class TypeORMTransaction implements ITransaction {
  /**
   * Initializes a new TypeORMTransaction with a provided TypeORM transaction.
   *
   * @constructor
   * @param {QueryRunner} _queryRunner - The TypeORM query runner used to manage the transaction.
   */
  public constructor(private readonly _queryRunner: QueryRunner) {}

  /**
   * Commits the current transaction using the TypeORM query runner.
   *
   * @returns {Promise<void>} A promise that resolves when the transaction is successfully committed.
   */
  public async commit(): Promise<void> {
    await this._queryRunner.commitTransaction();
  }

  /**
   * Rolls back the current transaction using the TypeORM query runner.
   *
   * @returns {Promise<void>} A promise that resolves when the transaction is successfully rolled back.
   */
  public async rollback(): Promise<void> {
    await this._queryRunner.rollbackTransaction();
  }
}
