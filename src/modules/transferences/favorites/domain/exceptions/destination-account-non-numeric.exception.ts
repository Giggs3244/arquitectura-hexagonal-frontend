import { DomainException } from './domain.exception';

export class DestinationAccountNonNumericException extends DomainException {
  readonly code = 'DESTINATION_ACCOUNT_NON_NUMERIC';

  constructor() {
    super('Destination account must contain only digits.');
  }
}
