# AGENTS.md — Contexto de la aplicación (Frontend Symphony)

Documento de contexto **obligatorio** para agentes de IA generativa y desarrolladores humanos. Debe leerse **antes** de escribir o modificar código. Nadie debe salirse de este marco: el código nuevo debe alinearse con las skills en `.agents/` y con la estructura real del repo.

Complementa (no sustituye) el [`README.md`](./README.md) operativo (instalación, comandos, despliegue).

---

## 1. Qué es este proyecto

**Symphony** (`package.json` name: `symphony`, versión `0.0.0`) es la SPA del ecosistema **pruebajaramillomora**. Consume el API REST NestJS del backend hermano:

| Recurso | Ruta / URL |
|---------|------------|
| Backend (código) | [`../backend`](../backend) |
| API base (dev/prod actual) | `http://localhost:3050/api/v1` |
| Swagger backend | `http://localhost:3050/api-docs` |
| Contexto backend | [`../backend/AGENTS.md`](../backend/AGENTS.md) |

Dominio de UI ya cableado:

- Autenticación JWT (login real al API)
- CRUD de **clientes** y **servicios**
- Consulta **servicios por cliente** (identidad)
- Layout con sidebar (ng-zorro)
- Home demo (formulario local, sin API)

---

## 2. Stack (versiones de referencia)

| Capa | Tecnología |
|------|------------|
| Framework | Angular **^21** (standalone components) |
| Lenguaje | TypeScript **~5.9.2** (`strict: true`) |
| UI primaria negocio | **ng-zorro-antd** `^21.0.0-next.1` |
| Estilos plantilla | Bootstrap **^5.3.8**, bootstrap-icons, Less (`theme.less`) |
| Form / overlay legacy | `@ng-bootstrap/ng-bootstrap`, `ngx-scrollbar` (presentes; no son el patrón preferido para pantallas nuevas de negocio) |
| HTTP | `HttpClient` + interceptor funcional JWT |
| Estado | **Signals** para UI local; **RxJS ~7.8** para HTTP (sin NgRx) |
| Build | `@angular/build` ^21 (esbuild/Vite bajo el CLI) |
| Tests | **Vitest** ^4 + jsdom |
| packageManager | `npm@11.6.2` |

No hay Docker ni `.env` en este frontend: la URL del API vive en `src/environments/`.

---

## 3. Skills del proyecto (`.agents/`) — fuente de verdad normativa

Antes de generar código, aplicar estas skills. Ante conflicto entre “atajo” y skill: **gana el skill**.

| Skill | Ruta | Cuándo |
|-------|------|--------|
| **angular-best-practices** | `.agents/skills/angular-best-practices/SKILL.md` (+ detalle en su `AGENTS.md`) | Todo cambio Angular: páginas, servicios, forms, HTTP, routing, tests |
| **commiter** | `.agents/skills/commiter/skill.md` | Solo si el usuario pide commit: Conventional Commits, header ≤50 chars, body obligatorio |
| **changelog-manager** | `.agents/skills/changelog-manager/skill.md` | Junto a commits: `CHANGELOG.md` Keep a Changelog bajo `[Unreleased]` con timestamp |

### 3.1 Reglas Angular prioritarias (resumen del skill)

1. **Architecture (CRITICAL):** features en `pages/<feature>/`; solo standalone; smart pages / dumb shared; un servicio por caso de uso; capa `core/` como **objetivo** para transversales (auth, API, guards, interceptors).
2. **Components (CRITICAL):** `OnPush` en componentes nuevos; preferir `input()` / `output()` / `signal()`; sin HTTP en plantillas; reutilizar `Card`, `InputText`, `Datapicker`, `UploadFile` (`app-upload-file`), `Form` (`app-form`), `Layout`.
3. **State (HIGH):** `async` pipe o `takeUntilDestroyed()`; sin subscribe anidados; signals local + RxJS HTTP.
4. **Forms (HIGH):** Reactive Forms; CVA en inputs compartidos; mensajes en **español**.
5. **HTTP (HIGH):** solo en servicios; mapear `IApiResponse<T>`; interceptors funcionales.
6. **Routing (HIGH):** `loadComponent` lazy; **proteger rutas privadas con `authGuard`** (aún pendiente en el código); sincronizar menú en `layout`.
7. **Testing:** `*.spec.ts` mínimo; mock HTTP; nunca API real en unit tests.
8. **Performance:** lazy routes, `trackBy` / `@for` track, `@defer` si aplica.

Guía completa con ejemplos: `.agents/skills/angular-best-practices/AGENTS.md`.

---

## 4. Estructura real del repositorio

