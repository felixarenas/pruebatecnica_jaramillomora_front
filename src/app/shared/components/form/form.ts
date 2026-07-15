import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { NzFormDirective } from 'ng-zorro-antd/form';

export type FormSubmitHandler = (form: FormGroup) => void;

/**
 * Contenedor de formulario reutilizable.
 *
 * Se usa sobre un `<form>` nativo con un `FormGroup` del padre.
 * El método de submit se define con `(formSubmit)` o `[submitHandler]`.
 *
 * @example Con evento (recomendado)
 * ```html
 * <form app-form [formGroup]="loginForm" [layout]="'vertical'" (formSubmit)="login()">
 *   <input formControlName="login" />
 *   <button type="submit">Enviar</button>
 * </form>
 * ```
 *
 * @example Con método/callback explícito
 * ```html
 * <form app-form [formGroup]="clienteForm" [submitHandler]="guardarCliente">
 *   ...
 * </form>
 * ```
 *
 * Inputs vía host: `[formGroup]` (obligatorio), `[layout]` (nz-form).
 */
@Component({
  selector: 'form[app-form]',
  templateUrl: './form.html',
  styleUrl: './form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: NzFormDirective,
      inputs: ['nzLayout: layout'],
    },
  ],
  host: {
    class: 'app-form',
  },
})
export class Form {
  private readonly formGroupDir = inject(FormGroupDirective, { optional: true });
  private readonly destroyRef = inject(DestroyRef);

  /**
   * Si es true, marca todos los controles como touched y solo
   * notifica el submit cuando el formulario es válido.
   */
  readonly validateOnSubmit = input(true);

  /**
   * Método/callback opcional que se ejecuta al enviar el formulario.
   *
   * Usa una arrow function en el padre para conservar `this`:
   * `guardarCliente = () => { ... }`
   */
  readonly submitHandler = input<FormSubmitHandler | undefined>(undefined);

  /**
   * Emite el FormGroup al completar un submit válido (o siempre si
   * `validateOnSubmit` es false).
   */
  readonly formSubmit = output<FormGroup>();

  constructor() {
    if (!this.formGroupDir) {
      throw new Error(
        'app-form requiere [formGroup] en el mismo <form>. Ejemplo: <form app-form [formGroup]="miForm">',
      );
    }

    this.formGroupDir.ngSubmit.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.onSubmit();
    });
  }

  private onSubmit(): void {
    const formGroup = this.formGroupDir!.form;

    if (this.validateOnSubmit() && formGroup.invalid) {
      formGroup.markAllAsTouched();
      return;
    }

    this.submitHandler()?.(formGroup);
    this.formSubmit.emit(formGroup);
  }
}
