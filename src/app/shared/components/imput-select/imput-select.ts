import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  input,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';

/** Opción de un select reutilizable */
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

type SelectValue = string | number | null;

@Component({
  selector: 'app-imput-select',
  standalone: true,
  imports: [FormsModule, NzSelectModule],
  templateUrl: './imput-select.html',
  styleUrl: './imput-select.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ImputSelect),
      multi: true,
    },
  ],
})
export class ImputSelect implements ControlValueAccessor {
  /** Etiqueta visible sobre el control */
  readonly label = input<string>('');
  /** Opciones del desplegable */
  readonly options = input<SelectOption[]>([]);
  /** Texto cuando no hay selección */
  readonly placeholder = input<string>('Seleccione una opción');
  /** Permite limpiar la selección */
  readonly allowClear = input(true);
  /** Activa búsqueda en opciones */
  readonly showSearch = input(true);
  /** Identificador accesible del control */
  readonly controlId = input<string>('imput-select');

  /** Emite el valor seleccionado (además del binding del formulario) */
  readonly valueChange = output<SelectValue>();

  readonly value = signal<SelectValue>(null);
  readonly isDisabled = signal(false);

  private onChange: (value: SelectValue) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  onSelectChange(value: SelectValue): void {
    this.value.set(value ?? null);
    this.onChange(this.value());
    this.valueChange.emit(this.value());
  }

  onBlur(): void {
    this.onTouched();
  }

  writeValue(value: SelectValue): void {
    this.value.set(value ?? null);
  }

  registerOnChange(fn: (value: SelectValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }
}
