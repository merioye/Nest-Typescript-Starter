/* eslint-disable @typescript-eslint/no-unsafe-return */
import { DatabaseError } from '@/common/errors';
import { PrismaClient } from '@prisma/client';

import { ITransaction } from '../interfaces';

/**
 * Handles transactions in a Prisma database.
 * Implements the `ITransaction` interface to provide commit and rollback functionality.
 *
 * @class PrismaTransaction
 * @implements {ITransaction}
 */
export class PrismaTransaction implements ITransaction {
  private _isCompleted = false;
  private _rollbackPromise: Promise<void>;
  private _resolve: (() => void) | null = null;
  private _reject: ((error: Error) => void) | null = null;

  /**
   * Creates a new PrismaTransaction instance.
   * @param _prismaClient - The Prisma client instance to use for the transaction
   * @param _originalClient - The original Prisma client instance
   */
  private constructor(
    private readonly _prismaClient: any,
    private readonly _originalClient: PrismaClient
  ) {
    this._rollbackPromise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  /**
   * Get the transaction-bound Prisma client.
   * This should be used for all database operations within the transaction.
   */
  public get prisma(): any {
    if (this._isCompleted) {
      throw new DatabaseError('Transaction has already been completed');
    }
    return this._prismaClient;
  }

  /**
   * Get the original Prisma client.
   * This is needed to start new transactions.
   */
  public get originalClient(): PrismaClient {
    return this._originalClient;
  }

  /**
   * Commits the current transaction.
   * In Prisma, the transaction is automatically committed when the callback completes successfully.
   * @throws {DatabaseError} If the transaction has already been completed.
   */
  public async commit(): Promise<void> {
    if (this._isCompleted) {
      throw new DatabaseError('Transaction has already been completed');
    }
    this._isCompleted = true;
    this._resolve?.();
    await this._rollbackPromise;
  }

  /**
   * Rolls back the current transaction.
   * In Prisma, throwing an error within the transaction callback triggers a rollback.
   * @throws {DatabaseError} If the transaction has already been completed.
   */
  public async rollback(): Promise<void> {
    if (this._isCompleted) {
      throw new DatabaseError('Transaction has already been completed');
    }
    this._isCompleted = true;
    const error = new DatabaseError('Transaction rolled back');
    this._reject?.(error);
    await this._rollbackPromise.catch(() => {
      // Ignore the error as it's expected during rollback
    });
  }

  /**
   * Starts a new transaction using the provided Prisma client.
   * @param prismaClient - The Prisma client to start the transaction with.
   * @returns Promise resolving to the started transaction.
   */
  public static start(prismaClient: PrismaClient): Promise<PrismaTransaction> {
    return prismaClient.$transaction<PrismaTransaction>((tx) => {
      return Promise.resolve(new PrismaTransaction(tx, prismaClient));
    });
  }
}
