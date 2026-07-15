import { DatePipe } from '@angular/common';
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

import { Createcliente } from '../../../services/createcliente';
import { Deletecliente } from '../../../services/deletecliente';
import { Getclienteall, Cliente } from '../../../services/getclienteall';
import { Getclientebyid } from '../../../services/getclientebyid';
import { Getidentitytypes, TipoIdentificacion } from '../../../services/getidentitytypes';
import { Updatecliente } from '../../../services/updatecliente';
import { Card } from '../../../shared/components/card/card';

const ONLY_LETTERS_PATTERN = /^[a-zA-Z]+(?: [a-zA-Z]+)*$/;
const ONLY_NUMBERS_PATTERN = /^\d+$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const CELLPHONE_PATTERN = /^\d{10}$/;

interface ClienteForm {
  id_tipo_identificacion: FormControl<number | null>;
  identificacion: FormControl<string>;
  nombres: FormControl<string>;
  apellidos: FormControl<string>;
  fecha_nacimiento: FormControl<Date | string | null>;
  numero_celular: FormControl<string>;
  email: FormControl<string>;
}

interface ClienteEditForm {
  id: FormControl<number | null>;
  nombres: FormControl<string>;
  apellidos: FormControl<string>;
  fecha_nacimiento: FormControl<Date | string | null>;
  numero_celular: FormControl<string>;
  email: FormControl<string>;
}

