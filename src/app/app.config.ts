import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { routes } from './app.routes';
// Okta imports - disabled for now
// import { provideOkta } from './core/authentication/okta.provider';
import { ENVIRONMENT, API_URL, environment, apiConfig } from '../environments/token';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptorsFromDi()),
    // Environment and API configuration - needed for UserService
    { provide: ENVIRONMENT, useValue: environment },
    { provide: API_URL, useValue: apiConfig.baseUrl },
    // Okta authentication - disabled for now
    // provideOkta(),
  ]
};
