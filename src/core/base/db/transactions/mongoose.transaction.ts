import { ClientSession } from 'mongoose';
import { ITransaction } from '../interfaces';

export class MongooseTransaction implements ITransaction {
  public constructor(private readonly _session: ClientSession) {}

  public async commit(): Promise<void> {
    await this._session.commitTransaction();
  }

  public async rollback(): Promise<void> {
    await this._session.abortTransaction();
  }
}