```
frontend/
├── AGENTS.md                 # Este archivo
├── README.md                 # Guía humana: build, deploy, extensión
├── .agents/skills/           # Skills normativas (§3)
├── angular.json              # Proyecto "symphony"
├── public/                   # Assets estáticos
└── src/
    ├── main.ts
    ├── styles.scss
    ├── theme.less            # Tema ng-zorro
    ├── environments/         # apiUrl, production, appVersion
    └── app/
        ├── app.config.ts     # Router, HttpClient+JWT, i18n es_ES, icons
        ├── app.routes.ts
        ├── models/           # IApiResponse
        ├── pages/            # Features / pantallas
        │   ├── auth/login/
        │   ├── main/home/
        │   ├── clientes/principal/
        │   └── servicios/
        │       ├── principal/
        │       └── cliente-servicios/principal/
        ├── services/         # HTTP por caso de uso (+ client/Api + JWT)
        └── shared/
            ├── components/   # card, datapicker, input-text, form, upload-file, button, layout
            ├── pages/notfound/
            └── shared.module.ts  # LEGACY — no usar en código nuevo
```

### 4.1 Realidad vs objetivo del skill

| Aspecto | Estado actual | Objetivo (skill) |
|---------|---------------|------------------|
| HTTP transversal | `services/client/api.ts`, `jwt.interceptor.ts`, `services/auth.ts` | Idealmente `core/services`, `core/interceptors`, `core/guards` |
| Páginas CRUD | Una página `principal/` por dominio | Idealmente `list/` + `form/` (o create/edit) |
| Auth guard | **No existe** | Obligatorio en rutas privadas |
| Servicios | Archivos planos `createcliente.ts`, `getclienteall.ts`, … | Pueden vivir en `pages/<feature>/services/` o ir migrando a `core/` |
| SharedModule | Archivo legacy **sin usos** | No expandirlo; solo standalone |

**Regla práctica para agentes:** al crear features nuevas, preferir la **estructura del skill** (`pages/<feature>/…`, `OnPush`, services colocados con el feature o en `core/` si es transversal). Al **modificar** código existente, respetar el patrón ya usado en ese feature (p. ej. `principal/`) sin refactor masivo no pedido. Si se toca auth/HTTP transversal y el usuario lo permite, migrar hacia `core/`.

---

## 5. Rutas y pantallas

Definidas en `src/app/app.routes.ts` (lazy `loadComponent`):

| Ruta | Componente | Notas |
|------|------------|--------|
| `/`, `/login` | `pages/auth/login` | Login API real → guarda JWT/usuario → `/home` |
| `/home` | `pages/main/home` | Demo Reactive Forms (sin API) — hijo de Layout |
| `/clientes` | `pages/clientes/principal` | CRUD clientes |
| `/servicios` | `pages/servicios/principal` | CRUD servicios |
| `/cliente-servicios` | `pages/servicios/cliente-servicios/principal` | Consulta por identidad |
| `/**` | `shared/pages/notfound` | 404 |

Layout shell: `shared/components/layout` (menú, avatar, logout). Ítems **Usuarios / Configuración** del menú están **deshabilitados** (placeholder).

**Deuda de routing:** hay dos rutas con `path: ''` (login y layout). Angular resuelve la primera coincidencia; el login también está en `'login'`. Al añadir rutas, no empeorar este arreglo; idealmente consolidar (redirect `''` → `login` o layout con guard) en un cambio dedicado.

**Seguridad:** sin `canActivate`/`authGuard`. Las rutas del layout son navegables sin sesión; el JWT solo se adjunta si existe en `sessionStorage`. Código nuevo de pantallas privadas **debe** introducir/usar un `authGuard` (ubicación preferida: `src/app/core/guards/`).

---

## 6. Contrato con el backend

### 6.1 Envelope HTTP

```typescript
// src/app/models/api-response.interface.ts
interface IApiResponse<T> {
  codresp: number;
  mensaje: string;
  status: boolean;
  datos: T | null;
}
```

La clase `Api` (`services/client/api.ts`):

- Prefija URLs relativas con `environment.apiUrl`
- Por defecto **desempaqueta** `datos` y falla si `status === false`
- Métodos: `get/post/put/patch/delete`, `request`, `requestApi` (sin unwrap)

### 6.2 Auth

- `POST users/auth/login` con `{ login, passwd }` vía `Auth` (`services/auth.ts`)
- Persistencia: `sessionStorage` keys `accessToken`, `authUser`
- `jwtInterceptor` añade `Authorization: Bearer <token>` si hay token
- Logout limpia storage y navega (ver `Layout` / `Auth`)

### 6.3 Endpoints ya usados en UI

| Servicio | Path relativo a `apiUrl` |
|----------|--------------------------|
| Auth | `POST users/auth/login` |
| Clientes | `GET getall`, `findbyid`, `findbyidentity`; `POST /`; `PATCH update`; `DELETE ?id=`; `GET gettiposidentity` |
| Servicios | `GET getall`, `findbyid`; `POST /`; `PATCH update`; `DELETE ?id=`; `GET gettiposservicio`, `getServiciosByCliente` |
| Process IFC | `POST process-ifc` (payload base64 → storage backend) |

