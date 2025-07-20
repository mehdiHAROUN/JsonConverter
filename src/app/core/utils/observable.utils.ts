import { type Observable } from 'rxjs';
import { DestroyRef, inject } from '@angular/core';

export function injectSubscribeUtilDestroy<T>(
  observable: Observable<T>,
  handler: (t: T) => void,
) {
  const subscription = observable.subscribe(handler);
  inject(DestroyRef).onDestroy(() => subscription.unsubscribe());
}
