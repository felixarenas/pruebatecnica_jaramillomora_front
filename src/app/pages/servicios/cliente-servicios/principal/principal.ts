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
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';

import {
  Getserviciosbycliente,
  ServiciosByCliente,
} from '../../../../services/getserviciosbycliente';
import { Getidentitytypes, TipoIdentificacion } from '../../../../services/getidentitytypes';
import { Card } from '../../../../shared/components/card/card';

const ONLY_NUMBERS_PATTERN = /^\d+$/;

interface BusquedaClienteServiciosForm {
  id_tipo_identificacion: FormControl<number | null>;
  numero_identificacion: FormControl<string>;
}

@Component({
  standalone: true,
  selector: 'app-cliente-servicios-principal',
  imports: [
    Card,
    CurrencyPipe,
    DatePipe,
    ReactiveFormsModule,
    NzButtonModule,
    NzFormModule,
    NzIconModule,
    NzInputModule,
    NzSelectModule,
    NzTableModule,
    NzTagModule,
  ],
  templateUrl: './principal.html',
  styleUrl: './principal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Principal implements OnInit {
  private readonly getidentitytypes = inject(Getidentitytypes);
  private readonly getserviciosbycliente = inject(Getserviciosbycliente);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly tiposIdentificacion = signal<TipoIdentificacion[]>([]);
  readonly isSearching = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly resultado = signal<ServiciosByCliente | null>(null);

  readonly busquedaForm: FormGroup<BusquedaClienteServiciosForm> = this.fb.group({
    id_tipo_identificacion: this.fb.control<number | null>(null, Validators.required),
    numero_identificacion: this.fb.control('', [
      Validators.required,
      Validators.pattern(ONLY_NUMBERS_PATTERN),
    ]),
  });

  ngOnInit(): void {
    this.loadTiposIdentificacion();
  }

  onNumeroIdentificacionInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const sanitized = input.value.replace(/\D/g, '');
    if (input.value !== sanitized) {
      input.value = sanitized;
      this.busquedaForm.controls.numero_identificacion.setValue(sanitized);
    }
  }

  buscar(): void {
    if (this.busquedaForm.invalid || this.isSearching()) {
      this.busquedaForm.markAllAsTouched();
      return;
    }

    const raw = this.busquedaForm.getRawValue();

    this.isSearching.set(true);
    this.errorMessage.set(null);
    this.resultado.set(null);

    this.getserviciosbycliente
      .getByClienteApi({
        id_tipo_identificacion: raw.id_tipo_identificacion!,
        identificacion: Number(raw.numero_identificacion),
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSearching.set(false)),
      )
      .subscribe({
        next: (response) => {
          if (response.status && response.datos) {
            this.resultado.set(response.datos);
            return;
          }

          this.errorMessage.set(
            response.mensaje || 'No se encontraron servicios para el cliente',
          );
        },
        error: (error: unknown) => {
          console.error('Search servicios by cliente error:', error);
          const backendError = (error as { error?: { mensaje?: string } }).error;
          const mensaje =
            backendError?.mensaje || 'No se pudo consultar los servicios del cliente';
          this.errorMessage.set(mensaje);
        },
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
}
