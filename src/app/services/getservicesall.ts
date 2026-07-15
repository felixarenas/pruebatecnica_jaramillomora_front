import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Api } from './client/api';

export interface Servicio {
  id: number;
  id_cliente: number;
  nom_cliente: string;
  id_tipo_servicio: number;
  tipo_servicio: string;
  fecha_inicio: string;
  ultima_facturacion: string;
  ultimo_pago: number;
  estado: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class Getservicesall {
  private readonly api = inject(Api);

  getAll(): Observable<Servicio[]> {
    return this.api.get<Servicio[]>('servicios/getall');
  }
}
