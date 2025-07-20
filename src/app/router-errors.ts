import { Component, inject } from '@angular/core';
import { type NavigationError, Router } from '@angular/router';
import { ToastService } from '@engie-group/fluid-design-system-angular';
import { injectRoot } from './core/utils/root.utils';
import {
  MAT_SNACK_BAR_DATA,
  MatSnackBarModule,
  MatSnackBarRef,
} from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';

export function handleRoutingErrors(error: NavigationError) {
  console.error('Routing error', error);
  const root = injectRoot();
  inject(ToastService).open(root.toast, {
    viewContainerRef: root.viewRef,
    data: error,
  });

  const router = inject(Router);
  if (!router.navigated) {
    void router.navigateByUrl('');
  }
}

@Component({
    template: `
    <span matSnackBarLabel>
      Error trying to load <b>{{ data.url }}</b> : <br />
      {{ data.error.message }}
    </span>
    <div matSnackBarActions>
      <button
        class="primary-button"
        matSnackBarAction
        (click)="snackBar.dismissWithAction()"
      >
        Ok
      </button>
    </div>
  `,
    styles: `
    :host {
      display: flex;
    }
  `,
    imports: [MatSnackBarModule, MatButtonModule]
})
export class RouterErrorSnackBarComponent {
  snackBar = inject(MatSnackBarRef);
  data = inject<NavigationError>(MAT_SNACK_BAR_DATA);
}
