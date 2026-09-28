export const FAVORITE_TRANSFERENCE_ERROR_MESSAGES: Readonly<Record<string, string>> = {
  ALIAS_REQUIRED: 'El alias es obligatorio.',
  ALIAS_TOO_LONG: 'El alias debe tener máximo 30 caracteres.',
  DUPLICATED_ALIAS: 'Ya existe una transferencia favorita con este alias.',
  AMOUNT_REQUIRED: 'El monto es obligatorio.',
  AMOUNT_INVALID_FORMAT: 'El monto debe ser un número válido.',
  AMOUNT_NOT_POSITIVE: 'El monto debe ser mayor a 0.',
  AMOUNT_EXCEEDS_LIMIT: 'El monto máximo es 1000 USD.',
  AMOUNT_INVALID_DECIMALS: 'El monto debe tener máximo 2 decimales.',
  DESTINATION_ACCOUNT_REQUIRED: 'La cuenta destino es obligatoria.',
  DESTINATION_ACCOUNT_NON_NUMERIC: 'La cuenta destino solo debe contener números.',
  DESTINATION_ACCOUNT_TOO_LONG: 'La cuenta destino debe tener máximo 10 caracteres.',
};
