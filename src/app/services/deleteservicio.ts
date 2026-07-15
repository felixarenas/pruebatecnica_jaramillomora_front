import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IApiResponse } from '../models/api-response.interface';
import { Api } from './client/api';
import { Servicio } from './getservicesall';

@Injectable({
  providedIn: 'root',
})
export class Deleteservicio {
  private readonly api = inject(Api);

  delete(id: number): Observable<IApiResponse<Servicio>> {
    return this.api.requestApi<Servicio>('DELETE', 'servicios', undefined, { params: { id } });
  }
}
