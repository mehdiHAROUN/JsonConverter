import {
  Component,
  inject,
  type TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { ToolbarComponent } from './toolbar.component';
// import {
//   ToastComponent,
// } from '@engie-group/fluid-design-system-angular';
import { getLastDescendent, getTitle, injectRouterLoading } from './core/utils/router.utils';
import { AsyncPipe } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { AppAvatarComponent } from './toolbar/avatar/avatar.component';
import { map } from 'rxjs';
// import { injectUser } from './core/utils/user.utils';
import { UserService } from './shared/user.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  imports: [
    ToolbarComponent,
    RouterOutlet,
   // ToastComponent,
    AsyncPipe,
    MatProgressSpinner,
    AppAvatarComponent,
  ],
  providers: [UserService],
  styles: `
    :host {
      --title-padding: 16px;
      --title-padding-left: 32px;

      display: grid;
      grid-template-areas:
        'engie-logo  page-title'
        'link-list content';
      flex-direction: column;
      height: 100vh;
      grid-template-rows: min-content auto;
      grid-template-columns: 360px auto;
      //transition: grid-template-columns 0.3s ease-in-out;
    }
    :host:has(.minimised-navbar) {
      grid-template-columns: 72px auto;
      overflow: hidden;
    }

    .content-title {
      grid-area: page-title;
      border-bottom: 1px solid oklch(94.77% 0.0052 247.88);
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--title-padding);
      padding-left: var(--title-padding-left);
    }

    .loading {
      display: flex;
      justify-content: center;
      margin-top: 5em;
      width: 100%;
    }

    .content {
      grid-area: content;
      padding: 8px;
      padding-left: 32px;
      background: oklch(97.79% 0.0025 228.78);
    }

    @media screen and (max-width: 1000px) {
      .content-wrapper {
        display: block;
      }
    }
  `,
  template: `
    <app-toolbar></app-toolbar>
    <div class="content-title">
      <h1>{{ getTitle() }}</h1>
      <!-- <app-avatar [user]="user$ | async"></app-avatar> -->
    </div>
    <div class="content">
      @if (loading$ | async) {
        <div class="loading">
          <mat-spinner></mat-spinner>
        </div>
      } @else {
        <router-outlet></router-outlet>
      }
    </div>
    <ng-template let-data #toast>
      <!-- <nj-toast [hasCloseIcon]="true" iconName="error" [shouldDismiss]="true">
        Error trying to load <b>{{ data.url }}</b>
        <ng-container njToastBody>
          {{ data.error.message }}
        </ng-container>
      </nj-toast> -->
    </ng-template>
  `,
})
export class AppComponent {
  loading$ = injectRouterLoading();
  viewRef = inject(ViewContainerRef);
  @ViewChild('toast') toast!: TemplateRef<unknown>;
  route = inject(ActivatedRoute);
  getTitle() {
    return getTitle(getLastDescendent(this.route));
  }

  #userService = inject(UserService);
  #sanitizer = inject(DomSanitizer);

  // user$ = injectUser();
}
