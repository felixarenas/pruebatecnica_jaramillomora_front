import { Component, inject, signal } from '@angular/core';
import { Card } from '../../shared/components/card/card';
import { ImputSelect, SelectOption } from '../../shared/components/imput-select/imput-select';
import { Button } from '../../shared/components/button/button';
import { ViewerModel3d } from '../../shared/components/viewer-model3d/viewer-model3d';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { LoadingService } from '../../services/loading';
import { Processifc } from '../../services/processifc';
import { InputTable } from '../../shared/components/input-table/input-table';
import { InputTableGroupby } from '../../shared/components/input-table-groupby/input-table-groupby';
import { InputGraficBar } from '../../shared/components/input-grafic-bar/input-grafic-bar';
import { InputGraficCircle } from '../../shared/components/input-grafic-circle/input-grafic-circle';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-process-grafic-ifc',
  imports: [Card, ImputSelect, Button, ViewerModel3d, CommonModule, ReactiveFormsModule, NzTabsModule, InputTable, InputTableGroupby, InputGraficBar, InputGraficCircle],
  templateUrl: './process-grafic-ifc.html',
  styleUrl: './process-grafic-ifc.scss',
})
export class ProcessGraficIfc {
  private readonly service = inject(Processifc);
  private readonly fb = inject(FormBuilder);
  private readonly message = inject(NzMessageService);
  private readonly loading = inject(LoadingService);
  private socket: Socket;

  readonly tiposOptions = signal<SelectOption[]>([]);
  readonly isLoading = this.loading.isLoading;
  readonly isCargaCompleta = this.loading.isCargaCompleta;
  readonly isCargaCompletaString = this.loading.isCargaCompletaString;
  readonly isCargaMensaje = this.loading.isCargaMensaje;
  readonly error = signal<string | null>(null);
  readonly success = signal<boolean>(false);
  readonly datosCategorias = signal<any>(null);
  readonly datosNiveles = signal<any>(null);

  readonly form = this.fb.nonNullable.group({
    id_archivo_ifc: this.fb.control<string | null>(null),
  });

  constructor() {
    this.socket = io(environment.urlSocket);
    this.socket.on('progress-update', (data: { percentage: string, message: string }) => {
      this.isCargaCompletaString.set(data.percentage);
      this.isCargaMensaje.set(data.message || '');
    });
  }

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
    this.isCargaCompleta.set(true);
    this.datosCategorias.set(null);
    this.datosNiveles.set(null);

    const idArchivoIfc = this.form.get('id_archivo_ifc')?.value;
    if (!idArchivoIfc) {
      this.message.error('Por favor, seleccione un archivo IFC');
      this.isLoading.set(false);
      this.isCargaCompleta.set(false);
      this.isCargaCompletaString.set('0%');
      return;
    }

    this.service.processGrafic(idArchivoIfc).subscribe({
      next: (res: any) => {
        if (!res.status || !res.datos) {
          this.message.error('No se pudo procesar el archivo IFC');
          this.isLoading.set(false);
          this.isCargaCompleta.set(false);
          this.isCargaCompletaString.set('0%');
          return;
        }

        const { data, status, mensaje } = res.datos;

        if (!status) {
          this.message.error(mensaje);
          this.isLoading.set(false);
          this.isCargaCompleta.set(false);
          this.isCargaCompletaString.set('0%');
          return;
        }

        const { categoria, nivel } = data.elementsDB;

        this.datosCategorias.set(categoria);

        this.datosNiveles.set(nivel);

        this.message.success('Archivo IFC procesado exitosamente');
        this.isLoading.set(false);
        this.isCargaCompleta.set(false);
        this.isCargaCompletaString.set('0%');
      },
      error: () => {
        this.message.error('No se pudo procesar el archivo IFC');
        this.isLoading.set(false);
        this.isCargaCompleta.set(false);
        this.isCargaCompletaString.set('0%');
      },
    });
  }
}