Prefijos reales: `clientes/...`, `servicios/...` (como en cada servicio). Confirmar contratos en Swagger del backend antes de inventar campos.

### 6.4 Environments

- `src/environments/environment.ts` — producción (`production: true`)
- `src/environments/environment.development.ts` — desarrollo (`fileReplacements` en `ng serve` / build development)
- Modelo: `environment.model.ts` (`appVersion`, `production`, `apiUrl`)

Hoy ambos apuntan a `http://localhost:3050/api/v1`. Cambiar `apiUrl` ahí para apuntar a otro host; no hardcodear URLs en páginas.

---

## 7. Convenciones de código (este repo)

1. Prefijo de selectores: `app-`.
2. Pantallas bajo `pages/<dominio>/…`; shared UI en `shared/components/<nombre>/`.
3. Servicios HTTP: `@Injectable({ providedIn: 'root' })`, inyección preferible con `inject()`.
4. Naming histórico de servicios: un archivo por caso de uso en minúsculas (`createcliente.ts`). Código nuevo puede usar nombres más claros (`create-cliente.service.ts`) **si** se crea feature nueva alineada al skill.
5. Locale UI: **español** (ng-zorro `es_ES`).
6. Validaciones y `nzMessage` / errores: mensajes en español.
7. No crear NgModules de feature; no ampliar `SharedModule`.
8. No llamar al API desde templates ni con lógica de negocio pesada en componentes dumb.
9. Tests unitarios junto al artefacto; nunca contra API real.
10. Commits: skills `commiter` + `changelog-manager` (crear `CHANGELOG.md` si no existe).

---

## 8. Cómo extender (checklist obligatorio)

### Feature de negocio (CRUD / consulta)

1. Crear `src/app/pages/<feature>/` (preferir `list/` + `form/` del skill; o seguir `principal/` solo si se extiende un feature existente en ese estilo).
2. Modelos/interfaces del dominio.
3. Servicio(s) HTTP usando `inject(Api)` — paths relativos al `apiUrl`.
4. Página smart: orquesta forms, tabla ng-zorro, mensajes; estado con signals.
5. Registrar `loadComponent` en `app.routes.ts` (hijo del `Layout` si requiere shell).
6. Añadir ítem de menú en `shared/components/layout/layout.html`.
7. Proteger con `authGuard` (crearlo en `core/guards/` si aún no existe).
8. Specs mínimos de componente/servicio.
9. Actualizar este `AGENTS.md` y el `README.md` si cambian rutas, envs o flujo de arranque.

### Componente reutilizable

- Solo en `shared/components/<nombre>/`, standalone, idealmente CVA si es input de form.
- Reutilizar antes de duplicar `Card` / `InputText` / `Datapicker` / `Form` (`app-form`).

### Cambio de API base

- Editar `src/environments/environment*.ts` únicamente.

### Transversal auth/HTTP

- Preferir migrar/crear bajo `src/app/core/` según skill; registrar providers en `app.config.ts`.

---

## 9. Estado validado (implementado vs deuda)

| Ítem | Estado |
|------|--------|
| Login JWT + sessionStorage + interceptor | Implementado |
| Layout + menú + logout | Implementado |
| CRUD clientes / servicios | Implementado |
| Cliente-servicios (consulta) | Implementado |
| Home | Demo / placeholder |
| Menú Usuarios / Configuración | Deshabilitado |
| `authGuard` | Pendiente |
| Capa `core/` | Pendiente (skill lo exige a futuro) |
| Error interceptor global | Pendiente |
| Docker en frontend | No existe |
| `AGENTS.md` / README alineados al código | Este documento + README reescrito |
| `CHANGELOG.md` | Puede no existir aún |

No inventar features “ya hechas” (p. ej. gestión de usuarios en UI) ni reintroducir login mock.

---

## 10. Principios de colaboración agente ↔ repo

- Este archivo + skills `.agents/` delimitan el marco; el código real manda si hay discrepancia factual.
- Cambios mínimos y alineados al patrón del feature tocado; sin refactors masivos no pedidos.
- No hardcodear secretos; no commitear tokens.
- Confirmar contratos con `../backend` (Swagger / `AGENTS.md` del backend) antes de inventar DTOs.
- Actualizar documentación cuando cambie el marco (rutas, envs, arquitectura).

---

## 11. Referencias rápidas

| Tema | Archivo |
|------|---------|
| Bootstrap app | `src/main.ts`, `src/app/app.config.ts` |
| Rutas | `src/app/app.routes.ts` |
| API client | `src/app/services/client/api.ts` |
| JWT | `src/app/services/client/jwt.interceptor.ts` |
| Auth | `src/app/services/auth.ts` |
| Envelope | `src/app/models/api-response.interface.ts` |
| Environments | `src/environments/` |
| Skill Angular | `.agents/skills/angular-best-practices/SKILL.md` |
| Ops humanos | [`README.md`](./README.md) |
| Backend | [`../backend/AGENTS.md`](../backend/AGENTS.md) |
