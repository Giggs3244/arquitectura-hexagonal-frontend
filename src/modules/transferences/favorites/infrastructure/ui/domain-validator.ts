import { Signal } from '@angular/core';
import { ValidationError } from '@angular/forms/signals';

import { DomainException } from '../../domain/exceptions/domain.exception';

/**
 * Adapts a value object factory into a Signal Forms validator so the
 * business rules are defined only once, in the domain.
 */
export function domainValidator<TValue>(factory: (value: TValue) => unknown) {
  return ({ value }: { value: Signal<TValue> }): ValidationError.WithoutFieldTree | undefined => {
    try {
      factory(value());
      return undefined;
    } catch (error) {
      if (error instanceof DomainException) {
        return { kind: error.code };
      }
      throw error;
    }
  };
}
