import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IApiResponse } from '../models/api-response.interface';
import { Api } from './client/api';
import { Cliente } from './getclienteall';

@Injectable({
  providedIn: 'root',
})
export class Deletecliente {
  private readonly api = inject(Api);

  delete(id: number): Observable<IApiResponse<Cliente>> {
    return this.api.requestApi<Cliente>('DELETE', 'clientes', undefined, { params: { id } });
  }
}
