import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Api } from './client/api';

export interface TipoServicio {
  id: number;
  nombre: string;
}

@Injectable({
  providedIn: 'root',
})
export class Gettiposservicio {
  private readonly api = inject(Api);

  getAll(): Observable<TipoServicio[]> {
    return this.api.get<TipoServicio[]>('servicios/gettiposservicio');
  }
}
