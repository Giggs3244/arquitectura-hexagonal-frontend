import { Injectable } from '@angular/core';

import {
  FavoriteTransference,
  FavoriteTransferencePrimitives,
} from '../../domain/entities/favorite-transference';
import { FavoriteTransferenceRepository } from '../../domain/repositories/favorite-transference.repository';
import { Alias } from '../../domain/value-objects/alias';

@Injectable()
export class LocalStorageFavoriteTransferenceRepository implements FavoriteTransferenceRepository {
  static readonly STORAGE_KEY = 'bank.transferences.favorites';

  async save(favorite: FavoriteTransference): Promise<void> {
    const favorites = await this.findAll();
    const primitives = [...favorites, favorite].map((item) => item.toPrimitives());

    localStorage.setItem(
      LocalStorageFavoriteTransferenceRepository.STORAGE_KEY,
      JSON.stringify(primitives),
    );
  }

  async findAll(): Promise<FavoriteTransference[]> {
    const raw = localStorage.getItem(LocalStorageFavoriteTransferenceRepository.STORAGE_KEY);

    if (raw === null) {
      return [];
    }

    try {
      const primitives: unknown = JSON.parse(raw);

      if (!Array.isArray(primitives)) {
        return [];
      }

      return primitives.map((item: FavoriteTransferencePrimitives) =>
        FavoriteTransference.fromPrimitives(item),
      );
    } catch {
      return [];
    }
  }

  async existsByAlias(alias: Alias): Promise<boolean> {
    const favorites = await this.findAll();

    return favorites.some((favorite) => favorite.alias.equals(alias));
  }
}
