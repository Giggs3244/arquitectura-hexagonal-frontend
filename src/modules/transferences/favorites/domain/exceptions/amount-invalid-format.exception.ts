import { DomainException } from './domain.exception';

export class AmountInvalidFormatException extends DomainException {
  readonly code = 'AMOUNT_INVALID_FORMAT';

  constructor() {
    super('Amount is not a valid number.');
  }
}
