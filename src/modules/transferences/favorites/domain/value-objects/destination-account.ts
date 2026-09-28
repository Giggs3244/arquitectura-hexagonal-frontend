import { DestinationAccountNonNumericException } from '../exceptions/destination-account-non-numeric.exception';
import { DestinationAccountRequiredException } from '../exceptions/destination-account-required.exception';
import { DestinationAccountTooLongException } from '../exceptions/destination-account-too-long.exception';

/** Kept as a string to preserve leading zeros. */
export class DestinationAccount {
  static readonly MAX_LENGTH = 10;

  private static readonly DIGITS_PATTERN = /^\d+$/;

  private constructor(readonly value: string) {}

  static create(raw: string): DestinationAccount {
    const value = (raw ?? '').trim();

    if (value.length === 0) {
      throw new DestinationAccountRequiredException();
    }
    if (!DestinationAccount.DIGITS_PATTERN.test(value)) {
      throw new DestinationAccountNonNumericException();
    }
    if (value.length > DestinationAccount.MAX_LENGTH) {
      throw new DestinationAccountTooLongException();
    }

    return new DestinationAccount(value);
  }
}
