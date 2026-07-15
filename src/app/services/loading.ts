import { Injectable, signal } from '@angular/core';

/**
 * Estado global de carga controlado de forma manual (sin interceptor).
 * Uso desde páginas: `this.loading.isLoading.set(true)`.
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  readonly isLoading = signal(false);
}
