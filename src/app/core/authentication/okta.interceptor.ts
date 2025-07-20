import { type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { OKTA_CONFIG } from '@okta/okta-angular';

export const tokenInterceptor: HttpInterceptorFn = (request, next) => {
  const okta = inject(OKTA_CONFIG);
  const token = okta.oktaAuth.getAccessToken();
  if (token) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  return next(request);
};
