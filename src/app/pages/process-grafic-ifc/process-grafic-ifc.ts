import { Component, inject, signal } from '@angular/core';
import { Card } from '../../shared/components/card/card';
import { ImputSelect, SelectOption } from '../../shared/components/imput-select/imput-select';
import { Button } from '../../shared/components/button/button';
import { ViewerModel3d } from '../../shared/components/viewer-model3d/viewer-model3d';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LoadingService } from '../../services/loading';
import { Processifc } from '../../services/processifc';

@Component({
  selector: 'app-process-grafic-ifc',
  imports: [Card, ImputSelect, Button, ViewerModel3d, CommonModule, ReactiveFormsModule],
  templateUrl: './process-grafic-ifc.html',
  styleUrl: './process-grafic-ifc.scss',
})
export class ProcessGraficIfc {
  private readonly service = inject(Processifc);
  private readonly fb = inject(FormBuilder);
  private readonly message = inject(NzMessageService);
  private readonly loading = inject(LoadingService);

  readonly tiposOptions = signal<SelectOption[]>([]);
  readonly isLoading = this.loading.isLoading;
  readonly error = signal<string | null>(null);
  readonly success = signal<boolean>(false);

  readonly form = this.fb.nonNullable.group({
    id_archivo_ifc: this.fb.control<string | null>(null),
  });

  ngOnInit(): void {

    this.error.set(null);
    this.success.set(true);

    this.service.getFileIfcAll().subscribe({
      next: (res) => {
        if (!res.status || !res.datos) {
          this.tiposOptions.set([]);
          return;
        }

        this.tiposOptions.set(
          res.datos.map((item) => ({
            value: item.nom_file,
            label: item.nom_file,
          })),
        );
      },
      error: () => {
        this.tiposOptions.set([]);
        this.message.error('No se pudieron cargar los archivos IFC');
      },
    });
  }

  procesar(): void {
    this.error.set(null);
    this.success.set(false);
    this.isLoading.set(true);

    const idArchivoIfc = this.form.get('id_archivo_ifc')?.value;
    if (!idArchivoIfc) {
      this.message.error('Por favor, seleccione un archivo IFC');
      this.isLoading.set(false);
      return;
    }

    this.service.processGrafic(idArchivoIfc).subscribe({
      next: (res: any) => {
        if (!res.status || !res.datos) {
          this.message.error('No se pudo procesar el archivo IFC');
          return;
        }

        const { data, status, mensaje } = res.datos;

        console.log(data)

        this.message.success('Archivo IFC procesado exitosamente');
        this.isLoading.set(false);
      },
      error: () => {
        this.message.error('No se pudo procesar el archivo IFC');
        this.isLoading.set(false);
      },
    });
  }
}
