import { FavoriteTransference } from '../entities/favorite-transference';
import { Alias } from '../value-objects/alias';

/**
 * Output port. Promise-based so a remote adapter can implement it
 * without changing the domain or application layers.
 */
export interface FavoriteTransferenceRepository {
  save(favorite: FavoriteTransference): Promise<void>;
  findAll(): Promise<FavoriteTransference[]>;
  existsByAlias(alias: Alias): Promise<boolean>;
}
