import { Injectable, signal } from '@angular/core';

/**
 * Estado global de carga controlado de forma manual (sin interceptor).
 * Uso desde páginas: `this.loading.isLoading.set(true)`.
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  readonly isLoading = signal(false);
  /** Activa la barra de progreso dentro del overlay de carga. */
  readonly isCargaCompleta = signal(false);
  /** Porcentaje visual de la barra (ej. `45%`). Actualizar mientras avanza la carga. */
  readonly isCargaCompletaString = signal('0%');
  /** Mensaje descriptivo del estado de carga. */
  readonly isCargaMensaje = signal('');
}
