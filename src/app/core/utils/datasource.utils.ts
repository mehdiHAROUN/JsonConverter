import { type Observable } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { injectSubscribeUtilDestroy } from './observable.utils';

export function injectDataSourceFrom<T>(t: Observable<T[]>) {
  const datasource = new MatTableDataSource<T>();
  injectSubscribeUtilDestroy(t, d => (datasource.data = d));
  return datasource;
}
