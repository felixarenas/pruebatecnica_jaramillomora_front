import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IApiResponse } from '../models/api-response.interface';
import { Api } from './client/api';

export interface ServicioDetail {
  id: number;
  id_cliente: number;
  id_tipo_servicio: number;
  fecha_inicio: string;
  ultima_facturacion: string;
  ultimo_pago: number;
  estado: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class Getserviciobyid {
  private readonly api = inject(Api);

  getById(id: number): Observable<IApiResponse<ServicioDetail>> {
    return this.api.requestApi<ServicioDetail>('GET', 'servicios/findbyid', undefined, { params: { id } });
  }
}
