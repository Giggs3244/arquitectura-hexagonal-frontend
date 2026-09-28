# SDD-001 · Registrar transferencias favoritas

| Campo        | Valor                                                        |
| ------------ | ------------------------------------------------------------ |
| Estado       | Aprobado para implementación                                 |
| Fecha        | 2026-09-28                                                   |
| Metodología  | SDD (Spec-Driven Development) con flujo RPI (Research → Plan → Implement) |
| Módulo       | `transferences`                                              |
| Slice        | `favorites`                                                  |
| Stack        | Angular 22 (standalone, zoneless, Signal Forms), TypeScript estricto |

---

## 1. Contexto

Este repositorio es un laboratorio para practicar **arquitectura hexagonal** en el frontend con Angular, organizando el código por **vertical slicing**. La aplicación simula una app bancaria que crecerá de forma incremental; cada funcionalidad nueva tendrá su propio documento SDD en `docs/sdd/NNN-<nombre>/`.

Esta primera funcionalidad permite al usuario **registrar transferencias favoritas** (datos de transferencias recurrentes) y guardarlas en el `localStorage` del navegador.

## 2. Especificación funcional (Spec)

### 2.1 Historia de usuario

> Como usuario del banco, quiero guardar los datos de las transferencias que realizo con frecuencia, para no tener que digitarlos cada vez.

### 2.2 Formulario

- HTML **sin estilos** (no se agrega CSS propio ni librerías de UI).
- Campos **uno debajo del otro**, en este orden, cada uno con su `<label>`:
  1. **Alias** de la transferencia.
  2. **Monto** (USD).
  3. **Cuenta destino**.
- Al final, un botón con el texto exacto **`Guardar`**.

### 2.3 Reglas de negocio por campo

Todos los campos son **obligatorios**.

| Campo          | Reglas                                                                                          |
| -------------- | ----------------------------------------------------------------------------------------------- |
| Alias          | Obligatorio (se aplica `trim`). Máximo **30** caracteres. **Único** (comparación sin distinguir mayúsculas y sin espacios al inicio/fin). |
| Monto          | Obligatorio. Numérico. Mayor que **0**. Máximo **1000** USD. Máximo **2** decimales.             |
| Cuenta destino | Obligatoria. **Solo dígitos**. Máximo **10** caracteres. Se guarda como `string` para conservar ceros a la izquierda. |

> Supuesto: el monto mínimo es estrictamente mayor que 0 (una transferencia de 0 USD no tiene sentido de negocio).

### 2.4 Comportamiento de validación (tiempo real)

- Cada campo se valida en tiempo real a medida que el usuario escribe.
- El mensaje de error de un campo se muestra **debajo de ese mismo campo** cuando el campo es inválido **y** el usuario ya lo tocó (`touched`) o modificó (`dirty`). No se muestran errores en campos que el usuario aún no ha tocado.
- Si un campo tiene varios errores, se muestra solo el primero según el orden de la tabla de excepciones (sección 4.1).
- El botón **Guardar** está **deshabilitado** mientras algún campo sea inválido o esté vacío; se habilita solo cuando todo el formulario es válido.

### 2.5 Guardado

- Al presionar **Guardar** se ejecuta el caso de uso de guardado.
- Si el alias ya existe, se muestra el mensaje de error de alias duplicado debajo del campo Alias y no se guarda.
- Si el guardado es exitoso:
  - La transferencia se agrega a la lista persistida en `localStorage`.
  - El formulario se **resetea** (valores vacíos, sin estado touched/dirty).
  - Se muestra el texto **`Transferencia guardada`** debajo del botón. El mensaje desaparece cuando el usuario vuelve a modificar el formulario.

### 2.6 Mensajes de error

| Excepción                                   | Mensaje                                                  |
| ------------------------------------------- | -------------------------------------------------------- |
| `AliasRequiredException`                    | El alias es obligatorio.                                 |
| `AliasTooLongException`                     | El alias debe tener máximo 30 caracteres.                |
| `DuplicatedAliasException`                  | Ya existe una transferencia favorita con este alias.     |
| `AmountRequiredException`                   | El monto es obligatorio.                                 |
| `AmountInvalidFormatException`              | El monto debe ser un número válido.                      |
| `AmountNotPositiveException`                | El monto debe ser mayor a 0.                             |
| `AmountExceedsLimitException`               | El monto máximo es 1000 USD.                             |
| `AmountInvalidDecimalsException`            | El monto debe tener máximo 2 decimales.                  |
| `DestinationAccountRequiredException`       | La cuenta destino es obligatoria.                        |
| `DestinationAccountNonNumericException`     | La cuenta destino solo debe contener números.            |
| `DestinationAccountTooLongException`        | La cuenta destino debe tener máximo 10 caracteres.       |

