import {
  inject,
  Injectable,
  InjectionToken,
  makeEnvironmentProviders,
} from '@angular/core';
import { type RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { Title } from '@angular/platform-browser';

export const TITLE_PREFIX = new InjectionToken<string>('TITLE_PREFIX');

@Injectable()
export class PrefixTitleStrategy extends TitleStrategy {
  #title = inject(Title);
  #prefix = inject(TITLE_PREFIX);

  override updateTitle(routerState: RouterStateSnapshot) {
    const title = this.buildTitle(routerState);
    if (title !== undefined) {
      this.#title.setTitle(`${this.#prefix}${title}`);
    }
  }
}

export function providePrefixTitle(prefix: string) {
  return makeEnvironmentProviders([
    { provide: TitleStrategy, useClass: PrefixTitleStrategy },
    { provide: TITLE_PREFIX, useValue: prefix },
  ]);
}
