import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { Auth } from '../auth';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(Auth).getAccessToken();

  if (!token) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    }),
  );
};