### 2.7 Fuera de alcance (iteraciones futuras)

- Listar, editar o eliminar transferencias favoritas.
- Ejecutar transferencias.
- Estilos, diseño visual y accesibilidad avanzada.
- Pruebas automatizadas (esta iteración no incluye tests; el proyecto se crea con `--skip-tests`).
- Backend / API remota.

---

## 3. Research (R)

Tareas de investigación que el agente debe completar **antes de escribir código**, dejando sus hallazgos en `docs/sdd/001-favorite-transferences/research.md`:

1. **Versión de Angular**: confirmar con `npx @angular/cli@22 version` (o `npm view @angular/cli@22 version`) la última versión 22.x disponible y usarla.
2. **Signal Forms**: revisar en la documentación oficial (angular.dev) la API vigente en Angular 22 de `@angular/forms/signals`: función `form()`, directiva de enlace de campo (`[formField]`/`[field]`, según la versión), validadores (`required`, `validate`, errores personalizados), estado de campo (`touched()`, `dirty()`, `invalid()`, `errors()`), `submit()` y reseteo del formulario. Documentar los nombres exactos que se usarán.
3. **Defaults del CLI 22**: confirmar que los proyectos nuevos son standalone y zoneless por defecto, y qué flags acepta `ng new` (estilos, SSR, routing, skip-tests).
4. **Inicialización en directorio existente**: el repositorio ya contiene `.git` y `README.md`; verificar cómo generar el proyecto en la raíz sin perder el historial de git (p. ej. `ng new <nombre> --directory . --skip-git`).

---

## 4. Plan técnico (P)

### 4.1 Diseño de dominio

**Principios**

- `domain` y `application` son **TypeScript puro**: no importan nada de `@angular/*`, ni de `localStorage`, ni del DOM.
- Las reglas de validación viven **una sola vez**, en los **Value Objects** del dominio. El formulario las reutiliza a través de un adaptador (sección 4.4); no se duplican reglas en validadores de Angular.
- Cada regla de validación tiene su **propia excepción de dominio**. Todas extienden una clase base `DomainException`, que expone un `code` estable (string) para que la UI pueda traducirla a un mensaje.
- Las excepciones se evalúan en el orden de la tabla de la sección 2.6 (primero obligatoriedad, luego formato, luego límites).

**Value Objects**

| Value Object          | Entrada            | Valor interno | Excepciones (en orden de evaluación) |
| --------------------- | ------------------ | ------------- | ------------------------------------ |
| `Alias`               | `string`           | `string` (trim) | `AliasRequiredException`, `AliasTooLongException` |
| `Amount`              | `string \| number` | `number`      | `AmountRequiredException`, `AmountInvalidFormatException`, `AmountNotPositiveException`, `AmountExceedsLimitException`, `AmountInvalidDecimalsException` |
| `DestinationAccount`  | `string`           | `string` (trim) | `DestinationAccountRequiredException`, `DestinationAccountNonNumericException`, `DestinationAccountTooLongException` |

- Cada VO se construye con un factory estático `create(raw)` que valida y lanza la excepción correspondiente; el constructor es privado.
- `Amount` valida los decimales sobre la **representación textual** (regex `^\d+(\.\d{1,2})?$`) para evitar problemas de punto flotante; las constantes `MAX_AMOUNT = 1000`, `MAX_DECIMALS = 2` quedan en el VO.
- `Alias` expone un método `equals(other: Alias)` que compara sin distinguir mayúsculas.

**Entidad `FavoriteTransference`**

- Propiedades: `id: string`, `alias: Alias`, `amount: Amount`, `destinationAccount: DestinationAccount`.
- Factory `FavoriteTransference.create({ alias, amount, destinationAccount })` que recibe primitivos, construye los VO y genera el `id` con `crypto.randomUUID()`.
- Factory `FavoriteTransference.fromPrimitives(...)` para rehidratar desde persistencia.
- Método `toPrimitives()` que devuelve `{ id, alias, amount, destinationAccount }` como tipos primitivos.

**Puerto (interface repository)**

```ts
export interface FavoriteTransferenceRepository {
  save(favorite: FavoriteTransference): Promise<void>;
  findAll(): Promise<FavoriteTransference[]>;
  existsByAlias(alias: Alias): Promise<boolean>;
}
```

> Se usa `Promise` aunque `localStorage` sea síncrono, para que un futuro adaptador HTTP implemente el mismo puerto sin cambiar el dominio ni la aplicación.

**Excepción de negocio adicional**

- `DuplicatedAliasException`: la lanza el caso de uso cuando `existsByAlias` devuelve `true`.

### 4.2 Capa de aplicación

