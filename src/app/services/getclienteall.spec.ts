import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../environments/environment';
import { Getclienteall } from './getclienteall';

describe('Getclienteall', () => {
  let service: Getclienteall;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(Getclienteall);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all clientes from clientes/getall', () => {
    const clientes = [
      {
        id: 1,
        id_tipo_identificacion: 4,
        identificacion: 1234567890,
        nombres: 'Juan',
        apellidos: 'Pérez',
        fecha_nacimiento: '1990-05-15',
        numero_celular: '3001234567',
        email: 'juan@example.com',
        estado: true,
      },
    ];

    service.getAll().subscribe((response) => {
      expect(response).toEqual(clientes);
    });

    const request = httpMock.expectOne(`${environment.apiUrl}/clientes/getall`);
    expect(request.request.method).toBe('GET');
    request.flush({
      codresp: 200,
      mensaje: 'Clientes consultados exitosamente',
      status: true,
      datos: clientes,
    });
  });
});
