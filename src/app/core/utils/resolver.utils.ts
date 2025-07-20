import { distinctUntilChanged, map, type Observable } from 'rxjs';
import { inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

export function injectFromResolver<T>(key: string): Observable<T> {
  return inject(ActivatedRoute).data.pipe(
    map(data => data[key] as T),
    distinctUntilChanged(),
  );
}
