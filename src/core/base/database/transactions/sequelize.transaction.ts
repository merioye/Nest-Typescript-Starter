import { Transaction } from 'sequelize';

import { ITransaction } from '../interfaces';

/**
 * Handles transactions in a Sequelize ORM database.
 * Implements the `ITransaction` interface to provide commit and rollback functionality.
 *
 * @class SequelizeTransaction
 * @implements {ITransaction}
 */
export class SequelizeTransaction implements ITransaction {
  /**
   * Initializes a new SequelizeTransaction with a provided Sequelize transaction.
   *
   * @constructor
   * @param {Transaction} _transaction - The Sequelize transaction used to manage the transaction.
   */
  public constructor(private readonly _transaction: Transaction) {}

  /**
   * Commits the current transaction using the Sequelize transaction.
   *
   * @returns {Promise<void>} A promise that resolves when the transaction is successfully committed.
   */
  public async commit(): Promise<void> {
    await this._transaction.commit();
  }

  /**
   * Rolls back the current transaction using the Sequelize transaction.
   *
   * @returns {Promise<void>} A promise that resolves when the transaction is successfully rolled back.
   */
  public async rollback(): Promise<void> {
    await this._transaction.rollback();
  }
}
