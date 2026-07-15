import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../environments/environment';
import { Getservicesall } from './getservicesall';

describe('Getservicesall', () => {
  let service: Getservicesall;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(Getservicesall);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all servicios from servicios/getall', () => {
    const servicios = [
      {
        id: 1,
        id_cliente: 1,
        nom_cliente: 'Juan Pérez',
        id_tipo_servicio: 1,
        tipo_servicio: 'Internet residencial',
        fecha_inicio: '2024-01-15',
        ultima_facturacion: '2024-06-01',
        ultimo_pago: 50000,
        estado: true,
      },
    ];

    service.getAll().subscribe((response) => {
      expect(response).toEqual(servicios);
    });

    const request = httpMock.expectOne(`${environment.apiUrl}/servicios/getall`);
    expect(request.request.method).toBe('GET');
    request.flush({
      codresp: 200,
      mensaje: 'Servicios consultados exitosamente',
      status: true,
      datos: servicios,
    });
  });
});
