import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Form } from './form';

@Component({
  selector: 'app-form-host',
  imports: [Form, ReactiveFormsModule],
  template: `
    <form
      app-form
      [formGroup]="demoForm"
      [submitHandler]="onSubmitHandler"
      (formSubmit)="onFormSubmit($event)"
    >
      <input formControlName="nombre" />
      <button type="submit">Enviar</button>
    </form>
  `,
})
class FormHost {
  readonly demoForm = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  lastEmitted: FormGroup | null = null;
  handlerCalls = 0;

  onSubmitHandler = (_form: FormGroup): void => {
    this.handlerCalls += 1;
  };

  onFormSubmit(form: FormGroup): void {
    this.lastEmitted = form;
  }
}

describe('Form', () => {
  let host: FormHost;
  let fixture: ComponentFixture<FormHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormHost],
    }).compileComponents();

    fixture = TestBed.createComponent(FormHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(host).toBeTruthy();
  });

  it('no debe emitir submit si el formulario es inválido', () => {
    const formEl: HTMLFormElement = fixture.nativeElement.querySelector('form');
    formEl.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(host.handlerCalls).toBe(0);
    expect(host.lastEmitted).toBeNull();
    expect(host.demoForm.touched).toBe(true);
  });

  it('debe ejecutar submitHandler y emitir formSubmit si es válido', () => {
    host.demoForm.controls.nombre.setValue('Symphony');
    fixture.detectChanges();

    const formEl: HTMLFormElement = fixture.nativeElement.querySelector('form');
    formEl.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(host.handlerCalls).toBe(1);
    expect(host.lastEmitted).toBe(host.demoForm);
  });
});
