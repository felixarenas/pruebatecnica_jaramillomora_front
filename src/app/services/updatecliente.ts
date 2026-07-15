import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IApiResponse } from '../models/api-response.interface';
import { Api } from './client/api';
import { Cliente } from './getclienteall';

export interface UpdateClienteDto {
  id: number;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  numero_celular: string;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class Updatecliente {
  private readonly api = inject(Api);

  update(dto: UpdateClienteDto): Observable<IApiResponse<Cliente>> {
    return this.api.requestApi<Cliente>('PATCH', 'clientes/update', dto);
  }
}
