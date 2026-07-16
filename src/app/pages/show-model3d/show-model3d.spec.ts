import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import {
  AimOutline,
  CompressOutline,
  ExpandOutline,
  EyeOutline,
  ReloadOutline,
} from '@ant-design/icons-angular/icons';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { of } from 'rxjs';
import { Processifc } from '../../services/processifc';
import { ShowModel3d } from './show-model3d';

describe('ShowModel3d', () => {
  let component: ShowModel3d;
  let fixture: ComponentFixture<ShowModel3d>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowModel3d],
      providers: [
        provideHttpClient(),
        provideNoopAnimations(),
        provideNzIcons([
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

    fixture = TestBed.createComponent(ShowModel3d);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
