export class CustomError extends Error {
  public constructor(
    message: string,
    public name: string,
    private readonly statusCode: number,
  ) {
    super(message);
    Object.setPrototypeOf(this, CustomError.prototype);
  }

  public getStatus(): number {
    return this.statusCode;
  }
}
