/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inject, Injectable, InjectionToken, Optional } from '@angular/core'
import { StorageMap } from '@ngx-pwa/local-storage'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export const STORAGE_PREFIX = new InjectionToken<string>('STORAGE_PREFIX')

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor(
    @Optional()
    @Inject(STORAGE_PREFIX)
    private readonly prefix: string,
    private readonly storageMap: StorageMap
  ) {}

  set<T>(key: string, value: T): Observable<any> {
    return this.storageMap.set(this.addPrefix(key), value)
  }

  get<T>(key: string, defaultValue?: T): Observable<T> {
    return this.storageMap.get(this.addPrefix(key)).pipe(map((e) => (e == null ? defaultValue : e))) as Observable<T>
  }

  getString(key: string, defaultValue?: string): Observable<string | undefined> {
    return this.storageMap
      .get<string>(this.addPrefix(key), { type: 'string' })
      .pipe(map((e) => (e == null ? defaultValue : e)))
  }

  getNumber(key: string, defaultValue?: number): Observable<number | undefined> {
    return this.storageMap
      .get<number>(this.addPrefix(key), { type: 'number' })
      .pipe(map((e) => (e == null ? defaultValue : e)))
  }

  getBoolean(key: string, defaultValue?: boolean): Observable<boolean | undefined> {
    return this.storageMap
      .get<boolean>(this.addPrefix(key), { type: 'boolean' })
      .pipe(map((e) => (e == null ? defaultValue : e)))
  }

  remove(key: string): Observable<any> {
    return this.storageMap.delete(this.addPrefix(key))
  }

  clear(): Observable<any> {
    return this.storageMap.clear()
  }

  watch<T>(key: string): Observable<T> {
    return this.storageMap.watch(this.addPrefix(key)) as Observable<T>
  }

  addPrefix(key: string) {
    return this.prefix || '' + `_${key}_`
  }
}
