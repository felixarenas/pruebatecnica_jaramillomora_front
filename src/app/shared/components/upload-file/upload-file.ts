import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  forwardRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';

@Component({
  selector: 'app-upload-file',
  standalone: true,
  imports: [CommonModule, NzInputModule, NzButtonModule, NzIconModule, NzTooltipModule],
  templateUrl: './upload-file.html',
  styleUrl: './upload-file.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UploadFile),
      multi: true,
    },
  ],
})
export class UploadFile implements ControlValueAccessor {
  /** Etiqueta visible sobre el control */
  readonly label = input<string>('');
  /** Placeholder del campo de texto (nombre del archivo) */
  readonly placeholder = input<string>('Seleccione un archivo plano…');
  /**
   * Tipos aceptados por el explorador de archivos.
   * Por defecto: archivos de texto / planos habituales.
   */
  readonly accept = input<string>('.txt,.csv,.tsv,.log,.json,.xml,.ifc,.md,text/plain');
  /** Icono del botón (ng-zorro). Por defecto nube de carga */
  readonly buttonIcon = input<string>('cloud-upload');
  /** Texto accesible / tooltip del botón */
  readonly buttonTitle = input<string>('Buscar archivo');
  /** Permitir varios archivos (value será File[] si multiple=true) */
  readonly multiple = input<boolean>(false);

  /** Emite el File (o File[]) seleccionado */
  readonly fileSelected = output<File | File[] | null>();
  /** Emite solo el nombre mostrado */
  readonly fileNameChange = output<string>();

  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  readonly fileName = signal('');
  readonly isDisabled = signal(false);

  private selectedFile: File | File[] | null = null;
  onChange: (value: File | File[] | null) => void = () => undefined;
  onTouched: () => void = () => undefined;

  openFilePicker(): void {
    if (this.isDisabled()) {
      return;
    }
    this.fileInput()?.nativeElement.click();
  }

  onFileInputChange(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const files = inputEl.files;

    if (!files || files.length === 0) {
      this.applySelection(null);
      return;
    }

    if (this.multiple()) {
      this.applySelection(Array.from(files));
    } else {
      this.applySelection(files.item(0));
    }

    // Permite volver a elegir el mismo archivo
    inputEl.value = '';
  }

  clear(): void {
    if (this.isDisabled()) {
      return;
    }
    this.applySelection(null);
    this.onTouched();
  }

  writeValue(value: File | File[] | string | null): void {
    if (value == null || value === '') {
      this.selectedFile = null;
      this.fileName.set('');
      return;
    }

    if (typeof value === 'string') {
      this.selectedFile = null;
      this.fileName.set(value);
      return;
    }

    if (Array.isArray(value)) {
      this.selectedFile = value;
      this.fileName.set(value.map((f) => f.name).join(', '));
      return;
    }

    this.selectedFile = value;
    this.fileName.set(value.name);
  }

  registerOnChange(fn: (value: File | File[] | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  private applySelection(value: File | File[] | null): void {
    this.selectedFile = value;

    let display = '';
    if (Array.isArray(value)) {
      display = value.map((f) => f.name).join(', ');
    } else if (value) {
      display = value.name;
    }

    this.fileName.set(display);
    this.onChange(value);
    this.onTouched();
    this.fileSelected.emit(value);
    this.fileNameChange.emit(display);
  }
}
