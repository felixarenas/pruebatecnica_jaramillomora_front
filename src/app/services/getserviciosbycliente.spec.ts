import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../environments/environment';
import { Getserviciosbycliente } from './getserviciosbycliente';

describe('Getserviciosbycliente', () => {
  let service: Getserviciosbycliente;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(Getserviciosbycliente);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch servicios by cliente from servicios/getServiciosByCliente', () => {
    const response = {
      id_cliente: 1,
      nom_cliente: 'Juan Pérez',
      tipo_identificacion: 'Cédula de ciudadanía',
      numero_identificacion: 1234567890,
      servicios: [
        {
          id_servicio: 1,
          nom_servicio: 'Internet residencial',
          fecha_inicio: '2024-01-15',
          ultima_facturacion: '2024-06-01',
          ultimo_pago: 50000,
          estado_servicio: true,
        },
      ],
    };

    service
      .getByCliente({ id_tipo_identificacion: 1, identificacion: 1234567890 })
      .subscribe((result) => {
        expect(result).toEqual(response);
      });

    const request = httpMock.expectOne(
      `${environment.apiUrl}/servicios/getServiciosByCliente?id_tipo_identificacion=1&identificacion=1234567890`,
    );
    expect(request.request.method).toBe('GET');
    request.flush({
      codresp: 200,
      mensaje: 'Servicios del cliente consultados exitosamente',
      status: true,
      datos: response,
    });
  });
});
