import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FieldTree, form, FormField, FormRoot, validate } from '@angular/forms/signals';

import { SaveFavoriteTransferenceCommand } from '../../../application/save-favorite-transference.command';
import { SaveFavoriteTransferenceUseCase } from '../../../application/save-favorite-transference.use-case';
import { DuplicatedAliasException } from '../../../domain/exceptions/duplicated-alias.exception';
import { Alias } from '../../../domain/value-objects/alias';
import { Amount } from '../../../domain/value-objects/amount';
import { DestinationAccount } from '../../../domain/value-objects/destination-account';
import { domainValidator } from '../domain-validator';
import { FAVORITE_TRANSFERENCE_ERROR_MESSAGES } from '../favorite-transference-error-messages';

const EMPTY_FAVORITE: SaveFavoriteTransferenceCommand = {
  alias: '',
  amount: '',
  destinationAccount: '',
};

@Component({
  selector: 'app-favorite-transference-form',
  imports: [FormField, FormRoot],
  templateUrl: './favorite-transference-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavoriteTransferenceFormComponent {
  private readonly saveFavoriteTransference = inject(SaveFavoriteTransferenceUseCase);

  private readonly model = signal<SaveFavoriteTransferenceCommand>({ ...EMPTY_FAVORITE });

  protected readonly saved = signal(false);

  protected readonly favoriteForm = form(
    this.model,
    (path) => {
      validate(path.alias, domainValidator(Alias.create));
      validate(path.amount, domainValidator(Amount.create));
      validate(path.destinationAccount, domainValidator(DestinationAccount.create));
    },
    {
      submission: {
        action: async (favoriteForm) => {
          try {
            await this.saveFavoriteTransference.execute(favoriteForm().value());
          } catch (error) {
            if (error instanceof DuplicatedAliasException) {
              return { kind: error.code, fieldTree: favoriteForm.alias };
            }
            throw error;
          }

          favoriteForm().reset({ ...EMPTY_FAVORITE });
          this.saved.set(true);
          return undefined;
        },
      },
    },
  );

  protected errorMessage(field: FieldTree<string>): string | null {
    const state = field();

    if (!(state.touched() || state.dirty()) || !state.invalid()) {
      return null;
    }

    const [error] = state.errors();
    return error ? (FAVORITE_TRANSFERENCE_ERROR_MESSAGES[error.kind] ?? error.kind) : null;
  }
}
