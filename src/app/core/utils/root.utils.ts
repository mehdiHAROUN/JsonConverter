import { ApplicationRef, inject } from '@angular/core';
import type { AppComponent } from '../../app.component';

export function injectRoot() {
  const applicationRef = inject(ApplicationRef);
  return applicationRef.components[0]?.instance as AppComponent;
}
