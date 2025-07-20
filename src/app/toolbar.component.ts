import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { storedSignal } from './core/utils/stored-signals.utils';

@Component({
  selector: 'app-toolbar',
  imports: [MatIcon, RouterLink, RouterLinkActive],
  styles: `
    :host {
      display: contents;
      --navbar-background: oklch(0.2885 0.0565 269.96);
      --navbar-background-hover: oklch(
          from var(--navbar-background) calc(l + 0.1) c h
      );
      --navbar-background-click: oklch(
          from var(--navbar-background) calc(l + 0.2) c h
      );
      --navbar-background-active: oklch(
          from var(--navbar-background) calc(l + 0.15) c h
      );
    }
    :host > * {
      background: var(--navbar-background);
    }

    .items {
      grid-area: link-list;
      background: var(--navbar-background);
      color: white;
    }

    .items > * {
      color: white;
    }

    .title > * {
      color: white;
    }

    .items a {
      display: flex;
      flex-direction: row;
      align-items: center;
      text-decoration: none;
      padding: 12px;
      gap: 8px;
      cursor: pointer;
    }

    .items.minimised-navbar a {
      justify-content: center;
    }

    .title.minimised-navbar {
      align-items: center;
      justify-content: center;
    }

    .items a:hover {
      background: var(--navbar-background-hover);
    }

    .items a:active {
      background: var(--navbar-background-click);
    }

    .items a.active {
      background: var(--navbar-background-active);
    }

    .title {
      color: white;
      grid-area: engie-logo;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--title-padding);
      gap: 5px;
      border-bottom: 1px solid oklch(39.77% 0.0124 267.21);
    }

  `,
  template: `
    <div
      class="title"
      [class.minimised-navbar]="state() === 'minimised'"
    >
      <img
        src="/assets/images/logo_engie.png"
        style="height: 55px ; width: 55px"
      />
      @if (state() === 'maximised') {
        <h3>Major IT incident</h3>
      }
    </div>
    <div
      class="items"
      [class.minimised-navbar]="state() === 'minimised'"
    >
      <a
        (click)="state.set(state() === 'minimised' ? 'minimised' : 'minimised')"
      >
        <mat-icon>keyboard_arrow_left</mat-icon>
        @if (state() === 'maximised') {
          Close
        }
      </a>
      <a
        routerLink="/"
        routerLinkActive="active"
        [routerLinkActiveOptions]="{ exact: true }"
      >
        <mat-icon>home</mat-icon>
        @if (state() === 'maximised') {
          Home
        }
      </a>
    </div>
  `,
})
export class ToolbarComponent {
  state = storedSignal<'minimised' | 'maximised'>('sidebar-state', 'maximised')
}
