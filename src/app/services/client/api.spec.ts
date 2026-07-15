import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { Api } from './api';

describe('Api', () => {
  let service: Api;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(Api);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should resolve relative urls against environment.apiUrl', () => {
    expect(service.resolveUrl('clientes')).toBe(`${environment.apiUrl}/clientes`);
    expect(service.resolveUrl('/clientes')).toBe(`${environment.apiUrl}/clientes`);
  });

  it('should keep absolute urls unchanged', () => {
    const absoluteUrl = 'https://example.com/api/resource';
    expect(service.resolveUrl(absoluteUrl)).toBe(absoluteUrl);
  });

  it('should unwrap successful IApiResponse on GET', () => {
    const datos = { id: 1, nombre: 'Cliente demo' };

    service.get<typeof datos>('clientes/findbyid?id=1').subscribe((response) => {
      expect(response).toEqual(datos);
    });

    const request = httpMock.expectOne(`${environment.apiUrl}/clientes/findbyid?id=1`);
    expect(request.request.method).toBe('GET');
    request.flush({
      codresp: 200,
      mensaje: 'Consulta exitosa',
      status: true,
      datos,
    });
  });

  it('should throw backend message when IApiResponse status is false', () => {
    let errorMessage = '';

    service.get('clientes/findbyid?id=99').subscribe({
      next: () => {
        throw new Error('expected error');
      },
      error: (error: Error) => {
        errorMessage = error.message;
      },
    });

    const request = httpMock.expectOne(`${environment.apiUrl}/clientes/findbyid?id=99`);
    request.flush({
      codresp: 404,
      mensaje: 'Cliente no encontrado',
      status: false,
      datos: null,
    });

    expect(errorMessage).toBe('Cliente no encontrado');
  });

  it('should support POST to any endpoint', () => {
    const payload = { nombre: 'Nuevo servicio' };
    const datos = { id: 10, ...payload };

    service.post<typeof datos>('servicios', payload).subscribe((response) => {
      expect(response).toEqual(datos);
    });

    const request = httpMock.expectOne(`${environment.apiUrl}/servicios`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({
      codresp: 201,
      mensaje: 'Servicio creado',
      status: true,
      datos,
    });
  });

  it('should return raw response when unwrapResponse is false', () => {
    const apiResponse = {
      codresp: 200,
      mensaje: 'OK',
      status: true,
      datos: { ok: true },
    };

    service.get('health', { unwrapResponse: false }).subscribe((response) => {
      expect(response).toEqual(apiResponse);
    });

    const request = httpMock.expectOne(`${environment.apiUrl}/health`);
    request.flush(apiResponse);
  });
});
