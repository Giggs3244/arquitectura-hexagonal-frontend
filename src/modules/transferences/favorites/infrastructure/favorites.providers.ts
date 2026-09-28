import { InjectionToken, Provider } from '@angular/core';

import { SaveFavoriteTransferenceUseCase } from '../application/save-favorite-transference.use-case';
import { FavoriteTransferenceRepository } from '../domain/repositories/favorite-transference.repository';
import { LocalStorageFavoriteTransferenceRepository } from './persistence/local-storage-favorite-transference.repository';

export const FAVORITE_TRANSFERENCE_REPOSITORY = new InjectionToken<FavoriteTransferenceRepository>(
  'FAVORITE_TRANSFERENCE_REPOSITORY',
);

export function provideFavoriteTransferences(): Provider[] {
  return [
    {
      provide: FAVORITE_TRANSFERENCE_REPOSITORY,
      useClass: LocalStorageFavoriteTransferenceRepository,
    },
    {
      provide: SaveFavoriteTransferenceUseCase,
      useFactory: (repository: FavoriteTransferenceRepository) =>
        new SaveFavoriteTransferenceUseCase(repository),
      deps: [FAVORITE_TRANSFERENCE_REPOSITORY],
    },
  ];
}
