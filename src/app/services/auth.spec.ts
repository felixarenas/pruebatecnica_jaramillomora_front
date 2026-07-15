import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../environments/environment';
import { Auth } from './auth';

describe('Auth', () => {
  let service: Auth;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(Auth);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login and store accessToken in sessionStorage', () => {
    const credentials = { login: 'perezp@delenaionales.com', passwd: 'secret' };
    const loginData = {
      accessToken: 'jwt-token-example',
      user: {
        id: 1,
        full_name: 'perez agudelo',
        email: 'perezp@delenaionales.com',
      },
    };

    service.login(credentials).subscribe((response) => {
      expect(response).toEqual(loginData);
      expect(service.getAccessToken()).toBe('jwt-token-example');
    });

    const request = httpMock.expectOne(`${environment.apiUrl}/users/auth/login`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(credentials);
    request.flush({
      codresp: 200,
      mensaje: 'Operación exitosa',
      status: true,
      datos: loginData,
    });
  });

  it('should clear accessToken from sessionStorage', () => {
    service.setAccessToken('jwt-token-example');
    service.clearAccessToken();
    expect(service.getAccessToken()).toBeNull();
  });
});
