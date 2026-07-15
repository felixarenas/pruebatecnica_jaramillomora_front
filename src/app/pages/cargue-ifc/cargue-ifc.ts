import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzMessageService } from 'ng-zorro-antd/message';
import { catchError, from, mergeMap, of, tap, toArray } from 'rxjs';

import { Card } from '../../shared/components/card/card';
import { Form } from '../../shared/components/form/form';
import { UploadFile } from '../../shared/components/upload-file/upload-file';
import { LoadingService } from '../../services/loading';
import { Processifc, ProcessIfcDto } from '../../services/processifc';

@Component({
  selector: 'app-cargue-ifc',
  imports: [Card, Form, UploadFile, ReactiveFormsModule, NzFormModule],
  templateUrl: './cargue-ifc.html',
  styleUrl: './cargue-ifc.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CargueIfc {
  private readonly processIfc = inject(Processifc);
  private readonly message = inject(NzMessageService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly loading = inject(LoadingService);

  /** Alias del signal global: `this.isLoading.set(true)` muestra el overlay del layout. */
  readonly isLoading = this.loading.isLoading;

  readonly cargueIfcForm = new FormGroup({
    archivosIfc: new FormControl<File[] | null>(null, {
      validators: [Validators.required],
    }),
  });

  cargueIfc(): void {
    const files = this.cargueIfcForm.controls.archivosIfc.value;

    if (!files?.length || this.isLoading()) {
      return;
    }

    this.isLoading.set(true);

    from(files)
      .pipe(
        mergeMap((file) => from(this.toProcessDto(file))),
        mergeMap((dto) =>
          this.processIfc.process(dto).pipe(
            tap((res) => {
              if (res.status) {
                this.message.success(`Archivo ${dto.nom_file}.${dto.ext} cargado correctamente`);
              } else {
                this.message.error(`Error al cargar ${dto.nom_file}.${dto.ext} => ${res.mensaje}`);
              }
            }),
            catchError((err: any) => {
              const { status, mensaje } = err.error
              if (!status && mensaje) {
                this.message.error(`Error al cargar => ${mensaje}`);
              } else {
                this.message.error(`Error al cargar => ${err.message}`);
              }
              return of(null);
            }),
          ),
        ),
        toArray(),
        takeUntilDestroyed(this.destroyRef),
      ).subscribe({
        next: (response) => {
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }

  private async toProcessDto(file: File): Promise<ProcessIfcDto> {
    const { nom_file, ext } = this.splitFileName(file.name);
    const base64 = await this.fileToBase64(file);

    return {
      nom_file,
      ext,
      size: file.size,
      base64,
    };
  }

  private splitFileName(fileName: string): { nom_file: string; ext: string } {
    const lastDot = fileName.lastIndexOf('.');
    if (lastDot <= 0) {
      return { nom_file: fileName, ext: 'ifc' };
    }

    return {
      nom_file: fileName.slice(0, lastDot),
      ext: fileName.slice(lastDot + 1).toLowerCase(),
    };
  }

  /** Convierte el File a base64 puro (sin prefijo data URI). */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const result = reader.result;
        if (typeof result !== 'string') {
          reject(new Error(`No se pudo leer el archivo ${file.name}`));
          return;
        }

        const commaIndex = result.indexOf(',');
        resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
      };

      reader.onerror = () => reject(new Error(`Error al leer el archivo ${file.name}`));
      reader.readAsDataURL(file);
    });
  }
}
