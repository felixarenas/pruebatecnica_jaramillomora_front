import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { Getserviciosbycliente } from '../../../../services/getserviciosbycliente';
import { Getidentitytypes } from '../../../../services/getidentitytypes';
import { Principal } from './principal';

describe('Principal', () => {
  let component: Principal;
  let fixture: ComponentFixture<Principal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Principal],
      providers: [
        provideNoopAnimations(),
        {
          provide: Getidentitytypes,
          useValue: {
            getAll: () => of([]),
          },
        },
        {
          provide: Getserviciosbycliente,
          useValue: {
            getByClienteApi: () =>
              of({
                codresp: 200,
                mensaje: 'Servicios del cliente consultados exitosamente',
                status: true,
                datos: null,
              }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Principal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
