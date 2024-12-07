import { ClientSession } from 'mongoose';

import { ITransaction } from '../interfaces';

/**
 * Handles transactions in a Mongoose database.
 * Implements the `ITransaction` interface to provide commit and rollback functionality.
 *
 * @class MongooseTransaction
 * @implements {ITransaction}
 */
export class MongooseTransaction implements ITransaction {
  /**
   * Initializes a new MongooseTransaction with a provided Mongoose session.
   *
   * @constructor
   * @param {ClientSession} _session - The Mongoose session used to manage the transaction.
   */
  public constructor(private readonly _session: ClientSession) {}

  /**
   * Commits the current transaction using the Mongoose session.
   *
   * @returns {Promise<void>} A promise that resolves when the transaction is successfully committed.
   */
  public async commit(): Promise<void> {
    await this._session.commitTransaction();
  }

  /**
   * Rolls back the current transaction using the Mongoose session.
   *
   * @returns {Promise<void>} A promise that resolves when the transaction is successfully rolled back.
   */
  public async rollback(): Promise<void> {
    await this._session.abortTransaction();
  }
}
