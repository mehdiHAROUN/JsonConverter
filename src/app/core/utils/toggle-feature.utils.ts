import { inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { OKTA_AUTH } from '@okta/okta-angular';
import type { CustomUserClaims, UserClaims } from '@okta/okta-auth-js';
import { from, map } from 'rxjs';
import {
  ENVIRONMENT,
  type EnvironmentConfiguration,
} from 'src/environments/token';

export function injectUseToggleFeature(
  featureName: keyof EnvironmentConfiguration['toggleFeatures'],
) {
  const okta = inject(OKTA_AUTH);
  const user = from(okta.getUser());
  const env = inject(ENVIRONMENT);

  return toSignal(user.pipe(map(c => useToggleFeqture(env, featureName, c))));
}

function useToggleFeqture(
  environment: EnvironmentConfiguration,
  featureName: keyof EnvironmentConfiguration['toggleFeatures'],
  user: UserClaims<CustomUserClaims>,
): boolean {
  const gaia = user.preferred_username?.split('@')[0] ?? '';
  const toggle = environment.toggleFeatures[featureName];

  if (typeof toggle === 'boolean') {
    return toggle;
  }

  return toggle.map(c => c.toLowerCase()).indexOf(gaia.toLowerCase()) !== -1;
}
