import { DomainException } from './domain.exception';

export class AmountInvalidDecimalsException extends DomainException {
  readonly code = 'AMOUNT_INVALID_DECIMALS';

  constructor() {
    super('Amount has too many decimals.');
  }
}
