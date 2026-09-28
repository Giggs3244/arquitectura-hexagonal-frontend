import { Alias } from '../value-objects/alias';
import { Amount } from '../value-objects/amount';
import { DestinationAccount } from '../value-objects/destination-account';

export interface FavoriteTransferencePrimitives {
  id: string;
  alias: string;
  amount: number;
  destinationAccount: string;
}

export class FavoriteTransference {
  private constructor(
    readonly id: string,
    readonly alias: Alias,
    readonly amount: Amount,
    readonly destinationAccount: DestinationAccount,
  ) {}

  static create(data: {
    alias: string;
    amount: string | number;
    destinationAccount: string;
  }): FavoriteTransference {
    return new FavoriteTransference(
      crypto.randomUUID(),
      Alias.create(data.alias),
      Amount.create(data.amount),
      DestinationAccount.create(data.destinationAccount),
    );
  }

  static fromPrimitives(primitives: FavoriteTransferencePrimitives): FavoriteTransference {
    return new FavoriteTransference(
      primitives.id,
      Alias.create(primitives.alias),
      Amount.create(primitives.amount),
      DestinationAccount.create(primitives.destinationAccount),
    );
  }

  toPrimitives(): FavoriteTransferencePrimitives {
    return {
      id: this.id,
      alias: this.alias.value,
      amount: this.amount.value,
      destinationAccount: this.destinationAccount.value,
    };
  }
}