- `SaveFavoriteTransferenceUseCase`
  - Dependencia por constructor: `FavoriteTransferenceRepository` (el puerto, no la implementación).
  - Método `execute(command: SaveFavoriteTransferenceCommand): Promise<void>`.
  - `SaveFavoriteTransferenceCommand` = `{ alias: string; amount: string; destinationAccount: string }` (primitivos).
  - Flujo: `FavoriteTransference.create(command)` → `repository.existsByAlias(alias)` → si existe, lanza `DuplicatedAliasException` → `repository.save(favorite)`.
- Sin decoradores de Angular (`@Injectable` no se usa aquí); la inyección se resuelve en infraestructura con un factory provider.

### 4.3 Infraestructura – adaptador secundario (persistencia)

- `LocalStorageFavoriteTransferenceRepository implements FavoriteTransferenceRepository`.
- Clave de `localStorage`: `bank.transferences.favorites`.
- Formato: arreglo JSON de primitivos `[{ id, alias, amount, destinationAccount }]`.
- `save`: lee el arreglo, agrega el nuevo elemento (`toPrimitives()`), escribe de nuevo.
- `findAll`: lee y rehidrata con `FavoriteTransference.fromPrimitives`. Si la clave no existe o el JSON es inválido, devuelve `[]`.
- `existsByAlias`: `findAll()` + `alias.equals(...)`.

### 4.4 Infraestructura – adaptador primario (UI)

- `FavoriteTransferenceFormComponent` (standalone, `ChangeDetectionStrategy.OnPush`, sin archivo de estilos).
- Modelo del formulario (signal): `{ alias: '', amount: '', destinationAccount: '' }` — todo como `string`; la conversión a número la hace el VO `Amount`.
- Inputs: `alias` → `type="text"`, `amount` → `type="text" inputmode="decimal"`, `destinationAccount` → `type="text" inputmode="numeric"`. No se usan atributos `maxlength` para que la regla la reporte el dominio.
- **Adaptador de validación** `domain-validator.ts`: función genérica que recibe un factory de VO (p. ej. `Alias.create`), lo ejecuta con el valor del campo y, si lanza una `DomainException`, la convierte en un error de Signal Forms con `kind = exception.code`. Se registra en el schema del formulario con `validate(...)` para cada campo.
- **Traductor de mensajes** `favorite-transference-error-messages.ts`: mapa `code → mensaje` (tabla de la sección 2.6).
- Template: cada campo en un `<div>` con `<label>`, `<input>` y, debajo, el mensaje de error visible solo si `(touched || dirty) && invalid`.
- Botón `Guardar` de tipo `submit`, `[disabled]` cuando el formulario es inválido.
- Al enviar: invoca `SaveFavoriteTransferenceUseCase.execute(...)`; captura `DuplicatedAliasException` y la muestra debajo del alias; en éxito resetea el formulario y muestra `Transferencia guardada`.

### 4.5 Inyección de dependencias

`favorites.providers.ts` en `infrastructure` expone `provideFavoriteTransferences()`:

- `FAVORITE_TRANSFERENCE_REPOSITORY` (`InjectionToken<FavoriteTransferenceRepository>`) → `useClass: LocalStorageFavoriteTransferenceRepository`.
- `SaveFavoriteTransferenceUseCase` → `useFactory: (repo) => new SaveFavoriteTransferenceUseCase(repo)`, `deps: [FAVORITE_TRANSFERENCE_REPOSITORY]`.

Los providers se registran en la ruta del slice (no globalmente) para mantener el slice autocontenido.

### 4.6 Enrutamiento

- `favorites.routes.ts` en `infrastructure` exporta las rutas del slice, con `providers: [provideFavoriteTransferences()]` y el componente cargado con `loadComponent`.
- `app.routes.ts`: ruta `transferences/favorites/new` (lazy) y redirección de `''` a esa ruta.
- `app.html` contiene solo `<router-outlet />`.

### 4.7 Estructura de carpetas objetivo

```
src/
├── app/
│   ├── app.config.ts
│   ├── app.routes.ts
│   ├── app.ts
│   └── app.html
└── modules/
    └── transferences/
        └── favorites/
            ├── domain/
            │   ├── entities/
            │   │   └── favorite-transference.ts
            │   ├── value-objects/
            │   │   ├── alias.ts
            │   │   ├── amount.ts
            │   │   └── destination-account.ts
            │   ├── exceptions/
            │   │   ├── domain.exception.ts
            │   │   ├── alias-required.exception.ts
            │   │   ├── alias-too-long.exception.ts
            │   │   ├── duplicated-alias.exception.ts
            │   │   ├── amount-required.exception.ts
            │   │   ├── amount-invalid-format.exception.ts
            │   │   ├── amount-not-positive.exception.ts
            │   │   ├── amount-exceeds-limit.exception.ts
            │   │   ├── amount-invalid-decimals.exception.ts
            │   │   ├── destination-account-required.exception.ts
            │   │   ├── destination-account-non-numeric.exception.ts
            │   │   └── destination-account-too-long.exception.ts
            │   └── repositories/
            │       └── favorite-transference.repository.ts
            ├── application/
            │   ├── save-favorite-transference.command.ts
            │   └── save-favorite-transference.use-case.ts
            └── infrastructure/
                ├── persistence/
                │   └── local-storage-favorite-transference.repository.ts
                ├── ui/
                │   ├── favorite-transference-form/
                │   │   ├── favorite-transference-form.component.ts
                │   │   └── favorite-transference-form.component.html
                │   ├── domain-validator.ts
                │   └── favorite-transference-error-messages.ts
                ├── favorites.providers.ts
                └── favorites.routes.ts
```

