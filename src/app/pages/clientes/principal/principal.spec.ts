import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Createcliente } from '../../../services/createcliente';
import { Getclienteall } from '../../../services/getclienteall';
import { Getidentitytypes } from '../../../services/getidentitytypes';
import { Principal } from './principal';

describe('Principal', () => {
  let component: Principal;
  let fixture: ComponentFixture<Principal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Principal],
      providers: [
        {
          provide: Getclienteall,
          useValue: {
            getAll: () => of([]),
          },
        },
        {
          provide: Createcliente,
          useValue: {
            create: () => of({ codresp: 201, mensaje: 'ok', status: true, datos: null }),
          },
        },
        {
          provide: Getidentitytypes,
          useValue: {
            getAll: () => of([{ id: 4, abr: 'CC', name: 'Cédula de Ciudadanía' }]),
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
