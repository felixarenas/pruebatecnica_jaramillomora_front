import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';

import { Api } from './client/api';

export interface TipoIdentificacion {
  id: number;
  abr: string;
  name: string;
}

const TIPOS_IDENTIFICACION_FALLBACK: TipoIdentificacion[] = [
  { id: 1, abr: 'CN', name: 'Certificado de Nacido Vivo' },
  { id: 2, abr: 'RC', name: 'Registro Civil de Nacimiento' },
  { id: 3, abr: 'TI', name: 'Tarjeta de Identidad' },
  { id: 4, abr: 'CC', name: 'Cédula de Ciudadanía' },
  { id: 5, abr: 'CE', name: 'Cédula de Extranjería' },
  { id: 6, abr: 'PA', name: 'Pasaporte' },
  { id: 7, abr: 'CD', name: 'Carné Diplomático' },
  { id: 8, abr: 'MS', name: 'Menor sin Identificación' },
  { id: 9, abr: 'AS', name: 'Adulto sin Identificación' },
  { id: 10, abr: 'SC', name: 'Salvoconducto de Permanencia' },
  { id: 11, abr: 'PE', name: 'Permiso Especial de Permanencia' },
  { id: 12, abr: 'PT', name: 'Permiso de Protección Temporal' },
  { id: 13, abr: 'DE', name: 'Documento Extranjero' },
  { id: 14, abr: 'OTROS', name: 'Otro tipo de documento' },
  { id: 15, abr: 'TE', name: 'Tarjeta de Extranjería' },
  { id: 16, abr: 'NIT', name: 'Número de Identificación Tributaria' },
];

@Injectable({
  providedIn: 'root',
})
export class Getidentitytypes {
  private readonly api = inject(Api);

  getAll(): Observable<TipoIdentificacion[]> {
    return this.api.get<TipoIdentificacion[]>('clientes/gettiposidentity').pipe(
      catchError(() => of(TIPOS_IDENTIFICACION_FALLBACK)),
    );
  }
}
