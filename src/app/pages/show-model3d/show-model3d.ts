import { ChangeDetectionStrategy, Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Card } from '../../shared/components/card/card';
import { ImputSelect, SelectOption } from '../../shared/components/imput-select/imput-select';
import { Processifc } from '../../services/processifc';
import { Button } from '../../shared/components/button/button';
import { ViewerModel3d } from '../../shared/components/viewer-model3d/viewer-model3d';
import { LoadingService } from '../../services/loading';

@Component({
  selector: 'app-show-model3d',
  standalone: true,
  imports: [Card, ImputSelect, ReactiveFormsModule, Button, ViewerModel3d],
  templateUrl: './show-model3d.html',
  styleUrl: './show-model3d.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowModel3d implements OnInit {
  private readonly service = inject(Processifc);
  private readonly fb = inject(FormBuilder);
  private readonly message = inject(NzMessageService);
  private readonly loading = inject(LoadingService);

  readonly tiposOptions = signal<SelectOption[]>([]);
  readonly modelUrl = signal<string | null>(null);
  readonly isLoading = this.loading.isLoading;
  readonly error = signal<string | null>(null);
  readonly success = signal<boolean>(false);

  @ViewChild(ViewerModel3d) viewer!: ViewerModel3d;

  readonly form = this.fb.nonNullable.group({
    id_archivo_ifc: this.fb.control<string | null>(null),
  });

  procesar(): void {
    const url = this.form.controls.id_archivo_ifc.value;
    if (!url || this.isLoading()) {
      this.message.warning('Seleccione un archivo IFC');
      return;
    }
    this.error.set(null);
    this.success.set(false);
    this.modelUrl.set(url);

    //this.onLoadPropertySets();
  }

  onViewerLoaded(): void {
    this.success.set(true);
    this.error.set(null);
  }

  onViewerError(message: string): void {
    this.success.set(false);
    this.error.set(message);
    this.message.error(message);
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
            value: item.url,
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

  onLoadPropertySets() {
    this.isLoading.set(true);
    this.viewer.apiGetPropertySets()
      .then(data => {
        if (!data) {
          this.message.warning('No se pudo extraer Property Sets del modelo');
          this.isLoading.set(false);
          return;
        }

        const jsonString = JSON.stringify(data, null, 2);
        //this.propertySetsJson.set(jsonString);
        console.log(jsonString);
        this.message.success('Property Sets extraídos correctamente');
        this.isLoading.set(false);
      })
      .catch(err => {
        this.message.error('Error al extraer Property Sets');
        this.isLoading.set(false);
      })
      .finally(() => {
        this.isLoading.set(false);
      });
  }
}
