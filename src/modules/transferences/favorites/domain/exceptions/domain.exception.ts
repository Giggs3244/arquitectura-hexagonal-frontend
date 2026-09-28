/**
 * Base class for every business rule violation.
 * `code` is a stable identifier that adapters use to translate the error.
 */
export abstract class DomainException extends Error {
  abstract readonly code: string;

  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}
