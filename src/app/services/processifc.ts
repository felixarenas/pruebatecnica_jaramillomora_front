import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IApiResponse } from '../models/api-response.interface';
import { Api } from './client/api';

/** Payload enviado a `POST process-ifc` (archivo en base64). */
export interface ProcessIfcDto {
  nom_file: string;
  ext: string;
  size: number;
  base64: string;
}

/** Respuesta `datos` del backend tras guardar el archivo en storage. */
export interface ProcessIfcResult {
  rutaCompleta: string;
  nombreArchivo: string;
  sizeBytes: number;
  ext: string;
}

/** Ítem listado por `GET process-ifc/getFileIfcAll`. */
export interface ProcessIfcFileItem {
  nom_file: string;
  url: string;
}

/**
 * Envía un archivo (IFC u otra extensión) codificado en base64
 * al endpoint `POST /api/v1/process-ifc` para almacenarlo en el backend.
 */
@Injectable({
  providedIn: 'root',
})
export class Processifc {
  private readonly api = inject(Api);

  /**
   * Procesa y guarda el archivo en el storage del backend.
   *
   * @param dto JSON con nom_file, ext, size y base64
   */
  process(dto: ProcessIfcDto): Observable<IApiResponse<ProcessIfcResult>> {
    return this.api.requestApi<ProcessIfcResult>('POST', 'process-ifc', dto);
  }

  /**
   * Obtiene la lista de archivos IFC disponibles en el backend.
   */
  getFileIfcAll(): Observable<IApiResponse<ProcessIfcFileItem[]>> {
    return this.api.requestApi<ProcessIfcFileItem[]>('GET', 'process-ifc/getFileIfcAll');
  }

  processGrafic(nom_file: string): Observable<IApiResponse<ProcessIfcResult>> {
    return this.api.requestApi<ProcessIfcResult>('POST', 'process-ifc/process-property-sets-ifc', { nom_file });
  }
}
