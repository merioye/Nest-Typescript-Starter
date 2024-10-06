import { Transaction } from 'sequelize';
import { ITransaction } from '../interfaces';

export class SequelizeTransaction implements ITransaction {
  public constructor(private readonly _transaction: Transaction) {}

  public async commit(): Promise<void> {
    await this._transaction.commit();
  }

  public async rollback(): Promise<void> {
    await this._transaction.rollback();
  }
}
