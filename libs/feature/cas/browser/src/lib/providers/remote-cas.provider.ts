import { HttpClient, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { CreatedResponse, ItemResponse, ListResponse } from '@platon/core/common'
import { CreateCas, Cas, CasFilters, UpdateCas } from '@platon/feature/cas/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { CasProvider } from '../models/cas-provider'

@Injectable()
export class RemoteCasProvider extends CasProvider {
  constructor(private readonly http: HttpClient) {
    super()
  }

  listCas(): Observable<ListResponse<string>> {
    return this.http.get<ListResponse<string>>('/api/v1/cas/casnames')
  }

  searchCas(filters?: CasFilters): Observable<ListResponse<Cas>> {
    filters = filters || {}
    let params = new HttpParams()

    if (filters.search) {
      params = params.append('search', filters.search)
    }

    if (filters.order) {
      params = params.append('order', filters.order)
    }

    if (filters.direction) {
      params = params.append('direction', filters.direction)
    }

    if (filters.limit) {
      params = params.append('limit', filters.limit.toString())
    }

    if (filters.offset) {
      params = params.append('offset', filters.offset.toString())
    }

    return this.http.get<ListResponse<Cas>>(`/api/v1/cas/`, { params })
  }

  findCas(id: string): Observable<Cas> {
    return this.http.get<ItemResponse<Cas>>(`/api/v1/cas/${id}`).pipe(map((response) => response.resource))
  }

  updateCas(id: string, input: UpdateCas): Observable<Cas> {
    return this.http.patch<ItemResponse<Cas>>(`/api/v1/cas/${id}`, input).pipe(map((response) => response.resource))
  }

  createCas(input: CreateCas): Observable<Cas> {
    return this.http.post<CreatedResponse<Cas>>('/api/v1/cas/', input).pipe(map((response) => response.resource))
  }
}
