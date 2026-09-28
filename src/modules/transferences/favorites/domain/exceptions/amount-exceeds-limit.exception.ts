import { DomainException } from './domain.exception';

export class AmountExceedsLimitException extends DomainException {
  readonly code = 'AMOUNT_EXCEEDS_LIMIT';

  constructor() {
    super('Amount exceeds the maximum allowed.');
  }
}
