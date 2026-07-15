import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Api } from './client/api';

export interface Cliente {
  id: number;
  id_tipo_identificacion: number;
  identificacion: number;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  numero_celular: string;
  email: string;
  estado: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class Getclienteall {
  private readonly api = inject(Api);

  getAll(): Observable<Cliente[]> {
    return this.api.get<Cliente[]>('clientes/getall');
  }
}
