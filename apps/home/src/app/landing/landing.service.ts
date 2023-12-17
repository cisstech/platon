import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { Observable, catchError, map, of } from 'rxjs'

export type DemoLink = {
  href: string
  title: string
}

export type DemoLinkGroup = {
  title: string
  links: DemoLink[]
}

@Injectable({ providedIn: 'root' })
export class LandingService {
  private readonly http = inject(HttpClient)

  listDemoLinks(): Observable<DemoLinkGroup[]> {
    type Response = {
      groups: DemoLinkGroup[]
    }
    const url = 'https://raw.githubusercontent.com/cisstech/platon/main/demo.json'
    return this.http.get<Response>(url).pipe(
      map((data) => {
        return data.groups ?? []
      }),
      catchError(() => of([]))
    )
  }
}
