import { DatabaseError } from '@/common/errors';
import { PrismaClient } from '@prisma/client';
import { ITransaction } from '../interfaces';

/**
 * Handles transactions in a Prisma ORM database.
 * Implements the `ITransaction` interface to provide commit and rollback functionality.
 *
 * @class PrismaTransaction
 * @implements {ITransaction}
 */
export class PrismaTransaction implements ITransaction {
  /**
   * Tracks whether the transaction has been completed (committed or rolled back).
   */
  private _isCompleted: boolean = false;
  /**
   * Function to resolve the transaction, used in commit.
   */
  private _resolveTransaction: ((value: unknown) => void) | null = null;
  /**
   * Function to reject the transaction, used in rollback.
   */
  private _rejectTransaction: ((reason?: any) => void) | null = null;

  /**
   * A promise that represents the transaction process.
   * @constructor
   */
  private constructor(private readonly _transactionPromise: Promise<unknown>) {}

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
    this._resolveTransaction?.(null);
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
   * Starts a new transaction on the given Prisma database.
   *
   * @param {AnyDrizzleDatabase} prisma - The prisma db client to start the transaction on.
   * @returns {Promise<DrizzleTransaction>} A promise that resolves with the started transaction.
   */
  public static start(prisma: PrismaClient): Promise<PrismaTransaction> {
    let resolveTransaction: ((value: unknown) => void) | null = null;
    let rejectTransaction: ((reason?: any) => void) | null = null;

    const transactionPromise = new Promise((resolve, reject) => {
      resolveTransaction = resolve;
      rejectTransaction = reject;
    });

    const transaction = new PrismaTransaction(transactionPromise);
    transaction._resolveTransaction = resolveTransaction;
    transaction._rejectTransaction = rejectTransaction;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    return prisma.$transaction(async (prismaTransaction: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      Object.assign(transaction, { prisma: prismaTransaction });
      await transactionPromise;
      return transaction;
    });
  }
}
