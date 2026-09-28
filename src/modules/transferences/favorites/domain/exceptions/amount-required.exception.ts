import { DomainException } from './domain.exception';

export class AmountRequiredException extends DomainException {
  readonly code = 'AMOUNT_REQUIRED';

  constructor() {
    super('Amount is required.');
  }
}
