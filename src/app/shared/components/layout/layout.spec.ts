import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import {
  AppstoreOutline,
  BellOutline,
  HomeOutline,
  MenuFoldOutline,
  MenuUnfoldOutline,
  SettingOutline,
  UserOutline,
} from '@ant-design/icons-angular/icons';

import { Auth } from '../../../services/auth';
import { Layout } from './layout';

describe('Layout', () => {
  let component: Layout;
  let fixture: ComponentFixture<Layout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Layout],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        {
          provide: Auth,
          useValue: {
            getAuthUser: () => ({ full_name: 'Usuario Test', email: 'test@example.com' }),
            getAccessToken: () => 'token-test',
            logout: () => undefined,
          },
        },
        provideNzIcons([
          HomeOutline,
          AppstoreOutline,
          SettingOutline,
          BellOutline,
          MenuFoldOutline,
          MenuUnfoldOutline,
          UserOutline,
        ]),
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Layout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
