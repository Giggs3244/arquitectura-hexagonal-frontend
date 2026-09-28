import { AliasRequiredException } from '../exceptions/alias-required.exception';
import { AliasTooLongException } from '../exceptions/alias-too-long.exception';

export class Alias {
  static readonly MAX_LENGTH = 30;

  private constructor(readonly value: string) {}

  static create(raw: string): Alias {
    const value = (raw ?? '').trim();

    if (value.length === 0) {
      throw new AliasRequiredException();
    }
    if (value.length > Alias.MAX_LENGTH) {
      throw new AliasTooLongException();
    }

    return new Alias(value);
  }

  equals(other: Alias): boolean {
    return this.value.toLowerCase() === other.value.toLowerCase();
  }
}
