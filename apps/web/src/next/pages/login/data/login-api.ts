import { Injectable, inject } from '@angular/core'
import { CasService } from '@platon/feature/cas/browser/shared'
import { Observable, map } from 'rxjs'

/** What the sign-in page reads from the API. Stateless. */
@Injectable({ providedIn: 'root' })
export class LoginApi {
  private readonly cas = inject(CasService)

  /** The names of the institution accounts (CAS) people can sign in with. */
  casNames(): Observable<string[]> {
    return this.cas.listCas().pipe(map((response) => response.resources))
  }
}
