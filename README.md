# Symphony — Frontend

SPA **Angular 21** del ecosistema **pruebajaramillomora**. Interfaz de autenticación y gestión de clientes/servicios que consume el API NestJS del backend hermano [`../backend`](../backend).

| Recurso | Valor |
|---------|--------|
| Paquete | `symphony` `0.0.0` |
| Dev server | `http://localhost:4200/` |
| API por defecto | `http://localhost:3050/api/v1` |
| Contexto para agentes / IA | [`AGENTS.md`](./AGENTS.md) |
| Skills normativas | [`.agents/skills/`](./.agents/skills/) |
| Contexto backend | [`../backend/AGENTS.md`](../backend/AGENTS.md) |

> **Fuente de verdad:** el marco contextual y las reglas de código están en [`AGENTS.md`](./AGENTS.md) y en el skill **angular-best-practices**. Este README traduce ese contexto a pasos prácticos de instalación, despliegue y extensión.

---

## Tabla de contenidos

- [Descripción y arquitectura](#descripción-y-arquitectura)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Desarrollo](#desarrollo)
- [Build y despliegue](#build-y-despliegue)
- [Integración con el API](#integración-con-el-api)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Desarrollar nuevas funcionalidades](#desarrollar-nuevas-funcionalidades)
- [Tests](#tests)
- [Troubleshooting](#troubleshooting)

---

## Descripción y arquitectura

Symphony es una Single Page Application orientada a:

1. **Login JWT** contra el backend (`POST users/auth/login`).
2. **CRUD de clientes y servicios** y consulta de servicios por cliente.
3. **Shell** con sidebar (ng-zorro), componentes compartidos y formularios reactivos.

```
Navegador (localhost:4200)
    │
    ▼
Angular (standalone + lazy routes)
    ├── pages/auth/login
    ├── shared/layout ──► home | clientes | servicios | cliente-servicios
    └── services/ (Api + JWT + dominio)
    │
    ▼ HTTP Bearer
Backend NestJS  →  http://localhost:3050/api/v1
```

### Stack

| Capa | Tecnología |
|------|------------|
| Framework | Angular 21 (standalone) |
| Lenguaje | TypeScript 5.9 |
| UI negocio | ng-zorro-antd 21 |
| Estilos | SCSS + Bootstrap 5.3 + Less (tema) |
| HTTP | HttpClient + interceptor JWT |
| Estado | Signals (UI) + RxJS (HTTP) |
| Tests | Vitest 4 |

### Estado funcional (código actual)

| Funcionalidad | Estado |
|---------------|--------|
| Login real + JWT en `sessionStorage` | Implementado |
| Interceptor Bearer | Implementado |
| Layout / menú / logout | Implementado |
| CRUD clientes | Implementado |
| CRUD servicios | Implementado |
| Consulta servicios por cliente | Implementado |
| Home (form demo) | Placeholder |
| Menú Usuarios / Configuración | Deshabilitado |
| Guard de autenticación en rutas | Pendiente (previsto en skills) |

Detalle y deuda técnica: [`AGENTS.md`](./AGENTS.md).

---

## Requisitos

- **Node.js** 20+ (recomendado alineado con el ecosistema del monorepo; npm del proyecto: **11.x**, ver `packageManager` en `package.json`)
- **npm** 11.x
- Backend API accesible (típicamente Compose del backend en puerto **3050**). Ver [`../backend/README.md`](../backend/README.md).

No hay Docker propio en el frontend: se sirve con el CLI Angular o se despliegan los estáticos generados por `ng build`.

---

## Instalación

```bash
cd /media/datos/CodigoFuente/pruebajaramillomora/frontend
npm install
```

Comprobar/ajustar la URL del API:

- Desarrollo: `src/environments/environment.development.ts`
- Producción: `src/environments/environment.ts`

Propiedad clave: `apiUrl` (por defecto `http://localhost:3050/api/v1`).

---

## Desarrollo

### 1. Levantar el backend (requerido para login y CRUDs)

Desde el directorio del backend:

```bash
cd ../backend
docker compose up -d
# API: http://localhost:3050  |  Swagger: http://localhost:3050/api-docs
```

O el flujo de desarrollo local documentado en el README del backend.

### 2. Servir el frontend

```bash
cd ../frontend
npm start
# equivalente: npm run dev
# → http://localhost:4200/
```

| Script | Comando | Uso |
|--------|---------|-----|
| `npm start` | `ng serve` | Dev server (configuración development por defecto) |
| `npm run dev` | `ng serve --configuration development` | Explícito development + `environment.development.ts` |
| `npm run watch` | `ng build --watch --configuration development` | Rebuild continuo sin serve |
| `npm run build` | `ng build` | Build producción |
| `npm test` | `ng test` | Unit tests (Vitest) |
| `npx ng …` / `npm run ng` | CLI Angular | Generators y utilidades |

La configuración **development** reemplaza `environment.ts` por `environment.development.ts` (`fileReplacements` en `angular.json`).

### Flujo típico de trabajo

1. Backend healthy en `:3050`.
2. `npm start` en frontend.
3. Abrir `http://localhost:4200/login`, autenticarse, navegar por Clientes / Servicios.
4. Contratos HTTP: Swagger del backend + servicios en `src/app/services/`.

---

## Build y despliegue

### Build de producción

```bash
npm run build
```

Salida por defecto del builder `application`: carpeta **`dist/symphony/`** (browser + assets). Verificar la ruta exacta tras el primer build.

Antes de publicar, fija un `apiUrl` de producción real en `src/environments/environment.ts` (no dejes `localhost` si el API está en otro host).

### Despliegue estático (nginx u otro)

Sirve el contenido de `dist/symphony/browser` (o la carpeta `browser` generada) como sitio estático. Ejemplo mínimo de nginx:

```nginx
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

Copia los archivos del build al `root` del server. CORS debe estar permitido en el backend hacia el origen del frontend.

### Checklist de despliegue

1. Backend desplegado y reachable desde el navegador del usuario.
2. `apiUrl` apunta al origen correcto (HTTPS en prod).
3. `npm run build` sin errores de presupuesto (`angular.json` budgets).
4. Publicar estáticos + rewrite SPA (`try_files` → `index.html`).
5. Probar login y una pantalla autenticada (Clientes).

No hay `Dockerfile` en este repo; puedes añadir una imagen `nginx:alpine` que copie `dist/symphony/browser` si el equipo lo requiere.

---

## Integración con el API

### Contrato de respuesta

```typescript
interface IApiResponse<T> {
  codresp: number;
  mensaje: string;
  status: boolean;
  datos: T | null;
}
```

El cliente `Api` (`src/app/services/client/api.ts`) concatena `environment.apiUrl` y, por defecto, devuelve solo `datos` si `status` es true.

### Auth

- Login: `Auth.login({ login, passwd })` → `POST users/auth/login`
- Token y usuario en `sessionStorage` (`accessToken`, `authUser`)
- `jwtInterceptor` envía `Authorization: Bearer …`

### Rutas de UI

| Ruta | Descripción |
|------|-------------|
| `/login` | Autenticación |
| `/home` | Demo home |
| `/clientes` | Gestión de clientes |
| `/servicios` | Gestión de servicios |
| `/cliente-servicios` | Consulta servicios de un cliente |

---

## Estructura del proyecto

```
src/app/
├── app.config.ts          # providers globales
├── app.routes.ts          # lazy routes
├── models/                # IApiResponse
├── pages/                 # features por dominio
├── services/              # HTTP (Api, Auth, casos de uso)
└── shared/components/     # Card, InputText, Datapicker, Layout
```

Convenciones, skills y checklist de extensión: **[`AGENTS.md`](./AGENTS.md)**.

Marco teórico resumido:

- **Standalone + lazy loading** por ruta.
- **Páginas smart** (orquestación) vs **componentes shared dumb**.
- **Un servicio por caso de uso** HTTP.
- **Reactive Forms** + mensajes en español.
- **Signals** para estado de UI; RxJS para flujos asíncronos.
- Hacia el futuro (skill): capa **`core/`** (guards, interceptors, auth/API) y `authGuard` en rutas privadas.

---

## Desarrollar nuevas funcionalidades

Sigue siempre [`AGENTS.md`](./AGENTS.md) y `.agents/skills/angular-best-practices/`.

Pasos prácticos:

1. **Contrato API** — confirmar en Swagger del backend (`../backend`).
2. **Página** — `src/app/pages/<feature>/` (preferir `list/` + `form/` en features nuevas).
3. **Servicio(s)** — `inject(Api)`, paths relativos, tipar `datos`.
4. **Ruta** — `loadComponent` en `app.routes.ts` (bajo `Layout` si lleva shell).
5. **Menú** — entrada en `layout.html`.
6. **Seguridad** — añadir/usar `authGuard` en rutas privadas.
7. **UI** — ng-zorro + shared components; `OnPush` en componentes nuevos.
8. **Tests** — `*.spec.ts` con HTTP mockeado.
9. **Docs** — actualizar `AGENTS.md` / este README si cambia el marco.
10. **Commits** (si se piden) — skills `commiter` + `changelog-manager`.

No ampliés `shared.module.ts` (legacy). No hardcodees la URL del API fuera de `environments/`.

---

## Tests

```bash
npm test
```

Usa el builder `@angular/build:unit-test` (Vitest). Los tests no deben llamar al API real.

---

## Troubleshooting

| Problema | Qué revisar |
|----------|-------------|
| Login falla / CORS | Backend en `:3050`, CORS habilitado, `apiUrl` correcto |
| 401 en CRUDs | Token en `sessionStorage`; interceptor registrado en `app.config.ts` |
| Pantalla en blanco tras F5 en prod | Rewrite SPA (`try_files` → `index.html`) |
| Estilos / iconos rotos | Build incluye assets de `@ant-design/icons-angular` (`angular.json`) |
| Environment “prod” en `ng serve` | Usar `npm start` / `npm run dev` (development por defecto) |
| Features “Usuarios” no abren | Están deshabilitadas a propósito en el menú |

---

## Documentación relacionada

| Documento | Uso |
|-----------|-----|
| [`AGENTS.md`](./AGENTS.md) | Marco contextual obligatorio para IA y desarrolladores |
| `.agents/skills/angular-best-practices/` | Reglas Angular 21 del proyecto |
| [`../backend/README.md`](../backend/README.md) | Compilar y levantar el API |
| [`../backend/AGENTS.md`](../backend/AGENTS.md) | Contrato y arquitectura del backend |

## Licencia

Proyecto privado.
