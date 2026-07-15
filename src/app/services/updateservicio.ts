import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IApiResponse } from '../models/api-response.interface';
import { Api } from './client/api';
import { Servicio } from './getservicesall';

export interface UpdateServicioDto {
  id: number;
  id_tipo_servicio: number;
  fecha_inicio: string;
}

@Injectable({
  providedIn: 'root',
})
export class Updateservicio {
  private readonly api = inject(Api);

  update(dto: UpdateServicioDto): Observable<IApiResponse<Servicio>> {
    return this.api.requestApi<Servicio>('PATCH', 'servicios/update', dto);
  }
}
