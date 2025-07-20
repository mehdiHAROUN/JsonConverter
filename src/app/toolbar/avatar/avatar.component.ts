import { Component, input } from '@angular/core';
import { type UserClaims } from '@okta/okta-auth-js';
import { type SafeUrl } from '@angular/platform-browser';
import { NgStyle } from '@angular/common';
import { MatMiniFabButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-avatar',
  template: `
    <span [innerHTML]="img()"></span>

    <button
      mat-mini-fab
      class="acronyms"
      [class.image]="img()"
      matTooltip="{{ user()?.given_name }} {{ user()?.family_name }}"
    >
      @if (!img()) {
        {{ user()?.given_name?.charAt(0)}}{{ user()?.family_name?.charAt(0) }}

      }
    </button>
  `,
  styles: `
    :host {
      display: flex;
      height: 100%;
      align-items: center;
      justify-content: center;
    }
    .acronyms {
      border-radius: 50%;
      background-color: oklch(0 0 0 / 10%);
    }

    button.image {
      background-color: transparent;
      background-repeat: no-repeat;
      background-size: cover;
      background-position: center center;
    }
  `,
  imports: [
    MatMiniFabButton,
    MatTooltip,
  ],
})
export class AppAvatarComponent {
  user = input<UserClaims | null>(null);
  img = input<SafeUrl | null>(null);
}
