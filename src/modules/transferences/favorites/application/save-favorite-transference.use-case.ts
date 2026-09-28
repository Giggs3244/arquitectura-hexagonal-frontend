import { FavoriteTransference } from '../domain/entities/favorite-transference';
import { DuplicatedAliasException } from '../domain/exceptions/duplicated-alias.exception';
import { FavoriteTransferenceRepository } from '../domain/repositories/favorite-transference.repository';
import { SaveFavoriteTransferenceCommand } from './save-favorite-transference.command';

export class SaveFavoriteTransferenceUseCase {
  constructor(private readonly repository: FavoriteTransferenceRepository) {}

  async execute(command: SaveFavoriteTransferenceCommand): Promise<void> {
    const favorite = FavoriteTransference.create(command);

    if (await this.repository.existsByAlias(favorite.alias)) {
      throw new DuplicatedAliasException();
    }

    await this.repository.save(favorite);
  }
}
