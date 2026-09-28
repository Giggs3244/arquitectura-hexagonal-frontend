import { DomainException } from './domain.exception';

export class DestinationAccountTooLongException extends DomainException {
  readonly code = 'DESTINATION_ACCOUNT_TOO_LONG';

  constructor() {
    super('Destination account exceeds the maximum length.');
  }
}
