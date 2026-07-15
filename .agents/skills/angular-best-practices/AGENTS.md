# Angular Best Practices — Symphony

**Version 1.0.0**  
Guía para agentes IA y desarrolladores del frontend Symphony (Angular 21).

> Aplicar junto con `symphony/AGENTS.md` y los skills transversales en `.agents/skills/` (`commiter`, `changelog-manager`).

---

## 1. Flujo obligatorio al generar funcionalidades

Cuando un prompt pida una feature nueva o cambios sustanciales:

1. **Leer** `symphony/AGENTS.md` (contexto del proyecto).
2. **Leer** este skill (`angular-best-practices/SKILL.md` + reglas relevantes abajo).
3. **Evaluar** otros skills según el prompt:
   - `commiter` → al preparar commits
   - `changelog-manager` → al documentar cambios en `CHANGELOG.md`
   - `skill-creator` → solo si se pide crear/mejorar skills
4. **Confirmar contrato API** en Swagger de `../app` si la feature consume backend.
5. **Entregar solución completa**: todos los artefactos necesarios (ver sección 2), no solo fragmentos.

---

## 2. Artefactos mínimos por tipo de solicitud

### CRUD de un dominio (ej. clientes, servicios)

| Artefacto | Ubicación | Obligatorio |
|-----------|-----------|-------------|
| Interfaces/modelos | `src/app/core/models/` o `pages/<feature>/models/` | Sí |
| Servicio HTTP | `src/app/core/services/` o `pages/<feature>/services/` | Sí |
| Página listado | `src/app/pages/<feature>/list/` | Si aplica |
| Página detalle/formulario | `src/app/pages/<feature>/form/` o `create/` / `edit/` | Sí |
| Rutas lazy | `src/app/app.routes.ts` | Sí |
| Entrada menú | `shared/components/layout/layout.html` | Si es navegable |
| Guard auth | `src/app/core/guards/` | Si ruta privada |
| Test `*.spec.ts` | Junto a cada componente/servicio nuevo | Sí |
| Environment | `apiUrl` en `src/environments/` | Si falta |

### Integración auth / HTTP transversal

| Artefacto | Ubicación |
|-----------|-----------|
| `AuthService` | `core/services/auth.service.ts` |
| `ApiService` base (opcional) | `core/services/api.service.ts` |
| JWT interceptor | `core/interceptors/jwt.interceptor.ts` |
| Error interceptor | `core/interceptors/error.interceptor.ts` |
| `authGuard` | `core/guards/auth.guard.ts` |
| Registro en `app.config.ts` | `provideHttpClient(withInterceptors([...]))` |

### Componente UI reutilizable

| Artefacto | Ubicación |
|-----------|-----------|
| Componente standalone | `shared/components/<nombre>/` |
| `ControlValueAccessor` | Si es input de formulario |
| Test | `<nombre>.spec.ts` |

---

## 3. Architecture — CRITICAL

### 3.1 Organizar por feature (`arch-feature-folders`)

**Incorrecto:** carpetas globales `src/components/`, `src/services/` mezclando dominios.

**Correcto:**

```
src/app/pages/clientes/
├── list/
│   ├── list.ts
│   ├── list.html
│   ├── list.scss
│   └── list.spec.ts
├── form/
│   └── ...
└── services/
    └── clientes.service.ts
```

### 3.2 Standalone components (`arch-standalone-components`)

**Correcto:**

```typescript
@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [CommonModule, NzTableModule, Card],
  templateUrl: './list.html',
  styleUrl: './list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientesList { }
```

### 3.3 Capa core (`arch-core-layer`)

- **Componentes de página:** orquestación, binding, navegación.
- **Servicios injectables:** HTTP, auth, estado de sesión.
- **No** duplicar lógica HTTP en múltiples componentes.

### 3.4 Smart vs dumb (`arch-smart-dumb`)

- **Smart (pages):** inyectan servicios, manejan rutas y estado de carga/error.
- **Dumb (shared):** reciben `@Input` / `input()`, emiten eventos; sin `HttpClient`.

---

## 4. Components — CRITICAL

### 4.1 Signals en código nuevo (`comp-signals-inputs`)

```typescript
export class Card {
  title = input.required<string>();
  padding = input(true);
}
```

### 4.2 Sin lógica de negocio en plantilla (`comp-no-business-logic`)

**Incorrecto:** `(click)="http.post(...)"` o pipes complejos con efectos secundarios.

**Correcto:** `(click)="guardar()" ` con método en clase que delega al servicio.

### 4.3 Reutilizar shared (`comp-reuse-shared`)

Usar `app-card-content-page`, `app-input-text`, `app-datapicker` antes de crear inputs ad hoc.

---

## 5. State & Reactivity — HIGH

### 5.1 Gestión de suscripciones (`state-async-pipe`)

**Correcto:**

```typescript
clientes$ = this.clientesService.getAll();

// template: @if (clientes$ | async; as clientes) { ... }
```

O con signals + `toSignal()`:

```typescript
clientes = toSignal(this.clientesService.getAll(), { initialValue: [] });
```

### 5.2 Evitar subscribe anidado (`state-no-nested-subscribe`)

Usar `switchMap`, `concatMap`, `forkJoin` según el flujo.

---

## 6. Forms & Validation — HIGH

### 6.1 Reactive Forms (`forms-reactive`)

```typescript
readonly form = this.fb.group({
  nombre: ['', [Validators.required, Validators.maxLength(100)]],
  email: ['', [Validators.required, Validators.email]],
});
```

### 6.2 Mensajes en español (`forms-messages-es`)

```html
<nz-form-control nzErrorTip="El campo nombre es requerido">
```

---

## 7. HTTP & API — HIGH

### 7.1 Capa de servicio (`http-service-layer`)

```typescript
@Injectable({ providedIn: 'root' })
export class ClientesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/clientes`;

  create(dto: CreateClienteDto): Observable<Cliente> {
    return this.http.post<IApiResponse<Cliente>>(this.baseUrl, dto).pipe(
      map((res) => {
        if (!res.status) throw new Error(res.mensaje);
        return res.datos!;
      }),
    );
  }
}
```

### 7.2 Contrato IApiResponse (`http-api-response`)

Siempre tratar `status: false` y mostrar `mensaje` al usuario (ej. `NzMessageService`).

---

## 8. Routing & Security — HIGH

### 8.1 Lazy loading (`route-lazy-load`)

```typescript
{
  path: 'clientes',
  loadComponent: () =>
    import('./pages/clientes/list/list').then((m) => m.ClientesList),
}
```

### 8.2 Auth guard (`route-auth-guard`)

Rutas bajo `Layout` deben usar `canActivate: [authGuard]` cuando auth esté implementado.

---

## 9. Testing — MEDIUM-HIGH

```typescript
describe('ClientesList', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientesList],
      providers: [
        { provide: ClientesService, useValue: { getAll: () => of([]) } },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ClientesList);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
```

---

## 10. Performance — MEDIUM

- Lazy routes para cada feature.
- `trackBy` en listas grandes.
- `OnPush` en componentes presentacionales.

---

## Referencias

- [Angular Documentation](https://angular.dev)
- [Angular Style Guide](https://angular.dev/style-guide)
- Backend API: `../app/AGENTS.md` y Swagger

---

*Mantener sincronizado con `symphony/AGENTS.md` cuando cambien convenciones del proyecto.*
