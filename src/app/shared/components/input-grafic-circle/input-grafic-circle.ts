import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnDestroy,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { Card } from '../card/card';

/** Fila genérica en formato JSON con las claves indicadas en `values`. */
export type InputGraficRow = Record<string, unknown>;

/** Punto agregado de la serie (categoría y su valor). */
interface ChartPoint {
  readonly label: string;
  readonly value: number;
}

/** Porción de la torta lista para pintar en el SVG. */
interface PieSlice extends ChartPoint {
  readonly percent: number;
  readonly path: string;
  readonly color: string;
  readonly labelX: number;
  readonly labelY: number;
  readonly showLabel: boolean;
}

/** Fila de la tabla resumen (incluye color de la porción y porcentaje). */
interface SummaryItem extends ChartPoint {
  readonly color: string;
  readonly percent: number;
}

/** Paleta de colores para las porciones (cíclica). */
const PALETTE = [
  '#1677ff',
  '#52c41a',
  '#faad14',
  '#f5222d',
  '#722ed1',
  '#13c2c2',
  '#eb2f96',
  '#fa8c16',
  '#a0d911',
  '#2f54eb',
] as const;

/**
 * Gráfico de torta / circular, genérico y reutilizable.
 *
 * Comparte comportamiento y parámetros con `app-input-grafic-bar` (título,
 * datos JSON, ejes, valores, resumen y pantalla completa), pero pinta los datos
 * como porciones de una torta. La categoría y el valor numérico se toman de los
 * campos indicados en `values` (`values[0]` = categoría, `values[1]` = valor).
 *
 * @example
 * <app-input-grafic-circle
 *   [title]="'Elementos por nivel'"
 *   [data]="datos"
 *   [ejesXY]="['Elemento', 'Cantidad']"
 *   [values]="['nombre_elemento', 'cuantos']"
 *   [resumen]="'Picos por elemento'" />
 */
@Component({
  selector: 'app-input-grafic-circle',
  imports: [CommonModule, NzEmptyModule, NzButtonModule, NzIconModule, Card],
  templateUrl: './input-grafic-circle.html',
  styleUrl: './input-grafic-circle.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputGraficCircle implements OnDestroy {
  private readonly document = inject(DOCUMENT);

  /** Título mostrado en el encabezado de la tarjeta que envuelve el gráfico. */
  title = input<string>('');

  /** Datos a graficar en formato JSON (arreglo de objetos). */
  data = input<InputGraficRow[]>([]);

  /** Etiquetas de los ejes: `[nombreCategoria, nombreValor]`. */
  ejesXY = input<string[]>([]);

  /** Claves del JSON: `[campoCategoria, campoValor]`. */
  values = input<string[]>([]);

  /** Título de la tabla resumen (picos y valores más relevantes). */
  resumen = input<string>('');

  /** Dimensiones del lienzo SVG (viewBox). */
  protected readonly view = { width: 380, height: 360 } as const;
  private readonly geometry = { cx: 190, cy: 180, radius: 150 } as const;

  /** Indica si el gráfico se está mostrando en pantalla completa. */
  protected readonly isFullscreen = signal(false);

  /** Abre la vista de pantalla completa y bloquea el scroll del documento. */
  protected openFullscreen(): void {
    this.isFullscreen.set(true);
    this.document.body.style.overflow = 'hidden';
  }

  /** Cierra la vista de pantalla completa y restaura el scroll del documento. */
  protected closeFullscreen(): void {
    this.isFullscreen.set(false);
    this.document.body.style.overflow = '';
  }

  /** Alterna entre vista normal y pantalla completa. */
  protected toggleFullscreen(): void {
    this.isFullscreen() ? this.closeFullscreen() : this.openFullscreen();
  }

  /** Cierra la pantalla completa al presionar la tecla Escape. */
  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.isFullscreen()) {
      this.closeFullscreen();
    }
  }

  ngOnDestroy(): void {
    this.document.body.style.overflow = '';
  }

  protected readonly categoryLabel = computed(() => this.ejesXY()[0] ?? '');
  protected readonly valueLabel = computed(() => this.ejesXY()[1] ?? '');

  /** Serie agregada por categoría (suma de valores repetidos). */
  protected readonly points = computed<ChartPoint[]>(() => {
    const categoryKey = this.values()[0] ?? '';
    const valueKey = this.values()[1] ?? '';
    if (!categoryKey || !valueKey) {
      return [];
    }

    const totals = new Map<string, number>();
    for (const row of this.data()) {
      const label = this.stringify(row[categoryKey]);
      const value = Number(row[valueKey]) || 0;
      totals.set(label, (totals.get(label) ?? 0) + value);
    }
    return [...totals].map(([label, value]) => ({ label, value }));
  });

  /** Porciones de la torta calculadas a partir de la serie. */
  protected readonly slices = computed<PieSlice[]>(() => {
    const points = this.points();
    const total = points.reduce((sum, point) => sum + point.value, 0);
    if (total <= 0) {
      return [];
    }

    const { cx, cy, radius } = this.geometry;
    let angle = -90;

    return points.map((point, index) => {
      const sweep = (point.value / total) * 360;
      const start = angle;
      const end = angle + sweep;
      angle = end;

      const percent = (point.value / total) * 100;
      const midAngle = (start + end) / 2;
      const labelPos = this.polar(cx, cy, radius * 0.62, midAngle);
      const path =
        points.length === 1
          ? this.fullCirclePath(cx, cy, radius)
          : this.arcPath(cx, cy, radius, start, end);

      return {
        ...point,
        percent: Math.round(percent * 10) / 10,
        path,
        color: PALETTE[index % PALETTE.length],
        labelX: labelPos.x,
        labelY: labelPos.y,
        showLabel: percent >= 5,
      };
    });
  });

  protected readonly hasData = computed(() => this.slices().length > 0);

  /** Elementos más pronunciados (orden descendente) para la tabla resumen. */
  protected readonly summary = computed<SummaryItem[]>(() =>
    [...this.slices()]
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
      .map((slice) => ({
        label: slice.label,
        value: slice.value,
        color: slice.color,
        percent: slice.percent,
      })),
  );

  /** Recorta etiquetas largas para no saturar la tabla resumen. */
  protected truncate(label: string, max = 24): string {
    return label.length > max ? `${label.slice(0, max - 1)}…` : label;
  }

  private stringify(value: unknown): string {
    return value === null || value === undefined ? '' : String(value);
  }

  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }

  /** Convierte un ángulo polar (grados) en coordenadas cartesianas del SVG. */
  private polar(cx: number, cy: number, radius: number, angleDeg: number): { x: number; y: number } {
    const angle = (angleDeg * Math.PI) / 180;
    return {
      x: this.round(cx + radius * Math.cos(angle)),
      y: this.round(cy + radius * Math.sin(angle)),
    };
  }

  /** Construye el path de una porción entre dos ángulos. */
  private arcPath(cx: number, cy: number, radius: number, startAngle: number, endAngle: number): string {
    const start = this.polar(cx, cy, radius, startAngle);
    const end = this.polar(cx, cy, radius, endAngle);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
  }

  /** Construye un círculo completo (caso de una sola categoría). */
  private fullCirclePath(cx: number, cy: number, radius: number): string {
    return `M ${cx - radius} ${cy} A ${radius} ${radius} 0 1 1 ${cx + radius} ${cy} A ${radius} ${radius} 0 1 1 ${cx - radius} ${cy} Z`;
  }
}
