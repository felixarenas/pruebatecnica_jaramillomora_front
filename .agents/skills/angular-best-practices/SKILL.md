---
name: angular-best-practices
description: Angular best practices and architecture patterns for building production-ready standalone applications. Use when writing, reviewing, or refactoring Angular code in Symphony — components, services, routing, forms, HTTP, signals, and tests.
license: MIT
metadata:
  author: Symphony
  version: "1.0.0"
---

# Angular Best Practices (Symphony)

Guía de mejores prácticas para **Angular 21** en el frontend Symphony. Aplica al escribir, revisar o generar funcionalidades nuevas.

## When to Apply

Usar este skill cuando el prompt implique:

- Crear o modificar páginas, componentes o rutas
- Integrar endpoints del API (`../app`)
- Implementar formularios, listados, CRUD o autenticación en UI
- Refactorizar código Angular existente en Symphony
- Añadir servicios, guards, interceptors o modelos TypeScript

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Architecture | CRITICAL | `arch-` |
| 2 | Components | CRITICAL | `comp-` |
| 3 | State & Reactivity | HIGH | `state-` |
| 4 | Forms & Validation | HIGH | `forms-` |
| 5 | HTTP & API | HIGH | `http-` |
| 6 | Routing & Security | HIGH | `route-` |
| 7 | Testing | MEDIUM-HIGH | `test-` |
| 8 | Performance | MEDIUM | `perf-` |

## Quick Reference

### 1. Architecture (CRITICAL)

- `arch-feature-folders` — Organizar por feature en `pages/<feature>/`, no por capa técnica global
- `arch-standalone-components` — Componentes standalone con `imports` explícitos
- `arch-core-layer` — Servicios transversales en `core/` (auth, API, interceptors, guards)
- `arch-smart-dumb` — Páginas "smart" orquestan; componentes compartidos "dumb" y reutilizables
- `arch-single-responsibility` — Un servicio por dominio/caso de uso claro

### 2. Components (CRITICAL)

- `comp-onpush-when-possible` — `ChangeDetectionStrategy.OnPush` en componentes nuevos
- `comp-signals-inputs` — Preferir `input()` / `output()` / `signal()` en código nuevo
- `comp-no-business-logic` — Sin llamadas HTTP ni reglas de negocio pesadas en plantillas
- `comp-reuse-shared` — Reutilizar `Card`, `InputText`, `Datapicker`, `Layout`

### 3. State & Reactivity (HIGH)

- `state-async-pipe` — Desuscribir con `async` pipe o `takeUntilDestroyed()`
- `state-no-nested-subscribe` — Evitar subscribe anidados; usar `switchMap`, `forkJoin`, etc.
- `state-signals-local` — Estado local de UI con signals; RxJS para flujos HTTP

### 4. Forms & Validation (HIGH)

- `forms-reactive` — Reactive Forms con `FormBuilder` y `Validators`
- `forms-cva-shared` — Inputs reutilizables implementan `ControlValueAccessor`
- `forms-messages-es` — Mensajes de validación en español (`nzErrorTip`)

### 5. HTTP & API (HIGH)

- `http-service-layer` — Toda comunicación HTTP en servicios injectables, no en componentes
- `http-api-response` — Mapear `IApiResponse<T>` del backend (`status`, `mensaje`, `datos`)
- `http-interceptors` — JWT y errores globales vía functional interceptors

### 6. Routing & Security (HIGH)

- `route-lazy-load` — Lazy loading con `loadComponent`
- `route-auth-guard` — Rutas privadas protegidas con `canActivate`
- `route-menu-sync` — Registrar rutas y entradas de menú en `layout` juntas

### 7. Testing (MEDIUM-HIGH)

- `test-component-create` — Test mínimo `should create` por componente nuevo
- `test-mock-http` — `HttpClientTestingModule` para servicios HTTP
- `test-no-real-api` — Nunca llamar al API real en unit tests

### 8. Performance (MEDIUM)

- `perf-lazy-routes` — Cargar features bajo demanda
- `perf-trackby-lists` — `trackBy` en `*ngFor` / `@for` con listas dinámicas
- `perf-defer-heavy` — `@defer` para bloques pesados cuando aplique

## Full Compiled Document

Guía detallada con ejemplos correctos/incorrectos: [`AGENTS.md`](AGENTS.md)

## Integración con Symphony

Antes de codificar, leer también el [`AGENTS.md`](../../../AGENTS.md) raíz del repositorio (contrato API, convenciones de carpetas, deuda técnica conocida).
