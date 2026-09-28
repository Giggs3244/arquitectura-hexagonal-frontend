import { DomainException } from './domain.exception';

export class AliasTooLongException extends DomainException {
  readonly code = 'ALIAS_TOO_LONG';

  constructor() {
    super('Alias exceeds the maximum length.');
  }
}
