import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NzButtonModule, NzButtonSize, NzButtonType } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';

type NzButtonShape = 'circle' | 'round' | null;
type HtmlButtonType = 'button' | 'submit' | 'reset';

/**
 * Botón reutilizable (ng-zorro) con label, proyección de contenido e icono.
 *
 * @example
 * ```html
 * <app-button label="Guardar" type="primary" (clicked)="guardar()" />
 * <app-button type="default" icon="eye" (clicked)="ver()">Ver Modelo</app-button>
 * ```
 */
@Component({
  selector: 'app-button',
  standalone: true,
  imports: [NzButtonModule, NzIconModule],
  templateUrl: './button.html',
  styleUrl: './button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-button-host',
    '[class.app-button-host--block]': 'block()',
  },
})
export class Button {
  /** Variante visual ng-zorro */
  readonly type = input<NzButtonType>('default');
  /** Tamaño */
  readonly size = input<NzButtonSize>('default');
  /** Forma (round / circle) */
  readonly shape = input<NzButtonShape>(null);
  /** Estilo ghost */
  readonly ghost = input(false);
  /** Ocupa el 100% del ancho del contenedor */
  readonly block = input(false);
  /** Estado de carga */
  readonly loading = input(false);
  /** Deshabilitado */
  readonly disabled = input(false);
  /** Estilo peligroso (rojo) */
  readonly danger = input(false);
  /** type HTML nativo del button */
  readonly htmlType = input<HtmlButtonType>('button');
  /** Texto del botón (alternativa a ng-content) */
  readonly label = input<string>('');
  /** Texto mientras loading=true */
  readonly loadingText = input<string>('Cargando…');
  /** Icono ng-zorro a la izquierda del texto */
  readonly icon = input<string>('');
  /** title / tooltip nativo */
  readonly title = input<string>('');

  /**
   * Click del botón (no dispara si disabled o loading).
   * Se usa `clicked` para no chocar con el evento DOM nativo `click`.
   */
  readonly clicked = output<MouseEvent>();

  /**
   * Compatibilidad: algunos consumidores usan `(click)`.
   * Emite el mismo evento que `clicked`.
   */
  readonly click = output<MouseEvent>();

  onHostClick(event: MouseEvent): void {
    if (this.disabled() || this.loading()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    this.clicked.emit(event);
    this.click.emit(event);
  }
}
