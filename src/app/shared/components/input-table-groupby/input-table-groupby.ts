import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { Card } from '../card/card';

/**
 * Fila genérica en formato JSON. Cada clave es el nombre del campo entregado
 * en `values` / `groupby` y su valor es el contenido a pintar.
 */
export type InputTableGroupbyRow = Record<string, unknown>;

/** Grupo de filas resultante de agrupar el JSON por los campos `groupby`. */
interface TableGroup {
  /** Etiqueta visible del grupo (combinación de los campos `groupby`). */
  readonly label: string;
  /** Filas que pertenecen al grupo. */
  readonly rows: InputTableGroupbyRow[];
}

/**
 * Tabla genérica y reutilizable con agrupación de registros.
 *
 * Pinta un `nz-table` a partir de datos en formato JSON, donde el encabezado de
 * cada columna se define en `columns` y el campo del JSON que alimenta esa
 * columna se define en la misma posición dentro de `values`. Las filas se
 * dividen en grupos según los campos indicados en `groupby`.
 *
 * @example
 * <app-input-table-groupby
 *   [title]="'Elementos por nivel'"
 *   [data]="datos"
 *   [columns]="['nombre', 'cantidad']"
 *   [values]="['nombre_elemento', 'cuantos']"
 *   [groupby]="['nombre_nivel']" />
 */
@Component({
  selector: 'app-input-table-groupby',
  imports: [CommonModule, NzTableModule, NzEmptyModule, Card],
  templateUrl: './input-table-groupby.html',
  styleUrl: './input-table-groupby.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputTableGroupby {
  /** Título mostrado en el encabezado de la tarjeta que envuelve la tabla. */
  title = input<string>('');

  /** Datos a mostrar en formato JSON (arreglo de objetos). */
  data = input<InputTableGroupbyRow[]>([]);

  /** Nombres visibles de las columnas, en orden. */
  columns = input<string[]>([]);

  /**
   * Claves del JSON que alimentan cada columna, alineadas por posición con
   * `columns` (columns[i] se pinta con el valor de row[values[i]]).
   */
  values = input<string[]>([]);

  /**
   * Campo(s) del JSON usados para agrupar las filas. Cada valor distinto de la
   * combinación genera un grupo con su propia fila de encabezado.
   */
  groupby = input<string[]>([]);

  /** Emparejamiento posición a posición entre encabezado y clave del JSON. */
  protected readonly headers = computed(() =>
    this.columns().map((label, index) => ({
      label,
      key: this.values()[index] ?? '',
    })),
  );

  /** Número de columnas de datos, usado para el `colspan` del encabezado de grupo. */
  protected readonly columnCount = computed(() => this.headers().length);

  /**
   * Agrupa las filas del JSON preservando el orden de aparición de cada grupo.
   * Si no se define `groupby`, se devuelve un único grupo sin etiqueta.
   */
  protected readonly groups = computed<TableGroup[]>(() => {
    const rows = this.data();
    const keys = this.groupby().filter((key) => !!key);

    if (!keys.length) {
      return rows.length ? [{ label: '', rows: [...rows] }] : [];
    }

    const grouped = new Map<string, TableGroup>();
    for (const row of rows) {
      const label = keys
        .map((key) => this.stringify(row[key]))
        .join(' · ');
      const existing = grouped.get(label);
      if (existing) {
        existing.rows.push(row);
      } else {
        grouped.set(label, { label, rows: [row] });
      }
    }
    return [...grouped.values()];
  });

  /** Obtiene el valor de una celda de forma segura. */
  protected cellValue(row: InputTableGroupbyRow, key: string): unknown {
    if (!key) {
      return '';
    }
    return row[key] ?? '';
  }

  /** Convierte un valor arbitrario en texto legible para la etiqueta de grupo. */
  private stringify(value: unknown): string {
    return value === null || value === undefined ? '' : String(value);
  }
}
