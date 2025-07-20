// Okta user injection disabled
// import { filter, first, map, switchMap } from 'rxjs';
// import { fromPromise } from 'rxjs/internal/observable/innerFrom';
// import { inject } from '@angular/core';
// import { OKTA_AUTH, OktaAuthStateService } from '@okta/okta-angular';

// export function injectUser() {
//   const authService = inject(OktaAuthStateService);
//   const oktaAuth = inject(OKTA_AUTH);

//   const authenticated$ = authService.authState$.pipe(
//     map(c => c.isAuthenticated),
//   );
//   return authenticated$.pipe(
//     filter(Boolean),
//     first(),
//     switchMap(() => fromPromise(oktaAuth.getUser<Record<string, never>>())),
//   );
// }
