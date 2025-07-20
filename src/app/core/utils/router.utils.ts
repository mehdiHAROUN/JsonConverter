import {
  ActivatedRoute,
  type Event,
  EventType,
  Router,
  RouterEvent,
} from '@angular/router';
import { concatMap, delay, EMPTY, filter, of } from 'rxjs';
import { inject } from '@angular/core';

export function injectRouterLoading() {
  return inject(Router).events.pipe(
    filter((c): c is RouterEvent & typeof c => c instanceof RouterEvent),
    concatMap(routerStartAndStop)
  );
}

function routerStartAndStop(event: Event & RouterEvent) {
  switch (event.type) {
    case EventType.NavigationStart:
      return of(true).pipe(delay(200));
    case EventType.NavigationCancel:
    case EventType.NavigationError:
    case EventType.NavigationEnd:
      return of(false);
    default:
      return EMPTY;
  }
}


export function getTitle(route: ActivatedRoute): string | undefined {
  while (route.parent !== null && route.snapshot.title === undefined) {
    route = route.parent;
  }
  return route.snapshot.title;
}

export function getLastDescendent(route: ActivatedRoute): ActivatedRoute {
  while (route.firstChild !== null) {
    route = route.firstChild;
  }
  return route;
}
