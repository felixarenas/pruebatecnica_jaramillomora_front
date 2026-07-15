import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../environments/environment';
import { Processifc } from './processifc';

describe('Processifc', () => {
  let service: Processifc;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(Processifc);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('debe enviar POST a process-ifc con el payload base64', () => {
    const dto = {
      nom_file: 'modelo_edificio',
      ext: 'ifc',
      size: 1024,
      base64: 'SUZDIEZJTEU=',
    };

    service.process(dto).subscribe((res) => {
      expect(res.status).toBe(true);
      expect(res.datos?.nombreArchivo).toBe('modelo_edificio.ifc');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/process-ifc`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);

    req.flush({
      codresp: 201,
      mensaje: 'Archivo IFC procesado y almacenado exitosamente',
      status: true,
      datos: {
        rutaCompleta: '/app/src/storage/modelo_edificio.ifc',
        nombreArchivo: 'modelo_edificio.ifc',
        sizeBytes: 1024,
        ext: 'ifc',
      },
    });
  });
});
