import { QueryRunner } from 'typeorm';
import { ITransaction } from '../interfaces';

export class TypeORMTransaction implements ITransaction {
  public constructor(private readonly _queryRunner: QueryRunner) {}

  public async commit(): Promise<void> {
    await this._queryRunner.commitTransaction();
  }

  public async rollback(): Promise<void> {
    await this._queryRunner.rollbackTransaction();
  }
}
