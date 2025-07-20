import { type Routes } from '@angular/router';
// import { OktaAuthGuard, OktaCallbackComponent } from '@okta/okta-angular';

export const routes: Routes = [
  // { path: 'login/callback', component: OktaCallbackComponent },
  {
    path: '',
    // canActivate: [OktaAuthGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/incident-report-form/incident-report-form.component').then(c => c.IncidentReportFormComponent),
        title: 'Major IT incident',
      },
      {
        path: '**',
        loadComponent: () =>
          import('./not-found.component').then(c => c.NotFoundComponent),
        title: `Not Found`,
      },
    ],
  },
];
