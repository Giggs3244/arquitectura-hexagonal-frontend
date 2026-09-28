# arquitectura-hexagonal-frontend

Laboratorio para practicar **arquitectura hexagonal** con **vertical slicing** en Angular. Simula una aplicación bancaria que crece de forma incremental; cada funcionalidad tiene su documento SDD en `docs/sdd/NNN-<nombre>/`.

## Stack

- Angular 22.2 (standalone, zoneless, `OnPush`, Signal Forms)
- TypeScript estricto
- Sin SSR, sin librerías de UI, sin estilos propios, sin tests

## Requisitos

- Node.js `^22.22.3 || ^24.15.0 || >=26.0.0`

## Comandos

```bash
npm install
npm start          # ng serve en http://localhost:4200
npm run build      # ng build
```

## Estructura

El código de negocio vive en `src/modules/<módulo>/<slice>/`, separado en tres capas:

- `domain/`: entidades, value objects, excepciones y puertos. TypeScript puro.
- `application/`: casos de uso. TypeScript puro; depende solo de `domain`.
- `infrastructure/`: adaptadores (persistencia, UI, inyección de dependencias y rutas). Es la única capa que conoce Angular y las APIs del navegador.

Regla de dependencias: `infrastructure → application → domain`.

## Funcionalidades

| SDD | Funcionalidad | Ruta |
| --- | ------------- | ---- |
| [001](docs/sdd/001-favorite-transferences/plan.md) | Registrar transferencias favoritas | `/transferences/favorites/new` |
