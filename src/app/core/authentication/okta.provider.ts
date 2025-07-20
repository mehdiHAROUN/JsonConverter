import {
  type EnvironmentProviders,
  importProvidersFrom,
  makeEnvironmentProviders,
} from '@angular/core';
import { OKTA_CONFIG, OktaAuthModule } from '@okta/okta-angular';
import { oktaAuthFactory } from './okta.config';

export function provideOkta(): EnvironmentProviders {
  return makeEnvironmentProviders([
    importProvidersFrom(OktaAuthModule),
    { provide: OKTA_CONFIG, useFactory: oktaAuthFactory },
  ]);
}
