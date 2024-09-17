import { DatabaseError } from '@/common/errors';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { PgDatabase } from 'drizzle-orm/pg-core';
import { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import { ITransaction } from '../interfaces';

type AnyDrizzleDatabase =
  | BaseSQLiteDatabase<any, any>
  | PgDatabase<any, any, any>
  | MySql2Database<any>;

export class DrizzleTransaction implements ITransaction {
  private _isCompleted: boolean = false;
  private _resolveTransaction: (() => void) | null = null;
  private _rejectTransaction: ((reason?: any) => void) | null = null;

  private constructor(
    private _db: AnyDrizzleDatabase,
    private _transactionPromise: Promise<void>
  ) {}

  public async commit(): Promise<void> {
    if (this._isCompleted) {
      throw new DatabaseError('Transaction has already been completed');
    }
    this._isCompleted = true;
    this._resolveTransaction?.();
    await this._transactionPromise;
  }

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

  public getDatabase(): AnyDrizzleDatabase {
    if (this._isCompleted) {
      throw new DatabaseError('Transaction has already been completed');
    }
    return this._db;
  }

  public static async start(
    db: AnyDrizzleDatabase
  ): Promise<DrizzleTransaction> {
    let resolveTransaction: (() => void) | null = null;
    let rejectTransaction: ((reason?: any) => void) | null = null;

    const transactionPromise = new Promise<void>((resolve, reject) => {
      resolveTransaction = resolve;
      rejectTransaction = reject;
    });

    const transaction = new DrizzleTransaction(db, transactionPromise);
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