### 4.8 Reglas de dependencia (hexágono)

```
infrastructure  ──▶  application  ──▶  domain
      └──────────────────────────────────▲
```

- `domain` no importa de ninguna otra capa.
- `application` importa solo de `domain`.
- `infrastructure` puede importar de `application` y `domain`; es la única capa que conoce Angular y `localStorage`.
- Ningún slice importa archivos internos de otro slice.

---

## 5. Implement (I) – Fases y checkpoints

Cada fase termina con `npx ng build` sin errores y un commit en español con formato *Conventional Commits*.

| Fase | Entregable | Checkpoint |
| ---- | ---------- | ---------- |
| 0. Research | `research.md` con versión exacta de Angular 22 y API de Signal Forms confirmada | Documento creado |
| 1. Scaffolding | Proyecto Angular 22 en la raíz (sin tests, sin SSR, CSS, routing), `README.md` actualizado, carpeta `src/modules/transferences/favorites/{domain,application,infrastructure}` | `ng build` OK · commit `chore: crear proyecto angular 22` |
| 2. Dominio | `DomainException`, 11 excepciones, 3 VO, entidad, puerto | `ng build` OK · sin imports de `@angular` en `domain` · commit `feat(favorites): agregar dominio` |
| 3. Aplicación | Command + `SaveFavoriteTransferenceUseCase` | `ng build` OK · sin imports de `@angular` en `application` · commit `feat(favorites): agregar caso de uso de guardado` |
| 4. Persistencia | `LocalStorageFavoriteTransferenceRepository` | `ng build` OK · commit `feat(favorites): agregar repositorio localStorage` |
| 5. UI + DI + rutas | Adaptador de validación, mensajes, componente, providers, rutas | `ng build` OK · commit `feat(favorites): agregar formulario de registro` |
| 6. Verificación | Pruebas manuales de la sección 6 en el navegador (`ng serve`) | Todos los criterios cumplidos |

Verificación de dependencias (debe devolver vacío):

```bash
grep -rE "from '@angular|localStorage" src/modules/transferences/favorites/domain src/modules/transferences/favorites/application
```

---

## 6. Criterios de aceptación

- [ ] El proyecto usa Angular 22.x y compila con `ng build`.
- [ ] La estructura de carpetas coincide con la sección 4.7 (carpeta `infrastructure`).
- [ ] `domain` y `application` no importan `@angular/*` ni usan `localStorage`.
- [ ] Existe una excepción de dominio por cada regla de la sección 2.6.
- [ ] Las reglas de validación están definidas una sola vez (en los VO) y el formulario las reutiliza.
- [ ] El formulario muestra Alias, Monto y Cuenta destino, uno debajo del otro, sin estilos, y un botón `Guardar` al final.
- [ ] Al cargar la página no se muestra ningún error.
- [ ] Al tocar o escribir en un campo inválido aparece su error justo debajo de ese campo.
- [ ] `Guardar` está deshabilitado hasta que los tres campos sean válidos.
- [ ] Casos de prueba manual:
  - Alias con 31 caracteres → "El alias debe tener máximo 30 caracteres."
  - Monto `0` → "El monto debe ser mayor a 0."
  - Monto `1000.01` → "El monto máximo es 1000 USD."
  - Monto `10.123` → "El monto debe tener máximo 2 decimales."
  - Monto `abc` → "El monto debe ser un número válido."
  - Cuenta `12ab` → "La cuenta destino solo debe contener números."
  - Cuenta `12345678901` → "La cuenta destino debe tener máximo 10 caracteres."
  - Datos válidos (`Arriendo`, `850.50`, `0012345678`) → se guarda, el formulario se limpia y aparece "Transferencia guardada".
  - Repetir el alias `arriendo ` → "Ya existe una transferencia favorita con este alias." y no se guarda.
- [ ] En DevTools → Application → Local Storage, la clave `bank.transferences.favorites` contiene el arreglo JSON con las transferencias guardadas, con `destinationAccount` como string (`"0012345678"`).
