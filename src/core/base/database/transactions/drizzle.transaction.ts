import { DatabaseError } from '@/common/errors';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { PgDatabase } from 'drizzle-orm/pg-core';
import { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import { ITransaction } from '../interfaces';

/**
 * Represents any supported Drizzle ORM database (MySQL, PostgreSQL, SQLite).
 */
type AnyDrizzleDatabase =
  | BaseSQLiteDatabase<any, any>
  | PgDatabase<any, any, any>
  | MySql2Database<any>;

/**
 * Handles transactions in a Drizzle ORM database.
 * Implements the `ITransaction` interface to provide commit and rollback functionality.
 *
 * @class DrizzleTransaction
 * @implements {ITransaction}
 */
export class DrizzleTransaction implements ITransaction {
  /**
   * Tracks whether the transaction has been completed (committed or rolled back).
   */
  private _isCompleted: boolean = false;
  /**
   * Function to resolve the transaction, used in commit.
   */
  private _resolveTransaction: (() => void) | null = null;
  /**
   * Function to reject the transaction, used in rollback.
   */
  private _rejectTransaction: ((reason?: any) => void) | null = null;

  /**
   * A promise that represents the transaction process.
   * @constructor
   */
  private constructor(private _transactionPromise: Promise<void>) {}

  /**
   * Commits the current transaction, marking it as completed and resolving the transaction promise.
   * Throws an error if the transaction has already been completed.
   *
   * @throws {DatabaseError} If the transaction has already been completed.
   * @returns {Promise<void>} A promise that resolves when the transaction is successfully committed.
   */
  public async commit(): Promise<void> {
    if (this._isCompleted) {
      throw new DatabaseError('Transaction has already been completed');
    }
    this._isCompleted = true;
    this._resolveTransaction?.();
    await this._transactionPromise;
  }

  /**
   * Rolls back the current transaction, marking it as completed and rejecting the transaction promise.
   * Throws an error if the transaction has already been completed.
   *
   * @throws {DatabaseError} If the transaction has already been completed.
   * @returns {Promise<void>} A promise that resolves when the transaction is successfully rolled back.
   */
  public async rollback(): Promise<void> {
    if (this._isCompleted) {
      throw new DatabaseError('Transaction has already been completed');
    }
    this._isCompleted = true;
    this._rejectTransaction?.(new DatabaseError('Transaction rolled back'));
    try {
      await this._transactionPromise;
    } catch (error) {
      // Ignore the error, as it's expected during rollback
    }
  }

  /**
   * Starts a new transaction on the given Drizzle database.
   *
   * @param {AnyDrizzleDatabase} db - The database to start the transaction on.
   * @returns {Promise<DrizzleTransaction>} A promise that resolves with the started transaction.
   */
  public static async start(
    db: AnyDrizzleDatabase
  ): Promise<DrizzleTransaction> {
    let resolveTransaction: (() => void) | null = null;
    let rejectTransaction: ((reason?: any) => void) | null = null;

    const transactionPromise = new Promise<void>((resolve, reject) => {
      resolveTransaction = resolve;
      rejectTransaction = reject;
    });

    const transaction = new DrizzleTransaction(transactionPromise);
    transaction._resolveTransaction = resolveTransaction;
    transaction._rejectTransaction = rejectTransaction;

    return new Promise((resolve) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      db.transaction(async (tx: any) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        Object.assign(transaction, { db: tx });
        resolve(transaction);
        await transactionPromise;
      });
    });
  }
}
