import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NzMessageService } from 'ng-zorro-antd/message';
import { of } from 'rxjs';

import { Processifc } from '../../services/processifc';
import { CargueIfc } from './cargue-ifc';

describe('CargueIfc', () => {
  let component: CargueIfc;
  let fixture: ComponentFixture<CargueIfc>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CargueIfc],
      providers: [
        {
          provide: Processifc,
          useValue: { process: () => of({ status: true, mensaje: 'ok', datos: null, codresp: 201 }) },
        },
        {
          provide: NzMessageService,
          useValue: { success: () => undefined, error: () => undefined },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CargueIfc);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
