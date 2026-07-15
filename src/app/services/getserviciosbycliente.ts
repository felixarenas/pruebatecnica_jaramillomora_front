import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IApiResponse } from '../models/api-response.interface';
import { Api } from './client/api';

export interface ServicioByClienteItem {
  id_servicio: number;
  nom_servicio: string;
  fecha_inicio: string;
  ultima_facturacion: string;
  ultimo_pago: number;
  estado_servicio: boolean;
}

export interface ServiciosByCliente {
  id_cliente: number;
  nom_cliente: string;
  tipo_identificacion: string;
  numero_identificacion: number;
  servicios: ServicioByClienteItem[];
}

export interface GetServiciosByClienteParams {
  id_tipo_identificacion: number;
  identificacion: number;
}

@Injectable({
  providedIn: 'root',
})
export class Getserviciosbycliente {
  private readonly api = inject(Api);

  getByCliente(params: GetServiciosByClienteParams): Observable<ServiciosByCliente> {
    return this.api.get<ServiciosByCliente>('servicios/getServiciosByCliente', {
      params: {
        id_tipo_identificacion: params.id_tipo_identificacion,
        identificacion: params.identificacion,
      },
    });
  }

  getByClienteApi(
    params: GetServiciosByClienteParams,
  ): Observable<IApiResponse<ServiciosByCliente>> {
    return this.api.requestApi<ServiciosByCliente>(
      'GET',
      'servicios/getServiciosByCliente',
      undefined,
      {
        params: {
          id_tipo_identificacion: params.id_tipo_identificacion,
          identificacion: params.identificacion,
        },
      },
    );
  }
}
