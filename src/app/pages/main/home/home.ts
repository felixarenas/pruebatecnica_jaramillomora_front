import { Component, inject } from '@angular/core';
import { Card } from '../../../shared/components/card/card';
import { InputText } from '../../../shared/components/input-text/input-text';
import { Datapicker } from '../../../shared/components/datapicker/datapicker';
import { FormControl, FormGroup } from '@angular/forms';

import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';

import { NzFormModule } from 'ng-zorro-antd/form';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [Card, InputText, ReactiveFormsModule, NzFormModule, Datapicker],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {

  private fb = inject(NonNullableFormBuilder);

  miFormulario = this.fb.group({
    nombre: new FormControl('', Validators.required),
    fechaNacimiento: new FormControl('', Validators.required),
    correo: new FormControl('', [Validators.required, Validators.email]),
  });
}
