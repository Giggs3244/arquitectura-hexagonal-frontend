import { AmountExceedsLimitException } from '../exceptions/amount-exceeds-limit.exception';
import { AmountInvalidDecimalsException } from '../exceptions/amount-invalid-decimals.exception';
import { AmountInvalidFormatException } from '../exceptions/amount-invalid-format.exception';
import { AmountNotPositiveException } from '../exceptions/amount-not-positive.exception';
import { AmountRequiredException } from '../exceptions/amount-required.exception';

export class Amount {
  static readonly MAX_AMOUNT = 1000;
  static readonly MAX_DECIMALS = 2;

  private static readonly NUMBER_PATTERN = /^-?\d+(\.\d+)?$/;
  private static readonly DECIMALS_PATTERN = new RegExp(
    `^\\d+(\\.\\d{1,${Amount.MAX_DECIMALS}})?$`,
  );

  private constructor(readonly value: number) {}

  /** Rules are checked over the textual representation to avoid floating point issues. */
  static create(raw: string | number): Amount {
    const text = String(raw ?? '').trim();

    if (text.length === 0) {
      throw new AmountRequiredException();
    }
    if (!Amount.NUMBER_PATTERN.test(text)) {
      throw new AmountInvalidFormatException();
    }

    const value = Number(text);

    if (value <= 0) {
      throw new AmountNotPositiveException();
    }
    if (value > Amount.MAX_AMOUNT) {
      throw new AmountExceedsLimitException();
    }
    if (!Amount.DECIMALS_PATTERN.test(text)) {
      throw new AmountInvalidDecimalsException();
    }

    return new Amount(value);
  }
}
