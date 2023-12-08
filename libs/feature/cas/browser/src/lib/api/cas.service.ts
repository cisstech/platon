import { Injectable } from '@angular/core'
import { ListResponse } from '@platon/core/common'
import { CreateCas, Cas, CasFilters, UpdateCas } from '@platon/feature-cas-common'
import { Observable } from 'rxjs'
import { CasProvider } from '../models/cas-provider'

@Injectable({ providedIn: 'root' })
export class CasService {
  constructor(private readonly provider: CasProvider) {}

  searchCas(filters?: CasFilters): Observable<ListResponse<Cas>> {
    return this.provider.searchCas(filters)
  }

  findCas(id: string): Observable<Cas> {
    return this.provider.findCas(id)
  }

  updateCas(id: string, input: UpdateCas): Observable<Cas> {
    return this.provider.updateCas(id, input)
  }

  createCas(input: CreateCas): Observable<Cas> {
    return this.provider.createCas(input)
  }

  listCas(): Observable<ListResponse<string>> {
    return this.provider.listCas()
  }
}
