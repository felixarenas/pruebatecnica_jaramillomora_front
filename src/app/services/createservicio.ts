import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IApiResponse } from '../models/api-response.interface';
import { Api } from './client/api';
import { Servicio } from './getservicesall';

export interface CreateServicioDto {
  id_cliente: number;
  id_tipo_servicio: number;
  fecha_inicio: string;
  ultima_facturacion: string;
  ultimo_pago: number;
}

@Injectable({
  providedIn: 'root',
})
export class Createservicio {
  private readonly api = inject(Api);

  create(dto: CreateServicioDto): Observable<IApiResponse<Servicio>> {
    return this.api.requestApi<Servicio>('POST', 'servicios', dto);
  }
}
