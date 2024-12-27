export class BaseError<T> extends Error {
  public readonly name: string
  public readonly data: T

  constructor(message: string, data: T) {
    super(message)

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BaseError)
    }

    this.name = 'BaseError'
    this.data = data
  }
}
