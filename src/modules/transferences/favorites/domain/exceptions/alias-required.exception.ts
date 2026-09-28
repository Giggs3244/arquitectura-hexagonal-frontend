import { DomainException } from './domain.exception';

export class AliasRequiredException extends DomainException {
  readonly code = 'ALIAS_REQUIRED';

  constructor() {
    super('Alias is required.');
  }
}