@Component({
  standalone: true,
  selector: 'app-clientes-principal',
  imports: [
    Card,
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
  private readonly getclienteall = inject(Getclienteall);
  private readonly getclientebyid = inject(Getclientebyid);
  private readonly createcliente = inject(Createcliente);
  private readonly updatecliente = inject(Updatecliente);
  private readonly deletecliente = inject(Deletecliente);
  private readonly getidentitytypes = inject(Getidentitytypes);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly clientes = signal<Cliente[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isModalVisible = signal(false);
  readonly isEditModalVisible = signal(false);
  readonly isSaving = signal(false);
  readonly isLoadingEdit = signal(false);
  readonly modalErrorMessage = signal<string | null>(null);
  readonly editModalErrorMessage = signal<string | null>(null);
  readonly tiposIdentificacion = signal<TipoIdentificacion[]>([]);

  readonly clienteForm: FormGroup<ClienteForm> = this.fb.group({
    id_tipo_identificacion: this.fb.control<number | null>(null, Validators.required),
    identificacion: this.fb.control('', [
      Validators.required,
      Validators.pattern(ONLY_NUMBERS_PATTERN),
    ]),
    nombres: this.fb.control('', [
      Validators.required,
      Validators.pattern(ONLY_LETTERS_PATTERN),
    ]),
    apellidos: this.fb.control('', [
      Validators.required,
      Validators.pattern(ONLY_LETTERS_PATTERN),
    ]),
    fecha_nacimiento: this.fb.control<Date | string | null>(null, [
      Validators.required,
      (control) => this.validateFechaNacimiento(control.value),
    ]),
    numero_celular: this.fb.control('', [
      Validators.required,
      Validators.pattern(CELLPHONE_PATTERN),
    ]),
    email: this.fb.control('', [Validators.required, Validators.email]),
  });

  readonly clienteEditForm: FormGroup<ClienteEditForm> = this.fb.group({
    id: this.fb.control<number | null>(null, Validators.required),
    nombres: this.fb.control('', [
      Validators.required,
      Validators.pattern(ONLY_LETTERS_PATTERN),
    ]),
    apellidos: this.fb.control('', [
      Validators.required,
      Validators.pattern(ONLY_LETTERS_PATTERN),
    ]),
    fecha_nacimiento: this.fb.control<Date | string | null>(null, [
      Validators.required,
      (control) => this.validateFechaNacimiento(control.value),
    ]),
    numero_celular: this.fb.control('', [
      Validators.required,
      Validators.pattern(CELLPHONE_PATTERN),
    ]),
    email: this.fb.control('', [Validators.required, Validators.email]),
  });

  ngOnInit(): void {
    this.loadClientes();
    this.loadTiposIdentificacion();
  }

  openCreateModal(): void {
    this.clienteForm.reset();
    this.modalErrorMessage.set(null);
    this.isModalVisible.set(true);
  }

  closeCreateModal(): void {
    this.isModalVisible.set(false);
    this.modalErrorMessage.set(null);
    this.clienteForm.reset();
  }

  openEditModal(clienteId: number): void {
    this.clienteEditForm.reset();
    this.editModalErrorMessage.set(null);
    this.isEditModalVisible.set(true);
    this.isLoadingEdit.set(true);

    this.getclientebyid
      .getById(clienteId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoadingEdit.set(false)),
      )
      .subscribe({
        next: (response) => {
          if (!response.status || !response.datos) {
            this.editModalErrorMessage.set(response.mensaje || 'No se pudo cargar el cliente');
            return;
          }

          const cliente = response.datos;
          console.log('Cliente data:', cliente);
          this.clienteEditForm.patchValue({
            id: cliente.id,
            nombres: cliente.nombres,
            apellidos: cliente.apellidos,
            fecha_nacimiento: this.parseDateValue(cliente.fecha_nacimiento),
            numero_celular: cliente.numero_celular,
            email: cliente.email,
          });
        },
        error: (error: any) => {
          console.log('Edit client error:', error);
          const { mensaje } = error.error || { mensaje: 'No se pudo cargar el cliente' };
          this.editModalErrorMessage.set(mensaje || 'No se pudo cargar el cliente');
        }
      });
  }

  closeEditModal(): void {
    this.isEditModalVisible.set(false);
    this.editModalErrorMessage.set(null);
    this.clienteEditForm.reset();
  }

  guardarClienteEdit(): void {
    if (this.clienteEditForm.invalid || this.isSaving()) {
      this.clienteEditForm.markAllAsTouched();
      return;
    }

    const raw = this.clienteEditForm.getRawValue();
    const fechaNacimiento = this.formatFechaNacimiento(raw.fecha_nacimiento);

    if (!fechaNacimiento) {
      this.clienteEditForm.controls.fecha_nacimiento.setErrors({ invalidDate: true });
      return;
    }

    this.isSaving.set(true);
    this.editModalErrorMessage.set(null);

    this.updatecliente
      .update({
        id: raw.id!,
        nombres: raw.nombres.trim(),
        apellidos: raw.apellidos.trim(),
        fecha_nacimiento: fechaNacimiento,
        numero_celular: raw.numero_celular,
        email: raw.email.trim(),
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSaving.set(false)),
      )
      .subscribe({
        next: (response) => {
          if (response.status) {
            this.message.success('Cliente actualizado con éxito');
            this.closeEditModal();
            this.loadClientes();
            return;
          }

          this.editModalErrorMessage.set(response.mensaje || 'No se pudo actualizar el cliente');
        },
        error: (error: any) => {
          console.error('Update client error:', error);
          const { mensaje } = error.error || { mensaje: 'No se pudo actualizar el cliente' };
          this.editModalErrorMessage.set(mensaje || 'No se pudo actualizar el cliente');
        }
      });
  }

  confirmDeleteCliente(cliente: Cliente): void {
    this.modal.confirm({
      nzTitle: 'Eliminar cliente',
      nzContent: `¿Está seguro de que desea eliminar el cliente ${cliente.nombres} ${cliente.apellidos}? Esta acción no se puede deshacer.`,
      nzOkText: 'Aceptar',
      nzCancelText: 'Cancelar',
      nzOkDanger: true,
      nzOnOk: () =>
        new Promise<void>((resolve, reject) => {
          this.deletecliente.delete(cliente.id).subscribe({
            next: (response) => {
              if (response.status) {
                this.message.success('Cliente eliminado con éxito');
                this.loadClientes();
                resolve();
                return;
              }

              this.message.error(response.mensaje || 'No se pudo eliminar el cliente');
              reject();
            },
            error: (error: any) => {
              console.error('Delete client error:', error);
              const { mensaje } = error.error || { mensaje: 'No se pudo eliminar el cliente' };
              this.message.error(mensaje || 'No se pudo eliminar el cliente');
              reject();
            },
          });
        }),
    });
  }

  onNumericInput(
    event: Event,
    controlName: 'identificacion' | 'numero_celular',
    form: 'create' | 'edit' = 'create',
  ): void {
    const input = event.target as HTMLInputElement;
    const sanitized = input.value.replace(/\D/g, '');
    if (input.value !== sanitized) {
      input.value = sanitized;
      if (form === 'edit') {
        this.clienteEditForm.controls.numero_celular.setValue(sanitized);
      } else {
        this.clienteForm.controls[controlName].setValue(sanitized);
      }
    }
  }

  onLettersInput(
    event: Event,
    controlName: 'nombres' | 'apellidos',
    form: 'create' | 'edit' = 'create',
  ): void {
    const input = event.target as HTMLInputElement;
    const sanitized = input.value.replace(/[^a-zA-Z ]/g, '');
    if (input.value !== sanitized) {
      input.value = sanitized;
      const targetForm = form === 'edit' ? this.clienteEditForm : this.clienteForm;
      targetForm.controls[controlName].setValue(sanitized);
    }
  }

  guardarCliente(): void {
    if (this.clienteForm.invalid || this.isSaving()) {
      this.clienteForm.markAllAsTouched();
      return;
    }

    const raw = this.clienteForm.getRawValue();
    const fechaNacimiento = this.formatFechaNacimiento(raw.fecha_nacimiento);

    if (!fechaNacimiento) {
      this.clienteForm.controls.fecha_nacimiento.setErrors({ invalidDate: true });
      return;
    }

    this.isSaving.set(true);
    this.modalErrorMessage.set(null);

    this.createcliente
      .create({
        id_tipo_identificacion: raw.id_tipo_identificacion!,
        identificacion: Number(raw.identificacion),
        nombres: raw.nombres.trim(),
        apellidos: raw.apellidos.trim(),
        fecha_nacimiento: fechaNacimiento,
        numero_celular: raw.numero_celular,
        email: raw.email.trim(),
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSaving.set(false)),
      )
      .subscribe({
        next: (response) => {
          if (response.status) {
            this.message.success('Cliente creado con éxito');
            this.closeCreateModal();
            this.loadClientes();
            return;
          }

          this.modalErrorMessage.set(response.mensaje || 'No se pudo crear el cliente');
        },
        error: (error: any) => {
          console.error('Create client error:', error);
          const { mensaje } = error.error || { mensaje: 'No se pudo crear el cliente' };
          this.modalErrorMessage.set(mensaje || 'No se pudo crear el cliente');
        }
      });
  }

  loadClientes(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.getclienteall
      .getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (clientes) => this.clientes.set(clientes),
        error: (error: any) => {
          console.error('Load clients error:', error);
          const { mensaje } = error.error || { mensaje: 'No se pudieron cargar los clientes' };
          this.errorMessage.set(mensaje || 'No se pudieron cargar los clientes');
        }
      });
  }

  private loadTiposIdentificacion(): void {
    this.getidentitytypes
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (tipos) => this.tiposIdentificacion.set(tipos),
      });
  }

  private validateFechaNacimiento(value: Date | string | null) {
    const formatted = this.formatFechaNacimiento(value);
    return formatted ? null : { invalidDate: true };
  }

  private parseDateValue(value: string): Date | null {
    
    const [fecha, hora] = value.split('T');
    console.log("fecha:", fecha, "hora:", hora);
    
    if (!DATE_PATTERN.test(fecha)) {
      return null;
    }
    
    const [year, month, day] = fecha.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private formatFechaNacimiento(value: Date | string | null): string | null {
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
