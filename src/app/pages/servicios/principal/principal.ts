import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { finalize } from 'rxjs';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { Cliente } from '../../../services/getclienteall';
import { Createservicio } from '../../../services/createservicio';
import { Deleteservicio } from '../../../services/deleteservicio';
import { Findclientebycedula } from '../../../services/findclientebycedula';
import { Getservicesall, Servicio } from '../../../services/getservicesall';
import { Getserviciobyid } from '../../../services/getserviciobyid';
import { Gettiposservicio, TipoServicio } from '../../../services/gettiposservicio';
import { Updateservicio } from '../../../services/updateservicio';
import { Card } from '../../../shared/components/card/card';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ONLY_NUMBERS_PATTERN = /^\d+$/;

interface ServicioForm {
  id_cliente: FormControl<number | null>;
  cliente_nombre: FormControl<string>;
  id_tipo_servicio: FormControl<number | null>;
  fecha_inicio: FormControl<Date | string | null>;
  ultima_facturacion: FormControl<Date | string | null>;
  ultimo_pago: FormControl<string>;
}

interface ServicioEditForm {
  id: FormControl<number | null>;
  id_tipo_servicio: FormControl<number | null>;
  fecha_inicio: FormControl<Date | string | null>;
}

@Component({
  standalone: true,
  selector: 'app-servicios-principal',
  imports: [
    Card,
    CurrencyPipe,
    DatePipe,
    ReactiveFormsModule,
    NzButtonModule,
    NzDatePickerModule,
    NzFormModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzSelectModule,
    NzTableModule,
    NzTagModule,
  ],
  templateUrl: './principal.html',
  styleUrl: './principal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Principal implements OnInit {
  private readonly getservicesall = inject(Getservicesall);
  private readonly getserviciobyid = inject(Getserviciobyid);
  private readonly createservicio = inject(Createservicio);
  private readonly updateservicio = inject(Updateservicio);
  private readonly deleteservicio = inject(Deleteservicio);
  private readonly findclientebycedula = inject(Findclientebycedula);
  private readonly gettiposservicio = inject(Gettiposservicio);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly servicios = signal<Servicio[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isModalVisible = signal(false);
  readonly isEditModalVisible = signal(false);
  readonly isSaving = signal(false);
  readonly isLoadingEdit = signal(false);
  readonly modalErrorMessage = signal<string | null>(null);
  readonly editModalErrorMessage = signal<string | null>(null);
  readonly tiposServicio = signal<TipoServicio[]>([]);
  readonly clientesBusqueda = signal<Cliente[]>([]);
  readonly isSearchingCliente = signal(false);
  readonly clienteSearchError = signal<string | null>(null);
  readonly cedulaBusqueda = signal('');

  readonly servicioForm: FormGroup<ServicioForm> = this.fb.group({
    id_cliente: this.fb.control<number | null>(null, Validators.required),
    cliente_nombre: this.fb.control({ value: '', disabled: true }),
    id_tipo_servicio: this.fb.control<number | null>(null, Validators.required),
    fecha_inicio: this.fb.control<Date | string | null>(null, [
      Validators.required,
      (control) => this.validateDate(control.value),
    ]),
    ultima_facturacion: this.fb.control<Date | string | null>(null, [
      Validators.required,
      (control) => this.validateDate(control.value),
    ]),
    ultimo_pago: this.fb.control('', [
      Validators.required,
      Validators.pattern(ONLY_NUMBERS_PATTERN),
    ]),
  });

  readonly servicioEditForm: FormGroup<ServicioEditForm> = this.fb.group({
    id: this.fb.control<number | null>(null, Validators.required),
    id_tipo_servicio: this.fb.control<number | null>(null, Validators.required),
    fecha_inicio: this.fb.control<Date | string | null>(null, [
      Validators.required,
      (control) => this.validateDate(control.value),
    ]),
  });

  ngOnInit(): void {
    this.loadServicios();
    this.loadTiposServicio();
  }

  openCreateModal(): void {
    this.servicioForm.reset();
    this.cedulaBusqueda.set('');
    this.clientesBusqueda.set([]);
    this.clienteSearchError.set(null);
    this.modalErrorMessage.set(null);
    if (!this.tiposServicio().length) {
      this.loadTiposServicio();
    }
    this.isModalVisible.set(true);
  }

  closeCreateModal(): void {
    this.isModalVisible.set(false);
    this.modalErrorMessage.set(null);
    this.clienteSearchError.set(null);
    this.clientesBusqueda.set([]);
    this.cedulaBusqueda.set('');
    this.servicioForm.reset();
  }

  openEditModal(servicioId: number): void {
    this.servicioEditForm.reset();
    this.editModalErrorMessage.set(null);
    this.isEditModalVisible.set(true);
    this.isLoadingEdit.set(true);

    if (!this.tiposServicio().length) {
      this.loadTiposServicio();
    }

    this.getserviciobyid
      .getById(servicioId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoadingEdit.set(false)),
      )
      .subscribe({
        next: (response) => {
          if (!response.status || !response.datos) {
            this.editModalErrorMessage.set(response.mensaje || 'No se pudo cargar el servicio');
            return;
          }

          const servicio = response.datos;
          this.servicioEditForm.patchValue({
            id: servicio.id,
            id_tipo_servicio: servicio.id_tipo_servicio,
            fecha_inicio: this.parseDateValue(servicio.fecha_inicio),
          });
        },
        error: (error: any) => {
          console.error('Load service error:', error);
          const { mensaje } = error.error || { mensaje: 'No se pudo cargar el servicio' };
          this.editModalErrorMessage.set(mensaje || 'No se pudo cargar el servicio');
        }
      });
  }

  closeEditModal(): void {
    this.isEditModalVisible.set(false);
    this.editModalErrorMessage.set(null);
    this.servicioEditForm.reset();
  }

  guardarServicioEdit(): void {
    if (this.servicioEditForm.invalid || this.isSaving()) {
      this.servicioEditForm.markAllAsTouched();
      return;
    }

    const raw = this.servicioEditForm.getRawValue();
    const fechaInicio = this.formatDate(raw.fecha_inicio);

    if (!fechaInicio) {
      this.servicioEditForm.controls.fecha_inicio.setErrors({ invalidDate: true });
      return;
    }

    this.isSaving.set(true);
    this.editModalErrorMessage.set(null);

    this.updateservicio
      .update({
        id: raw.id!,
        id_tipo_servicio: raw.id_tipo_servicio!,
        fecha_inicio: fechaInicio,
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSaving.set(false)),
      )
      .subscribe({
        next: (response) => {
          if (response.status) {
            this.message.success('Servicio actualizado con éxito');
            this.closeEditModal();
            this.loadServicios();
            return;
          }

          this.editModalErrorMessage.set(response.mensaje || 'No se pudo actualizar el servicio');
        },
        error: (error: any) => {
          console.error('Update service error:', error);
          const { mensaje } = error.error || { mensaje: 'No se pudo actualizar el servicio' };
          this.editModalErrorMessage.set(mensaje || 'No se pudo actualizar el servicio');
        }
      });
  }

  confirmDeleteServicio(servicio: Servicio): void {
    this.modal.confirm({
      nzTitle: 'Eliminar servicio',
      nzContent: `¿Está seguro de que desea eliminar el servicio #${servicio.id}? Esta acción no se puede deshacer.`,
      nzOkText: 'Aceptar',
      nzCancelText: 'Cancelar',
      nzOkDanger: true,
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.deleteservicio.delete(servicio.id).subscribe({
            next: (response) => {
              if (response.status) {
                this.message.success('Servicio eliminado con éxito');
                this.loadServicios();
                resolve();
                return;
              }

              this.message.error(response.mensaje || 'No se pudo eliminar el servicio');
              reject();
            },
            error: (error: any) => {
              console.error('Delete service error:', error);
              const { mensaje } = error.error || { mensaje: 'No se pudo eliminar el servicio' };
              this.message.error(mensaje || 'No se pudo eliminar el servicio');
              reject();
            },
          });
        }),
    });
  }

  onCedulaInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const sanitized = input.value.replace(/\D/g, '');
    if (input.value !== sanitized) {
      input.value = sanitized;
    }
    this.cedulaBusqueda.set(sanitized);
  }

  buscarCliente(): void {
    const cedula = this.cedulaBusqueda().trim();
    if (!cedula) {
      this.clienteSearchError.set('Ingrese una cédula para buscar');
      this.clientesBusqueda.set([]);
      return;
    }

    if (!ONLY_NUMBERS_PATTERN.test(cedula)) {
      this.clienteSearchError.set('La cédula debe contener solo números');
      this.clientesBusqueda.set([]);
      return;
    }

    this.isSearchingCliente.set(true);
    this.clienteSearchError.set(null);
    this.clientesBusqueda.set([]);

    this.findclientebycedula
      .searchByCedula(cedula)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSearchingCliente.set(false)),
      )
      .subscribe({
        next: (clientes) => {
          if (!clientes.length) {
            this.clienteSearchError.set('No se encontraron clientes con esa cédula');
            return;
          }
          this.clientesBusqueda.set(clientes);
        },
        error: () =>
          this.clienteSearchError.set('No se pudo realizar la búsqueda de clientes'),
      });
  }

  seleccionarCliente(cliente: Cliente): void {
    this.servicioForm.controls.id_cliente.setValue(cliente.id);
    this.servicioForm.controls.id_cliente.markAsTouched();
    this.servicioForm.controls.cliente_nombre.setValue(
      `${cliente.nombres} ${cliente.apellidos}`.trim(),
    );
    this.clientesBusqueda.set([]);
    this.clienteSearchError.set(null);
  }

  onUltimoPagoInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const sanitized = input.value.replace(/\D/g, '');
    if (input.value !== sanitized) {
      input.value = sanitized;
      this.servicioForm.controls.ultimo_pago.setValue(sanitized);
    }
  }

  guardarServicio(): void {
    if (this.servicioForm.invalid || this.isSaving()) {
      this.servicioForm.markAllAsTouched();
      return;
    }

    const raw = this.servicioForm.getRawValue();
    const fechaInicio = this.formatDate(raw.fecha_inicio);
    const ultimaFacturacion = this.formatDate(raw.ultima_facturacion);

    if (!fechaInicio) {
      this.servicioForm.controls.fecha_inicio.setErrors({ invalidDate: true });
      return;
    }

    if (!ultimaFacturacion) {
      this.servicioForm.controls.ultima_facturacion.setErrors({ invalidDate: true });
      return;
    }

    this.isSaving.set(true);
    this.modalErrorMessage.set(null);

    this.createservicio
      .create({
        id_cliente: raw.id_cliente!,
        id_tipo_servicio: raw.id_tipo_servicio!,
        fecha_inicio: fechaInicio,
        ultima_facturacion: ultimaFacturacion,
        ultimo_pago: Number(raw.ultimo_pago),
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSaving.set(false)),
      )
      .subscribe({
        next: (response) => {
          if (response.status) {
            this.message.success('Servicio creado con éxito');
            this.closeCreateModal();
            this.loadServicios();
            return;
          }

          this.modalErrorMessage.set(response.mensaje || 'No se pudo crear el servicio');
        },
        error: (error: any) => {
          console.error('Create service error:', error);
          const { mensaje } = error.error || { mensaje: 'No se pudo crear el servicio' };
          this.modalErrorMessage.set(mensaje || 'No se pudo crear el servicio');
        }
      });
  }

  loadServicios(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.getservicesall
      .getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (servicios) => this.servicios.set(servicios),
        error: (error: any) => {
          console.error('Load services error:', error);
          const { mensaje } = error.error || { mensaje: 'No se pudieron cargar los servicios' };
          this.errorMessage.set(mensaje || 'No se pudieron cargar los servicios');
        }
      });
  }

  private loadTiposServicio(): void {
    this.gettiposservicio
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (tipos) => this.tiposServicio.set(tipos),
        error: (error: any) => {
          console.error('Load tipos de servicio error:', error);
          const { mensaje } = error.error || { mensaje: 'No se pudieron cargar los tipos de servicio' };
          this.modalErrorMessage.set(mensaje || 'No se pudieron cargar los tipos de servicio');
        }
      });
  }

  private validateDate(value: Date | string | null) {
    return this.formatDate(value) ? null : { invalidDate: true };
  }

  private parseDateValue(value: string): Date | null {
    if (!DATE_PATTERN.test(value)) {
      return null;
    }

    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private formatDate(value: Date | string | null): string | null {
    if (!value) {
      return null;
    }

    if (typeof value === 'string') {
      return DATE_PATTERN.test(value) ? value : null;
    }

    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    const formatted = `${year}-${month}-${day}`;

    return DATE_PATTERN.test(formatted) ? formatted : null;
  }
}
