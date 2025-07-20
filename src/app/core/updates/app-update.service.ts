import {
  APP_INITIALIZER,
  inject,
  makeEnvironmentProviders,
} from '@angular/core';
import { SwUpdate, type VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';
import { ConfirmDialogComponent } from '../dialogs/confirm.component';
import { Dialog } from '@angular/cdk/dialog';

function updateApp(serviceWorkerUpdater: SwUpdate, dialog: Dialog) {
  console.debug(`[AppUpdateService]`);

  if (serviceWorkerUpdater.isEnabled) {
    console.log('Service workers supported');
    serviceWorkerUpdater.versionUpdates
      .pipe(filter((c): c is VersionReadyEvent => c.type === 'VERSION_READY'))
      .subscribe(event => {
        console.log('current version is', event.currentVersion);
        console.log('available version is', event.latestVersion);
        void showAppUpdateAlert();
      });
    serviceWorkerUpdater.unrecoverable.subscribe(event => {
      console.log('** UNRECOVERABLE **', event);
    });
  } else {
    console.warn('Service workers NOT supported');
  }

  async function showAppUpdateAlert() {
    const confirmed = await ConfirmDialogComponent.open(dialog, {
      message: 'New version available. Do you want to update now ?',
      title: 'New Version',
    });

    if (confirmed) {
      await doAppUpdate();
    }
  }

  async function doAppUpdate() {
    await serviceWorkerUpdater.activateUpdate();
    document.location.reload();
  }
}

export function provideAppUpdater() {
  return makeEnvironmentProviders([
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => {
        const serviceWorkerUpdater = inject(SwUpdate);
        const dialog = inject(Dialog);

        return () => updateApp(serviceWorkerUpdater, dialog);
      },
    },
  ]);
}
