import { ListResponse } from '@platon/core/common'
import { CreateCas, Cas, CasFilters, UpdateCas } from '@platon/feature-cas-common'
import { Observable } from 'rxjs'

export abstract class CasProvider {
  abstract searchCas(filters?: CasFilters): Observable<ListResponse<Cas>>
  abstract findCas(id: string, markAsViewed?: boolean): Observable<Cas>
  abstract updateCas(id: string, input: UpdateCas): Observable<Cas>
  abstract createCas(input: CreateCas): Observable<Cas>
  abstract listCas(): Observable<ListResponse<string>>
}
