import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IApiResponse } from '../models/api-response.interface';
import { Api } from './client/api';
import { Cliente } from './getclienteall';

export interface CreateClienteDto {
  id_tipo_identificacion: number;
  identificacion: number;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  numero_celular: string;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class Createcliente {
  private readonly api = inject(Api);

  create(dto: CreateClienteDto): Observable<IApiResponse<Cliente>> {
    return this.api.requestApi<Cliente>('POST', 'clientes', dto);
  }
}
