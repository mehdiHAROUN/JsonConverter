import { importProvidersFrom, isDevMode } from '@angular/core';
import { ServiceWorkerModule } from '@angular/service-worker';

export function provideServiceWorker() {
  return importProvidersFrom(
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000',
    }),
  );
}
