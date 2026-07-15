import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IApiResponse } from '../models/api-response.interface';
import { Api } from './client/api';
import { Cliente } from './getclienteall';

@Injectable({
  providedIn: 'root',
})
export class Getclientebyid {
  private readonly api = inject(Api);

  getById(id: number): Observable<IApiResponse<Cliente>> {
    return this.api.requestApi<Cliente>('GET', 'clientes/findbyid', undefined, { params: { id } });
  }
}
