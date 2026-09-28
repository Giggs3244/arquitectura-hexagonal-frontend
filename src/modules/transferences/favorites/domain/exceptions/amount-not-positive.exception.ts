import { DomainException } from './domain.exception';

export class AmountNotPositiveException extends DomainException {
  readonly code = 'AMOUNT_NOT_POSITIVE';

  constructor() {
    super('Amount must be greater than zero.');
  }
}
