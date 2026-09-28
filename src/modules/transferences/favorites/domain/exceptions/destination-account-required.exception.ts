import { DomainException } from './domain.exception';

export class DestinationAccountRequiredException extends DomainException {
  readonly code = 'DESTINATION_ACCOUNT_REQUIRED';

  constructor() {
    super('Destination account is required.');
  }
}
