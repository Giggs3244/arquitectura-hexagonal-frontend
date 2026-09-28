import { DomainException } from './domain.exception';

export class DuplicatedAliasException extends DomainException {
  readonly code = 'DUPLICATED_ALIAS';

  constructor() {
    super('A favorite transference with this alias already exists.');
  }
}
