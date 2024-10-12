/**
 * Interface representing a database transaction.
 * Provides methods to either commit or rollback the transaction.
 *
 * @interface ITransaction
 */
export interface ITransaction {
  /**
   * Commits the current transaction, saving all changes to the database.
   * @returns A promise that resolves when the transaction is successfully committed.
   */
  commit(): Promise<void>;
  /**
   * Rolls back the current transaction, undoing any changes made during the transaction.
   * @returns A promise that resolves when the transaction is successfully rolled back.
   */
  rollback(): Promise<void>;
}
