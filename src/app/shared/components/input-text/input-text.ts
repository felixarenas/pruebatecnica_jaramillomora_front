import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';

@Component({
  selector: 'app-input-text',
  imports: [CommonModule, ReactiveFormsModule, NzInputModule, NzIconModule],
  templateUrl: './input-text.html',
  styleUrl: './input-text.scss',
})
export class InputText implements ControlValueAccessor {
  // Configuraciones del input
  @Input() type: 'text' | 'number' | 'email' | 'password' | 'date' | 'tel' = 'text';
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() icon: string = ''; // Opcional: clase de font-awesome o material icon

  value: any = '';
  isDisabled: boolean = false;

  // Funciones registradas por Angular para el flujo de datos
  onChange = (_: any) => { };
  onTouched = () => { };

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  // Métodos requeridos por ControlValueAccessor
  writeValue(value: any): void { this.value = value || ''; }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.isDisabled = isDisabled; }
}