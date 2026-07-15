import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Createservicio } from '../../../services/createservicio';
import { Findclientebycedula } from '../../../services/findclientebycedula';
import { Getservicesall } from '../../../services/getservicesall';
import { Gettiposservicio } from '../../../services/gettiposservicio';
import { Principal } from './principal';

describe('Principal', () => {
  let component: Principal;
  let fixture: ComponentFixture<Principal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Principal],
      providers: [
        {
          provide: Getservicesall,
          useValue: {
            getAll: () => of([]),
          },
        },
        {
          provide: Createservicio,
          useValue: {
            create: () => of({ status: true, mensaje: '', codresp: 201, datos: null }),
          },
        },
        {
          provide: Findclientebycedula,
          useValue: {
            searchByCedula: () => of([]),
          },
        },
        {
          provide: Gettiposservicio,
          useValue: {
            getAll: () => of([]),
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
