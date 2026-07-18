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

/** Tipo de gráfico soportado. */
export type GraficType = 'barras' | 'lineas';

/** Punto agregado de la serie (categoría del eje X y su valor en el eje Y). */
interface ChartPoint {
  readonly label: string;
  readonly value: number;
}

/** Barra lista para pintar en el SVG. */
interface ChartBar extends ChartPoint {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly cx: number;
}

/** Punto de la línea con sus coordenadas en el SVG. */
interface ChartNode extends ChartPoint {
  readonly x: number;
  readonly y: number;
}

/** Marca del eje Y (valor + coordenada). */
interface AxisTick {
  readonly value: number;
  readonly y: number;
}

/** Geometría calculada del gráfico para la plantilla. */
interface ChartGeometry {
  readonly bars: ChartBar[];
  readonly nodes: ChartNode[];
  readonly linePath: string;
  readonly ticks: AxisTick[];
  readonly baselineY: number;
  readonly axisX: number;
  readonly axisTopY: number;
  readonly plotRight: number;
}

/**
 * Gráfico de barras o de líneas consecutivas, genérico y reutilizable.
 *
 * Pinta un SVG a partir de datos en formato JSON. La categoría del eje X y el
 * valor numérico del eje Y se toman de los campos indicados en `values`
 * (`values[0]` = eje X, `values[1]` = eje Y). En modo `lineas` dibuja una curva
 * suave mostrando el valor en cada punto de intersección. En la parte superior
 * derecha muestra una tabla resumen con los elementos más pronunciados.
 *
 * @example
 * <app-input-grafic-bar
 *   [title]="'Elementos por nivel'"
 *   [data]="datos"
 *   [ejesXY]="['Elemento', 'Cantidad']"
 *   [values]="['nombre_elemento', 'cuantos']"
 *   [resumen]="'Picos por elemento'"
 *   [tipo]="'barras'" />
 */
@Component({
  selector: 'app-input-grafic-bar',
  imports: [CommonModule, NzEmptyModule, NzButtonModule, NzIconModule, Card],
  templateUrl: './input-grafic-bar.html',
  styleUrl: './input-grafic-bar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputGraficBar implements OnDestroy {
  private readonly document = inject(DOCUMENT);
  /** Título mostrado en el encabezado de la tarjeta que envuelve el gráfico. */
  title = input<string>('');

  /** Datos a graficar en formato JSON (arreglo de objetos). */
  data = input<InputGraficRow[]>([]);

  /** Etiquetas de los ejes: `[nombreEjeX, nombreEjeY]`. */
  ejesXY = input<string[]>([]);

  /** Claves del JSON: `[campoEjeX, campoEjeY]`. */
  values = input<string[]>([]);

  /** Título de la tabla resumen (picos y valores más relevantes). */
  resumen = input<string>('');

  /** Tipo de gráfico: `'barras'` o `'lineas'`. */
  tipo = input<GraficType>('barras');

  /** Dimensiones del lienzo SVG (viewBox). */
  protected readonly view = { width: 760, height: 360 } as const;
  private readonly padding = { top: 24, right: 24, bottom: 72, left: 60 } as const;

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

  protected readonly xAxisLabel = computed(() => this.ejesXY()[0] ?? '');
  protected readonly yAxisLabel = computed(() => this.ejesXY()[1] ?? '');

  /** Serie agregada por categoría del eje X (suma de valores repetidos). */
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

  protected readonly hasData = computed(() => this.points().length > 0);

  /** Elementos más pronunciados (orden descendente) para la tabla resumen. */
  protected readonly summary = computed<ChartPoint[]>(() =>
    [...this.points()].sort((a, b) => b.value - a.value).slice(0, 5),
  );

  /** Geometría del gráfico (barras, línea, ejes y marcas). */
  protected readonly chart = computed<ChartGeometry>(() => {
    const points = this.points();
    const { width, height } = this.view;
    const pad = this.padding;
    const plotWidth = width - pad.left - pad.right;
    const plotHeight = height - pad.top - pad.bottom;
    const baselineY = pad.top + plotHeight;

    const scale = this.niceScale(Math.max(0, ...points.map((p) => p.value)));
    const toY = (value: number): number =>
      scale.max ? this.round(baselineY - (value / scale.max) * plotHeight) : baselineY;

    const bandWidth = points.length ? plotWidth / points.length : plotWidth;
    const barWidth = bandWidth * 0.6;

    const bars: ChartBar[] = points.map((point, index) => {
      const cx = pad.left + bandWidth * index + bandWidth / 2;
      const y = toY(point.value);
      return {
        ...point,
        cx,
        x: this.round(cx - barWidth / 2),
        y,
        width: this.round(barWidth),
        height: this.round(baselineY - y),
      };
    });

    const nodes: ChartNode[] = points.map((point, index) => ({
      ...point,
      x: this.round(pad.left + bandWidth * index + bandWidth / 2),
      y: toY(point.value),
    }));

    const ticks: AxisTick[] = scale.ticks.map((value) => ({ value, y: toY(value) }));

    return {
      bars,
      nodes,
      linePath: this.buildSmoothPath(nodes),
      ticks,
      baselineY,
      axisX: pad.left,
      axisTopY: pad.top,
      plotRight: pad.left + plotWidth,
    };
  });

  /** Recorta etiquetas largas del eje X para no saturar el gráfico. */
  protected truncate(label: string, max = 16): string {
    return label.length > max ? `${label.slice(0, max - 1)}…` : label;
  }

  private stringify(value: unknown): string {
    return value === null || value === undefined ? '' : String(value);
  }

  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }

  /** Calcula una escala "bonita" para el eje Y con marcas uniformes. */
  private niceScale(max: number, tickCount = 5): { max: number; ticks: number[] } {
    if (max <= 0) {
      return { max: 0, ticks: [0] };
    }

    const rawStep = max / tickCount;
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const normalized = rawStep / magnitude;
    let step: number;
    if (normalized <= 1) step = 1;
    else if (normalized <= 2) step = 2;
    else if (normalized <= 2.5) step = 2.5;
    else if (normalized <= 5) step = 5;
    else step = 10;
    step *= magnitude;

    const niceMax = Math.ceil(max / step) * step;
    const ticks: number[] = [];
    for (let value = 0; value <= niceMax + step / 1000; value += step) {
      ticks.push(Math.round(value * 100) / 100);
    }
    return { max: niceMax, ticks };
  }

  /** Construye una curva suave (Catmull-Rom → Bézier) que une los puntos. */
  private buildSmoothPath(nodes: ChartNode[]): string {
    if (!nodes.length) {
      return '';
    }
    if (nodes.length === 1) {
      return `M ${nodes[0].x} ${nodes[0].y}`;
    }

    let path = `M ${nodes[0].x} ${nodes[0].y}`;
    for (let i = 0; i < nodes.length - 1; i++) {
      const p0 = nodes[i - 1] ?? nodes[i];
      const p1 = nodes[i];
      const p2 = nodes[i + 1];
      const p3 = nodes[i + 2] ?? p2;
      const c1x = this.round(p1.x + (p2.x - p0.x) / 6);
      const c1y = this.round(p1.y + (p2.y - p0.y) / 6);
      const c2x = this.round(p2.x - (p3.x - p1.x) / 6);
      const c2y = this.round(p2.y - (p3.y - p1.y) / 6);
      path += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${p2.x} ${p2.y}`;
    }
    return path;
  }
}
