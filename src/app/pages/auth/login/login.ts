import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormControl, FormsModule, FormBuilder, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { Auth } from '../../../services/auth';

interface LoginForm {
  login: FormControl<string>;
  passwd: FormControl<string>;
}
@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly auth = inject(Auth);
  private readonly destroyRef = inject(DestroyRef);

  loginForm: FormGroup;
  protected readonly date = new Date();
  readonly errorMessage = signal<string | null>(null);
  readonly isLoading = signal(false);

  // public method
  SignInOptions = [
    {
      image: 'assets/images/authentication/google.svg',
      name: 'Google'
    },
    {
      image: 'assets/images/authentication/twitter.svg',
      name: 'Twitter'
    },
    {
      image: 'assets/images/authentication/facebook.svg',
      name: 'Facebook'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {

    this.loginForm = this.fb.group<LoginForm>({
      login: this.fb.control('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }),
      passwd: this.fb.control('', { nonNullable: true, validators: [Validators.required] })
    })
  }

  login() {
    if (!this.loginForm.valid) {
      return;
    }

    this.errorMessage.set(null);
    this.isLoading.set(true);

    const { login, passwd } = this.loginForm.getRawValue();

    this.auth
      .login({ login, passwd })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (response) => this.router.navigate(['/home']),
        error: (error: any) => {
          //console.log('Login error:', error);
          const { mensaje } = error.error || { mensaje: 'No se pudo iniciar sesión' };
          this.errorMessage.set(mensaje || 'No se pudo iniciar sesión');
        }
      });
  }
}
