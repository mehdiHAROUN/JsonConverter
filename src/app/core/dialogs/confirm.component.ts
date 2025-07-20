import { Component, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { type Dialog, DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
  ButtonComponent,
  ModalComponent,
} from '@engie-group/fluid-design-system-angular';

interface ConfirmDialogInput {
  title: string;
  message: string;
  info?: boolean;
}

@Component({
    selector: 'app-confirm-dialog',
    template: `
    <nj-modal>
      <span njModalTitle>{{ data.title }}</span>
      <div njModalContent>
        <p>{{ data.message }}</p>
      </div>
      <ng-container njModalFooter>
        @if (data.info) {
          <nj-button (click)="ref.close()">Close</nj-button>
        }
        @if (!data.info) {
          <nj-button (click)="ref.close(false)">No</nj-button>
        }
        @if (!data.info) {
          <nj-button (click)="ref.close(true)">Yes</nj-button>
        }
      </ng-container>
    </nj-modal>
  `,
    imports: [ButtonComponent, ModalComponent]
})
export class ConfirmDialogComponent {
  data = inject(DIALOG_DATA) as ConfirmDialogInput;
  ref = inject(DialogRef<boolean>);
  static async open(dialog: Dialog, data: ConfirmDialogInput) {
    const dialogRef = dialog.open<boolean>(ConfirmDialogComponent, {
      data,
    });

    return await firstValueFrom(dialogRef.closed);
  }
}
