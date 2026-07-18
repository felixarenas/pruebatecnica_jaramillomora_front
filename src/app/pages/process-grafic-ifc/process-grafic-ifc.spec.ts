import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import {
  AimOutline,
  AreaChartOutline,
  CompressOutline,
  ExpandOutline,
  EyeOutline,
  ReloadOutline,
} from '@ant-design/icons-angular/icons';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { of } from 'rxjs';
import { Processifc } from '../../services/processifc';
import { ProcessGraficIfc } from './process-grafic-ifc';

describe('ProcessGraficIfc', () => {
  let component: ProcessGraficIfc;
  let fixture: ComponentFixture<ProcessGraficIfc>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcessGraficIfc],
      providers: [
        provideHttpClient(),
        provideNoopAnimations(),
        provideNzIcons([
          AreaChartOutline,
          EyeOutline,
          AimOutline,
          ReloadOutline,
          ExpandOutline,
          CompressOutline,
        ]),
        {
          provide: Processifc,
          useValue: {
            getFileIfcAll: () => of({ status: true, datos: [], mensaje: '', codresp: 200 }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProcessGraficIfc);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
