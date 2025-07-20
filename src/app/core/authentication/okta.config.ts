import { OktaAuth } from '@okta/okta-auth-js';
import { inject } from '@angular/core';
import { ENVIRONMENT } from '../../../environments/token';

export const oktaAuthFactory = () => {
  const environment = inject(ENVIRONMENT);
  return {
    oktaAuth: new OktaAuth({
      issuer: environment.authentication.issuer,
      scopes: ['openid', 'profile', 'email'],
      clientId: environment.authentication.clientId,
      redirectUri: environment.authentication.redirectUri,
      tokenManager: {
        autoRemove: true,
        autoRenew: true,
      },
    }),
  };
};
