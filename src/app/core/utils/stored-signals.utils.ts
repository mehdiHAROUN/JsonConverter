import { effect, signal } from '@angular/core';

// signal whose value is stored in localStorage
// Doesn't handle sharing key between multiple instances
export function storedSignal<T extends string>(key: string, defaultValue: T) {
  const v = (localStorage.getItem(key) as T) ?? defaultValue;

  const s = signal(v);

  effect(() => {
    localStorage.setItem(key, s());
  });

  return s;
}
