import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';

import { Api } from './client/api';
import { Cliente, Getclienteall } from './getclienteall';

@Injectable({
  providedIn: 'root',
})
export class Findclientebycedula {
  private readonly api = inject(Api);
  private readonly getclienteall = inject(Getclienteall);

  searchByCedula(cedula: string): Observable<Cliente[]> {
    const term = cedula.trim();
    if (!term || !/^\d+$/.test(term)) {
      return of([]);
    }

    return this.getclienteall.getAll().pipe(
      map((clientes) =>
        clientes.filter((cliente) => String(cliente.identificacion).includes(term)),
      ),
      catchError(() =>
        this.api
          .get<Cliente>('clientes/findbyidentity', { params: { identificacion: term } })
          .pipe(
            map((cliente) => [cliente]),
            catchError(() => of([])),
          ),
      ),
    );
  }
}
