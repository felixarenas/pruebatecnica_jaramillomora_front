import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { Card } from '../card/card';

/**
 * Fila genérica en formato JSON. Cada clave es el nombre del campo entregado
 * en `values` y su valor es el contenido a pintar en la celda correspondiente.
 */
export type InputTableRow = Record<string, unknown>;

/**
 * Tabla genérica y reutilizable.
 *
 * Pinta un `nz-table` a partir de datos en formato JSON, donde el encabezado de
 * cada columna se define en `columns` y el campo del JSON que alimenta esa
 * columna se define en la misma posición dentro de `values`.
 *
 * @example
 * <app-input-table
 *   [title]="'Elementos por nivel'"
 *   [data]="datos"
 *   [columns]="['Nombre', 'Tipo', 'Grupo', 'Cantidad']"
 *   [values]="['nombre_elemento', 'tipo_elemento', 'tipo_agrupacion', 'cuantos']" />
 */
@Component({
  selector: 'app-input-table',
  imports: [CommonModule, NzTableModule, NzEmptyModule, Card],
  templateUrl: './input-table.html',
  styleUrl: './input-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputTable {
  /** Título mostrado en el encabezado de la tarjeta que envuelve la tabla. */
  title = input<string>('');

  /** Datos a mostrar en formato JSON (arreglo de objetos). */
  data = input<InputTableRow[]>([]);

  /** Nombres visibles de las columnas, en orden. */
  columns = input<string[]>([]);

  /**
   * Claves del JSON que alimentan cada columna, alineadas por posición con
   * `columns` (columns[i] se pinta con el valor de row[values[i]]).
   */
  values = input<string[]>([]);

  /** Emparejamiento posición a posición entre encabezado y clave del JSON. */
  protected readonly headers = computed(() =>
    this.columns().map((label, index) => ({
      label,
      key: this.values()[index] ?? '',
    })),
  );

  /** Obtiene el valor de una celda de forma segura. */
  protected cellValue(row: InputTableRow, key: string): unknown {
    if (!key) {
      return '';
    }
    const value = row[key];
    return value ?? '';
  }
}
