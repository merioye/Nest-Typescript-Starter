import { DatabaseError } from '@/common/errors';
import { PrismaClient } from '@prisma/client';
import { ITransaction } from '../interfaces';

export class PrismaTransaction implements ITransaction {
  private _isCompleted: boolean = false;
  private _resolveTransaction: ((value: unknown) => void) | null = null;
  private _rejectTransaction: ((reason?: any) => void) | null = null;

  private constructor(
    private readonly _prisma: PrismaClient,
    private readonly _transactionPromise: Promise<unknown>
  ) {}

  public async commit(): Promise<void> {
    if (this._isCompleted) {
      throw new DatabaseError('Transaction has already been completed');
    }
    this._isCompleted = true;
    this._resolveTransaction?.(null);
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

  public getClient(): PrismaClient {
    if (this._isCompleted) {
      throw new DatabaseError('Transaction has already been completed');
    }
    return this._prisma;
  }

  public static start(prisma: PrismaClient): Promise<PrismaTransaction> {
    let resolveTransaction: ((value: unknown) => void) | null = null;
    let rejectTransaction: ((reason?: any) => void) | null = null;

    const transactionPromise = new Promise((resolve, reject) => {
      resolveTransaction = resolve;
      rejectTransaction = reject;
    });

    const transaction = new PrismaTransaction(prisma, transactionPromise);
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
