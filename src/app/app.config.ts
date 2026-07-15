import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { es_ES, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import es from '@angular/common/locales/es';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { jwtInterceptor } from './services/client/jwt.interceptor';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import {
  AppstoreOutline,
  BellOutline,
  HomeOutline,
  MenuFoldOutline,
  MenuUnfoldOutline,
  PlusOutline,
  SearchOutline,
  SettingOutline,
  UserOutline,
} from '@ant-design/icons-angular/icons';

registerLocaleData(es);

const nzIcons = [
  HomeOutline,
  AppstoreOutline,
  SettingOutline,
  BellOutline,
  MenuFoldOutline,
  MenuUnfoldOutline,
  UserOutline,
  PlusOutline,
  SearchOutline,
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideNzI18n(es_ES),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    provideNzIcons(nzIcons),
  ],
};
