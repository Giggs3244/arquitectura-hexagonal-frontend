# SDD-001 · Research

Fecha: 2026-09-28. Hallazgos verificados contra los paquetes publicados en npm (tipos `.d.ts` de `@angular/forms@22.2.0` y `@angular/core@22.2.0`) y una simulación de `ng new` sobre un repositorio git con `README.md` y `docs/`.

## 1. Versión de Angular

| Paquete          | Versión          | Fuente                                         |
| ---------------- | ---------------- | ---------------------------------------------- |
| `@angular/cli`   | **22.2.0**       | `npm view @angular/cli dist-tags` → `latest`   |
| `@angular/core`  | **22.2.0**       | `npm view @angular/core dist-tags` → `latest`  |
| TypeScript       | ~6.0.2           | `package.json` generado por el CLI 22.2.0      |
| Node.js local    | 24.15.0          | Requerido por Angular 22: `^22.22.3 \|\| ^24.15.0 \|\| >=26.0.0` |

- `next` apunta a `22.2.0-rc.0`, así que `22.2.0` es la última 22.x estable.
- Comando de generación: `npx @angular/cli@22.2.0 new ...`.

## 2. Signal Forms (`@angular/forms/signals`)

La API es **estable** en Angular 22 (anotada `@publicApi 22.0`), ya no experimental.

| Necesidad                     | API exacta en 22.2.0 |
| ----------------------------- | -------------------- |
| Crear formulario              | `form(model: WritableSignal<T>, schema?: SchemaOrSchemaFn<T> \| FormOptions<T>): FieldTree<T>` |
| Schema                        | función `(path) => { ... }` pasada como segundo argumento de `form()` |
| Enlazar input                 | directiva **`[formField]`** (clase `FormField`, selector `[formField]`). **No** existe `[field]`/`[control]`. |
| Enlazar `<form>` y submit     | directiva `FormRoot`, selector `form[formRoot]` (pone `novalidate`, hace `preventDefault` y llama `submit()` si el form tiene opciones de envío) |
| Validador personalizado       | `validate(path, (ctx) => ValidationResult)`; `ctx.value()` devuelve el valor del campo. Retorna `undefined`/`null` si es válido o `{ kind: string, message?: string }` si es inválido. |
| Validador `required`          | `required(path, config?)` (no se usará: la obligatoriedad la valida el dominio) |
| Estado del campo              | `form.alias()` devuelve `FieldState` con señales `touched()`, `dirty()`, `invalid()`, `valid()`, `errors()`, `value`, `submitting()` |
| Error                         | `ValidationError { kind: string; message?: string }`; `errors()` devuelve `ValidationError.WithFieldTree[]` |
| Envío                         | `submit(form, action)` o `submit(form, { action, onInvalid?, ignoreValidators? })` → `Promise<boolean>`. `action` recibe el `FieldTree` y retorna `Promise<TreeValidationResult>`; un error devuelto con `fieldTree: form.alias` se asigna a ese campo (error de envío, se limpia al cambiar el valor). |
| Reseteo                       | `form().reset(value?)`: limpia `touched`/`dirty` del campo y descendientes; **no** cambia el modelo salvo que se pase `value`. |

Nombres a usar: `form`, `validate`, `submit`, `FormField` (`[formField]`), `FormRoot` (`[formRoot]`), `ValidationError`, `FieldTree`.

## 3. Defaults de `ng new` en el CLI 22.2.0

| Flag                      | Default | Uso previsto |
| ------------------------- | ------- | ------------ |
| `--standalone`            | `true`  | default |
| `--zoneless`              | `true` (schema `application`) | default; el proyecto no incluye `zone.js` ni `provideZoneChangeDetection` |
| `--ssr`                   | pregunta | `--ssr=false` |
| `--routing`               | pregunta | `--routing` |
| `--style`                 | pregunta (`css`, `scss`, `sass`, `less`, `tailwind`) | `--style=css` |
| `--inline-style`          | —       | `--inline-style` para que los componentes no generen archivo `.css` |
| `--skip-tests`            | `false` | `--skip-tests` |
| `--test-runner`           | `vitest` | irrelevante con `--skip-tests` |
| `--ai-config`             | pregunta | `--ai-config=none` |
| `--file-name-style-guide` | `2025`  | default (`app.ts`, `app.html`, coincide con la sección 4.7) |
| `--skip-git`              | `false` | `--skip-git` (el repo ya existe) |

Detección de cambios: en Angular 22 **`OnPush` es el valor por defecto** de `ChangeDetectionStrategy` (el antiguo `Default` quedó como alias deprecado de `Eager`). Igualmente se declarará `ChangeDetectionStrategy.OnPush` de forma explícita.

## 4. Generar el proyecto en la raíz del repositorio

Simulado en un repo de prueba con `.git`, `README.md` y `docs/`:

- `ng new <nombre> --directory . --skip-git ...` **falla** con `A merge conflicted on path "/README.md"` porque el CLI no sobrescribe archivos existentes.
- Solución verificada: mover temporalmente `README.md`, ejecutar `ng new`, y luego reescribir `README.md` (el plan ya pide actualizarlo). `.git` y `docs/` quedan intactos y el historial se conserva.

Comando:

```bash
mv README.md /tmp/README.md.bak
npx @angular/cli@22.2.0 new arquitectura-hexagonal-frontend --directory . --skip-git --skip-tests \
  --ssr=false --style=css --inline-style --routing --zoneless --ai-config=none --interactive=false
```

Archivos generados además de los de la sección 4.7: `.editorconfig`, `.gitignore`, `.prettierrc`, `.vscode/`, `public/favicon.ico`, `src/index.html`, `src/main.ts`, `src/styles.css` (vacío con comentario), `tsconfig*.json`. `app.html` trae una página de bienvenida que se reemplazará por `<router-outlet />`.

## 5. Diferencias con el plan

1. **Directiva de campo**: es `[formField]` (el plan lo dejaba abierto entre `[formField]`/`[field]`).
2. **`ng new --directory .`**: requiere mover `README.md` temporalmente (el plan asumía que funcionaba directo).
3. **Reset**: `reset()` no limpia valores; hay que llamar `form().reset({ alias: '', amount: '', destinationAccount: '' })` o resetear el modelo aparte.
4. **Alias duplicado**: la forma idiomática en Signal Forms es que el `action` de `submit()` capture `DuplicatedAliasException` y retorne `{ kind: exception.code, fieldTree: form.alias }`; así el error queda en el campo Alias y se limpia solo cuando el usuario edita el valor. Cumple la sección 2.5 sin estado adicional.
5. **`src/styles.css`**: el CLI siempre genera una hoja global. Para cumplir "sin archivos de estilos propios" se propone eliminarla y quitarla de `angular.json`.
6. **OnPush** ya es el default en v22 (no cambia nada, se declara explícito).
